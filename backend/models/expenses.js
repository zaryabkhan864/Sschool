import mongoose from "mongoose";

export const EXPENSE_CATEGORIES = ["Electricity", "Maintenance", "Books", "Furniture", "Events"];
export const EXPENSE_PAYMENT_METHODS = ["Cash", "Bank Transfer", "Online"];

// Lightweight audit trail — same idea as EmployeeContract's embedded
// `audit` sub-schema, but scoped to what actually applies to an expense
// (no termination/re-hire concept here, just who created/last-edited
// this record).
const expenseAuditSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "createdBy is required for audit trail"],
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { _id: false }
);

export const ExpenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: {
        values: EXPENSE_CATEGORIES,
        message: "category must be one of: " + EXPENSE_CATEGORIES.join(", "),
      },
      required: true,
    },
    amount: { type: Number, required: true, min: [0.01, "Amount must be greater than 0"] },
    date: { type: Date, default: Date.now },
    description: { type: String, trim: true },
    vendor: { type: String, trim: true },

    // ── NEW: how the school actually paid this expense, and a
    // reference number for the invoice/receipt/transaction on the
    // vendor's side — mirrors the paymentMethod/paymentReference
    // pattern already used in Fees and Salaries.
    paymentMethod: {
      type: String,
      enum: EXPENSE_PAYMENT_METHODS,
      default: "Cash",
    },
    reference: { type: String, trim: true, default: null },

    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
    },
    // 👇 NEW: was missing entirely, even though
    // feesController.js's getRevenueVsExpenses already tries to match
    // Expense documents by academicYear — without this field that
    // match silently found nothing whenever an academicYear filter was
    // in play. Optional, same as campus, so nothing already-created
    // breaks.
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      default: null,
    },

    // 👇 NEW: who recorded/last edited this expense.
    audit: {
      type: expenseAuditSchema,
      required: true,
    },
  },
  { timestamps: true }
);

ExpenseSchema.index({ category: 1, date: -1 });
ExpenseSchema.index({ campus: 1, academicYear: 1, date: -1 });

export default mongoose.model("Expense", ExpenseSchema);
