import mongoose from "mongoose";

export const SalarySchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    amount: { type: Number, required: true },
    month: { type: String, required: true }, // e.g., "January 2024"
    status: { type: String, enum: ["Paid", "Unpaid"], default: "Unpaid" },
    paymentDate: { type: Date },
    deductions: { type: Number, default: 0 },
    netSalary: { type: Number } // amount - deductions
});

export default mongoose.model("Salary", SalarySchema);
