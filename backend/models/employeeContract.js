import mongoose from "mongoose";
import auditSchema from "./audit.js";
import salarySchema from "./salaryDetails.js";

const employeeContractSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Employee reference is required"],
      validate: {
        validator: async function (userId) {
          const user = await mongoose.model("User").findById(userId);
          return user && user.role !== "student";
        },
        message: "Employee must be a staff member (not a student)",
      },
    },
    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      required: [true, "A contract must be linked to a campus"],
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: [true, "A contract must be linked to an academic year"],
    },
    role: {
      type: String,
      enum: [
        "teacher",
        "coordinator",
        "principle",
        "vice_principal",
        "finance",
        "admin",
        "manager",
        "assistant",
        "librarian",
        "counselor",
        "it_support",
        "security",
        "maintenance",
      ],
      required: [true, "Contract role is required"],
    },
    designationLevel: {
      type: String,
      enum: ["junior", "mid", "senior", "lead", "manager", "assistant"],
    },
    startDate: {
      type: Date,
      required: [true, "Contract start date is required"],
    },
    endDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: [
        "draft",
        "active",
        "expired",
        "terminated",
        "resigned",
        "transferred",
        "cancelled",
      ],
      default: "draft",
    },
    transferredTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      default: null,
    },
    salary: {
      type: salarySchema,          // ✅ subdocument schema
      required: [true, "Salary details are required"],
    },
    reHireAllowed: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    expiryAlertSent: {
      type: Boolean,
      default: false,
    },
    audit: {
      type: auditSchema,
      required: true,
    },
    note: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// ====================== INDEXES ======================
employeeContractSchema.index({ employee: 1, campus: 1, status: 1 });
employeeContractSchema.index({ employee: 1, academicYear: 1, startDate: 1 });
employeeContractSchema.index({ employee: 1, status: 1 });
employeeContractSchema.index({ campus: 1, academicYear: 1 });
employeeContractSchema.index({ status: 1, endDate: 1 });
employeeContractSchema.index({ isDeleted: 1 });

// ====================== PRE-SAVE ======================
employeeContractSchema.pre("save", async function (next) {
  try {
    const Contract = mongoose.model("EmployeeContract");
    const AcademicYear = mongoose.model("AcademicYear");

    const academicYear = await AcademicYear.findById(this.academicYear);
    if (!academicYear) {
      return next(new Error("Academic year not found"));
    }

    if (academicYear.startDate && this.startDate < academicYear.startDate) {
      return next(
        new Error(
          `Contract startDate (${this.startDate.toDateString()}) cannot be before academic year start (${academicYear.startDate.toDateString()})`
        )
      );
    }

    if (academicYear.endDate && this.endDate && this.endDate > academicYear.endDate) {
      return next(
        new Error(
          `Contract endDate (${this.endDate.toDateString()}) cannot exceed academic year end (${academicYear.endDate.toDateString()})`
        )
      );
    }

    if (this.endDate && this.startDate >= this.endDate) {
      return next(new Error("startDate must be earlier than endDate"));
    }

    if (
      ["terminated", "expired", "resigned", "transferred"].includes(this.status) &&
      !this.endDate
    ) {
      return next(
        new Error(`A contract with status "${this.status}" must have an endDate`)
      );
    }

    if (this.isNew) {
      const wasTerminated = await Contract.findOne({
        employee: this.employee,
        status: "terminated",
        isDeleted: false,
      });

      if (wasTerminated && !this.reHireAllowed) {
        return next(
          new Error(
            "This employee was previously terminated. Admin must enable re-hire before creating a new contract"
          )
        );
      }
    }

    if (["draft", "active"].includes(this.status)) {
      const thisEndDate = this.endDate || new Date("9999-12-31");

      const overlapping = await Contract.findOne({
        employee: this.employee,
        campus: this.campus,
        academicYear: this.academicYear,
        _id: { $ne: this._id },
        status: { $in: ["draft", "active"] },
        isDeleted: false,
        $or: [
          {
            startDate: { $lte: thisEndDate },
            endDate: { $gte: this.startDate },
          },
          {
            startDate: { $lte: thisEndDate },
            endDate: null,
          },
        ],
      });

      if (overlapping) {
        return next(
          new Error(
            "Employee already has an overlapping active/draft contract in this campus and academic year"
          )
        );
      }
    }

    next();
  } catch (err) {
    next(err);
  }
});

