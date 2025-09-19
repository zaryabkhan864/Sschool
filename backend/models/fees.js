import mongoose from "mongoose";

export const FeesSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        validate: {
            validator: async function (studentId) {
                const user = await mongoose.model("User").findById(studentId);
                return user && user.role === "student";
            },
            message: "The referenced user must be a student."
        }
    },
    amount: { type: Number, required: true },
    feeType: { type: String, enum: ["Admission", "Tuition", "Exam", "Transport", "Hostel"], required: true },
    currency: { type: String, enum: ["USD", "EUR", "GBP", "TL", "AUD", "CAD", "AED"], default: "USD" },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ["Paid", "Unpaid", "Overdue"], default: "Unpaid" },
    paymentDate: { type: Date },
    paymentMethod: { type: String, enum: ["Cash", "Bank Transfer", "Online"] },
    campus:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Campus",
      },
      year:{
        type: Number,
        required: [true, "Please enter course year"],
      }
});

export default mongoose.model("Fees", FeesSchema);