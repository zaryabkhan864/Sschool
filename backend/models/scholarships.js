import mongoose from "mongoose";

export const SCHOLARSHIP_TYPES = ["Percentage", "Fixed"];
export const SCHOLARSHIP_STATUSES = ["Pending", "Approved", "Rejected"];

const scholarshipSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student reference is required"],
      validate: {
        validator: async function (studentId) {
          const user = await mongoose.model("User").findById(studentId);
          return user && user.role === "student";
        },
        message: "The referenced user must be a student.",
      },
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: [true, "Academic year is required"],
    },
    // Optional link to the enrollment this scholarship was created/updated
    // alongside. Not required because a scholarship can, in principle,
    // be reviewed/updated independently of a specific enrollment record.
    enrollment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentEnrollment",
      default: null,
    },
    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      default: null,
    },
    type: {
      type: String,
      enum: {
        values: SCHOLARSHIP_TYPES,
        message: "type must be one of: " + SCHOLARSHIP_TYPES.join(", "),
      },
      default: "Percentage",
      required: true,
    },
    percentage: {
      type: Number,
      min: [0, "Percentage cannot be negative"],
      max: [100, "Percentage cannot exceed 100"],
      required: function () {
        return this.type === "Percentage";
      },
    },
    amount: {
      type: Number,
      min: [0, "Amount cannot be negative"],
      required: function () {
        return this.type === "Fixed";
      },
    },
    criteria: {
      type: String,
      required: [true, "Please describe the scholarship criteria"],
      trim: true,
      maxLength: [300, "Criteria cannot exceed 300 characters"],
    },
    status: {
      type: String,
      enum: {
        values: SCHOLARSHIP_STATUSES,
        message: "status must be one of: " + SCHOLARSHIP_STATUSES.join(", "),
      },
      default: "Pending",
    },
  },
  { timestamps: true }
);

// One scholarship per student per academic year — matches the frontend's
// "check existing, then update instead of duplicating" logic in
// UpdateStudentEnrollment.jsx / scholarshipApi.js.
scholarshipSchema.index({ student: 1, academicYear: 1 }, { unique: true });
scholarshipSchema.index({ status: 1, academicYear: 1 });

// Given a base fee amount, return what the student actually owes once
// this scholarship is applied. Only Approved scholarships give a discount —
// Pending/Rejected scholarships must not silently change what's billed.
scholarshipSchema.methods.applyTo = function (baseAmount) {
  const base = Number(baseAmount) || 0;
  if (this.status !== "Approved") return base;

  if (this.type === "Percentage") {
    const pct = Number(this.percentage) || 0;
    return Math.max(0, base - (base * pct) / 100);
  }

  const amt = Number(this.amount) || 0;
  return Math.max(0, base - amt);
};

export default mongoose.model("Scholarship", scholarshipSchema);