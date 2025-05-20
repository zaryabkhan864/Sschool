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
    courses: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: false },
    ], // Courses offered in this grade
    campus:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
    },
    year:{
      type: Number,
      required: [true, "Please enter course year"],
    }
  },
  { timestamps: false }
);

export default mongoose.model("Grade", gradeSchema);
