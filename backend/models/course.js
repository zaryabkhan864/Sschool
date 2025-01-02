import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      required: [true, "please enter course name"],
      maxLength: [200, "Course name cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Please enter description of course"],
      maxLength: [200, "Course description cannot exceed 200 characters"],
    },
    code: {
      type: String,
      required: [true, "Please enter the code of course"],
      maxLength: [8, "Code cannot exceed 8 characters"],

    },
    year: {
      type: Number,
      required: [true, "Please enter the year of course offer"],
    },
    grade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grade",
      required: false,
    }, // Associated grade
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: false,
    }, //Assigned teacher
  },
  { timestamps: false }
);

export default mongoose.model("Course", courseSchema);