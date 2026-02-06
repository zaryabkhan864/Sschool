import mongoose from "mongoose";

const timetableSlotSchema = new mongoose.Schema(
  {
    classGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassGroup",
      required: true,
    },
    weekDay: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WeekDay",
      required: true,
    },
    sessionTemplate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SessionTemplate",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
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
  { timestamps: true }
);

export default mongoose.model("TimeTableSlot", timetableSlotSchema);
