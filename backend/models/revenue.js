const mongoose = require("mongoose");

const RevenueSchema = new mongoose.Schema({
    source: { type: String, enum: ["Fees", "Donations", "Grants"], required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Revenue", RevenueSchema);
