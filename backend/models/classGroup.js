import mongoose from "mongoose";

const classGroupSchema = new mongoose.Schema(
  {
    grade: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grade",
      required: true,
    },
    academicLevel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicLevel",
      required: true,
    },
    section: {
      type: String, // A, B, ENG
      required: true,
    },
    displayName: {
      type: String, // "7B", "11 ENG"
      required: true,
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
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ClassGroup", classGroupSchema);
