import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      required: [true, "Please enter course name"],
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
      maxLength: [9, "Code cannot exceed  characters"],
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },
    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: [true, "Please select an academic year"],
    },
    // NEW – status field for the course itself
    status: {
      type: Boolean,
      default: true,   // true = Active, false = Inactive
    },
  },
  { timestamps: true }   // now createdAt and updatedAt will be generated
);

export default mongoose.model("Course", courseSchema);