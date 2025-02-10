import mongoose from "mongoose";


export const ExpenseSchema = new mongoose.Schema({
    category: { type: String, enum: ["Electricity", "Maintenance", "Books", "Furniture", "Events"], required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    description: { type: String },
    vendor: { type: String }
});


export default mongoose.model("Expense", ExpenseSchema);
