import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import TimeTable from "../models/timetableSlot.js";
import WeekDay from "../models/weekDay.js";
import SessionTemplate from "../models/sessionTemplate.js";
import ClassGroup from "../models/classGroup.js";
import Course from "../models/course.js";
import User from "../models/user.js";                 // if you need to query teachers
import ErrorHandler from "../utils/errorHandler.js";
import Grade from "../models/grade.js";

export const getAndCreateTimeTableSlots = catchAsyncErrors(
  async (req, res, next) => {
    const { campus, selectedYear } = req.cookies;
    const { classGroupId } = req.params;

    if (!campus || !selectedYear || !classGroupId) {
      return next(new ErrorHandler("Missing required data", 400));
    }

    const year = Number(selectedYear);

    // ===== 1️⃣ CHECK IF TIMETABLE EXISTS =====
    let existingTimeTable = await TimeTable.findOne({
      campus,
      year,
      classGroup: classGroupId,
    })
      .populate("slots.weekDay")
      .populate("slots.sessionTemplate")
      .populate("slots.course")
      .populate("slots.teacher");

    if (existingTimeTable) {
      return res.status(200).json({
        success: true,
        message: "Existing timetable retrieved successfully.",
        timeTable: existingTimeTable,
      });
    }

    // ===== 2️⃣ IF NOT EXISTS → CREATE FULL GRID =====

    // Get class group
    const classGroupDoc = await ClassGroup.findById(classGroupId);
    if (!classGroupDoc) {
      return next(new ErrorHandler("Class group not found", 404));
    }

    // Get all weekdays (you can filter isWorkingDay if needed)
    const weekDays = await WeekDay.find({ campus }).sort({ order: 1 });

    if (!weekDays.length) {
      return next(new ErrorHandler("No weekdays found", 404));
    }

    // Get all sessions related to academic level
    const sessions = await SessionTemplate.find({
      $or: [
        { academicLevel: classGroupDoc.academicLevel },
        { academicLevel: null },
      ],
    });

    if (!sessions.length) {
      return next(new ErrorHandler("No sessions found", 404));
    }

    // ===== 3️⃣ GENERATE COMPLETE SLOT GRID =====
    const slots = [];

    for (const day of weekDays) {
      for (const session of sessions) {
        slots.push({
          weekDay: day._id,
          sessionTemplate: session._id,
          course: null,
          teacher: null,
        });
      }
    }

    // ===== 4️⃣ CREATE NEW TIMETABLE =====
    const newTimeTable = await TimeTable.create({
      campus,
      year,
      classGroup: classGroupId,
      slots,
    });

    // ===== 5️⃣ POPULATE BEFORE SENDING =====
    const populatedTimeTable = await TimeTable.findById(newTimeTable._id)
      .populate("slots.weekDay")
      .populate("slots.sessionTemplate")
      .populate("slots.course")
      .populate("slots.teacher");

    return res.status(201).json({
      success: true,
      message: "New timetable created successfully.",
      timeTable: populatedTimeTable,
    });
  }
);


export const updateTimeTableSlots = catchAsyncErrors(async (req, res, next) => {
  const { campus, selectedYear } = req.cookies;
  const { classGroupId } = req.params;          // from URL
  const { slots: updatedSlots } = req.body;    // array of slot updates

  if (!classGroupId) {
    return next(new ErrorHandler("Please provide Class Group ID", 400));
  }
  if (!updatedSlots || !Array.isArray(updatedSlots)) {
    return next(new ErrorHandler("Request body must contain a 'slots' array", 400));
  }

  // 1. Find the timetable for this campus, year and class group
  const timeTable = await TimeTable.findOne({
    campus,
    year: selectedYear,
    classGroup: classGroupId,
  });

  if (!timeTable) {
    return next(new ErrorHandler("Timetable not found for the given class group", 404));
  }

  // 2. Loop through each updated slot and apply changes
  updatedSlots.forEach((update) => {
    const { weekDay, sessionTemplate, course, teacher } = update;

    // Find the matching slot in the timetable's slots array
    const slotToUpdate = timeTable.slots.find(
      (slot) =>
        slot.weekDay.toString() === weekDay &&
        slot.sessionTemplate.toString() === sessionTemplate
    );

    if (!slotToUpdate) {
      timeTable.slots.push({
        weekDay,
        sessionTemplate,
        course: course || null,
        teacher: teacher || null,
      });
      return;
    }

    // Update fields if provided (allow null values)
    if (course !== undefined) slotToUpdate.course = course;
    if (teacher !== undefined) slotToUpdate.teacher = teacher;
  });

  // 3. Save the updated document
  await timeTable.save();

  // 4. Populate and return the updated timetable
  const populatedTimeTable = await TimeTable.findById(timeTable._id)
    .populate("slots.weekDay slots.sessionTemplate slots.course slots.teacher");

  res.status(200).json({
    success: true,
    timeTable: populatedTimeTable,
  });
});
// ===== NEW: Get available courses for a specific slot =====
// ===== Get available courses for a specific slot (with teacher conflict check) =====


