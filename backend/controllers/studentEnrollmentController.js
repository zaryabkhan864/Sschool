// controllers/studentEnrollmentController.js
import mongoose from "mongoose"; // ✅ FIX: Missing import added
import StudentEnrollment from "../models/studentEnrollment.js";
import User from "../models/user.js";
import AcademicYear from "../models/academicYear.js";
import ClassGroup from "../models/classGroup.js";
import Campus from "../models/campus.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import APIFilters from "../utils/apiFilters.js";

// @desc    Create a new student enrollment
// @route   POST /api/v1/admin/student-enrollments
// @access  Private/Admin
export const createStudentEnrollment = catchAsyncErrors(async (req, res, next) => {
  const { student, academicYear, classGroup, campus, startDate } = req.body;

  if (!student || !academicYear || !classGroup || !startDate) {
    return next(new ErrorHandler("Please provide student, academicYear, classGroup, and startDate", 400));
  }

  const studentDoc = await User.findById(student);
  if (!studentDoc) {
    return next(new ErrorHandler("Student not found", 404));
  }

  if (studentDoc.role !== "student") {
    return next(new ErrorHandler("The selected user is not a student", 400));
  }

  // ❌ REMOVE OLD CHECK
  // (ab multiple enrollments allowed hain)

  // ✅ CHECK: koi active enrollment already hai?
  const existingActive = await StudentEnrollment.findOne({
    student,
    academicYear,
    status: "active",
  });

  if (existingActive) {
    return next(
      new ErrorHandler(
        "Student already has an active enrollment. Use transfer instead.",
        400
      )
    );
  }

  const enrollment = await StudentEnrollment.create({
    student,
    academicYear,
    classGroup,
    campus: campus || undefined, // ✅ SAFE
    startDate,
    status: "active",
  });

  if (studentDoc.status === "pending") {
    studentDoc.status = "active";
    await studentDoc.save({ validateBeforeSave: false });
  }

  res.status(201).json({
    success: true,
    message: "Student enrolled successfully",
    enrollment,
  });
});

export const getStudentEnrollments = catchAsyncErrors(async (req, res, next) => {
  const apiFilters = new APIFilters(StudentEnrollment.find(), req.query)
    .search()
    .filters()
    .sort();

  let enrollments = await apiFilters.query
    .populate({
      path: "student",
      select: "firstName middleName lastName email phoneNumber gender nationality status",
    })
    .populate("academicYear", "name yearRange")
    .populate("classGroup", "name grade section")
    .populate("campus", "name code");

  const paginate = req.query.paginate === "false" ? false : true;
  let pagination = {};

  if (paginate) {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = enrollments.length;

    pagination = {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    };

    enrollments = enrollments.slice(startIndex, endIndex);
  }

  res.status(200).json({
    success: true,
    count: enrollments.length,
    pagination: paginate ? pagination : null,
    enrollments,
  });
});

export const getStudentEnrollmentDetails = catchAsyncErrors(async (req, res, next) => {
  const enrollment = await StudentEnrollment.findById(req.params.id)
    .populate("student")
    .populate("academicYear")
    .populate("classGroup")
    .populate("campus");

  if (!enrollment) {
    return next(new ErrorHandler("Enrollment not found", 404));
  }

  res.status(200).json({
    success: true,
    enrollment,
  });
});

export const updateStudentEnrollment = catchAsyncErrors(async (req, res, next) => {
  let enrollment = await StudentEnrollment.findById(req.params.id);

  if (!enrollment) {
    return next(new ErrorHandler("Enrollment not found", 404));
  }

  // ❌ student & academicYear change na hone do
  const restrictedFields = ["student", "academicYear"];
  restrictedFields.forEach((field) => {
    if (req.body[field]) delete req.body[field];
  });

  // ✅ allow updating dates & classGroup etc
  Object.keys(req.body).forEach((key) => {
    enrollment[key] = req.body[key];
  });

  await enrollment.save(); // important for validation

  res.status(200).json({
    success: true,
    message: "Enrollment updated successfully",
    enrollment,
  });
});

export const deleteStudentEnrollment = catchAsyncErrors(async (req, res, next) => {
  const enrollment = await StudentEnrollment.findById(req.params.id);

  if (!enrollment) {
    return next(new ErrorHandler("Enrollment not found", 404));
  }

  await enrollment.deleteOne();

  res.status(200).json({
    success: true,
    message: "Enrollment deleted successfully",
  });
});

export const getUnenrolledStudents = catchAsyncErrors(async (req, res, next) => {
  let { academicYear, campus } = req.query;

  if (!academicYear || !mongoose.Types.ObjectId.isValid(academicYear)) {
    const currentYear = await AcademicYear.findOne({ isCurrent: true });
    if (!currentYear) {
      return next(new ErrorHandler("No academic year provided and no current academic year found", 400));
    }
    academicYear = currentYear._id;
  }

  const enrolledStudentIds = await StudentEnrollment.find({
    academicYear,
    status: "active",
  }).distinct("student");

  const studentFilter = {
    role: "student",
    _id: { $nin: enrolledStudentIds },
  };

  if (campus) {
    studentFilter.campus = campus;
  }

  const students = await User.find(studentFilter).select(
    "firstName middleName lastName email phoneNumber gender nationality status avatar campus"
  );

  res.status(200).json({
    success: true,
    count: students.length,
    students,
  });
});

export const getEnrolledStudentsWithDetails = catchAsyncErrors(async (req, res, next) => {
  const enrollments = await StudentEnrollment.find()
    .populate({
      path: "student",
      select: "firstName middleName lastName email phoneNumber gender nationality status",
    })
    .populate("academicYear", "name yearRange")
    .populate("classGroup", "name grade section")
    .populate("campus", "name code");

  res.status(200).json({
    success: true,
    count: enrollments.length,
    enrollments,
  });
});

export const transferStudent = catchAsyncErrors(async (req, res, next) => {
  const {
    studentId,
    newCampusId,
    newClassGroupId,
    academicYearId,
    transferDate,
  } = req.body;

  if (!studentId || !newCampusId || !newClassGroupId || !academicYearId || !transferDate) {
    return next(new ErrorHandler("All fields are required", 400));
  }

  const newEnrollment = await StudentEnrollment.transferStudent({
    studentId,
    newCampusId,
    newClassGroupId,
    academicYearId,
    transferDate,
  });

  res.status(200).json({
    success: true,
    message: "Student transferred successfully",
    enrollment: newEnrollment,
  });
});