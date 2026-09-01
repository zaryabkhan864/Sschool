import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import TimeTable from "../models/timetableSlot.js";
import WeekDay from "../models/weekDay.js";
import SessionTemplate from "../models/sessionTemplate.js";
import ClassGroup from "../models/classGroup.js";
import Course from "../models/course.js";
import ErrorHandler from "../utils/errorHandler.js";

// User has no `name` field — only firstName/middleName/lastName.
const fullName = (user) =>
  [user?.firstName, user?.middleName, user?.lastName].filter(Boolean).join(" ");

const TEACHER_SELECT = "firstName middleName lastName role";

// Reshapes a populated TimeTable doc so every slot.course.teacher becomes
// a plain { _id, name } — same shape the frontend already expects.
const withTeacherNames = (timeTableDoc) => {
  const obj = timeTableDoc.toObject ? timeTableDoc.toObject() : timeTableDoc;
  obj.slots = obj.slots.map((slot) => {
    if (slot.course && slot.course.teacher) {
      slot.course.teacher = {
        _id: slot.course.teacher._id,
        name: fullName(slot.course.teacher),
      };
    }
    return slot;
  });
  return obj;
};

export const getAndCreateTimeTableSlots = catchAsyncErrors(
  async (req, res, next) => {
    const { campus, academicYear } = req.cookies;
    const { classGroupId } = req.params;

    if (!campus || !academicYear || !classGroupId) {
      return next(new ErrorHandler("Missing required data", 400));
    }

    // ===== 1️⃣ CHECK IF TIMETABLE EXISTS =====
    let existingTimeTable = await TimeTable.findOne({
      campus,
      academicYear,
      classGroup: classGroupId,
    })
      .populate("slots.weekDay")
      .populate("slots.sessionTemplate")
      .populate({
        path: "slots.course",
        populate: { path: "teacher", select: TEACHER_SELECT },
      });

    if (existingTimeTable) {
      return res.status(200).json({
        success: true,
        message: "Existing timetable retrieved successfully.",
        timeTable: withTeacherNames(existingTimeTable),
      });
    }

    // ===== 2️⃣ IF NOT EXISTS → CREATE FULL GRID =====

    const classGroupDoc = await ClassGroup.findById(classGroupId);
    if (!classGroupDoc) {
      return next(new ErrorHandler("Class group not found", 404));
    }

    const weekDays = await WeekDay.find({ campus }).sort({ order: 1 });
    if (!weekDays.length) {
      return next(new ErrorHandler("No weekdays found", 404));
    }

    // Sessions must match the same campus + academic year as the grid
    // being built here — same filter the Session Template list uses.
    const sessions = await SessionTemplate.find({
      campus,
      academicYear,
      $or: [
        { academicLevel: classGroupDoc.academicLevel },
        { academicLevel: null },
      ],
    });

    if (!sessions.length) {
      return next(
        new ErrorHandler("No sessions found for this academic level", 404)
      );
    }

    // ===== 3️⃣ GENERATE COMPLETE SLOT GRID =====
    const slots = [];

    for (const day of weekDays) {
      for (const session of sessions) {
        slots.push({
          weekDay: day._id,
          sessionTemplate: session._id,
          course: null,
        });
      }
    }

    // ===== 4️⃣ CREATE NEW TIMETABLE =====
    const newTimeTable = await TimeTable.create({
      campus,
      academicYear,
      classGroup: classGroupId,
      slots,
    });

    // ===== 5️⃣ POPULATE BEFORE SENDING =====
    const populatedTimeTable = await TimeTable.findById(newTimeTable._id)
      .populate("slots.weekDay")
      .populate("slots.sessionTemplate")
      .populate({
        path: "slots.course",
        populate: { path: "teacher", select: TEACHER_SELECT },
      });

    return res.status(201).json({
      success: true,
      message: "New timetable created successfully.",
      timeTable: withTeacherNames(populatedTimeTable),
    });
  }
);

