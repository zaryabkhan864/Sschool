// models/homeworkSubmission.js
import mongoose from "mongoose";

const homeworkSubmissionSchema = new mongoose.Schema(
  {
    homeworkAssignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HomeworkAssignment",
      required: [true, "Homework/Assignment reference is required"],
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required"],
    },

    // Denormalized for fast scoped queries / reporting (kept in sync on create)
    classGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassGroup",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      required: true,
    },
    academicYear: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },

    submissionType: {
      type: String,
      enum: ["text", "file"],
      required: [true, "Please specify submission type (text or file)"],
    },
    textContent: {
      type: String,
      trim: true,
      maxLength: [5000, "Text submission cannot exceed 5000 characters"],
    },
    attachments: [
      {
        public_id: { type: String },
        url: { type: String },
        name: { type: String },
      },
    ],

    submittedAt: {
      type: Date,
      default: Date.now,
    },

    // submitted -> on time / late decided against dueDate at submit time
    status: {
      type: String,
      enum: ["submitted", "late", "graded"],
      default: "submitted",
    },

    marksObtained: {
      type: Number,
      min: [0, "Marks cannot be negative"],
      default: null,
    },
    feedback: {
      type: String,
      trim: true,
      maxLength: [1000, "Feedback cannot exceed 1000 characters"],
    },
  },
  { timestamps: true }
);

// One submission per student per assignment (resubmission = update existing doc)
homeworkSubmissionSchema.index({ homeworkAssignment: 1, student: 1 }, { unique: true });

// Teacher-side listing: all submissions for one assignment
homeworkSubmissionSchema.index({ homeworkAssignment: 1, status: 1 });

// Student-side listing: all of a student's submissions, campus/year scoped
homeworkSubmissionSchema.index({ student: 1, campus: 1, academicYear: 1 });

homeworkSubmissionSchema.pre("validate", function (next) {
  if (this.submissionType === "text" && !this.textContent) {
    return next(new Error("Text content is required for a text submission"));
  }
  if (this.submissionType === "file" && (!this.attachments || this.attachments.length === 0)) {
    return next(new Error("At least one file is required for a file submission"));
  }
  next();
});

export default mongoose.model("HomeworkSubmission", homeworkSubmissionSchema);
