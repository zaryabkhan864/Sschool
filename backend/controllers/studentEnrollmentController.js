// controllers
import mongoose from "mongoose";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import StudentEnrollment from "../models/studentEnrollment.js";
import User from "../models/user.js";
import AcademicYear from "../models/academicYear.js";
import ClassGroup from "../models/classGroup.js";
import Campus from "../models/campus.js";
import Fees from "../models/fees.js";
import ErrorHandler from "../utils/errorHandler.js";
import APIFilters from "../utils/apiFilters.js";
import { generateFeesForEnrollment, FEE_TYPE_FREQUENCIES } from "../utils/feePlanGenerator.js";

// Shared validation for the feePlan planner array (used by both create
// and update). Returns an ErrorHandler-ready message, or null if valid.
function validateFeePlanLines(feePlan) {
  if (!Array.isArray(feePlan) || feePlan.length === 0) {
    return "feePlan must include at least one fee type (e.g. Tuition)";
  }
  const seenTypes = new Set();
  for (const line of feePlan) {
    if (
      !line.feeType ||
      line.amount === undefined ||
      line.amount === null ||
      line.amount === "" ||
      !line.dueDate ||
      !line.paymentFrequency
    ) {
      return "Each fee plan line needs feeType, amount, dueDate, and paymentFrequency";
    }
    if (Number(line.amount) <= 0) {
      return `${line.feeType} amount must be greater than 0`;
    }
    if (seenTypes.has(line.feeType)) {
      return `Duplicate fee type in fee plan: ${line.feeType}`;
    }
    // Admission is always one-off; Exam is only ever Quarterly/Annually —
    // reject anything outside what's sensible for that fee type before it
    // ever reaches the model validator, so the error message is clean.
    const allowedFrequencies = FEE_TYPE_FREQUENCIES[line.feeType];
    if (allowedFrequencies && !allowedFrequencies.includes(line.paymentFrequency)) {
      return `${line.feeType} can only be billed as: ${allowedFrequencies.join(", ")}`;
    }
    seenTypes.add(line.feeType);
  }
  return null;
}

export const createStudentEnrollment = catchAsyncErrors(async (req, res, next) => {
  const { campus: cookieCampus, academicYear: cookieAcademicYear } = req.cookies;

  const { student, classGroup, startDate, feePlan } = req.body;
  const campus = req.body.campus || cookieCampus;
  const academicYear = req.body.academicYear || cookieAcademicYear;

  if (!student || !academicYear || !classGroup || !startDate) {
    return next(
      new ErrorHandler("student, academicYear, classGroup, and startDate are required", 400)
    );
  }
  if (!campus) {
    return next(new ErrorHandler("Campus is required. Provide campus or set cookie.", 400));
  }

  // feePlan is now a planner: an array of lines, one per fee type the
  // admin selected (Admission/Tuition/Exam/Transport/Hostel). A student
  // who isn't taking transport simply won't have a "Transport" line.
  const feePlanError = validateFeePlanLines(feePlan);
  if (feePlanError) {
    return next(new ErrorHandler(feePlanError, 400));
  }

  const studentDoc = await User.findById(student);
  if (!studentDoc) {
    return next(new ErrorHandler("Student not found", 404));
  }
  if (studentDoc.role !== "student") {
    return next(new ErrorHandler("The selected user is not a student", 400));
  }

  // Prevent duplicate active enrollment in the same academic year
  const existingActive = await StudentEnrollment.findOne({
    student,
    academicYear,
    status: "active",
  });
  if (existingActive) {
    return next(
      new ErrorHandler(
        "Student already has an active enrollment for this academic year. Use transfer.",
        400
      )
    );
  }
  const enrollment = await StudentEnrollment.create({
    student,
    academicYear,
    classGroup,
    campus,
    startDate,
    status: "active",
    feePlan: feePlan.map((line) => ({
      feeType: line.feeType,
      amount: Number(line.amount),
      currency: line.currency || "USD",
      paymentFrequency: line.paymentFrequency,
      dueDate: line.dueDate,
      paymentMethod: line.paymentMethod || undefined,
    })),
  });

  await User.findByIdAndUpdate(student, { campus }, { runValidators: false });

  // Splits each fee plan line into installments (Fees docs) according to
  // its paymentFrequency, applies any existing Approved scholarship's
  // discount to Tuition, and sets a reminderDate on each installment so
  // finance is notified ahead of the due date.
  const fees = await generateFeesForEnrollment(enrollment);

  res.status(201).json({
    success: true,
    message: "Student enrolled successfully",
    enrollment,
    fees,
  });
});

