import mongoose from "mongoose";

// One line per student for a single class+course+session+date — mirrors
// the array-of-lines pattern already used elsewhere in this codebase
// (DaySessionConfig.sessions, StudentEnrollment.feePlan): one write per
// roster submission instead of one document per student per period,
// which keeps writes cheap and makes reports a simple $unwind away.
const attendanceRecordSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["present", "absent", "late", "half-day", "excused"],
      default: "present",
    },
    remarks: {
      type: String,
      trim: true,
      maxLength: [200, "Remarks cannot exceed 200 characters"],
    },
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    classGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassGroup",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    // Which period this attendance is for — this is what makes attendance
    // SESSION-wise instead of one flat entry per day. Resolved server-side
    // from the class group's timetable, never trusted from the client.
    sessionTemplate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SessionTemplate",
      required: true,
    },
    weekDay: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WeekDay",
      required: true,
    },
    // Calendar date, normalized to midnight — the actual day this session
    // ran, so "Monday's 3rd period on 2026-09-08" is one exact record.
    date: {
      type: Date,
      required: true,
    },
    // Who took/owns this attendance — lets a teacher's own sessions be
    // queried directly, and is an audit trail if a record is disputed.
    takenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
    records: {
      type: [attendanceRecordSchema],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "At least one student record is required",
      },
    },
  },
  { timestamps: true }
);

// One attendance record per class+course+period+day — submitting again
// for the same session/date updates this same document (upsert) instead
// of creating a duplicate.
attendanceSchema.index(
  { classGroup: 1, course: 1, sessionTemplate: 1, date: 1 },
  { unique: true }
);

// Common report shapes, each backed by its own index:
attendanceSchema.index({ classGroup: 1, date: -1 });                 // a class's day-by-day record
attendanceSchema.index({ course: 1, date: -1 });                     // a course's attendance over term
attendanceSchema.index({ "records.student": 1, date: -1 });          // one student's history across classes
attendanceSchema.index({ takenBy: 1, date: -1 });                    // a teacher's own sessions
attendanceSchema.index({ campus: 1, academicYear: 1, date: -1 });    // campus/year-wide dashboards

export default mongoose.model("Attendance", attendanceSchema);