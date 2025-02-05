import mongoose from "mongoose";

const TeacherLeaveSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    leaveType: {
      type: String,
      enum: ["Full Day", "Half Day"],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date }, // Only needed for full day leaves
    totalDays: { type: Number, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    }, // If approved, store the admin ID
  },
  { timestamps: false }
);
export default mongoose.model("TeacherLeave", TeacherLeaveSchema);
