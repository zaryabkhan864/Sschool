import mongoose from "mongoose";

// ✅ Keep this list in sync with PAYMENT_TYPE_OPTIONS in
//    src/components/GUI/EmployeeContractForm.jsx
export const PAYMENT_TYPES = [
  "hourly",
  "daily",
  "weekly",
  "bi_weekly",
  "monthly",
  "quarterly",
  "yearly",
];

// ✅ Keep this list in sync with CURRENCY_OPTIONS in
//    src/components/GUI/EmployeeContractForm.jsx
export const CURRENCIES = ["USD", "EUR", "GBP", "TRY", "PKR", "AED", "SAR"];

const salaryDetailsSchema = new mongoose.Schema(
  {
    baseSalary: {
      type: Number,
      required: [true, "Base salary is required"],
      min: [0, "Base salary cannot be negative"],
    },
    paymentType: {
      type: String,
      enum: {
        values: PAYMENT_TYPES,
        message: "paymentType must be one of: " + PAYMENT_TYPES.join(", "),
      },
      default: "monthly",
    },
    currency: {
      type: String,
      enum: {
        values: CURRENCIES,
        message: "currency must be one of: " + CURRENCIES.join(", "),
      },
      default: "USD",
      uppercase: true,
      trim: true,
    },
    allowances: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    annualLeaveAllowance: {
      type: Number,
      default: 0,
      min: [0, "Annual leave allowance cannot be negative"],
    },
  },
  { timestamps: true }
);
export default salaryDetailsSchema;