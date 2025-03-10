const mongoose = require("mongoose");

const ScholarshipSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, validate: {
        validator: async function (studentId) {
            const user = await mongoose.model("User").findById(studentId);
            return user && user.role === "student";
        },
        message: "The referenced user must be a student."
    } },
    amount: { type: Number, required: true },
    criteria: { type: String, required: true },
    status: { type: String, enum: ["Approved", "Pending", "Rejected"], default: "Pending" }
});

module.exports = mongoose.model("Scholarship", ScholarshipSchema);
