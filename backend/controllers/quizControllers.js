// controllers/quizControllers.js
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Quiz from "../models/quiz.js";
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
// POST => /api/v1/teacher/quiz/fetch-or-create
// If a quiz already exists for this classGroup+course+quizNumber+year,
// returns it as-is (its totalQuestions/marksPerQuestion are fixed once
// created). Otherwise creates a new one, seeded with every currently
// active student in the class group (all answers start at 0).
// ============================================================
export const fetchOrCreateQuiz = catchAsyncErrors(async (req, res, next) => {
  const { academicYear, campus } = getContext(req);
  if (!academicYear) return next(new ErrorHandler("Academic Year not selected", 400));
  if (!campus) return next(new ErrorHandler("Campus not selected", 400));

  const teacher = req.user?._id;
  if (!teacher) return next(new ErrorHandler("Teacher could not be resolved", 400));

  const { classGroup, course, quizNumber, title, date, totalQuestions, marksPerQuestion } = req.body;

  if (!classGroup || !course || !quizNumber) {
    return next(new ErrorHandler("Class group, course and quiz number are required", 400));
  }

  const existingQuiz = await Quiz.findOne({
    classGroup,
    course,
    quizNumber,
    academicYear,
  }).populate(populateOptions);

  if (existingQuiz) {
    return res.status(200).json({
      success: true,
      message: "Existing quiz loaded.",
      isNew: false,
      quiz: existingQuiz,
    });
  }

  // No quiz yet — need date/totalQuestions/marksPerQuestion to create one
  if (!date || !totalQuestions || !marksPerQuestion) {
    return next(
      new ErrorHandler("Date, total questions and marks per question are required to create a new quiz", 400)
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

  const quiz = await Quiz.create({
    title: title || `Quiz ${quizNumber}`,
    quizNumber,
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

  const populated = await Quiz.findById(quiz._id).populate(populateOptions);

  res.status(201).json({
    success: true,
    message: "New quiz created.",
    isNew: true,
    quiz: populated,
  });
});

// ============================================================
// GET (list) => /api/v1/teacher/quizzes
// ============================================================
export const getQuizzes = catchAsyncErrors(async (req, res, next) => {
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

  const total = await Quiz.countDocuments(baseConditions);

  const quizzes = await Quiz.find(baseConditions)
    .populate(populateOptions)
    .sort({ date: -1 })
    .skip((page - 1) * resPerPage)
    .limit(resPerPage);

  res.status(200).json({
    success: true,
    quizzes,
    pagination: {
      total,
      page,
      limit: resPerPage,
      totalPages: Math.ceil(total / resPerPage),
    },
  });
});

// ============================================================
// GET single => /api/v1/quizzes/:id
// ============================================================
export const getQuizDetails = catchAsyncErrors(async (req, res, next) => {
  const quiz = await Quiz.findById(req.params.id).populate(populateOptions);
  if (!quiz) return next(new ErrorHandler("Quiz not found", 404));
  res.status(200).json({ success: true, quiz });
});

// ============================================================
// PUT => /api/v1/teacher/quiz/:id
// Updates marks (and optionally title/date). totalQuestions and
// marksPerQuestion are intentionally NOT editable here — changing them
// after students already have answers would silently corrupt existing
// data, so a quiz's structure is fixed at creation time.
// ============================================================
export const updateQuizMarks = catchAsyncErrors(async (req, res, next) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) return next(new ErrorHandler("Quiz not found", 404));

  const { marks, title, date } = req.body;

  if (marks) quiz.marks = marks;
  if (title) quiz.title = title;
  if (date) quiz.date = date;

  await quiz.save();

  const populated = await Quiz.findById(quiz._id).populate(populateOptions);

  res.status(200).json({
    success: true,
    message: "Quiz marks updated successfully",
    quiz: populated,
  });
});

// ============================================================
// DELETE => /api/v1/teacher/quiz/:id
// ============================================================
export const deleteQuiz = catchAsyncErrors(async (req, res, next) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) return next(new ErrorHandler("Quiz not found", 404));

  await Quiz.findByIdAndDelete(req.params.id);

  res.status(200).json({ success: true, message: "Quiz deleted successfully" });
});