// ====================== POST-SAVE: seed PositionHistory + sync User ======================
employeeContractSchema.post("save", async function (doc) {
  const PositionHistory = mongoose.model("PositionHistory");
  const User = mongoose.model("User");

  // --- Seed initial PositionHistory if brand new ---
  if (this.wasNew) {
    const existing = await PositionHistory.findOne({ contract: doc._id });
    if (!existing) {
      await PositionHistory.create({
        contract: doc._id,
        role: doc.role,
        designationLevel: doc.designationLevel,
        salary: doc.salary,
        effectiveDate: doc.startDate,
        reason: "initial",
        approvedBy: doc.audit?.createdBy,
      });
    }
  }

  // --- Sync User.currentContract and lifecycleStatus ---
  if (doc.status === "active") {
    // ✅ Contract is active – user is now contracted
    await User.findByIdAndUpdate(doc.employee, {
      currentContract: doc._id,
      lifecycleStatus: "contracted",
    });
  } else {
    // ✅ Contract is not active – determine new lifecycleStatus
    const stillActiveElsewhere = await mongoose.model("EmployeeContract").findOne({
      employee: doc.employee,
      status: "active",
      isDeleted: false,
    });

    if (stillActiveElsewhere) {
      // User still has another active contract → stay contracted
      await User.findByIdAndUpdate(doc.employee, {
        currentContract: stillActiveElsewhere._id,
        lifecycleStatus: "contracted",
      });
    } else {
      // No active contracts left → set lifecycleStatus based on this contract's final status
      let newLifecycle;
      switch (doc.status) {
        case "terminated":
          newLifecycle = "terminated";
          break;
        case "resigned":
          newLifecycle = "resigned";
          break;
        case "transferred":
          newLifecycle = "transferred";
          break;
        case "expired":
        case "cancelled":
        default:
          newLifecycle = "uncontracted";
          break;
      }
      await User.findByIdAndUpdate(doc.employee, {
        currentContract: null,
        lifecycleStatus: newLifecycle,
      });
    }
  }
});

employeeContractSchema.pre("save", function (next) {
  this.wasNew = this.isNew;
  next();
});

// ====================== STATIC: Soft Delete ======================
employeeContractSchema.statics.softDelete = async function (contractId, deletedBy) {
  return this.findByIdAndUpdate(
    contractId,
    {
      isDeleted: true,
      deletedAt: new Date(),
      "audit.updatedBy": deletedBy,
    },
    { new: true }
  );
};

// ====================== STATIC: Promote / change position ======================
employeeContractSchema.statics.promoteEmployee = async function ({
  contractId,
  role,
  designationLevel,
  salary,
  effectiveDate,
  reason,
  approvedBy,
  note,
}) {
  const PositionHistory = mongoose.model("PositionHistory");
  return PositionHistory.recordChange({
    contractId,
    role,
    designationLevel,
    salary,
    effectiveDate,
    reason: reason || "promotion",
    approvedBy,
    note,
  });
};

// ====================== STATIC: Terminate (UPDATED) ======================
employeeContractSchema.statics.terminateContract = async function ({
  contractId,
  terminatedBy,
  reason,
  terminationDate,
}) {
  const contract = await this.findOneAndUpdate(
    { _id: contractId, status: "active" },
    {
      status: "terminated",
      endDate: terminationDate || new Date(),
      "audit.terminatedBy": terminatedBy,
      "audit.terminationReason": reason || null,
      "audit.updatedBy": terminatedBy,
    },
    { new: true }
  );

  if (!contract) {
    throw new Error("Only active contracts can be terminated (or contract not found)");
  }

  const otherActive = await this.countDocuments({
    employee: contract.employee,
    status: "active",
    isDeleted: false,
  });

  // ✅ Now correctly sets lifecycleStatus to "terminated" (not user.status)
  await mongoose.model("User").findByIdAndUpdate(contract.employee, {
    currentContract: otherActive === 0 ? null : undefined,
    ...(otherActive === 0 ? { lifecycleStatus: "terminated" } : {}),
  });

  return contract;
};

