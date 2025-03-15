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
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    }, //Assigned teacher
    campus:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
    },
  },
  { timestamps: false }
);

export default mongoose.model("Course", courseSchema);