export const updateTimeTableSlots = catchAsyncErrors(async (req, res, next) => {
  const { campus, academicYear } = req.cookies;
  const { classGroupId } = req.params; // from URL
  const { slots: updatedSlots } = req.body; // array of { weekDay, sessionTemplate, course }

  if (!classGroupId) {
    return next(new ErrorHandler("Please provide Class Group ID", 400));
  }
  if (!updatedSlots || !Array.isArray(updatedSlots)) {
    return next(new ErrorHandler("Request body must contain a 'slots' array", 400));
  }

  const timeTable = await TimeTable.findOne({
    campus,
    academicYear,
    classGroup: classGroupId,
  });

  if (!timeTable) {
    return next(new ErrorHandler("Timetable not found for the given class group", 404));
  }

  // 1. Resolve the CURRENT teacher for every course being assigned.
  // This is looked up fresh from Course.teacher every time — never
  // from a stored copy — so it can't be stale and can't be bypassed.
  const slotsWithCourse = updatedSlots.filter((u) => u.course);
  const courseIds = [...new Set(slotsWithCourse.map((u) => u.course))];
  const courses = await Course.find({ _id: { $in: courseIds } }).select("teacher courseName");
  const courseTeacherMap = new Map(
    courses.map((c) => [c._id.toString(), c.teacher ? c.teacher.toString() : null])
  );

  // 2. Server-side double-booking guard, checked against every OTHER
  // class group's timetable using each slot's course's live teacher.
  if (slotsWithCourse.length) {
    // NOTE: "slots.course": { $ne: null } is a classic Mongo trap — on an
    // array field it only matches when NONE of the array's elements equal
    // the value, not when SOME element differs from it. Since a timetable
    // has 50+ slots and most are null, that condition was never true.
    // $elemMatch fixes it: "does at least one slot have a non-null course".
    const otherTimeTables = await TimeTable.find({
      campus,
      academicYear,
      classGroup: { $ne: classGroupId },
      slots: { $elemMatch: { course: { $ne: null } } },
    })
      .select("classGroup slots")
      .populate("classGroup", "displayName")
      .populate("slots.sessionTemplate", "name")
      .populate({
        path: "slots.course",
        select: "teacher courseName",
        populate: { path: "teacher", select: TEACHER_SELECT },
      });

    for (const update of slotsWithCourse) {
      const teacherId = courseTeacherMap.get(update.course);
      if (!teacherId) continue; // course has no teacher assigned, nothing to conflict

      for (const tt of otherTimeTables) {
        const conflictSlot = tt.slots.find(
          (slot) =>
            slot.weekDay.toString() === update.weekDay &&
            slot.sessionTemplate?._id?.toString() === update.sessionTemplate &&
            slot.course?.teacher?._id?.toString() === teacherId
        );

        if (conflictSlot) {
          return next(
            new ErrorHandler(
              `${fullName(conflictSlot.course.teacher)} is already assigned to ${
                tt.classGroup?.displayName || "another class"
              } for ${conflictSlot.sessionTemplate?.name || "this session"} on the same day.`,
              400
            )
          );
        }
      }
    }
  }

  // 3. Apply the changes — only `course` is ever stored on a slot.
  updatedSlots.forEach((update) => {
    const { weekDay, sessionTemplate, course } = update;

    const slotToUpdate = timeTable.slots.find(
      (slot) =>
        slot.weekDay.toString() === weekDay &&
        slot.sessionTemplate.toString() === sessionTemplate
    );

    if (!slotToUpdate) {
      timeTable.slots.push({ weekDay, sessionTemplate, course: course || null });
      return;
    }

    if (course !== undefined) slotToUpdate.course = course || null;
  });

  // 4. Save the updated document
  await timeTable.save();

  // 5. Populate and return the updated timetable
  const populatedTimeTable = await TimeTable.findById(timeTable._id)
    .populate("slots.weekDay")
    .populate("slots.sessionTemplate")
    .populate({
      path: "slots.course",
      populate: { path: "teacher", select: TEACHER_SELECT },
    });

  res.status(200).json({
    success: true,
    timeTable: withTeacherNames(populatedTimeTable),
  });
});

