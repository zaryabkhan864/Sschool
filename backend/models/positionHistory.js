import mongoose from "mongoose";
import salarySchema from "./salaryDetails.js";

const positionHistorySchema = new mongoose.Schema(
  {
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmployeeContract",
      required: [true, "Position history must belong to a contract"],
      immutable: true,
    },
    role: {
      type: String,
      required: [true, "Role is required"],
    },
    designationLevel: {
      type: String,
      enum: ["junior", "mid", "senior", "lead", "manager", "assistant"],
    },
    salary: {
      type: salarySchema,
      required: [true, "Salary details are required"],
    },
    effectiveDate: {
      type: Date,
      required: [true, "Effective date is required"],
      immutable: true,
    },
    reason: {
      type: String,
      enum: ["initial", "promotion", "demotion", "salary_revision", "lateral_move"],
      required: true,
      immutable: true,
    },
    note: {
      type: String,
      trim: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Position change must record who approved it"],
      immutable: true,
    },
  },
  { timestamps: true }
);

// ====================== INDEXES ======================
positionHistorySchema.index({ contract: 1, effectiveDate: -1 });
positionHistorySchema.index({ contract: 1, createdAt: -1 });

// Prevent inserting a position entry dated earlier than the current latest one —
// history must move forward in time, never be inserted retroactively out of order.
positionHistorySchema.pre("save", async function (next) {
  if (!this.isNew) return next();
  const Position = this.constructor;
  const latest = await Position.findOne({ contract: this.contract }).sort({ effectiveDate: -1 });
  if (latest && this.effectiveDate < latest.effectiveDate) {
    return next(
      new Error("New position entry cannot be dated earlier than the current position")
    );
  }
  next();
});

// ====================== STATIC: Get current position ======================
positionHistorySchema.statics.getCurrentPosition = function (contractId) {
  return this.findOne({ contract: contractId }).sort({ effectiveDate: -1 });
};

// ====================== STATIC: Record a change (promotion, raise, etc.) ======================
// This is the single write-path for any role/designation/salary change.
// It also syncs EmployeeContract's denormalized snapshot so reads stay fast.
positionHistorySchema.statics.recordChange = async function ({
  contractId,
  role,
  designationLevel,
  salary,
  effectiveDate,
  reason,
  approvedBy,
  note,
}) {
  const Contract = mongoose.model("EmployeeContract");
  const contract = await Contract.findById(contractId);
  if (!contract) throw new Error("Contract not found");
  if (!["active", "draft"].includes(contract.status)) {
    throw new Error("Cannot change position on a contract that is not active or draft");
  }
  if (!approvedBy) {
    throw new Error("approvedBy is required to record a position change");
  }

  const entry = await this.create({
    contract: contractId,
    role: role || contract.role,
    designationLevel: designationLevel ?? contract.designationLevel,
    salary: salary || contract.salary,
    effectiveDate: effectiveDate || new Date(),
    reason,
    approvedBy,
    note,
  });

  // Keep the contract's denormalized "current" fields in sync for fast reads.
  contract.role = entry.role;
  contract.designationLevel = entry.designationLevel;
  contract.salary = entry.salary;
  await contract.save();

  return entry;
};

// ====================== STATIC: Full timeline for a contract ======================
positionHistorySchema.statics.getTimeline = function (contractId) {
  return this.find({ contract: contractId }).sort({ effectiveDate: 1 });
};

export default mongoose.model("PositionHistory", positionHistorySchema);
