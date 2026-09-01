import mongoose from "mongoose";

const academicLevelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Academic level name is required"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Academic level code is required"],
      uppercase: true,
      trim: true,
    },
    order: {
      type: Number,
      required: [true, "Display order is required"],
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
    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ✅ FIX: Prevent duplicate level names within the same campus + academic year
academicLevelSchema.index({ name: 1, campus: 1, academicYear: 1 }, { unique: true });

// Allow same code in different campuses/years, but unique within same campus+year
academicLevelSchema.index({ code: 1, campus: 1, academicYear: 1 }, { unique: true });

export default mongoose.model("AcademicLevel", academicLevelSchema);
