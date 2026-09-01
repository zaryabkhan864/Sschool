// scholarshipControllers.js
import mongoose from "mongoose";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Scholarship from "../models/scholarships.js";
import User from "../models/user.js";
import ErrorHandler from "../utils/errorHandler.js";
import { regenerateFeesForScholarship } from "../utils/feePlanGenerator.js";

// ============================================================
// GET single scholarship for a student (+ optional academicYear filter)
// => GET /api/v1/scholarships/student/:studentId
// Used by UpdateStudentEnrollment.jsx to pre-fill / decide create vs update
// ============================================================
export const getScholarshipByStudent = catchAsyncErrors(async (req, res, next) => {
  const { studentId } = req.params;
  const { academicYear } = req.query;

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return next(new ErrorHandler("Invalid student id", 400));
  }

  const filter = { student: studentId };
  if (academicYear && mongoose.Types.ObjectId.isValid(academicYear)) {
    filter.academicYear = academicYear;
  }

  const scholarship = await Scholarship.findOne(filter)
    .sort({ createdAt: -1 })
    .populate("academicYear", "name")
    .populate("campus", "name code")
    .populate("enrollment", "status startDate endDate");

  // success:true with scholarship:null is a valid "no scholarship yet" response
  res.status(200).json({ success: true, scholarship });
});

// ============================================================
// GET all scholarships (admin list/report view)
// => GET /api/v1/admin/scholarships
// ============================================================
export const getScholarships = catchAsyncErrors(async (req, res, next) => {
  const { academicYear, campus, status, student, keyword, page, limit } = req.query;

  const filter = {};
  if (academicYear && mongoose.Types.ObjectId.isValid(academicYear)) {
    filter.academicYear = academicYear;
  }
  if (campus && mongoose.Types.ObjectId.isValid(campus)) {
    filter.campus = campus;
  }
  if (status) filter.status = status;
  if (student && mongoose.Types.ObjectId.isValid(student)) {
    filter.student = student;
  }

  if (keyword && keyword.trim()) {
    const matchingStudents = await User.find({
      role: "student",
      $or: [
        { firstName: { $regex: keyword.trim(), $options: "i" } },
        { middleName: { $regex: keyword.trim(), $options: "i" } },
        { lastName: { $regex: keyword.trim(), $options: "i" } },
        { email: { $regex: keyword.trim(), $options: "i" } },
      ],
    }).distinct("_id");

    filter.student = filter.student
      ? filter.student
      : { $in: matchingStudents.length ? matchingStudents : [null] };
  }

  const total = await Scholarship.countDocuments(filter);

  const numericLimit = limit !== undefined && limit !== null && limit !== "" ? Number(limit) : undefined;
  const isDropdownRequest = numericLimit === 0;

  let query = Scholarship.find(filter)
    .sort({ createdAt: -1 })
    .populate({ path: "student", select: "firstName middleName lastName email userId avatar" })
    .populate("academicYear", "name")
    .populate("campus", "name code");

  let pagination = null;
  if (!isDropdownRequest && numericLimit) {
    const finalLimit = Math.max(numericLimit, 1);
    const finalPage = Math.max(Number(page) || 1, 1);
    query = query.skip((finalPage - 1) * finalLimit).limit(finalLimit);
    pagination = {
      total,
      page: finalPage,
      limit: finalLimit,
      totalPages: Math.ceil(total / finalLimit),
    };
  }

  const scholarships = await query;

  res.status(200).json({
    success: true,
    count: scholarships.length,
    total,
    ...(pagination && { pagination }),
    scholarships,
  });
});

// ============================================================
// GET single scholarship by id
// => GET /api/v1/admin/scholarships/:id
// ============================================================
export const getScholarshipDetails = catchAsyncErrors(async (req, res, next) => {
  const scholarship = await Scholarship.findById(req.params.id)
    .populate({ path: "student", select: "firstName middleName lastName email userId avatar" })
    .populate("academicYear", "name")
    .populate("campus", "name code")
    .populate("enrollment", "status startDate endDate");

  if (!scholarship) {
    return next(new ErrorHandler("Scholarship not found", 404));
  }

  res.status(200).json({ success: true, scholarship });
});

