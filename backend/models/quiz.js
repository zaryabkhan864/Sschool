import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    semester: {
      type: Number,
      required: [true, "Please specify the semester"],
      enum: [1, 2], // 1 year = 2 semesters
    },
    quarter: {
      type: Number,
      required: [true, "Please specify the quarter"],
      enum: [1, 2], // Each semester has 2 quarters
    },
    quizNumber: {
      type: Number,
      required: [true, "Please specify the quiz number"],
      enum: [1, 2], // Each quarter has 2 quizzes
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Please specify the associated course"],
    },
    grade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grade",
      required: [true, "Please specify the associated grade"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: [true, "Please specify the teacher responsible for this quiz"],
    },
    marks: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Student",
        },
        question1: {
          type: Number,
          required: true,
          default: 0,
          min: [0, "Marks cannot be less than 0"],
          max: [2, "Marks cannot exceed 2"], // Each question is worth 2 marks
        },
        question2: {
          type: Number,
          required: true,
          default: 0,
          min: [0, "Marks cannot be less than 0"],
          max: [2, "Marks cannot exceed 2"],
        },
        question3: {
          type: Number,
          required: true,
          default: 0,
          min: [0, "Marks cannot be less than 0"],
          max: [2, "Marks cannot exceed 2"],
        },
        question4: {
          type: Number,
          required: true,
          default: 0,
          min: [0, "Marks cannot be less than 0"],
          max: [2, "Marks cannot exceed 2"],
        },
        question5: {
          type: Number,
          required: true,
          default: 0,
          min: [0, "Marks cannot be less than 0"],
          max: [2, "Marks cannot exceed 2"],
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Quiz", quizSchema);
