const mongoose = require("mongoose");

const ScholarshipSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    amount: { type: Number, required: true },
    criteria: { type: String, required: true },
    status: { type: String, enum: ["Approved", "Pending", "Rejected"], default: "Pending" }
});

module.exports = mongoose.model("Scholarship", ScholarshipSchema);