// ============================================================
// CREATE scholarship
// => POST /api/v1/admin/scholarships
// Body (from scholarshipApi.js): studentId, academicYear, enrollment,
// campus, type, criteria, status, percentage | amount
// ============================================================
export const createScholarship = catchAsyncErrors(async (req, res, next) => {
  const {
    studentId,
    academicYear,
    enrollment,
    campus,
    type,
    percentage,
    amount,
    criteria,
    status,
  } = req.body;

  if (!studentId || !academicYear || !criteria || !criteria.trim()) {
    return next(
      new ErrorHandler("studentId, academicYear and criteria are required", 400)
    );
  }

  const student = await User.findById(studentId);
  if (!student || student.role !== "student") {
    return next(new ErrorHandler("The referenced user must be a student", 400));
  }

  const scholarshipType = type === "Fixed" ? "Fixed" : "Percentage";

  if (scholarshipType === "Percentage") {
    const pct = Number(percentage);
    if (percentage === undefined || percentage === null || percentage === "" || pct < 0 || pct > 100) {
      return next(new ErrorHandler("Scholarship percentage must be between 0 and 100", 400));
    }
  } else {
    const amt = Number(amount);
    if (amount === undefined || amount === null || amount === "" || amt < 0) {
      return next(new ErrorHandler("Scholarship amount must be 0 or greater", 400));
    }
  }

  // Enforce one-scholarship-per-student-per-year with a friendly error
  // (the unique index would also catch this, but this gives a clean 400
  // instead of a raw duplicate-key error).
  const existing = await Scholarship.findOne({ student: studentId, academicYear });
  if (existing) {
    return next(
      new ErrorHandler(
        "A scholarship already exists for this student in this academic year. Please update it instead.",
        400
      )
    );
  }

  const scholarship = await Scholarship.create({
    student: studentId,
    academicYear,
    enrollment: enrollment || null,
    campus: campus || null,
    type: scholarshipType,
    percentage: scholarshipType === "Percentage" ? Number(percentage) : undefined,
    amount: scholarshipType === "Fixed" ? Number(amount) : undefined,
    criteria: criteria.trim(),
    status: status || "Pending",
  });

  // Scholarship only ever discounts Tuition, and only once its status is
  // Approved — this keeps the student's Tuition installments (still
  // Pending Fees) in sync with the latest scholarship decision.
  await regenerateFeesForScholarship(scholarship);

  res.status(201).json({ success: true, scholarship });
});

// ============================================================
// UPDATE scholarship
// => PUT /api/v1/admin/scholarships/:id
// ============================================================
export const updateScholarship = catchAsyncErrors(async (req, res, next) => {
  const scholarship = await Scholarship.findById(req.params.id);
  if (!scholarship) {
    return next(new ErrorHandler("Scholarship not found", 404));
  }

  const {
    academicYear,
    enrollment,
    campus,
    type,
    percentage,
    amount,
    criteria,
    status,
  } = req.body;

  // Changing the academic year could collide with another existing
  // scholarship for the same student — guard against that.
  if (academicYear && String(academicYear) !== String(scholarship.academicYear)) {
    const clash = await Scholarship.findOne({
      student: scholarship.student,
      academicYear,
      _id: { $ne: scholarship._id },
    });
    if (clash) {
      return next(
        new ErrorHandler(
          "This student already has a scholarship for that academic year",
          400
        )
      );
    }
    scholarship.academicYear = academicYear;
  }

  if (enrollment !== undefined) scholarship.enrollment = enrollment || null;
  if (campus !== undefined) scholarship.campus = campus || null;
  if (criteria !== undefined) {
    if (!criteria.trim()) {
      return next(new ErrorHandler("Please describe the scholarship criteria", 400));
    }
    scholarship.criteria = criteria.trim();
  }
  if (status !== undefined) scholarship.status = status;

  const nextType = type === "Fixed" || type === "Percentage" ? type : scholarship.type;

  if (nextType === "Percentage") {
    const pct = percentage !== undefined ? Number(percentage) : scholarship.percentage;
    if (pct === undefined || pct === null || Number.isNaN(pct) || pct < 0 || pct > 100) {
      return next(new ErrorHandler("Scholarship percentage must be between 0 and 100", 400));
    }
    scholarship.type = "Percentage";
    scholarship.percentage = pct;
    scholarship.amount = undefined;
  } else {
    const amt = amount !== undefined ? Number(amount) : scholarship.amount;
    if (amt === undefined || amt === null || Number.isNaN(amt) || amt < 0) {
      return next(new ErrorHandler("Scholarship amount must be 0 or greater", 400));
    }
    scholarship.type = "Fixed";
    scholarship.amount = amt;
    scholarship.percentage = undefined;
  }

  await scholarship.save();

  // Re-sync the student's Tuition Fees (still Pending) with whatever just
  // changed — status flipping to Approved/Rejected, or the discount
  // amount/percentage itself changing.
  await regenerateFeesForScholarship(scholarship);

  const populated = await Scholarship.findById(scholarship._id)
    .populate({ path: "student", select: "firstName middleName lastName email userId avatar" })
    .populate("academicYear", "name")
    .populate("campus", "name code");

  res.status(200).json({ success: true, scholarship: populated });
});

// ============================================================
// DELETE scholarship
// => DELETE /api/v1/admin/scholarships/:id
// ============================================================
export const deleteScholarship = catchAsyncErrors(async (req, res, next) => {
  const scholarship = await Scholarship.findById(req.params.id);
  if (!scholarship) {
    return next(new ErrorHandler("Scholarship not found", 404));
  }
  await scholarship.deleteOne();
  res.status(200).json({ success: true, message: "Scholarship deleted successfully" });
});
