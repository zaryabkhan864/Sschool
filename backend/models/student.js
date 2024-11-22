import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: [true, "Please enter student name"],
    maxLength: [200, "Student name cannot exceed 200 characters"],
  },
  age: {
    type: Number,
    required: [true, "Please enter age of student"],
    maxLength: [2, "Student age cannot exceed 2 digits"],
  },
  gender: {
    type: String,
    required: [true, "Please enter the gender of student"],
  },
  nationality: {
    type: String,
    required: [true, "Please enter the nationality of student"],
  },
  images: [
    {
      public_id: {
        type: String,
        required: false,
      },
      url: {
        type: String,
        required: false,
      },
    },
  ],
  studentPhoneNumber: {
    type: Number,
    required: [true, "Please enter the student number"],
    maxLength: [10, "Contact number should be 10 digits"],
  },
  parentOnePhoneNumber: {
    type: Number,
    required: [true, "Please enter students parent number"],
    maxLength: [10, "Contact number should be 10 digits"],
  },
  parentTwoPhoneNumber: {
    type: Number,
    maxLength: [10, "Contact number should be 10 digits"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  grade: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Grade",
    required: false,
  }, // Current grade
  enrolledCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ], //courses the student is enrolled in
});

export default mongoose.model("Student", studentSchema);