// ====================== STATIC: Transfer ======================
employeeContractSchema.statics.transferEmployee = async function ({
  employeeId,
  newCampusId,
  newRole,
  transferDate,
  newBaseSalary,
  transferredBy,
  newContractStartDate,
}) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const Contract = this;

    const current = await Contract.findOne({
      employee: employeeId,
      status: "active",
      isDeleted: false,
    }).session(session);

    if (!current) throw new Error("No active contract found to transfer");

    current.endDate = transferDate;
    current.status = "transferred";
    current.transferredTo = newCampusId;
    current.audit.updatedBy = transferredBy;
    await current.save({ session });

    const [newContract] = await Contract.create(
      [
        {
          employee: employeeId,
          role: newRole || current.role,
          designationLevel: current.designationLevel,
          campus: newCampusId,
          academicYear: current.academicYear,
          startDate: newContractStartDate || transferDate,
          endDate: null,
          status: "active",
          salary: {
            baseSalary: newBaseSalary ?? current.salary.baseSalary,
            paymentType: current.salary.paymentType,
            currency: current.salary.currency,
            allowances: current.salary.allowances,
            annualLeaveAllowance: current.salary.annualLeaveAllowance,
          },
          reHireAllowed: false,
          audit: { createdBy: transferredBy },
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    return newContract;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// ====================== STATIC: Auto-Expire (cron) ======================
employeeContractSchema.statics.expireOverdueContracts = async function () {
  const now = new Date();

  const overdueContracts = await this.find({
    status: "active",
    endDate: { $ne: null, $lte: now },
    isDeleted: false,
  }).select("_id employee note");

  if (overdueContracts.length === 0) return 0;

  const bulkOps = overdueContracts.map((c) => ({
    updateOne: {
      filter: { _id: c._id, status: "active" },
      update: {
        status: "expired",
        note: `${c.note || ""} [Auto-expired]`.trim(),
      },
    },
  }));
  await this.bulkWrite(bulkOps);

  const employeesToCheck = [...new Set(overdueContracts.map((c) => c.employee.toString()))];
  const User = mongoose.model("User");

  for (const empId of employeesToCheck) {
    const activeCount = await this.countDocuments({
      employee: empId,
      status: "active",
      isDeleted: false,
    });
    if (activeCount === 0) {
      // ✅ Sets lifecycleStatus to "uncontracted" (field was previously incorrect)
      await User.findByIdAndUpdate(empId, {
        lifecycleStatus: "uncontracted",
        currentContract: null,
      });
    }
  }

  return overdueContracts.length;
};

// ====================== STATIC: Expiring Soon (cron/alerts) ======================
employeeContractSchema.statics.getExpiringContracts = function (days = 30) {
  const now = new Date();
  const threshold = new Date(now.getTime() + days * 86_400_000);

  return this.find({
    status: "active",
    endDate: { $ne: null, $gte: now, $lte: threshold },
    expiryAlertSent: false,
    isDeleted: false,
  }).populate("employee campus academicYear");
};

// ====================== STATIC: Get Active Contract ======================
employeeContractSchema.statics.getActiveContract = function (employeeId, campusId) {
  const query = { employee: employeeId, status: "active", isDeleted: false };
  if (campusId) query.campus = campusId;
  return this.findOne(query);
};

// ====================== STATIC: Has Active Contract On Date ======================
employeeContractSchema.statics.hasActiveContractOn = async function (
  employeeId,
  campusId,
  date = new Date()
) {
  const contract = await this.findOne({
    employee: employeeId,
    campus: campusId,
    status: "active",
    isDeleted: false,
    startDate: { $lte: date },
    $or: [{ endDate: null }, { endDate: { $gte: date } }],
  });
  return !!contract;
};

// ====================== STATIC: History ======================
employeeContractSchema.statics.getHistory = function (employeeId, academicYearId) {
  const query = { employee: employeeId, isDeleted: false };
  if (academicYearId) query.academicYear = academicYearId;
  return this.find(query).sort({ startDate: 1 });
};

export default mongoose.model("EmployeeContract", employeeContractSchema);