// ===== Get available courses for a specific slot (with live teacher conflict check) =====
export const getAvailableCoursesForSlot = catchAsyncErrors(
  async (req, res, next) => {
    const { classGroup, weekDay, sessionTemplate, slotId } = req.query;
    const { campus, academicYear } = req.cookies;

    if (!classGroup || !weekDay || !sessionTemplate) {
      return next(
        new ErrorHandler("Please provide classGroup, weekDay and sessionTemplate", 400)
      );
    }

    // 1️⃣ Get class group and populate its assigned courses (with live teacher)
    const classGroupDoc = await ClassGroup.findById(classGroup).populate({
      path: "courses",
      populate: { path: "teacher", select: TEACHER_SELECT },
    });

    if (!classGroupDoc) {
      return next(new ErrorHandler("Class group not found", 404));
    }

    const assignedCourses = classGroupDoc.courses || [];

    // 2️⃣ Find every other class group's course at this exact day+session,
    // and resolve each of those courses' CURRENT teacher live.
    // Same $elemMatch fix as above — plain dot-notation "$ne: null" on an
    // array field never matches a timetable that has any null slots
    // (i.e. almost all of them), so it must be scoped with $elemMatch.
    const elemMatch = {
      weekDay: weekDay,
      sessionTemplate: sessionTemplate,
      course: { $ne: null },
    };
    if (slotId) {
      elemMatch._id = { $ne: slotId };
    }

    const conflictingTimeTables = await TimeTable.find({
      campus,
      academicYear,
      slots: { $elemMatch: elemMatch },
    })
      .select("slots")
      .populate({ path: "slots.course", select: "teacher" });

    const busyTeacherIds = new Set();
    conflictingTimeTables.forEach((tt) => {
      tt.slots.forEach((slot) => {
        if (
          slot.weekDay.toString() === weekDay &&
          slot.sessionTemplate.toString() === sessionTemplate &&
          slot.course?.teacher
        ) {
          busyTeacherIds.add(slot.course.teacher.toString());
        }
      });
    });

    // 3️⃣ Build available courses list from assigned courses.
    // Courses whose teacher is busy elsewhere at this exact day/session
    // are left out of the list entirely — not just disabled.
    const availableCourses = [];

    for (const course of assignedCourses) {
      if (course.teacher && busyTeacherIds.has(course.teacher._id.toString())) {
        continue; // teacher busy elsewhere — hide this course
      }

      availableCourses.push({
        course: {
          _id: course._id,
          courseName: course.courseName,
          code: course.code,
        },
        teacher: course.teacher
          ? { _id: course.teacher._id, name: fullName(course.teacher) }
          : null,
        available: true,
      });
    }

    // 4️⃣ Ensure current slot's course is still included (if editing),
    // even if it's no longer in classGroupDoc.courses — its own booking
    // is excluded from the conflict check above via slotId, so it's
    // always safe to keep showing.
    if (slotId) {
      const currentTimeTable = await TimeTable.findOne({
        campus,
        academicYear,
        classGroup,
        "slots._id": slotId,
      }).select("slots.$");

      if (currentTimeTable && currentTimeTable.slots.length > 0) {
        const currentSlot = currentTimeTable.slots[0];

        if (currentSlot.course) {
          const exists = availableCourses.some(
            (item) => item.course._id.toString() === currentSlot.course.toString()
          );

          if (!exists) {
            const currentCourse = await Course.findById(currentSlot.course).populate(
              "teacher",
              TEACHER_SELECT
            );

            if (currentCourse) {
              availableCourses.push({
                course: {
                  _id: currentCourse._id,
                  courseName: currentCourse.courseName,
                  code: currentCourse.code,
                },
                teacher: currentCourse.teacher
                  ? { _id: currentCourse.teacher._id, name: fullName(currentCourse.teacher) }
                  : null,
                available: true,
              });
            }
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      courses: availableCourses,
    });
  }
);
