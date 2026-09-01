// controllers/homeworkAssignmentController.js
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import HomeworkAssignment from "../models/homeworkAssignment.js";
import HomeworkSubmission from "../models/homeworkSubmission.js";
import ClassGroup from "../models/classGroup.js";
import Course from "../models/course.js";
import StudentEnrollment from "../models/studentEnrollment.js";
import APIFilters from "../utils/apiFilters.js";
import ErrorHandler from "../utils/errorHandler.js";

// Helper: campus + academicYear from query params or cookies (same pattern
// used across academicLevel / course controllers)
const getContext = (req) => {
  const academicYear = req.query.academicYear || req.cookies.academicYear;
  const campus = req.query.campus || req.cookies.campus;
  return { academicYear, campus };
};

const populateOptions = [
  {
    path: "classGroup",
    select: "displayName section grade academicLevel",
    populate: { path: "academicLevel", select: "name" },
  },
  { path: "course", select: "courseName code" },
  { path: "teacher", select: "firstName middleName lastName email" },
  { path: "campus", select: "name" },
  { path: "academicYear", select: "name" },
  { path: "targetStudents", select: "firstName middleName lastName userId" },
];

// ============================================================
// CREATE => /api/v1/teacher/homework-assignments
// Teacher posts a homework/assignment to a class group + course
// ============================================================
export const newHomeworkAssignment = catchAsyncErrors(async (req, res, next) => {
  const { academicYear, campus } = getContext(req);

  if (!academicYear) {
    return next(new ErrorHandler("Academic Year not selected", 400));
  }
  if (!campus) {
    return next(new ErrorHandler("Campus not selected", 400));
  }

  const {
    type,
    title,
    description,
    classGroup,
    course,
    targetType,
    targetStudents,
    dueDate,
    totalMarks,
    attachments,
  } = req.body;

  if (!classGroup || !course) {
    return next(new ErrorHandler("Class group and course are required", 400));
  }

  // Make sure the class group actually belongs to this campus
  const classGroupDoc = await ClassGroup.findOne({ _id: classGroup, campus });
  if (!classGroupDoc) {
    return next(new ErrorHandler("Class group not found for this campus", 404));
  }

  // req.user is expected to be set by the auth middleware (isAuthenticatedUser)
  const teacher = req.user?._id || req.body.teacher;
  if (!teacher) {
    return next(new ErrorHandler("Teacher could not be resolved for this posting", 400));
  }

  const homework = await HomeworkAssignment.create({
    type,
    title,
    description,
    classGroup,
    course,
    teacher,
    campus,
    academicYear,
    targetType: targetType || "all",
    targetStudents: targetType === "individual" ? targetStudents : [],
    dueDate,
    totalMarks: totalMarks ?? null,
    attachments: attachments || [],
  });

  const populated = await HomeworkAssignment.findById(homework._id).populate(populateOptions);

  res.status(201).json({ success: true, homework: populated });
});

// ============================================================
// GET (teacher-facing list) => /api/v1/teacher/homework-assignments
// Filters: classGroup, course, type, status, keyword; campus + academicYear scoped
// ============================================================
export const getHomeworkAssignments = catchAsyncErrors(async (req, res, next) => {
  const { academicYear, campus } = getContext(req);

  if (!academicYear) {
    return next(new ErrorHandler("Academic Year not selected", 400));
  }
  if (!campus) {
    return next(new ErrorHandler("Campus not selected", 400));
  }

  const { classGroup, course, type, status, teacher, keyword } = req.query;

  const baseConditions = { campus, academicYear };
  if (classGroup) baseConditions.classGroup = classGroup;
  if (course) baseConditions.course = course;
  if (type) baseConditions.type = type;
  if (teacher) baseConditions.teacher = teacher;
  if (status === "active") baseConditions.status = true;
  else if (status === "deactive") baseConditions.status = false;
  if (keyword && keyword.trim()) {
    baseConditions.title = { $regex: keyword.trim(), $options: "i" };
  }

  // No pagination — dropdown/full list use
  if (req.query.paginate === "false") {
    const homeworks = await HomeworkAssignment.find(baseConditions)
      .populate(populateOptions)
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, homeworks });
  }

  const resPerPage = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  const total = await HomeworkAssignment.countDocuments(baseConditions);
  const active = await HomeworkAssignment.countDocuments({ ...baseConditions, status: true });
  const deactive = await HomeworkAssignment.countDocuments({ ...baseConditions, status: false });

  const homeworks = await HomeworkAssignment.find(baseConditions)
    .populate(populateOptions)
    .sort({ createdAt: -1 })
    .skip((page - 1) * resPerPage)
    .limit(resPerPage);

  res.status(200).json({
    success: true,
    homeworks,
    pagination: {
      total,
      page,
      limit: resPerPage,
      totalPages: Math.ceil(total / resPerPage),
      counts: { total, active, deactive },
    },
  });
});

// ============================================================
// GET single => /api/v1/homework-assignments/:id
// ============================================================
export const getHomeworkAssignmentDetails = catchAsyncErrors(async (req, res, next) => {
  const { campus } = getContext(req);

  if (!campus) {
    return next(new ErrorHandler("Campus not selected", 400));
  }

  const homework = await HomeworkAssignment.findOne({ _id: req.params.id, campus }).populate(
    populateOptions
  );

  if (!homework) {
    return next(new ErrorHandler("Homework/Assignment not found", 404));
  }

  res.status(200).json({ success: true, homework });
});

