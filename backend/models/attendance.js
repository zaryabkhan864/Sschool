import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Referencing the User model
      required: [true, "Please provide a student"],
    },
    date: {
      type: Date,
      required: [true, "Please provide the date"],
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["present", "absent", "late", "half-day"],
      default: "present",
    },
    remarks: {
      type: String,
      maxLength: [100, "Remarks cannot exceed 100 characters"],
    },
  },
  { timestamps: true }
);
export default mongoose.model("Attendance",attendanceSchema);