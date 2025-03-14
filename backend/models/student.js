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
  passportNumber: {
    type: String,
    required: [false, "Please enter the passport number of student"],
    maxLength: [14, "Passport number cannot exceed 14 digits"],
  },
  siblings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student", // Referencing other students
    },
  ],
  avatar: {
    public_id: String,
    url: String,
  },
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
  address: {
    type: String,
    required: [true, "Please enter the address of the student"],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  grade: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Grade",
    required: false,
  },

});

export default mongoose.model("Student", studentSchema);
