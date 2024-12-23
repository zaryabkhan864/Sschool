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
    },
    year: {
      type: Number,
      required: [true, "Please enter the year of course offer"],
    },
    grade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grade",
      required: true,
    }, // Associated grade
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    }, //Assigned teacher
  },
  { timestamps: false }
);

export default mongoose.model("Course", courseSchema);