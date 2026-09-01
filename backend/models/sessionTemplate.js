import mongoose from "mongoose";

const sessionTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String, // 1st Period, Lunch Break
      required: true,
    },
    type: {
      type: String,
      enum: ["CLASS", "BREAK"],
      default: "CLASS",
    },
    order: {
      type: Number,
      required: true,
    },
    startTime: {
      type: String, // "08:30"
      required: true,
    },
    endTime: {
      type: String, // "09:10"
      required: true,
    },
    academicLevel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicLevel",
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
  },
  { timestamps: false }
);

export default mongoose.model("SessionTemplate", sessionTemplateSchema);
