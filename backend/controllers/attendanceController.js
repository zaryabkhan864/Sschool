import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import mongoose from "mongoose";
import Attendance from "../models/attendance.js";
import ClassGroup from "../models/classGroup.js";
import Course from "../models/course.js";
import StudentEnrollment from "../models/studentEnrollment.js";
// Inferred from CreateTimeTable.jsx's `timeTableData.timeTable.slots` shape
// and confirmed against timeTableSlotController.js — model file is named
// timetableSlot.js (model itself is still exported as "TimeTable").
import TimeTable from "../models/timetableSlot.js";
import ErrorHandler from "../utils/errorHandler.js";

const AUTHOR_SELECT = "firstName middleName lastName";

const normalizeDate = (dateInput) => {
  const d = new Date(dateInput);
  d.setHours(0, 0, 0, 0);
  return d;
};

// A teacher may only take attendance for a course they actually teach, in
// a class group that course belongs to. Admin/principle bypass this.
const assertCanTakeAttendance = async (req, classGroupId, courseId) => {
  if (["admin", "principle"].includes(req.user.role)) return;

  const course = await Course.findById(courseId).select("teacher");
  if (!course || !course.teacher || course.teacher.toString() !== req.user._id.toString()) {
    throw new ErrorHandler("You can only take attendance for courses you teach", 403);
  }

  const classGroup = await ClassGroup.findOne({ _id: classGroupId, courses: courseId });
  if (!classGroup) {
    throw new ErrorHandler("This course does not belong to the selected class group", 400);
  }
};

// Finds which SessionTemplate this course actually runs in, for this
// class group, on this date's weekday — resolved server-side from the
// class group's own timetable, never trusted from the client. Returns
// null if the course isn't scheduled on this class's timetable that day.
const resolveSessionForDate = async (classGroupId, courseId, date) => {
  const weekDayName = new Date(date).toLocaleDateString("en-US", { weekday: "long" });

  const timeTable = await TimeTable.findOne({ classGroup: classGroupId }).populate(
    "slots.weekDay",
    "name order"
  );
  if (!timeTable) return null;

  const slot = timeTable.slots.find(
    (s) =>
      s.course?.toString() === courseId.toString() &&
      s.weekDay?.name?.toLowerCase() === weekDayName.toLowerCase()
  );

  return slot ? { sessionTemplate: slot.sessionTemplate, weekDay: slot.weekDay._id } : null;
};

// GET /attendance/sheet?classGroup=&course=&date=
//
// Resolves the session for that day, then returns the active roster for
// that class group plus any attendance already taken for that exact
// class+course+session+date — so the frontend prefills instead of
// starting blank every time it's reopened.
export const getAttendanceSheet = catchAsyncErrors(async (req, res, next) => {
  const { classGroup, course, date } = req.query;
  if (!classGroup || !course || !date) {
    return next(new ErrorHandler("classGroup, course and date are required", 400));
  }

  await assertCanTakeAttendance(req, classGroup, course);

  const resolved = await resolveSessionForDate(classGroup, course, date);
  if (!resolved) {
    return next(
      new ErrorHandler("This course isn't scheduled for this class group on that day", 400)
    );
  }

  const normalizedDate = normalizeDate(date);

  const [enrollments, existing] = await Promise.all([
    StudentEnrollment.find({ classGroup, status: "active", isDeleted: false })
      .populate("student", AUTHOR_SELECT)
      .sort({ createdAt: 1 }),
    Attendance.findOne({
      classGroup,
      course,
      sessionTemplate: resolved.sessionTemplate,
      date: normalizedDate,
    }),
  ]);

  const existingByStudent = new Map(
    (existing?.records || []).map((r) => [r.student.toString(), r])
  );

  const roster = enrollments
    .filter((e) => e.student)
    .map((e) => {
      const prior = existingByStudent.get(e.student._id.toString());
      return {
        student: e.student._id,
        studentName: [e.student.firstName, e.student.middleName, e.student.lastName]
          .filter(Boolean)
          .join(" "),
        status: prior?.status || "present",
        remarks: prior?.remarks || "",
      };
    });

  res.status(200).json({
    success: true,
    sessionTemplate: resolved.sessionTemplate,
    weekDay: resolved.weekDay,
    attendanceId: existing?._id || null,
    roster,
  });
});