export const getStudentEnrollments = catchAsyncErrors(async (req, res, next) => {
  const { campus: cookieCampus, academicYear: cookieAcademicYear } = req.cookies;
  if (!req.query.campus && cookieCampus) req.query.campus = cookieCampus;
  if (!req.query.academicYear && cookieAcademicYear) req.query.academicYear = cookieAcademicYear;

  req.query.isDeleted = false;

  const limit = Number(req.query.limit);
  const isDropdownRequest = limit === 0 || req.query.paginate === "false";
  const includeUnenrolled = req.query.includeUnenrolled === "true";
  const countOnly = req.query.countOnly === "true";
  const keyword = req.query.keyword?.trim();
  const gender = req.query.gender;
  let studentIdFilter = null;
  if (keyword || gender) {
    const studentQuery = { role: "student" };
    if (gender) studentQuery.gender = gender;
    if (keyword) {
      studentQuery.$or = [
        { firstName: { $regex: keyword, $options: "i" } },
        { middleName: { $regex: keyword, $options: "i" } },
        { lastName: { $regex: keyword, $options: "i" } },
        { phoneNumber: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
      ];
    }
    studentIdFilter = await User.find(studentQuery).distinct("_id");
  }
  delete req.query.keyword;
  delete req.query.gender;
  delete req.query.countOnly;

  const baseApiFilters = new APIFilters(StudentEnrollment, req.query)
    .filters()
    .sort();
  if (studentIdFilter) {
    baseApiFilters.query._conditions.student = { $in: studentIdFilter };
  }
  const totalEnrollments = await StudentEnrollment.countDocuments(
    baseApiFilters.query._conditions
  );
  if (countOnly) {
    return res.status(200).json({ success: true, total: totalEnrollments });
  }

  const apiFilters = new APIFilters(StudentEnrollment, req.query)
    .filters()
    .sort();
  if (studentIdFilter) {
    apiFilters.query._conditions.student = { $in: studentIdFilter };
  }

  if (!isDropdownRequest) {
    apiFilters.pagination();
  }

  let enrollments = await apiFilters.query
    .populate({
      path: "student",
      select: "firstName middleName lastName email phoneNumber gender nationality status avatar",
    })
    .populate("campus", "name code")
    .populate("academicYear", "name")
    .populate("classGroup", "name grade section");

  let finalEnrollments = enrollments;
  let totalCount = totalEnrollments;

  if (includeUnenrolled) {
    const studentFilter = { role: "student" };

    let campusFilter = null;
    if (req.query.campus && mongoose.Types.ObjectId.isValid(req.query.campus)) {
      campusFilter = req.query.campus;
    } else if (cookieCampus && mongoose.Types.ObjectId.isValid(cookieCampus)) {
      campusFilter = cookieCampus;
    }
    if (campusFilter) {
      studentFilter.campus = campusFilter;
    }

    let academicYearFilter = null;
    if (req.query.academicYear && mongoose.Types.ObjectId.isValid(req.query.academicYear)) {
      academicYearFilter = req.query.academicYear;
    } else if (cookieAcademicYear && mongoose.Types.ObjectId.isValid(cookieAcademicYear)) {
      academicYearFilter = cookieAcademicYear;
    }

    const candidateStudents = await User.find(studentFilter)
      .select("firstName middleName lastName email phoneNumber gender nationality accountStatus lifecycleStatus avatar")
      .populate("campus", "name code");

    let unenrolledStudents = candidateStudents;

    if (candidateStudents.length > 0) {
      const enrollmentQuery = {
        student: { $in: candidateStudents.map((s) => s._id) },
        status: "active",
        isDeleted: false,
      };
      if (academicYearFilter) enrollmentQuery.academicYear = academicYearFilter;

      const enrolledIds = new Set(
        (await StudentEnrollment.find(enrollmentQuery).distinct("student")).map((id) =>
          id.toString()
        )
      );

      unenrolledStudents = candidateStudents.filter(
        (s) => !enrolledIds.has(s._id.toString())
      );
    }

    const pseudoEnrollments = unenrolledStudents.map((student) => ({
      _id: null,
      student,
      campus: student.campus || null,
      academicYear: null,
      classGroup: null,
      status: "unenrolled",
      startDate: null,
      endDate: null,
      note: null,
      isDeleted: false,
      expiryAlertSent: false,
      audit: null,
      createdAt: null,
      updatedAt: null,
    }));

    finalEnrollments = [...enrollments, ...pseudoEnrollments];
    totalCount = totalEnrollments + unenrolledStudents.length;
  }

  let pagination = null;
  if (!isDropdownRequest && apiFilters.shouldPaginate) {
    if (includeUnenrolled) {
      pagination = null;
    } else {
      pagination = {
        total: totalEnrollments,
        page: apiFilters.page,
        limit: apiFilters.limit,
        totalPages: Math.ceil(totalEnrollments / apiFilters.limit),
      };
    }
  }

  res.status(200).json({
    success: true,
    count: finalEnrollments.length,
    total: totalEnrollments,
    ...(pagination && { pagination }),
    enrollments: finalEnrollments,
  });
});

// ============================================================
// GET single enrollment details
// ============================================================
export const getStudentEnrollmentDetails = catchAsyncErrors(async (req, res, next) => {
  const enrollment = await StudentEnrollment.findOne({
    _id: req.params.id,
    isDeleted: false,
  })
    .populate("student")
    .populate("campus")
    .populate("academicYear")
    .populate("classGroup");

  if (!enrollment) {
    return next(new ErrorHandler("Enrollment not found", 404));
  }
  const fees = await Fees.find({ enrollment: enrollment._id }).sort({
    feeType: 1,
    installmentNumber: 1,
  });

  res.status(200).json({
    success: true,
    enrollment,
    fees,
  });
});

// ============================================================
// UPDATE student enrollment
// ============================================================
export const updateStudentEnrollment = catchAsyncErrors(async (req, res, next) => {
  const enrollment = await StudentEnrollment.findOne({
    _id: req.params.id,
    isDeleted: false,
  });

  if (!enrollment) {
    return next(new ErrorHandler("Enrollment not found", 404));
  }

  // Prevent editing closed enrollments (you may adjust these statuses)
  if (["expired", "terminated", "resigned"].includes(enrollment.status)) {
    return next(
      new ErrorHandler(
        `Enrollments with status "${enrollment.status}" are read-only and cannot be edited`,
        400
      )
    );
  }

  // Lock down the student and academic year after creation
  const restrictedFields = ["student", "academicYear"];
  restrictedFields.forEach((field) => {
    if (req.body[field] !== undefined) delete req.body[field];
  });

  // If the fee plan is being updated, validate it the same way create does.
  if (req.body.feePlan !== undefined) {
    const feePlanError = validateFeePlanLines(req.body.feePlan);
    if (feePlanError) {
      return next(new ErrorHandler(feePlanError, 400));
    }
    req.body.feePlan = req.body.feePlan.map((line) => ({
      feeType: line.feeType,
      amount: Number(line.amount),
      currency: line.currency || "USD",
      paymentFrequency: line.paymentFrequency,
      dueDate: line.dueDate,
      paymentMethod: line.paymentMethod || undefined,
    }));
  }

  Object.keys(req.body).forEach((key) => {
    enrollment[key] = req.body[key];
  });

  if (enrollment.audit) {
    enrollment.audit.updatedBy = req.user._id;
  }
  await enrollment.save();
  if (enrollment.status === "active") {
    await User.findByIdAndUpdate(
      enrollment.student,
      { campus: enrollment.campus },
      { runValidators: false }
    );
  }

  // The fee plan (or campus/academic dates) may have changed — regenerate
  // the still-Pending installments so finance always sees the current
  // plan. Fees already Paid or Overdue are never touched or deleted.
  const fees = await generateFeesForEnrollment(enrollment);

  res.status(200).json({
    success: true,
    message: "Enrollment updated successfully",
    enrollment,
    fees,
  });
});

// ============================================================
// SOFT DELETE enrollment
// ============================================================
export const deleteStudentEnrollment = catchAsyncErrors(async (req, res, next) => {
  const enrollment = await StudentEnrollment.findOne({
    _id: req.params.id,
    isDeleted: false,
  });

  if (!enrollment) {
    return next(new ErrorHandler("Enrollment not found", 404));
  }

  enrollment.isDeleted = true;
  if (enrollment.audit) {
    enrollment.audit.deletedBy = req.user._id;
    enrollment.audit.deletedAt = new Date();
  }
  await enrollment.save();

  res.status(200).json({
    success: true,
    message: "Enrollment deleted successfully",
  });
});

// ============================================================
// TERMINATE enrollment
// ============================================================
export const terminateEnrollment = catchAsyncErrors(async (req, res, next) => {
  const enrollment = await StudentEnrollment.findOne({
    _id: req.params.id,
    isDeleted: false,
  });

  if (!enrollment) {
    return next(new ErrorHandler("Enrollment not found", 404));
  }

  if (enrollment.status !== "active") {
    return next(new ErrorHandler("Only active enrollments can be terminated", 400));
  }

  enrollment.status = "terminated";
  enrollment.endDate = req.body.endDate || new Date();
  enrollment.terminationReason = req.body.reason;
  enrollment.note = req.body.note || enrollment.note;
  if (enrollment.audit) {
    enrollment.audit.terminatedBy = req.user._id;
    enrollment.audit.updatedBy = req.user._id;
  }
  await enrollment.save();

  await User.findByIdAndUpdate(enrollment.student, {
    lifecycleStatus: "terminated",
    currentEnrollment: null,
  });

  res.status(200).json({
    success: true,
    message: "Enrollment terminated successfully",
    enrollment,
  });
});

// ============================================================
// RESIGN enrollment
// ============================================================
export const resignEnrollment = catchAsyncErrors(async (req, res, next) => {
  const enrollment = await StudentEnrollment.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false, status: "active" },
    {
      status: "resigned",
      endDate: req.body.endDate || new Date(),
      note: req.body.note,
      "audit.updatedBy": req.user._id,
    },
    { new: true }
  );

  if (!enrollment) {
    return next(new ErrorHandler("Only active enrollments can be resigned", 400));
  }

  await User.findByIdAndUpdate(enrollment.student, {
    lifecycleStatus: "resigned",
    currentEnrollment: null,
  });

  res.status(200).json({
    success: true,
    message: "Enrollment resigned successfully",
    enrollment,
  });
});

