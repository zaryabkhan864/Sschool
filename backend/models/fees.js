import mongoose from "mongoose";

export const FeesSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    amount: { type: Number, required: true },
    feeType: { type: String, enum: ["Admission", "Tuition", "Exam", "Transport", "Hostel"], required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ["Paid", "Unpaid", "Overdue"], default: "Unpaid" },
    paymentDate: { type: Date },
    paymentMethod: { type: String, enum: ["Cash", "Bank Transfer", "Online"] }
});


export default mongoose.model("Fees", FeesSchema);

