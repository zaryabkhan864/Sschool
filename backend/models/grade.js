// Grade model me ye changes karein:
import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema(
  {
    gradeName: {
      type: String,
      required: [true, "Please enter Grade name"],
      maxLength: [30, "Grade name cannot exceed 30 characters"],
    },
    description: {
      type: String,
      required: [true, "Please enter description of the grade"],
      maxLength: [50, "Description cannot exceed 50 characters"],
    },
    academicLevel: {  // ✅ ADD THIS FIELD
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicLevel",
      required: true,
    },
    order: {  // ✅ OPTIONAL: Agar aapko ordering chahiye
      type: Number,
      required: false,
    },
    courses: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: false },
    ],
    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
    },
    year: {
      type: Number,
      required: [true, "Please enter course year"],
    }
  },
  { timestamps: false }
);

export default mongoose.model("Grade", gradeSchema);