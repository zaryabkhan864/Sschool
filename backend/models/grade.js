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
    yearFrom: {
      type: Number,
      required: [true, "Please enter the year from of the grade"],
    },
    yearTo: {
      type: Number,
      required: [true, "Please enter the year to of the grade"],
    },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }], // Courses offered in this grade
  },
  { timestamps: false }
);

export default mongoose.model("Grade", gradeSchema);
