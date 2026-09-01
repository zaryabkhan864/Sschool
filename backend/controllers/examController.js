// controllers/examController.js
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Exam from "../models/exam.js";
import StudentEnrollment from "../models/studentEnrollment.js";
import ErrorHandler from "../utils/errorHandler.js";

const getContext = (req) => {
  const academicYear = req.query.academicYear || req.cookies.academicYear;
  const campus = req.query.campus || req.cookies.campus;
  return { academicYear, campus };
};

const populateOptions = [
  { path: "classGroup", select: "displayName section grade academicLevel" },
  { path: "course", select: "courseName code" },
  { path: "teacher", select: "firstName middleName lastName email" },
  { path: "campus", select: "name" },
  { path: "academicYear", select: "name" },
  { path: "marks.student", select: "firstName middleName lastName userId" },
];

// ============================================================
// POST => /api/v1/teacher/exam/fetch-or-create
// ============================================================
export const fetchOrCreateExam = catchAsyncErrors(async (req, res, next) => {
  const { academicYear, campus } = getContext(req);
  if (!academicYear) return next(new ErrorHandler("Academic Year not selected", 400));
  if (!campus) return next(new ErrorHandler("Campus not selected", 400));

  const teacher = req.user?._id;
  if (!teacher) return next(new ErrorHandler("Teacher could not be resolved", 400));

  const { classGroup, course, examNumber, title, date, totalQuestions, marksPerQuestion } = req.body;

  if (!classGroup || !course || !examNumber) {
    return next(new ErrorHandler("Class group, course and exam number are required", 400));
  }

  const existingExam = await Exam.findOne({
    classGroup,
    course,
    examNumber,
    academicYear,
  }).populate(populateOptions);

  if (existingExam) {
    return res.status(200).json({
      success: true,
      message: "Existing exam loaded.",
      isNew: false,
      exam: existingExam,
    });
  }

  if (!date || !totalQuestions || !marksPerQuestion) {
    return next(
      new ErrorHandler("Date, total questions and marks per question are required to create a new exam", 400)
    );
  }

  const enrollments = await StudentEnrollment.find({ classGroup, status: "active" });
  if (!enrollments.length) {
    return next(new ErrorHandler("No active students found in this class group", 404));
  }

  const initialMarks = enrollments.map((e) => ({
    student: e.student,
    answers: Array(Number(totalQuestions)).fill(0),
  }));

  const exam = await Exam.create({
    title: title || `Exam ${examNumber}`,
    examNumber,
    date,
    course,
    classGroup,
    teacher,
    campus,
    academicYear,
    totalQuestions: Number(totalQuestions),
    marksPerQuestion: Number(marksPerQuestion),
    marks: initialMarks,
  });

  const populated = await Exam.findById(exam._id).populate(populateOptions);

  res.status(201).json({
    success: true,
    message: "New exam created.",
    isNew: true,
    exam: populated,
  });
});

// ============================================================
// GET (list) => /api/v1/teacher/exams
// ============================================================
export const getExams = catchAsyncErrors(async (req, res, next) => {
  const { academicYear, campus } = getContext(req);
  if (!academicYear) return next(new ErrorHandler("Academic Year not selected", 400));
  if (!campus) return next(new ErrorHandler("Campus not selected", 400));

  const { classGroup, course, keyword } = req.query;
  const baseConditions = { campus, academicYear };
  if (classGroup) baseConditions.classGroup = classGroup;
  if (course) baseConditions.course = course;
  if (keyword && keyword.trim()) {
    baseConditions.title = { $regex: keyword.trim(), $options: "i" };
  }

  const resPerPage = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  const total = await Exam.countDocuments(baseConditions);

  const exams = await Exam.find(baseConditions)
    .populate(populateOptions)
    .sort({ date: -1 })
    .skip((page - 1) * resPerPage)
    .limit(resPerPage);

  res.status(200).json({
    success: true,
    exams,
    pagination: {
      total,
      page,
      limit: resPerPage,
      totalPages: Math.ceil(total / resPerPage),
    },
  });
});

// ============================================================
// GET single => /api/v1/exams/:id
// ============================================================
export const getExamDetails = catchAsyncErrors(async (req, res, next) => {
  const exam = await Exam.findById(req.params.id).populate(populateOptions);
  if (!exam) return next(new ErrorHandler("Exam not found", 404));
  res.status(200).json({ success: true, exam });
});

// ============================================================
// PUT => /api/v1/teacher/exam/:id
// totalQuestions/marksPerQuestion are fixed at creation, same reasoning
// as the Quiz module — changing them after marks exist would corrupt data.
// ============================================================
export const updateExamMarks = catchAsyncErrors(async (req, res, next) => {
  const exam = await Exam.findById(req.params.id);
  if (!exam) return next(new ErrorHandler("Exam not found", 404));

  const { marks, title, date } = req.body;

  if (marks) exam.marks = marks;
  if (title) exam.title = title;
  if (date) exam.date = date;

  await exam.save();

  const populated = await Exam.findById(exam._id).populate(populateOptions);

  res.status(200).json({
    success: true,
    message: "Exam marks updated successfully",
    exam: populated,
  });
});

// ============================================================
// DELETE => /api/v1/teacher/exam/:id
// ============================================================
export const deleteExam = catchAsyncErrors(async (req, res, next) => {
  const exam = await Exam.findById(req.params.id);
  if (!exam) return next(new ErrorHandler("Exam not found", 404));

  await Exam.findByIdAndDelete(req.params.id);

  res.status(200).json({ success: true, message: "Exam deleted successfully" });
});
