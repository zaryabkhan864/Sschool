// models/classGroup.js
import mongoose from "mongoose";

const classGroupSchema = new mongoose.Schema(
  {
    grade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grade",
      required: true,
    },
    academicLevel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicLevel",
      required: true,
    },
    section: {
      type: String, // A, B, ENG, SCIENCE
      required: true,
      trim: true,
      uppercase: true
    },
    displayName: {
      type: String, // "7B", "11 ENG", "10 SCIENCE"
      required: true,
      trim: true
    },
    // ✅ Courses field add kiya
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: false,
      }
    ],
    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ClassGroup", classGroupSchema);