// models/projectSubmission.js
import mongoose from "mongoose";

const projectSubmissionSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project reference is required"],
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required"],
    },

    classGroup: { type: mongoose.Schema.Types.ObjectId, ref: "ClassGroup", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: false, default: null },
    campus: { type: mongoose.Schema.Types.ObjectId, ref: "Campus", required: true },
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: "AcademicYear", required: true },

    submissionType: {
      type: String,
      enum: ["text", "file"],
      required: [true, "Please specify submission type (text or file)"],
    },
    textContent: {
      type: String,
      trim: true,
      maxLength: [8000, "Text submission cannot exceed 8000 characters"],
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

projectSubmissionSchema.index({ project: 1, student: 1 }, { unique: true });
projectSubmissionSchema.index({ project: 1, status: 1 });
projectSubmissionSchema.index({ student: 1, campus: 1, academicYear: 1 });

projectSubmissionSchema.pre("validate", function (next) {
  if (this.submissionType === "text" && !this.textContent) {
    return next(new Error("Text content is required for a text submission"));
  }
  if (this.submissionType === "file" && (!this.attachments || this.attachments.length === 0)) {
    return next(new Error("At least one file is required for a file submission"));
  }
  next();
});

export default mongoose.model("ProjectSubmission", projectSubmissionSchema);