// ============================================================
// APPROVE RE-ENROLL
// ============================================================
export const approveReEnroll = catchAsyncErrors(async (req, res, next) => {
  const enrollment = await StudentEnrollment.findOne({
    _id: req.params.id,
    isDeleted: false,
    status: "terminated",
  });

  if (!enrollment) {
    return next(new ErrorHandler("Terminated enrollment not found", 404));
  }

  enrollment.reEnrollAllowed = true;
  if (enrollment.audit) {
    enrollment.audit.reEnrollApprovedBy = req.user._id;
    enrollment.audit.updatedBy = req.user._id;
  }
  await enrollment.save();

  res.status(200).json({
    success: true,
    message: "Re-enrollment approved. A new enrollment can now be created.",
    enrollment,
  });
});
export const transferStudent = catchAsyncErrors(async (req, res, next) => {
  const { studentId, newCampusId, newClassGroupId, academicYearId, transferDate, feePlan } = req.body;

  if (!studentId || !newCampusId || !newClassGroupId || !academicYearId || !transferDate) {
    return next(new ErrorHandler("All fields are required", 400));
  }

  if (feePlan !== undefined) {
    const feePlanError = validateFeePlanLines(feePlan);
    if (feePlanError) {
      return next(new ErrorHandler(feePlanError, 400));
    }
  }

  if (!(await Campus.findById(newCampusId))) {
    return next(new ErrorHandler("New campus not found", 404));
  }

  // Use the static method if available
  if (StudentEnrollment.transferStudent) {
    const newEnrollment = await StudentEnrollment.transferStudent({
      studentId,
      newCampusId,
      newClassGroupId,
      academicYearId,
      transferDate,
      feePlan,
    });
    await User.findByIdAndUpdate(studentId, { campus: newCampusId });
    const fees = await generateFeesForEnrollment(newEnrollment);
    return res.status(200).json({
      success: true,
      message: "Student transferred successfully",
      enrollment: newEnrollment,
      fees,
    });
  }

  // Fallback manual transfer
  const existingEnrollment = await StudentEnrollment.findOne({
    student: studentId,
    academicYear: academicYearId,
    status: "active",
    isDeleted: false,
  });

  if (!existingEnrollment) {
    return next(new ErrorHandler("No active enrollment found for this academic year", 404));
  }

  existingEnrollment.status = "transferred";
  existingEnrollment.endDate = new Date(transferDate);
  existingEnrollment.transferredToCampus = newCampusId;
  if (existingEnrollment.audit) {
    existingEnrollment.audit.updatedBy = req.user._id;
  }
  await existingEnrollment.save();

  const newEnrollment = await StudentEnrollment.create({
    student: studentId,
    campus: newCampusId,
    classGroup: newClassGroupId,
    academicYear: academicYearId,
    startDate: new Date(transferDate),
    status: "active",
    previousEnrollment: existingEnrollment._id,
    feePlan: feePlan && feePlan.length ? feePlan : existingEnrollment.feePlan,
    audit: { createdBy: req.user._id },
  });

  await User.findByIdAndUpdate(studentId, { campus: newCampusId });
  const fees = await generateFeesForEnrollment(newEnrollment);

  res.status(200).json({
    success: true,
    message: "Student transferred successfully",
    enrollment: newEnrollment,
    fees,
  });
});

