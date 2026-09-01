import mongoose from "mongoose";

const FEE_TYPES = ["Admission", "Tuition", "Exam", "Transport", "Hostel"];
const FEE_CURRENCIES = ["USD", "EUR", "GBP", "TL", "AUD", "CAD", "AED"];
const PAYMENT_FREQUENCIES = ["Monthly", "Quarterly", "Half Yearly", "Annually"];
const PAYMENT_METHODS = ["Cash", "Bank Transfer", "Online"];

// Which payment frequencies make sense for each fee type — Admission is
// always a one-off charge, Exam is only ever Quarterly or once a year.
// Kept in sync with utils/feePlanGenerator.js's FEE_TYPE_FREQUENCIES (not
// imported directly to avoid a load-order dependency between the model
// and the utils file — same list, single intent).
const FEE_TYPE_FREQUENCIES = {
  Admission: ["Annually"],
  Tuition: ["Monthly", "Quarterly", "Half Yearly", "Annually"],
  Exam: ["Quarterly", "Annually"],
  Transport: ["Monthly", "Quarterly", "Half Yearly", "Annually"],
  Hostel: ["Monthly", "Quarterly", "Half Yearly", "Annually"],
};

// One line per fee type the admin actually selected for this student
// (Admission / Tuition / Exam / Transport / Hostel). A student who isn't
// taking transport simply has no "Transport" line here — nothing is
// planned or charged for it. This is the planner the finance department
// eventually reads (via the generated Fees docs) to know exactly what to
// collect from this student.
const feeLineSchema = new mongoose.Schema(
  {
    feeType: {
      type: String,
      enum: FEE_TYPES,
      required: [true, "Fee type is required for each fee plan line"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required for each fee plan line"],
      min: [0.01, "Amount must be greater than 0"],
    },
    currency: {
      type: String,
      enum: FEE_CURRENCIES,
      default: "USD",
    },
    paymentFrequency: {
      type: String,
      enum: PAYMENT_FREQUENCIES,
      default: "Monthly",
      required: [true, "Payment frequency is required for each fee plan line"],
      validate: {
        validator: function (freq) {
          const allowed = FEE_TYPE_FREQUENCIES[this.feeType];
          return !allowed || allowed.includes(freq);
        },
        message: function (props) {
          const allowed = FEE_TYPE_FREQUENCIES[props.instance?.feeType] || [];
          return `${props.instance?.feeType || "This fee type"} can only be billed as: ${allowed.join(", ")}`;
        },
      },
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required for each fee plan line"],
    },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
    },
  },
  { _id: true }
);

const studentEnrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student reference is required"],
    },
    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      required: [true, "Campus is required"],
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: [true, "Academic year is required"],
    },
    classGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassGroup",
      required: [true, "Class group is required"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "transferred", "completed", "left"],
      default: "active",
    },
    transferredTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      default: null,
    },
    note: {
      type: String,
      trim: true,
    },

    // 🐛 FIX — this field was referenced everywhere in
    // studentEnrollmentControllers.js (getStudentEnrollmentDetails,
    // updateStudentEnrollment, deleteStudentEnrollment, and critically
    // regenerateFeesForScholarship in feePlanGenerator.js) via queries
    // like `{ isDeleted: false }`, but was never actually declared on
    // the schema. Mongo's `{ field: false }` query does NOT match
    // documents where the field is entirely absent (that special
    // "missing counts as match" behavior only applies to `{ field: null }`),
    // so every one of those lookups was silently returning nothing.
    // Concretely: this is why approving a scholarship never regenerated
    // the student's fee installments with the discount applied — the
    // enrollment could never be found to regenerate from.
    isDeleted: {
      type: Boolean,
      default: false,
    },

    // Replaces the old single-fee-type `feePlan` object — now a small
    // planner: one entry per fee type the admin actually picked for this
    // student (Tuition, Transport, Hostel, etc.), each with its own
    // amount/currency/frequency/due date. The actual billable
    // installments (what finance works from) are generated from this
    // array — see utils/feePlanGenerator.js — and land in the Fees
    // collection as Pending, split according to each line's
    // paymentFrequency.
    feePlan: {
      type: [feeLineSchema],
      required: [true, "At least one fee plan line is required"],
      validate: {
        validator: function (lines) {
          if (!Array.isArray(lines) || lines.length === 0) return false;
          const types = lines.map((l) => l.feeType);
          return new Set(types).size === types.length; // no duplicate fee types
        },
        message: "Fee plan must have at least one line and no duplicate fee types",
      },
    },
  },
  { timestamps: true }
);

// ──────────────────────────────── INDEXES ────────────────────────────────
studentEnrollmentSchema.index({ student: 1, academicYear: 1, status: 1 });
studentEnrollmentSchema.index({ campus: 1, academicYear: 1, status: 1 });
studentEnrollmentSchema.index({ student: 1, status: 1 });
studentEnrollmentSchema.index({ academicYear: 1, status: 1, endDate: 1 });
studentEnrollmentSchema.index({ isDeleted: 1 });

