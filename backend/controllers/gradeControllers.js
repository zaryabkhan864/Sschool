import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Grade from "../models/grade.js";
import AcademicLevel from "../models/academicLevel.js";
import ClassGroup from "../models/classGroup.js";
import Course from "../models/course.js";
import StudentEnrollment from "../models/studentEnrollment.js";
import ErrorHandler from "../utils/errorHandler.js";
import APIFilters from "../utils/apiFilters.js";

// ============================================================
// Create a new grade
// ============================================================
export const newGrade = catchAsyncErrors(async (req, res, next) => {
  const { campus, academicYear } = req.cookies;
  const { gradeName, academicLevel, description } = req.body;

  if (academicLevel) {
    const level = await AcademicLevel.findById(academicLevel);
    if (!level) {
      return next(new ErrorHandler("Academic Level not found", 404));
    }
  }

  const grade = await Grade.create({
    gradeName,
    academicLevel,
    description,
    campus,
    academicYear,
    status: true,
  });

  res.status(201).json({ success: true, grade });
});

// ============================================================
// GET all grades
// ============================================================
export const getGrades = catchAsyncErrors(async (req, res, next) => {
  const { campus, academicYear } = req.cookies;
  const limit = Number(req.query.limit);
  const isDropdownRequest = limit === 0;

  if (campus && !isDropdownRequest) req.query.campus = campus;
  if (academicYear && !isDropdownRequest) req.query.academicYear = academicYear;

  if (req.query.status) {
    req.query.status = req.query.status === "active" ? true : false;
  }

  const baseApiFilters = new APIFilters(Grade, req.query)
    .setSearchFields(["gradeName", "description"])
    .search()
    .filters()
    .sort();
  const baseQuery = baseApiFilters.query;
  const total = await baseApiFilters.model.countDocuments(baseQuery._conditions);

  let active = 0, deactive = 0;
  try {
    active = await Grade.countDocuments({ ...baseQuery._conditions, status: true });
    deactive = await Grade.countDocuments({ ...baseQuery._conditions, status: false });
  } catch (error) {
    active = total;
    deactive = 0;
  }

  const apiFilters = new APIFilters(Grade, req.query)
    .setSearchFields(["gradeName", "description"])
    .search()
    .filters()
    .sort()
    .pagination();

  const populateOptions = [
    { path: "academicLevel", select: "name level" },
    { path: "campus", select: "name" },
  ];
  apiFilters.populate(populateOptions);

  let grades = await apiFilters.query;

  let pagination = null;
  if (apiFilters.shouldPaginate) {
    pagination = {
      total,
      page: apiFilters.page,
      limit: apiFilters.limit,
      totalPages: Math.ceil(total / apiFilters.limit),
    };
  }

  res.status(200).json({
    success: true,
    ...(pagination && { pagination: { ...pagination, counts: { total, active, deactive } } }),
    ...(!pagination && { counts: { total, active, deactive } }),
    grades,
  });
});

// ============================================================
// UPDATE grade
// ============================================================
export const updateGrade = catchAsyncErrors(async (req, res, next) => {
  let grade = await Grade.findById(req.params.id);
  if (!grade) {
    return next(new ErrorHandler("Grade not found", 404));
  }

  const { campus, academicYear } = req.cookies;
  const { gradeName, academicLevel, description, status } = req.body;

  if (academicLevel) {
    const level = await AcademicLevel.findById(academicLevel);
    if (!level) {
      return next(new ErrorHandler("Academic Level not found", 404));
    }
  }

  const updateData = {
    gradeName,
    academicLevel,
    description,
    campus,
    academicYear,
    status: status !== undefined ? status : grade.status,
  };

  grade = await Grade.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  }).populate("academicLevel campus");

  res.status(200).json({ success: true, grade });
});