// ============================================================
// GET enrolled students with details (active enrollments)
// ============================================================
export const getEnrolledStudentsWithDetails = catchAsyncErrors(async (req, res, next) => {
  const { campus: cookieCampus, academicYear: cookieAcademicYear } = req.cookies;
  const filter = { status: "active", isDeleted: false };
  if (cookieCampus) filter.campus = cookieCampus;
  if (cookieAcademicYear) filter.academicYear = cookieAcademicYear;

  const enrollments = await StudentEnrollment.find(filter)
    .populate({
      path: "student",
      select: "firstName middleName lastName email phoneNumber gender nationality status",
    })
    .populate("campus", "name code")
    .populate("academicYear", "name startDate endDate")
    .populate("classGroup", "name grade section");

  res.status(200).json({
    success: true,
    count: enrollments.length,
    enrollments,
  });
});

export const getUnenrolledStudents = catchAsyncErrors(async (req, res, next) => {
  let { campus, academicYear, keyword, gender, page, limit, countOnly } = req.query;
  if (!campus && req.cookies?.campus && mongoose.Types.ObjectId.isValid(req.cookies.campus)) {
    campus = req.cookies.campus;
  }
  if (!academicYear && req.cookies?.academicYear && mongoose.Types.ObjectId.isValid(req.cookies.academicYear)) {
    academicYear = req.cookies.academicYear;
  }

  if (!academicYear) {
    const currentYear = await AcademicYear.findOne({ isCurrent: true });
    if (currentYear) academicYear = currentYear._id;
  }

  const studentFilter = {
    role: "student",
    $or: [
      { accountStatus: "pending" },
      { lifecycleStatus: { $in: ["pending", "unenrolled", "transferred"] } },
    ],
  };
  if (campus) {
    studentFilter.campus = campus;
  }
  if (gender) {
    studentFilter.gender = gender;
  }

  const trimmedKeyword = keyword?.trim();
  if (trimmedKeyword) {
    studentFilter.$and = [
      {
        $or: [
          { firstName: { $regex: trimmedKeyword, $options: "i" } },
          { middleName: { $regex: trimmedKeyword, $options: "i" } },
          { lastName: { $regex: trimmedKeyword, $options: "i" } },
          { phoneNumber: { $regex: trimmedKeyword, $options: "i" } },
          { email: { $regex: trimmedKeyword, $options: "i" } },
        ],
      },
    ];
  }

  if (academicYear) {
    const enrolledIds = await StudentEnrollment.find({
      academicYear,
      status: "active",
      isDeleted: false,
    }).distinct("student");
    if (enrolledIds.length > 0) {
      studentFilter._id = { $nin: enrolledIds };
    }
  }

  const total = await User.countDocuments(studentFilter);

  if (countOnly === "true") {
    return res.status(200).json({ success: true, total });
  }

  const numericLimit = limit === undefined || limit === null || limit === "" ? undefined : Number(limit);
  const hasPaginationParams = numericLimit !== undefined && numericLimit !== 0;

  let query = User.find(studentFilter)
    .select("firstName middleName lastName email phoneNumber gender nationality accountStatus lifecycleStatus avatar")
    .populate("campus", "name code")
    .sort("-createdAt");

  let paginationMeta = null;
  if (hasPaginationParams) {
    const finalLimit = Math.max(numericLimit, 1);
    const finalPage = Math.max(Number(page) || 1, 1);
    query = query.skip((finalPage - 1) * finalLimit).limit(finalLimit);
    paginationMeta = {
      total,
      page: finalPage,
      limit: finalLimit,
      totalPages: Math.ceil(total / finalLimit),
    };
  }

  const students = await query;

  res.status(200).json({
    success: true,
    count: students.length,
    total,
    ...(paginationMeta && { pagination: paginationMeta }),
    students,
  });
});