// POST /attendance — create or update (upsert) the attendance for one
// class+course+session+date in a single write.
export const submitAttendance = catchAsyncErrors(async (req, res, next) => {
  const { classGroup, course, date, records } = req.body;
  const { campus, academicYear } = req.cookies;

  if (!classGroup || !course || !date || !Array.isArray(records) || !records.length) {
    return next(new ErrorHandler("classGroup, course, date and records are required", 400));
  }
  if (!campus || !academicYear) {
    return next(new ErrorHandler("Campus and academic year must be selected before taking attendance", 400));
  }

  await assertCanTakeAttendance(req, classGroup, course);

  const resolved = await resolveSessionForDate(classGroup, course, date);
  if (!resolved) {
    return next(
      new ErrorHandler("This course isn't scheduled for this class group on that day", 400)
    );
  }

  const cleanRecords = records.map((r) => ({
    student: r.student,
    status: r.status || "present",
    remarks: r.remarks || "",
  }));

  const attendance = await Attendance.findOneAndUpdate(
    {
      classGroup,
      course,
      sessionTemplate: resolved.sessionTemplate,
      date: normalizeDate(date),
    },
    {
      $set: {
        weekDay: resolved.weekDay,
        takenBy: req.user._id,
        campus,
        academicYear,
        records: cleanRecords,
      },
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  res.status(200).json({
    success: true,
    attendance,
    message: "Attendance saved successfully",
  });
});

// GET /attendance/history?classGroup=&course=&student=&from=&to=
// For reports: a class/course/student's attendance over a date range.
export const getAttendanceHistory = catchAsyncErrors(async (req, res, next) => {
  const { classGroup, course, student, from, to } = req.query;

  const filter = {};
  if (classGroup) filter.classGroup = classGroup;
  if (course) filter.course = course;
  if (student) filter["records.student"] = student;
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = normalizeDate(from);
    if (to) filter.date.$lte = normalizeDate(to);
  }

  const attendances = await Attendance.find(filter)
    .populate("classGroup", "displayName")
    .populate("course", "courseName code")
    .populate("sessionTemplate", "name startTime endTime")
    .populate("records.student", AUTHOR_SELECT)
    .sort({ date: -1 });

  res.status(200).json({ success: true, count: attendances.length, attendances });
});

// GET /attendance/calendar/class?classGroup=&from=&to=
//
// Month-wise class report, broken down by actual date (not just totals) —
// one collapsed status per student per day. When a student had multiple
// sessions in a day with different statuses, the worst one wins (an
// absence anywhere that day marks the whole day absent) — the usual
// school convention for a single daily attendance mark. Collapsing and
// grouping happens entirely in MongoDB so the response stays a compact
// per-day grid instead of every raw session document.
export const getClassAttendanceCalendar = catchAsyncErrors(async (req, res, next) => {
  const { classGroup, from, to } = req.query;
  if (!classGroup || !from || !to) {
    return next(new ErrorHandler("classGroup, from and to are required", 400));
  }

  const rows = await Attendance.aggregate([
    {
      $match: {
        classGroup: new mongoose.Types.ObjectId(classGroup),
        date: { $gte: normalizeDate(from), $lte: normalizeDate(to) },
      },
    },
    { $unwind: "$records" },
    {
      $group: {
        _id: { student: "$records.student", date: "$date" },
        statuses: { $push: "$records.status" },
      },
    },
    {
      $group: {
        _id: "$_id.student",
        days: { $push: { date: "$_id.date", statuses: "$statuses" } },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "student",
      },
    },
    { $unwind: "$student" },
    {
      $project: {
        _id: 0,
        studentId: "$_id",
        firstName: "$student.firstName",
        middleName: "$student.middleName",
        lastName: "$student.lastName",
        days: 1,
      },
    },
  ]);

  const priority = { absent: 0, late: 1, "half-day": 2, excused: 3, present: 4 };
  const dateSet = new Set();

  const students = rows
    .map((r) => {
      const dayMap = {};
      r.days.forEach((d) => {
        const key = d.date.toISOString().split("T")[0];
        dateSet.add(key);
        const worst = [...d.statuses].sort((a, b) => priority[a] - priority[b])[0];
        dayMap[key] = worst;
      });
      const name = [r.firstName, r.middleName, r.lastName].filter(Boolean).join(" ");
      return { studentId: r.studentId, name, days: dayMap };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const dates = Array.from(dateSet).sort();

  res.status(200).json({ success: true, from, to, dates, students });
});