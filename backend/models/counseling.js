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

    // --- Timeline Dates ---
    incidentDate: { 
      type: Date, 
      default: Date.now,
      required: [true, "Please specify when the incident happened"] 
    },
    resolvedAt: { type: Date }, // Jab status 'resolved' ho tab update hoga
    closedAt: { type: Date },   // Jab status 'closed' ho tab update hoga

    // --- Comments Sections ---
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
      type: Number,
      required: true,
    },
  },
  { timestamps: true } // Is se 'createdAt' (Complain Date) automatic mil jayegi
);

export default mongoose.model("Counseling", counselingSchema);