// ============================================================
// GET students needing enrollment
// ============================================================
export const getStudentsNeedingEnrollment = catchAsyncErrors(async (req, res, next) => {
  let { campus, academicYear } = req.query;
  if (!campus && req.cookies?.campus) campus = req.cookies.campus;
  if (!academicYear && req.cookies?.academicYear) academicYear = req.cookies.academicYear;

  if (!campus || !academicYear) {
    return next(new ErrorHandler("campus and academicYear are required", 400));
  }

  const students = await User.find({
    role: "student",
    campus,
  }).select("firstName middleName lastName email phoneNumber gender nationality accountStatus lifecycleStatus");

  const result = [];
  for (const student of students) {
    const hasActiveEnrollment = await StudentEnrollment.findOne({
      student: student._id,
      academicYear,
      status: "active",
      isDeleted: false,
    });
    if (!hasActiveEnrollment) {
      const previousEnrollment = await StudentEnrollment.findOne({
        student: student._id,
        academicYear,
        isDeleted: false,
      });
      result.push({
        user: student,
        previousEnrollment: previousEnrollment || null,
      });
    }
  }

  res.status(200).json({
    success: true,
    count: result.length,
    students: result,
  });
});

// ============================================================
// GET expiring enrollments
// ============================================================
export const getExpiringEnrollments = catchAsyncErrors(async (req, res, next) => {
  const days = parseInt(req.query.days) || 30;
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const enrollments = await StudentEnrollment.find({
    status: "active",
    isDeleted: false,
    endDate: { $lte: futureDate, $gte: now },
  })
    .populate({
      path: "student",
      select: "firstName middleName lastName email phoneNumber",
    })
    .populate("campus", "name code")
    .populate("academicYear", "name");

  res.status(200).json({
    success: true,
    count: enrollments.length,
    message: `Enrollments expiring within ${days} days`,
    enrollments,
  });
});

