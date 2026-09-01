// models/quiz.js
import mongoose from "mongoose";

const quizMarkSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      validate: {
        validator: async function (studentId) {
          const user = await mongoose.model("User").findById(studentId);
          return user && user.role === "student";
        },
        message: "The referenced user must be a student.",
      },
    },
    // One entry per question — length must equal the quiz's
    // totalQuestions, each value capped at marksPerQuestion. Checked in
    // the parent's pre-validate hook below since a subdocument validator
    // can't see its parent's fields.
    answers: {
      type: [Number],
      default: [],
    },
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please enter a title for the quiz"],
      trim: true,
      maxLength: [150, "Title cannot exceed 150 characters"],
    },
    quizNumber: {
      type: Number,
      required: [true, "Please specify the quiz number"],
      min: [1, "Quiz number must be at least 1"],
    },
    // ✅ NEW — the date the quiz was actually conducted
    date: {
      type: Date,
      required: [true, "Please enter the date the quiz was conducted"],
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Please specify the associated course"],
    },
    classGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassGroup",
      required: [true, "Please specify the associated class group"],
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please specify the teacher responsible for this quiz"],
      validate: {
        validator: async function (teacherId) {
          const user = await mongoose.model("User").findById(teacherId);
          return user && user.role === "teacher";
        },
        message: "The referenced user must be a teacher.",
      },
    },
    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      required: [true, "Campus is required"],
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: [true, "Academic year is required"],
    },

    // ✅ FIX: previously hardcoded to exactly 5 questions worth 2 marks
    // each (question1..question5 fields). Now fully teacher-configurable
    // per quiz — one quiz can have 5 questions, another 10 or 20, each
    // worth however many marks the teacher decides.
    totalQuestions: {
      type: Number,
      required: [true, "Please specify how many questions this quiz has"],
      min: [1, "A quiz must have at least 1 question"],
      max: [100, "A quiz cannot exceed 100 questions"],
    },
    marksPerQuestion: {
      type: Number,
      required: [true, "Please specify how many marks each question is worth"],
      min: [1, "Each question must be worth at least 1 mark"],
    },

    marks: [quizMarkSchema],
  },
  { timestamps: true }
);

quizSchema.virtual("totalMarks").get(function () {
  return this.totalQuestions * this.marksPerQuestion;
});
quizSchema.set("toJSON", { virtuals: true });
quizSchema.set("toObject", { virtuals: true });

// One quiz-number per class group + course + academic year — stops the
// same "Quiz 1" from silently being created twice for the same class/course/year.
quizSchema.index({ classGroup: 1, course: 1, quizNumber: 1, academicYear: 1 }, { unique: true });
quizSchema.index({ teacher: 1, campus: 1, academicYear: 1 });

// Every student's answers array must match totalQuestions, and no single
// answer can exceed marksPerQuestion.
quizSchema.pre("validate", function (next) {
  for (const mark of this.marks) {
    if (mark.answers.length !== this.totalQuestions) {
      return next(
        new Error(
          `Each student's answers must have exactly ${this.totalQuestions} entries (this quiz has ${this.totalQuestions} questions)`
        )
      );
    }
    for (const a of mark.answers) {
      if (a < 0 || a > this.marksPerQuestion) {
        return next(new Error(`Each answer must be between 0 and ${this.marksPerQuestion} marks`));
      }
    }
  }
  next();
});

export default mongoose.model("Quiz", quizSchema);
