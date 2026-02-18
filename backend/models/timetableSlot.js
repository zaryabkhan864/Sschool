import mongoose from "mongoose";

const timeTableSchema = new mongoose.Schema(
  {
    campus: { type: mongoose.Schema.Types.ObjectId, ref: "Campus", required: true },
    year: { type: Number, required: true },
    classGroup: { type: mongoose.Schema.Types.ObjectId, ref: "ClassGroup", required: true },
    slots: [
      {
        weekDay: { type: mongoose.Schema.Types.ObjectId, ref: "WeekDay", required: true },
        sessionTemplate: { type: mongoose.Schema.Types.ObjectId, ref: "SessionTemplate", required: true },
        course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", default: null },
        teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      },
    ],
  },
  { timestamps: true }
);

timeTableSchema.index({ campus: 1, year: 1, classGroup: 1 }, { unique: true });

export default mongoose.model("TimeTable", timeTableSchema);