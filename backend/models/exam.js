// models/exam.js
import mongoose from "mongoose";

const examMarkSchema = new mongoose.Schema(
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
    // One entry per question — length must equal the exam's
    // totalQuestions, each value capped at marksPerQuestion. Checked in
    // the parent's pre-validate hook below.
    answers: {
      type: [Number],
      default: [],
    },
  },
  { _id: false }
);

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please enter a title for the exam"],
      trim: true,
      maxLength: [150, "Title cannot exceed 150 characters"],
    },
    examNumber: {
      type: Number,
      required: [true, "Please specify the exam number"],
      min: [1, "Exam number must be at least 1"],
    },
    // ✅ NEW — the date the exam was actually conducted
    date: {
      type: Date,
      required: [true, "Please enter the date the exam was conducted"],
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
      required: [true, "Please specify the teacher responsible for this exam"],
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

    // ✅ FIX: previously hardcoded to exactly 10 questions with no upper
    // cap on marks per question. Now fully teacher-configurable per exam,
    // same as the Quiz module — one exam can have 10 questions, another
    // 20 or 50, each worth however many marks the teacher decides.
    totalQuestions: {
      type: Number,
      required: [true, "Please specify how many questions this exam has"],
      min: [1, "An exam must have at least 1 question"],
      max: [200, "An exam cannot exceed 200 questions"],
    },
    marksPerQuestion: {
      type: Number,
      required: [true, "Please specify how many marks each question is worth"],
      min: [1, "Each question must be worth at least 1 mark"],
    },

    marks: [examMarkSchema],
  },
  { timestamps: true }
);

examSchema.virtual("totalMarks").get(function () {
  return this.totalQuestions * this.marksPerQuestion;
});
examSchema.set("toJSON", { virtuals: true });
examSchema.set("toObject", { virtuals: true });

// One exam-number per class group + course + academic year.
examSchema.index({ classGroup: 1, course: 1, examNumber: 1, academicYear: 1 }, { unique: true });
examSchema.index({ teacher: 1, campus: 1, academicYear: 1 });

examSchema.pre("validate", function (next) {
  for (const mark of this.marks) {
    if (mark.answers.length !== this.totalQuestions) {
      return next(
        new Error(
          `Each student's answers must have exactly ${this.totalQuestions} entries (this exam has ${this.totalQuestions} questions)`
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

export default mongoose.model("Exam", examSchema);
