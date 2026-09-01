import mongoose from "mongoose";

// ─────────────────────────────────────────────
// Audit Sub-Schema
// Embedded inside EmployeeContract — not a standalone collection
// Tracks who created, updated, or terminated a contract
// ─────────────────────────────────────────────
const auditSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "createdBy is required for audit trail"],
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    terminatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    terminationReason: {
      type: String,
      trim: true,
      default: null,
    },
    // Admin who approved re-hire for a previously terminated employee
    reHireApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { _id: false } // No separate _id — this is embedded
);

export default auditSchema;
