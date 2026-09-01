// models/homeworkAssignment.js
import mongoose from "mongoose";

const homeworkAssignmentSchema = new mongoose.Schema(
  {
    // Homework or Assignment
    type: {
      type: String,
      enum: ["homework", "assignment"],
      required: [true, "Please specify type (homework or assignment)"],
    },

    title: {
      type: String,
      required: [true, "Please enter a title/topic"],
      trim: true,
      maxLength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Please enter a description"],
      trim: true,
      maxLength: [2000, "Description cannot exceed 2000 characters"],
    },

    // Where it belongs
    classGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassGroup",
      required: [true, "Class group is required"],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Teacher is required"],
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

    // Targeting — all students of the class group, or a specific subset
    targetType: {
      type: String,
      enum: ["all", "individual"],
      default: "all",
    },
    targetStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        validate: {
          validator: async function (studentId) {
            const user = await mongoose.model("User").findById(studentId);
            return user && user.role === "student";
          },
          message: "targetStudents must reference students only",
        },
      },
    ],

    dueDate: {
      type: Date,
      required: [true, "Please enter a due date"],
    },

    totalMarks: {
      type: Number,
      min: [0, "Total marks cannot be negative"],
      default: null,
    },

    // Optional teacher-attached files (question paper, reference material)
    attachments: [
      {
        public_id: { type: String },
        url: { type: String },
        name: { type: String },
      },
    ],

    // Active / Inactive (soft toggle, separate from hard delete)
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Fast lookups for teacher's own postings, class-group-wise listing,
// and student-facing queries (classGroup + campus + academicYear + status)
homeworkAssignmentSchema.index({ classGroup: 1, campus: 1, academicYear: 1, status: 1 });
homeworkAssignmentSchema.index({ teacher: 1, campus: 1, academicYear: 1 });
homeworkAssignmentSchema.index({ course: 1, classGroup: 1 });
homeworkAssignmentSchema.index({ targetStudents: 1 });

// Guard: individual targeting must actually include students
homeworkAssignmentSchema.pre("validate", function (next) {
  if (this.targetType === "individual" && (!this.targetStudents || this.targetStudents.length === 0)) {
    return next(new Error("Please select at least one student for individual targeting"));
  }
  if (this.targetType === "all") {
    // keep the array clean when targeting everyone
    this.targetStudents = [];
  }
  next();
});

export default mongoose.model("HomeworkAssignment", homeworkAssignmentSchema);
