
import mongoose from "mongoose";


export const RevenueSchema = new mongoose.Schema({
    source: { type: String, enum: ["Fees", "Donations", "Grants"], required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});


export default mongoose.model("Revenue", RevenueSchema);
