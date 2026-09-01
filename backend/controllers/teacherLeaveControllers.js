import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Teacher from "../models/user.js";
import TeacherLeave from "../models/teacherLeave.js";
import EmployeeContract from "../models/employeeContract.js";
import APIFilters from "../utils/apiFilters.js";
import ErrorHandler from "../utils/errorHandler.js";
import { computeLeaveBalance, canTakeLeave } from "../utils/leaveBalance.js";
import mongoose from "mongoose";

// ============================================================
// Helper: work out a teacher's leave balance from their active
// contract's salary.annualLeaveAllowance minus days already
// approved for the given `year` (the same "year" value TeacherLeave
// records are tagged with elsewhere in this module).
// ============================================================
const getLeaveBalanceForTeacher = async (teacherId, year) => {
  const contractQuery = {
    employee: teacherId,
    status: "active",
    isDeleted: false,
  };

  const contract = await EmployeeContract.findOne(contractQuery).sort({ startDate: -1 });
  const annualLeaveAllowance = contract?.salary?.annualLeaveAllowance ?? 0;

  const usedMatch = {
    teacher: new mongoose.Types.ObjectId(teacherId),
    status: "Approved",
  };
  if (year !== undefined && year !== null && year !== "") {
    usedMatch.year = Number(year);
  }

  const usedAgg = await TeacherLeave.aggregate([
    { $match: usedMatch },
    { $group: { _id: null, totalUsed: { $sum: "$totalDays" } } },
  ]);

  const usedDays = usedAgg[0]?.totalUsed || 0;

  return {
    ...computeLeaveBalance(annualLeaveAllowance, usedDays),
    contractId: contract?._id || null,
  };
};

// Create new teacherLeave => /api/v1/teacherLeaves
export const newTeacherLeave = catchAsyncErrors(async (req, res, next) => {
  const { campus, academicYear } = req.cookies;
  const { teacher, leaveType, startDate, endDate, totalDays, reason } = req.body;

  // Verify teacher
  const teacherVerify = await Teacher.findById(teacher);
  if (!teacherVerify) {
    return next(new ErrorHandler("Teacher record not found", 400));
  }

  // ✅ NEW: enforce the contract's annual leave allowance, if one is set.
  const balance = await getLeaveBalanceForTeacher(teacher, academicYear);
  const decision = canTakeLeave(balance, totalDays);
  if (!decision.allowed) {
    return next(new ErrorHandler(decision.reason, 400));
  }

  const teacherLeave = await TeacherLeave.create({
    teacher,
    leaveType,
    startDate,
    endDate: leaveType === "Full Day" ? endDate : null,
    totalDays,
    reason,
    campus,
    year: academicYear,
    status: "Pending", // default status
  });

  res.status(200).json({
    success: true,
    teacherLeave,
  });
});

// Get all teacherLeaves => /api/v1/teacherLeaves
export const getTeachersLeave = catchAsyncErrors(async (req, res, next) => {
  const { campus, academicYear } = req.cookies;

  // Inject filters
  req.query.campus = campus;
  if (academicYear) {
    req.query.year = academicYear;
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
  const { campus, academicYear } = req.cookies;

  let teacherLeave = await TeacherLeave.findById(req?.params?.id);
  if (!teacherLeave) {
    return next(new ErrorHandler("Teacher leave request not found", 404));
  }

  if (teacherLeave.status !== "Pending") {
    return next(new ErrorHandler("Only pending requests can be updated", 400));
  }

  const { leaveType, startDate, endDate, totalDays, reason, status } = req.body;

  // ✅ NEW: if this update is approving the leave, re-check the balance
  // (totalDays may have changed since the request was first submitted).
  if (status === "Approved") {
    const balance = await getLeaveBalanceForTeacher(teacherLeave.teacher, academicYear || teacherLeave.year);
    const daysToCheck = totalDays ?? teacherLeave.totalDays;
    const decision = canTakeLeave(balance, daysToCheck);
    if (!decision.allowed) {
      return next(new ErrorHandler(decision.reason, 400));
    }
  }

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
      year: academicYear,
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

// ============================================================
// GET a teacher's leave balance (allowance vs used vs remaining)
// => /api/v1/teacherleave/balance/:id?year=2026
// ============================================================
export const getTeacherLeaveBalance = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { year } = req.query;

  const teacher = await Teacher.findById(id);
  if (!teacher) {
    return next(new ErrorHandler("Teacher record not found", 404));
  }

  const balance = await getLeaveBalanceForTeacher(id, year ?? req.cookies?.academicYear);

  res.status(200).json({
    success: true,
    teacher: id,
    ...balance,
  });
});