// ============================================================
// MARK expiry alert sent
// ============================================================
export const markEnrollmentExpiryAlertSent = catchAsyncErrors(async (req, res, next) => {
  const enrollment = await StudentEnrollment.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false },
    { expiryAlertSent: true },
    { new: true }
  );

  if (!enrollment) {
    return next(new ErrorHandler("Enrollment not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Expiry alert marked as sent",
    enrollment,
  });
});

// ============================================================
// EXPIRE overdue enrollments (cron)
// ============================================================
export const expireOverdueEnrollments = catchAsyncErrors(async (req, res, next) => {
  const now = new Date();
  const result = await StudentEnrollment.updateMany(
    {
      status: "active",
      isDeleted: false,
      endDate: { $lte: now },
    },
    {
      status: "expired",
      "audit.updatedBy": req.user?._id,
    }
  );

  res.status(200).json({
    success: true,
    message: `${result.nModified} enrollment(s) expired automatically`,
  });
});

// ============================================================
// CHECK active enrollment on a specific date
// ============================================================
export const checkActiveEnrollmentOnDate = catchAsyncErrors(async (req, res, next) => {
  const { studentId, campusId, date } = req.query;

  if (!studentId || !campusId) {
    return next(new ErrorHandler("studentId and campusId are required", 400));
  }

  const checkDate = date ? new Date(date) : new Date();

  const hasEnrollment = !!(await StudentEnrollment.findOne({
    student: studentId,
    campus: campusId,
    status: "active",
    isDeleted: false,
    startDate: { $lte: checkDate },
    $or: [
      { endDate: { $gte: checkDate } },
      { endDate: null },
    ],
  }));

  res.status(200).json({
    success: true,
    hasActiveEnrollment: hasEnrollment,
    date: checkDate,
  });
});

// ============================================================
// GET student enrollment history
// ============================================================
export const getStudentEnrollmentHistory = catchAsyncErrors(async (req, res, next) => {
  const { academicYear } = req.query;

  const filter = {
    student: req.params.studentId,
    isDeleted: false,
  };
  if (academicYear) filter.academicYear = academicYear;

  const history = await StudentEnrollment.find(filter)
    .sort({ startDate: -1 })
    .populate("campus", "name code")
    .populate("academicYear", "name startDate endDate")
    .populate("classGroup", "name grade section");

  res.status(200).json({
    success: true,
    count: history.length,
    history,
  });
});
