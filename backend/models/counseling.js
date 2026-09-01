import mongoose from "mongoose";

const counselingSchema = new mongoose.Schema(
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
        message: "The target of counseling must be a student."
      }
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      validate: {
        validator: async function (teacherId) {
          if (!teacherId) return true; // optional field
          const user = await mongoose.model("User").findById(teacherId);
          return user && user.role === "teacher";
        },
        message: "The involved person must be a teacher."
      }
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reporterRole: {
      type: String,
      required: true,
    },

    issueType: {
      type: String,
      required: true,
    },

    complainDescription: {
      type: String,
      required: [true, "Please provide details of the issue/complain"],
    },

    incidentDate: {
      type: Date,
      default: Date.now,
      required: [true, "Please specify when the incident happened"]
    },
    resolvedAt: { type: Date },
    closedAt: { type: Date },

    teacherComment: {
      text: String,
      author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      date: { type: Date, default: Date.now }
    },
    counselorComment: {
      text: String,
      author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      date: { type: Date, default: Date.now }
    },
    principalComment: {
      text: String,
      author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      date: { type: Date, default: Date.now }
    },

    actionTaken: {
      type: String,
    },

    status: {
      type: String,
      enum: ["pending", "under_review", "resolved", "closed"],
      default: "pending",
    },

    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      required: true,
    },
    year: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Counseling", counselingSchema);