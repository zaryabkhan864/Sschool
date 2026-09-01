import mongoose from "mongoose";

const salarySchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Employee reference is required"],
    },
    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
    },
    year: {
      type: Number,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    month: {
      type: String,
      required: [true, "Month is required"],
    },
    status: {
      type: String,
      enum: {
        values: ["Paid", "Unpaid"],
        message: "status must be either Paid or Unpaid",
      },
      default: "Unpaid",
    },
    paymentDate: {
      type: Date,
    },
    deductions: {
      type: Number,
      default: 0,
      min: [0, "Deductions cannot be negative"],
    },
    netSalary: {
      type: Number,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Salary", salarySchema);