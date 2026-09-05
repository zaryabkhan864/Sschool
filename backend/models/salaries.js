import mongoose from "mongoose";

export const SALARY_STATUSES = ["Unpaid", "Paid"];
export const SALARY_PAYMENT_METHODS = ["Cash", "Bank Transfer", "Online"];
export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const salarySchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Employee reference is required"],
    },
    // Which contract this salary was generated from — lets finance trace
    // exactly why the amount is what it is, and is what makes salaries
    // "contract-based" rather than freely typed numbers. Optional only
    // for backward compatibility with any salary rows created before
    // this field existed.
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmployeeContract",
      default: null,
    },
    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      default: null,
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      default: null,
    },

    month: {
      type: String,
      enum: { values: MONTH_NAMES, message: "month must be a full month name, e.g. 'January'" },
      required: [true, "Month is required"],
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
    },

    // Gross amount for this month — copied from the contract's
    // baseSalary (+ any numeric allowances) at generation time.
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    currency: {
      type: String,
      default: "USD",
    },

    // ── Deduction (the "detect/deduct for some reason" requirement) ──
    deductions: {
      type: Number,
      default: 0,
      min: [0, "Deductions cannot be negative"],
    },
    deductionReason: {
      type: String,
      trim: true,
      default: null,
    },

    // Always kept as max(0, amount - deductions) — recomputed server-side
    // any time amount/deductions change, never trusted from the client.
    netSalary: {
      type: Number,
      required: true,
      min: [0, "Net salary cannot be negative"],
    },

    status: {
      type: String,
      enum: SALARY_STATUSES,
      default: "Unpaid",
    },
    paymentDate: { type: Date, default: null },

    // 👇 FIX: no `default: null` here. A generated-but-not-yet-paid
    // salary has no payment method at all yet — leaving this field
    // simply unset is what a non-required field is supposed to do.
    // `default: null` was actively wrong: Mongoose runs the `enum`
    // validator against the default value too, and `null` is not one
    // of SALARY_PAYMENT_METHODS, so every single generated (Unpaid)
    // salary failed validation on save. Once markSalaryAsPaid /
    // paySalariesBulk sets a real value ("Cash" / "Bank Transfer" /
    // "Online"), it validates normally.
    paymentMethod: { type: String, enum: SALARY_PAYMENT_METHODS },

    // ── POS-style cash handling / receipt info (mirrors the Fees module) ──
    amountTendered: { type: Number, default: null },
    changeReturned: { type: Number, default: null },
    paymentReference: { type: String, trim: true, default: null },
    receiptNo: { type: String, trim: true, default: null },
  },
  { timestamps: true }
);

// One salary row per employee per calendar month — this is what makes
// "generate monthly salaries" idempotent: running it twice for the same
// month never creates duplicates.
salarySchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });
salarySchema.index({ status: 1, month: 1, year: 1 });
salarySchema.index({ status: 1, employeeId: 1 });

export default mongoose.model("Salary", salarySchema);
