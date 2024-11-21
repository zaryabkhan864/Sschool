import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    grade: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Grade",
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Course",
    },
    semester: {
      type: Number,
      required: true,
    },
    term: {
      type: Number,
      required: true,
    },
    quizNumber: {
      type: Number,
      required: true,
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
        },
        question2: {
          type: Number,
          required: true,
          default: 0,
        },
        question3: {
          type: Number,
          required: true,
          default: 0,
        },
        question4: {
          type: Number,
          required: true,
          default: 0,
        },
        question5: {
          type: Number,
          required: true,
          default: 0,
        },
      },
    ],
  },
  { timestamps: false }
);

export default mongoose.model("Quiz", quizSchema);