export const getAvailableCoursesForSlot = catchAsyncErrors(
  async (req, res, next) => {
    const { classGroup, weekDay, sessionTemplate, slotId } = req.query;
    const { campus, selectedYear } = req.cookies;

    if (!classGroup || !weekDay || !sessionTemplate) {
      return next(
        new ErrorHandler(
          "Please provide classGroup, weekDay and sessionTemplate",
          400
        )
      );
    }

    // 1️⃣ Get class group
    const classGroupDoc = await ClassGroup.findById(classGroup);
    if (!classGroupDoc) {
      return next(new ErrorHandler("Class group not found", 404));
    }

    // 2️⃣ Ensure the class group has a grade
    if (!classGroupDoc.grade) {
      return next(new ErrorHandler("Class group has no grade assigned", 400));
    }

    // 3️⃣ Fetch courses for that specific grade only
    const courses = await Course.find({
      grade: classGroupDoc.grade,
    }).populate({
      path: "teacher",
      match: { role: "teacher" },
      select: "name role",
    });

    // 4️⃣ Find teacher conflicts
    const conflictQuery = {
      campus,
      year: Number(selectedYear),
      "slots.weekDay": weekDay,
      "slots.sessionTemplate": sessionTemplate,
      "slots.teacher": { $ne: null },
    };

    if (slotId) {
      conflictQuery["slots._id"] = { $ne: slotId };
    }

    const conflictingTimeTables = await TimeTable.find(conflictQuery).select(
      "slots"
    );

    const busyTeacherIds = new Set();
    conflictingTimeTables.forEach((tt) => {
      tt.slots.forEach((slot) => {
        if (slot.teacher) {
          busyTeacherIds.add(slot.teacher.toString());
        }
      });
    });

    // 5️⃣ Build available courses list with availability flag
    const availableCourses = [];

    for (const course of courses) {
      let availableTeacher = null;
      let available = true; // default

      if (course.teacher) {
        if (!busyTeacherIds.has(course.teacher._id.toString())) {
          availableTeacher = {
            _id: course.teacher._id,
            name: course.teacher.name,
          };
          available = true;
        } else {
          // teacher is busy → mark as unavailable, keep teacher null
          available = false;
        }
      } else {
        // no teacher → no conflict, available true
      }

      availableCourses.push({
        course: {
          _id: course._id,
          courseName: course.courseName,
          code: course.code,
        },
        teacher: availableTeacher,
        available, // 👈 new flag
      });
    }

    // 6️⃣ Ensure current slot's course is included (if editing)
    if (slotId) {
      const currentTimeTable = await TimeTable.findOne({
        campus,
        year: Number(selectedYear),
        classGroup: classGroup,
        "slots._id": slotId,
      }).select("slots.$");

      if (currentTimeTable && currentTimeTable.slots.length > 0) {
        const currentSlot = currentTimeTable.slots[0];

        if (currentSlot.course) {
          const exists = availableCourses.some(
            (item) =>
              item.course._id.toString() === currentSlot.course.toString()
          );

          if (!exists) {
            const currentCourse = await Course.findById(
              currentSlot.course
            ).populate("teacher", "name");

            availableCourses.push({
              course: {
                _id: currentCourse._id,
                courseName: currentCourse.courseName,
                code: currentCourse.code,
              },
              teacher: currentCourse.teacher
                ? {
                    _id: currentCourse.teacher._id,
                    name: currentCourse.teacher.name,
                  }
                : null,
              available: true, // existing assignment should remain selectable
            });
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