// ──────────────────────────── PRE‑SAVE VALIDATION ────────────────────────
studentEnrollmentSchema.pre("save", async function (next) {
  try {
    const Enrollment = mongoose.model("StudentEnrollment");
    const AcademicYear = mongoose.model("AcademicYear");

    // 1. Fetch academic year boundaries
    const ay = await AcademicYear.findById(this.academicYear);
    if (!ay) return next(new Error("Academic year not found"));

    if (ay.startDate && this.startDate < ay.startDate) {
      return next(
        new Error(
          `Enrollment startDate (${this.startDate.toDateString()}) cannot be before academic year start (${ay.startDate.toDateString()})`
        )
      );
    }

    if (ay.endDate && this.endDate && this.endDate > ay.endDate) {
      return next(
        new Error(
          `Enrollment endDate (${this.endDate.toDateString()}) cannot exceed academic year end (${ay.endDate.toDateString()})`
        )
      );
    }

    // 2. Date ordering
    if (this.endDate && this.startDate >= this.endDate) {
      return next(new Error("startDate must be earlier than endDate"));
    }
    if (["transferred", "completed", "left"].includes(this.status) && !this.endDate) {
      return next(
        new Error(`Enrollment with status "${this.status}" must have an endDate.`)
      );
    }
    if (this.status === "active") {
      const thisEnd = this.endDate || new Date("9999-12-31");
      const overlapping = await Enrollment.findOne({
        student: this.student,
        academicYear: this.academicYear,
        status: "active",
        _id: { $ne: this._id },
        $or: [
          { startDate: { $lte: thisEnd }, endDate: { $gte: this.startDate } },
          { startDate: { $lte: thisEnd }, endDate: null },
        ],
      });
      if (overlapping) {
        return next(
          new Error(
            "Student already has an active enrollment in this academic year. Use transfer instead."
          )
        );
      }
    }

    next();
  } catch (err) {
    next(err);
  }
});

studentEnrollmentSchema.pre("save", function (next) {
  this.wasNew = this.isNew;
  next();
});

studentEnrollmentSchema.post("save", async function (doc) {
  const User = mongoose.model("User");

  if (doc.status === "active") {
    const updateData = {
      currentEnrollment: doc._id,
      lifecycleStatus: "enrolled",
    };
    const student = await User.findById(doc.student).select("accountStatus");
    if (student?.accountStatus === "pending") {
      updateData.accountStatus = "active";
    }

    await User.findByIdAndUpdate(doc.student, updateData);
  } else {
    const stillActive = await mongoose.model("StudentEnrollment").findOne({
      student: doc.student,
      status: "active",
      _id: { $ne: doc._id },
    });

    if (stillActive) {
      await User.findByIdAndUpdate(doc.student, {
        currentEnrollment: stillActive._id,
        lifecycleStatus: "enrolled",
      });
    } else {
      let newLifecycle;
      switch (doc.status) {
        case "transferred":
          newLifecycle = "transferred";
          break;
        case "completed":
        case "left":
        default:
          newLifecycle = "unenrolled";
          break;
      }
      await User.findByIdAndUpdate(doc.student, {
        currentEnrollment: null,
        lifecycleStatus: newLifecycle,
      });
    }
  }
});
studentEnrollmentSchema.statics.transferStudent = async function ({
  studentId,
  newCampusId,
  newClassGroupId,
  academicYearId,
  transferDate,
  feePlan,
}) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const Enrollment = this;
    const current = await Enrollment.findOne({
      student: studentId,
      academicYear: academicYearId,
      status: "active",
    }).session(session);

    if (!current) throw new Error("No active enrollment found to transfer.");
    current.endDate = transferDate;
    current.status = "transferred";
    current.transferredTo = newCampusId;
    await current.save({ session });

    const [newEnrollment] = await Enrollment.create(
      [
        {
          student: studentId,
          academicYear: academicYearId,
          campus: newCampusId,
          classGroup: newClassGroupId,
          startDate: new Date(new Date(transferDate).getTime() + 86_400_000),
          status: "active",
          feePlan: feePlan && feePlan.length ? feePlan : current.feePlan,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    return newEnrollment;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

studentEnrollmentSchema.statics.expireOverdueEnrollments = async function () {
  const now = new Date();

  const overdue = await this.find({
    status: "active",
    endDate: { $ne: null, $lte: now },
  }).select("_id student note");

  if (overdue.length === 0) return 0;

  const bulkOps = overdue.map((e) => ({
    updateOne: {
      filter: { _id: e._id, status: "active" },
      update: {
        status: "completed",
        note: `${e.note || ""} [Auto-completed]`.trim(),
      },
    },
  }));
  await this.bulkWrite(bulkOps);

  const studentIds = [...new Set(overdue.map((e) => e.student.toString()))];
  const User = mongoose.model("User");

  for (const sid of studentIds) {
    const activeCount = await this.countDocuments({
      student: sid,
      status: "active",
    });
    if (activeCount === 0) {
      await User.findByIdAndUpdate(sid, {
        lifecycleStatus: "unenrolled",
        currentEnrollment: null,
      });
    }
  }

  return overdue.length;
};
studentEnrollmentSchema.statics.getActiveEnrollment = function (studentId) {
  return this.findOne({ student: studentId, status: "active" })
    .populate("campus", "name code")
    .populate("academicYear", "name")
    .populate("classGroup", "name grade section");
};

studentEnrollmentSchema.statics.getYearHistory = function (studentId, academicYearId) {
  const query = { student: studentId };
  if (academicYearId) query.academicYear = academicYearId;
  return this.find(query)
    .sort({ startDate: 1 })
    .populate("campus", "name code")
    .populate("academicYear", "name")
    .populate("classGroup", "name grade section");
};

studentEnrollmentSchema.statics.getEnrolledIds = function (academicYearId, campusId) {
  const filter = { academicYear: academicYearId, status: "active" };
  if (campusId) filter.campus = campusId;
  return this.find(filter).distinct("student");
};

export default mongoose.model("StudentEnrollment", studentEnrollmentSchema);
