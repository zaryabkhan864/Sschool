// models/grade.js
import mongoose from "mongoose";

// models/grade.js
const gradeSchema = new mongoose.Schema(
  {
    gradeName: {
      type: String,
      required: [true, "Please enter Grade name"],
      maxLength: [30, "Grade name cannot exceed 30 characters"],
    },
    // ✅ Ye field add karein
    academicLevel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicLevel",
      required: [true, "Please select Academic Level"],
    },
    description: {
      type: String,
      required: [true, "Please enter description of the grade"],
      maxLength: [50, "Description cannot exceed 50 characters"],
    },
    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      required: true,
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);
export default mongoose.model("Grade", gradeSchema);