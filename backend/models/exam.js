import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
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
      ref: "User",
      required: [true, "Please specify the teacher responsible for this exam"],
      validate: {
        validator: async function (teacherId) {
            const user = await mongoose.model("User").findById(teacherId);
            return user && user.role === "teacher";
        },
        message: "The referenced user must be a teacher."
    },
    campus:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
    },
    year: {
      type: Number,
      required: [true, "Please enter course year"],
    },

    },
    marks: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "User",
          validate: {
            validator: async function (studentId) {
                const user = await mongoose.model("User").findById(studentId);
                return user && user.role === "student";
            },
            message: "The referenced user must be a student."
        }
        },
        question1: {
          type: Number,
          required: true,
          default: 0,
          min: [0, "Marks cannot be less than 0"], // Each question is worth 2 marks
        },
        question2: {
          type: Number,
          required: true,
          default: 0,
          min: [0, "Marks cannot be less than 0"],
        },
        question3: {
          type: Number,
          required: true,
          default: 0,
          min: [0, "Marks cannot be less than 0"],
        },
        question4: {
          type: Number,
          required: true,
          default: 0,
          min: [0, "Marks cannot be less than 0"],
        },
        question5: {
          type: Number,
          required: true,
          default: 0,
          min: [0, "Marks cannot be less than 0"],
        },
        question6: {
          type: Number,
          required: true,
          default: 0,
          min: [0, "Marks cannot be less than 0"], 
        },
        question7: {
          type: Number,
          required: true,
          default: 0,
          min: [0, "Marks cannot be less than 0"],
        },
        question8: {
          type: Number,
          required: true,
          default: 0,
          min: [0, "Marks cannot be less than 0"],
        },
        question9: {
          type: Number,
          required: true,
          default: 0,
          min: [0, "Marks cannot be less than 0"],
        },
        question10: {
          type: Number,
          required: true,
          default: 0,
          min: [0, "Marks cannot be less than 0"],
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Exam", examSchema);