// ============================================================
// UPDATE => /api/v1/teacher/homework-assignments/:id
// ============================================================
export const updateHomeworkAssignment = catchAsyncErrors(async (req, res, next) => {
  const { campus } = getContext(req);

  if (!campus) {
    return next(new ErrorHandler("Campus not selected", 400));
  }

  const existing = await HomeworkAssignment.findOne({ _id: req.params.id, campus });
  if (!existing) {
    return next(new ErrorHandler("Homework/Assignment not found", 404));
  }

  // keep targetStudents consistent with targetType on update too
  if (req.body.targetType === "all") {
    req.body.targetStudents = [];
  }

  const homework = await HomeworkAssignment.findOneAndUpdate(
    { _id: req.params.id, campus },
    req.body,
    { new: true, runValidators: true }
  ).populate(populateOptions);

  res.status(200).json({ success: true, homework });
});

// ============================================================
// DELETE => /api/v1/teacher/homework-assignments/:id
// Also removes any student submissions tied to it
// ============================================================
export const deleteHomeworkAssignment = catchAsyncErrors(async (req, res, next) => {
  const { campus } = getContext(req);

  if (!campus) {
    return next(new ErrorHandler("Campus not selected", 400));
  }

  const homework = await HomeworkAssignment.findOne({ _id: req.params.id, campus });
  if (!homework) {
    return next(new ErrorHandler("Homework/Assignment not found", 404));
  }

  await HomeworkSubmission.deleteMany({ homeworkAssignment: homework._id });
  await HomeworkAssignment.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Homework/Assignment deleted successfully",
  });
});

// ============================================================
// GET => /api/v1/teacher/homework-meta
// Teacher's own class groups + courses, for the "New Homework" form
// dropdowns. Self-contained (doesn't depend on the existing
// /courses/by-role endpoint), scoped via req.user + cookies.
// Mirrors ClassGroup's convention of using the `academicYearName`
// cookie (year is stored as a String on ClassGroup) alongside the
// `academicYear` ObjectId cookie used by Course.
// ============================================================
export const getTeacherClassGroupsAndCourses = catchAsyncErrors(async (req, res, next) => {
  const { campus, academicYear, academicYearName } = req.cookies;

  if (!campus) {
    return next(new ErrorHandler("Campus not selected", 400));
  }

  const teacherId = req.user?._id;
  if (!teacherId) {
    return next(new ErrorHandler("Teacher could not be resolved", 400));
  }

  const courses = await Course.find({
    teacher: teacherId,
    campus,
    ...(academicYear && { academicYear }),
  });

  const classGroups = await ClassGroup.find({
    campus,
    ...(academicYearName && { year: academicYearName }),
    courses: { $in: courses.map((c) => c._id) },
  }).populate("courses");

  res.status(200).json({ success: true, courses, classGroups });
});

// ============================================================
// GET (student-facing list) => /api/v1/student/homework-assignments
// Resolves the student's active class group via StudentEnrollment,
// then returns postings targeted at "all" or at that student individually.
// ============================================================
export const getHomeworkForStudent = catchAsyncErrors(async (req, res, next) => {
  const { academicYear, campus } = getContext(req);

  if (!academicYear) {
    return next(new ErrorHandler("Academic Year not selected", 400));
  }
  if (!campus) {
    return next(new ErrorHandler("Campus not selected", 400));
  }

  // req.user expected from auth middleware; allow explicit studentId override
  // for teacher/admin previewing a specific student's view
  const studentId = req.query.studentId || req.user?._id;
  if (!studentId) {
    return next(new ErrorHandler("Student could not be resolved", 400));
  }

  const enrollment = await StudentEnrollment.findOne({
    student: studentId,
    status: "active",
  });

  if (!enrollment) {
    return next(new ErrorHandler("No active enrollment found for this student", 404));
  }

  const { classGroup, type, status } = req.query;
  const targetClassGroup = classGroup || enrollment.classGroup;

  const baseConditions = {
    campus,
    academicYear,
    classGroup: targetClassGroup,
    $or: [{ targetType: "all" }, { targetType: "individual", targetStudents: studentId }],
  };
  if (type) baseConditions.type = type;
  if (status === "active") baseConditions.status = true;
  else if (status === "deactive") baseConditions.status = false;
  else baseConditions.status = true; // students only see active postings by default

  const homeworks = await HomeworkAssignment.find(baseConditions)
    .populate(populateOptions)
    .sort({ dueDate: 1 });

  // attach this student's own submission (if any) for each posting
  const submissions = await HomeworkSubmission.find({
    homeworkAssignment: { $in: homeworks.map((h) => h._id) },
    student: studentId,
  });
  const submissionMap = new Map(submissions.map((s) => [s.homeworkAssignment.toString(), s]));

  const homeworksWithSubmission = homeworks.map((h) => ({
    ...h.toObject(),
    mySubmission: submissionMap.get(h._id.toString()) || null,
  }));

  res.status(200).json({
    success: true,
    classGroup: targetClassGroup,
    homeworks: homeworksWithSubmission,
    total: homeworksWithSubmission.length,
  });
});
