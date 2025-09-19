import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Teacher from "../models/user.js";
import TeacherLeave from "../models/teacherLeave.js";
import APIFilters from "../utils/apiFilters.js";
import ErrorHandler from "../utils/errorHandler.js";
import mongoose from "mongoose";

// Create new teacherLeave => /api/v1/teacherLeaves
export const newTeacherLeave = catchAsyncErrors(async (req, res, next) => {
  const { campus, selectedYear } = req.cookies;
  const { teacher, leaveType, startDate, endDate, totalDays, reason } = req.body;

  // Verify teacher
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
    campus,
    year: selectedYear,
    status: "Pending", // default status
  });

  res.status(200).json({
    success: true,
    teacherLeave,
  });
});

// Get all teacherLeaves => /api/v1/teacherLeaves
export const getTeachersLeave = catchAsyncErrors(async (req, res, next) => {
  const { campus, selectedYear } = req.cookies;

  // Inject filters
  req.query.campus = campus;
  if (selectedYear) {
    req.query.year = selectedYear;
  }

  const resPerPage = 8;
  const apiFilters = new APIFilters(TeacherLeave, req.query)
    .search()
    .filters()
    .populate("teacher");

  let teacherLeaves = await apiFilters.query;
  const filteredTeacherLeavesCount = teacherLeaves.length;

  apiFilters.pagination(resPerPage);
  teacherLeaves = await apiFilters.query.clone();

  res.status(200).json({
    success: true,
    resPerPage,
    filteredTeacherLeavesCount,
    teacherLeaves,
  });
});

// Update teacherLeave => /api/v1/teacherLeaves/:id
export const updateTeacherLeave = catchAsyncErrors(async (req, res, next) => {
  const { campus, selectedYear } = req.cookies;

  let teacherLeave = await TeacherLeave.findById(req?.params?.id);
  if (!teacherLeave) {
    return next(new ErrorHandler("Teacher leave request not found", 404));
  }

  if (teacherLeave.status !== "Pending") {
    return next(new ErrorHandler("Only pending requests can be updated", 400));
  }

  const { leaveType, startDate, endDate, totalDays, reason, status } = req.body;

  teacherLeave = await TeacherLeave.findByIdAndUpdate(
    req?.params?.id,
    {
      leaveType,
      startDate,
      endDate: leaveType === "Full Day" ? endDate : null,
      totalDays,
      reason,
      status,
      campus,
      year: selectedYear,
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
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
    success: true,
    message: "Teacher leave request deleted successfully",
  });
});

// Get single teacherLeave details => /api/v1/teacherLeaves/:id
export const getTeacherLeaveDetails = catchAsyncErrors(async (req, res, next) => {
  const teacherLeave = await TeacherLeave.findById(req?.params?.id).populate("teacher");

  if (!teacherLeave) {
    return next(new ErrorHandler("Teacher leave request not found", 404));
  }

  res.status(200).json({
    success: true,
    teacherLeave,
  });
});