// ============================================================
// DELETE grade
// ============================================================
export const deleteGrade = catchAsyncErrors(async (req, res, next) => {
  const grade = await Grade.findById(req.params.id);
  if (!grade) {
    return next(new ErrorHandler("Grade not found", 404));
  }
  await Grade.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: "Grade deleted successfully" });
});

// ============================================================
// GET single grade details (FIXED – using lean & manual extraction)
// ============================================================
export const getGradeDetails = catchAsyncErrors(async (req, res, next) => {
  // 1. Grade fetch karo with basic population
  let grade = await Grade.findById(req.params.id)
    .populate("academicLevel", "name level")
    .populate("campus", "name")
    .populate("academicYear", "name")
    .lean();   // plain object for safety

  if (!grade) {
    return next(new ErrorHandler("Grade not found", 404));
  }

  // 2. ClassGroups fetch karo (sirf courses field) – NO POPULATE
  const classGroups = await ClassGroup.find({ grade: grade._id })
    .select("courses")
    .lean();

  // 3. Unique course IDs extract karo
  const courseIds = [];
  classGroups.forEach((cg) => {
    if (cg.courses && Array.isArray(cg.courses)) {
      courseIds.push(...cg.courses);
    }
  });

  // Remove duplicates
  const uniqueCourseIds = [...new Set(courseIds.map((id) => id.toString()))];

  // 4. Courses fetch karo with teacher
  const courses = uniqueCourseIds.length > 0
    ? await Course.find({ _id: { $in: uniqueCourseIds } })
        .populate("teacher", "firstName lastName email")
        .lean()
    : [];

  // 5. Class group IDs for student count
  const classGroupIds = classGroups.map((cg) => cg._id);

  const totalStudents = classGroupIds.length > 0
    ? await StudentEnrollment.countDocuments({
        classGroup: { $in: classGroupIds },
        academicYear: grade.academicYear?._id || grade.academicYear,
        status: "active",
      })
    : 0;

  // 6. Unique teachers count
  const teacherIds = new Set();
  courses.forEach((c) => {
    if (c.teacher?._id) teacherIds.add(c.teacher._id.toString());
  });

  const stats = {
    totalCourses: courses.length,
    totalTeachers: teacherIds.size,
    totalStudents,
  };

  // 7. Response assemble karo
  grade.courses = courses;
  grade.stats = stats;

  res.status(200).json({ success: true, grade });
});

// ============================================================
// Get grades by academic level
// ============================================================
export const getGradesByAcademicLevel = catchAsyncErrors(async (req, res, next) => {
  const { campus, academicYear } = req.cookies;
  const { academicLevelId } = req.params;

  if (!academicLevelId) {
    return next(new ErrorHandler("Academic Level ID is required", 400));
  }

  const grades = await Grade.find({
    academicLevel: academicLevelId,
    campus,
    academicYear,
  }).populate("academicLevel", "name level")
    .populate("campus", "name");

  res.status(200).json({ success: true, grades });
});

// ============================================================
// ✅ NAYA: Sirf courses (count + names) – bhi fix kiya
// ============================================================
export const getGradeCourses = catchAsyncErrors(async (req, res, next) => {
  const grade = await Grade.findById(req.params.id).lean();
  if (!grade) {
    return next(new ErrorHandler("Grade not found", 404));
  }

  // ClassGroups se course IDs lo
  const classGroups = await ClassGroup.find({ grade: grade._id })
    .select("courses")
    .lean();

  const courseIds = [];
  classGroups.forEach((cg) => {
    if (cg.courses) courseIds.push(...cg.courses);
  });

  const uniqueCourseIds = [...new Set(courseIds.map((id) => id.toString()))];

  // Courses sirf naam ke saath fetch karo
  const courses = uniqueCourseIds.length > 0
    ? await Course.find({ _id: { $in: uniqueCourseIds } })
        .select("courseName")
        .lean()
    : [];

  res.status(200).json({
    success: true,
    count: courses.length,
    courses,   
  });
});