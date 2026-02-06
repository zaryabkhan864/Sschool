import mongoose from "mongoose";

const weekDaySchema = new mongoose.Schema(
  {
    name: {
      type: String, // Monday
      required: true,
    },
    shortName: {
      type: String, // Mon
      required: true,
    },
    order: {
      type: Number, // 1–7
      required: true,
    },
    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campus",
      required: true,
    },
    isWorkingDay: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: false }
);

export default mongoose.model("WeekDay", weekDaySchema);
