import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Teacher from "../models/user.js";
import TeacherLeave from "../models/teacherLeave.js";
import APIFilters from "../utils/apiFilters.js";
import ErrorHandler from "../utils/errorHandler.js";
// CRUD operations for courses

// Create new teacherLeave => /api/v1/teacherLeaves
export const newTeacherLeave = catchAsyncErrors(async (req, res, next) => {
  const { teacher, leaveType, startDate, endDate, totalDays, reason } =
    req.body;

  const teacherVerify = await Teacher.findById(teacher);
  if (!teacherVerify) {
    return next(new ErrorHandler("Teacher record not found", 400));
  }

  const teacherLeave = await TeacherLeave.create({
    teacher,
    leaveType,
    startDate,
    endDate: leaveType === "Full Day" ? endDate : null,
    totalDays,
    reason,
  });
  res.status(200).json({
    success: true,
    teacherLeave,
  });
});
// Create get all teacherLeave => /api/v1/teacherLeaves
export const getTeachersLeave = catchAsyncErrors(async (req, res, next) => {
  const resPerPage = 8;
  const apiFilters = new APIFilters(TeacherLeave, req.query).search().filters();

  let teacherLeaves = await apiFilters.query;
  let filteredTeacherLeavesCount = teacherLeaves.length;
  apiFilters.pagination(resPerPage);
  teacherLeaves = await apiFilters.query.clone();
  res.status(200).json({
    resPerPage,
    filteredTeacherLeavesCount,
    teacherLeaves,
  });
});
// Update teacherLeave => /api/v1/teacherLeaves/:id
export const updateTeacherLeave = catchAsyncErrors(async (req, res, next) => {
  let teacherLeave = await Teacher.findById(req?.params?.id);
  const { leaveType, startDate, endDate, totalDays, reason } = req.body;

  if (!teacherLeave) {
    return next(new ErrorHandler("Teacher leave request not found", 404));
  }

  if (!teacherLeave.status !== "Pending") {
    return next(new ErrorHandler("Can not update request", 404));
  }

  teacherLeave = await TeacherLeave.findByIdAndUpdate(
    req?.params?.id,
    req.body,
    {
      new: true,
    }
  );
  res.status(200).json({
    teacherLeave,
  });
});

// Delete teacherLeave => /api/v1/teacherLeaves/:id
export const deleteTeacherLeave = catchAsyncErrors(async (req, res, next) => {
  const teacherLeave = await TeacherLeave.findById(req?.params?.id);
  if (!teacherLeave) {
    return next(new ErrorHandler("Teacher leave request not found", 404));
  }
  await TeacherLeave.findOneAndDelete({ _id: req?.params?.id });
  res.status(200).json({
    message: "Teacher leave request deleted successfully",
  });
});

// extra controller for teacherLeave

// Get single teacherLeave details => /api/v1/teacherLeaves/:id
export const getTeacherLeaveDetails = catchAsyncErrors(
  async (req, res, next) => {
    const teacherLeave = await Course.findById(req?.params?.id).populate(
      "teacherId"
    );

    if (!teacherLeave) {
      return next(new ErrorHandler("Teacher leave request not found", 404));
    }

    res.status(200).json({
      teacherLeave,
    });
  }
);
