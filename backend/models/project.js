// models/project.js
import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
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
      maxLength: [3000, "Description cannot exceed 3000 characters"],
    },

    classGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassGroup",
      required: [true, "Class group is required"],
    },
    // Optional — a project can span more than one subject
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: false,
      default: null,
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

    // Whole class, or a hand-picked subset of students
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

    attachments: [
      {
        public_id: { type: String },
        url: { type: String },
        name: { type: String },
      },
    ],

    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

projectSchema.index({ classGroup: 1, campus: 1, academicYear: 1, status: 1 });
projectSchema.index({ teacher: 1, campus: 1, academicYear: 1 });
projectSchema.index({ course: 1, classGroup: 1 });
projectSchema.index({ targetStudents: 1 });

projectSchema.pre("validate", function (next) {
  if (this.targetType === "individual" && (!this.targetStudents || this.targetStudents.length === 0)) {
    return next(new Error("Please select at least one student for individual targeting"));
  }
  if (this.targetType === "all") {
    this.targetStudents = [];
  }
  next();
});

export default mongoose.model("Project", projectSchema);
