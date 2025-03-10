const mongoose = require("mongoose");

const FineSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, validate: {
        validator: async function (studentId) {
            const user = await mongoose.model("User").findById(studentId);
            return user && user.role === "student";
        },
        message: "The referenced user must be a student."
    } },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ["Paid", "Unpaid"], default: "Unpaid" },
    dateIssued: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Fine", FineSchema);
