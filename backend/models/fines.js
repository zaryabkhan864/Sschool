const mongoose = require("mongoose");

const FineSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ["Paid", "Unpaid"], default: "Unpaid" },
    dateIssued: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Fine", FineSchema);
