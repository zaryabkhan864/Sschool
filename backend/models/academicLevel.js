import mongoose from "mongoose";

const academicLevelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // Primary, Middle, High
    },
    code: {
      type: String,
      required: true, // PRIMARY, MIDDLE, HIGH
      uppercase: true,
    },
    order: {
      type: Number,
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

export default mongoose.model("AcademicLevel", academicLevelSchema);
