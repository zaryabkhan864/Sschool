import mongoose from "mongoose";

const daySessionConfigSchema = new mongoose.Schema(
  {
    academicLevel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicLevel",
      required: true,
    },
    weekDay: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WeekDay",
      required: true,
    },
    sessions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SessionTemplate",
      },
    ],
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
  { timestamps: false }
);

export default mongoose.model("DaySessionConfig", daySessionConfigSchema);
