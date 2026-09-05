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
    // 👇 FIX: `year` is now an AcademicYear ObjectId (see models/teacherLeave.js),
    // not a plain number — aggregation `$match` stages don't auto-cast the
    // way normal queries do, so this must be cast explicitly.
    usedMatch.year = new mongoose.Types.ObjectId(year);
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

// Create new teacherLeave => /api/v1/admin/teacherleave
export const newTeacherLeave = catchAsyncErrors(async (req, res, next) => {
  const { campus, academicYear } = req.cookies;
  let { teacher, leaveType, startDate, endDate, totalDays, reason } = req.body;

  // 👇 FIX: a teacher applying for leave must only ever apply for
  // themselves — previously any authenticated teacher could pass any
  // teacher id in the request body and file a leave on someone else's
  // behalf. Admin/principle can still create a leave record for any
  // teacher (e.g. logging a historical/manual entry).
  if (req.user.role === "teacher") {
    teacher = req.user._id.toString();
  }

  // Verify teacher
  const teacherVerify = await Teacher.findById(teacher);
  if (!teacherVerify) {
    return next(new ErrorHandler("Teacher record not found", 400));
  }

  // Enforce the contract's annual leave allowance, if one is set.
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

// Get all teacherLeaves => /api/v1/teacherleaves
export const getTeachersLeave = catchAsyncErrors(async (req, res, next) => {
  const { campus, academicYear } = req.cookies;

  // 👇 FIX: this route previously had no auth requirement at all, and even
  // for a logged-in teacher it returned every teacher's leave records with
  // no scoping. A teacher must only ever see their own requests here —
  // admin/principle continue to see everyone's (campus/year-scoped, as
  // before).
  if (req.user?.role === "teacher") {
    req.query.teacher = req.user._id.toString();
  }

  req.query.campus = campus;
  if (academicYear) {
    req.query.year = academicYear;
  }

  // 👇 FIX: the Status filter dropdown sends lowercase values ("pending"),
  // but the schema stores capitalized ones ("Pending") — an exact-match
  // Mongo filter on the raw value never matched anything, so the filter
  // silently did nothing.
  if (req.query.status) {
    const normalized = req.query.status.toLowerCase();
    req.query.status = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }

  const apiFilters = new APIFilters(TeacherLeave, req.query).search().filters();
  const baseConditions = { ...apiFilters.query._conditions };

  // 👇 FIX: these stats were never actually computed — the frontend read
  // `data.pagination.counts`, which never existed in the response, so
  // every stat card silently showed 0.
  const [total, pending, approved, rejected] = await Promise.all([
    TeacherLeave.countDocuments(baseConditions),
    TeacherLeave.countDocuments({ ...baseConditions, status: "Pending" }),
    TeacherLeave.countDocuments({ ...baseConditions, status: "Approved" }),
    TeacherLeave.countDocuments({ ...baseConditions, status: "Rejected" }),
  ]);

  // 👇 FIX: `limit` from the frontend's per-page selector was silently
  // ignored — page size was hardcoded to 8 regardless of what was chosen.
  const resPerPage = parseInt(req.query.limit) || 8;
  const currentPage = parseInt(req.query.page) || 1;

  const teacherLeaves = await TeacherLeave.find(baseConditions)
    .populate("teacher")
    .sort({ appliedDate: -1 })
    .skip((currentPage - 1) * resPerPage)
    .limit(resPerPage);

  res.status(200).json({
    success: true,
    teacherLeaves,
    // 👇 FIX: this key never existed before — the frontend's pagination
    // controls and stats cards both read `data.pagination`, which was
    // always undefined, so pagination never rendered and stats stayed 0.
    pagination: {
      total,
      page: currentPage,
      limit: resPerPage,
      totalPages: Math.ceil(total / resPerPage) || 1,
      counts: { total, pending, approved, rejected },
    },
  });
});

// Update teacherLeave => /api/v1/admin/teacherleave/:id
export const updateTeacherLeave = catchAsyncErrors(async (req, res, next) => {
  const { campus, academicYear } = req.cookies;

  let teacherLeave = await TeacherLeave.findById(req?.params?.id);
  if (!teacherLeave) {
    return next(new ErrorHandler("Teacher leave request not found", 404));
  }

  const isOwner = teacherLeave.teacher.toString() === req.user._id.toString();
  const isApprover = ["admin", "principle"].includes(req.user.role);

  // 👇 FIX: previously ANY authenticated teacher could hit this route and
  // change ANY leave's status — including approving their own request or
  // someone else's — since there was no ownership check and nothing
  // stopped a non-approver from setting `status`.
  if (!isApprover) {
    if (!isOwner) {
      return next(new ErrorHandler("You can only edit your own leave request", 403));
    }
    if (req.body.status !== undefined) {
      return next(
        new ErrorHandler("Only admin or principle can approve or reject a leave request", 403)
      );
    }
  }

  if (teacherLeave.status !== "Pending") {
    return next(new ErrorHandler("Only pending requests can be updated", 400));
  }

  const { leaveType, startDate, endDate, totalDays, reason, status } = req.body;

  // If this update is approving the leave, re-check the balance (totalDays
  // may have changed since the request was first submitted).
  if (status === "Approved") {
    const balance = await getLeaveBalanceForTeacher(teacherLeave.teacher, academicYear || teacherLeave.year);
    const daysToCheck = totalDays ?? teacherLeave.totalDays;
    const decision = canTakeLeave(balance, daysToCheck);
    if (!decision.allowed) {
      return next(new ErrorHandler(decision.reason, 400));
    }
  }

  const updateData = {
    leaveType,
    startDate,
    endDate: leaveType === "Full Day" ? endDate : null,
    totalDays,
    reason,
    status,
    campus,
    year: academicYear,
  };

  // 👇 FIX: `approvedBy` existed on the schema (and is validated to only
  // ever be an admin/principle) but this controller never actually set
  // it — there was no record of who approved or rejected a request.
  if (status && isApprover) {
    updateData.approvedBy = req.user._id;
  }

  teacherLeave = await TeacherLeave.findByIdAndUpdate(req?.params?.id, updateData, {
    new: true,
  });

  res.status(200).json({
    success: true,
    teacherLeave,
  });
});

// Delete teacherLeave => /api/v1/admin/teacherleave/:id
export const deleteTeacherLeave = catchAsyncErrors(async (req, res, next) => {
  const teacherLeave = await TeacherLeave.findById(req?.params?.id);
  if (!teacherLeave) {
    return next(new ErrorHandler("Teacher leave request not found", 404));
  }

  const isOwner = teacherLeave.teacher.toString() === req.user._id.toString();
  const isApprover = ["admin", "principle"].includes(req.user.role);

  // 👇 FIX: no ownership check existed at all — any authenticated teacher
  // could delete any OTHER teacher's leave request via this endpoint.
  if (!isApprover) {
    if (!isOwner) {
      return next(new ErrorHandler("You can only delete your own leave request", 403));
    }
    if (teacherLeave.status !== "Pending") {
      return next(new ErrorHandler("Only a pending leave request can be withdrawn", 400));
    }
  }

  await teacherLeave.deleteOne();
  res.status(200).json({
    success: true,
    message: "Teacher leave request deleted successfully",
  });
});

// Get single teacherLeave details => /api/v1/teacherleave/:id
export const getTeacherLeaveDetails = catchAsyncErrors(async (req, res, next) => {
  const teacherLeave = await TeacherLeave.findById(req?.params?.id)
    .populate("teacher")
    // 👇 FIX: was never populated, so the details page had no way to show
    // who actually approved/rejected the request — only a raw ObjectId.
    .populate("approvedBy", "firstName middleName lastName");

  if (!teacherLeave) {
    return next(new ErrorHandler("Teacher leave request not found", 404));
  }

  // 👇 FIX: route previously had no auth middleware, so anyone could view
  // any leave's full detail (reason, dates, etc.) with no ownership check.
  const isOwner = teacherLeave.teacher._id.toString() === req.user._id.toString();
  const isApprover = ["admin", "principle"].includes(req.user.role);
  if (!isOwner && !isApprover) {
    return next(new ErrorHandler("You are not authorized to view this leave request", 403));
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