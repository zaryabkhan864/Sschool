import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Course from "../models/course.js";
import ErrorHandler from "../utils/errorHandler.js";
import Grade from "../models/grade.js";
import Teacher from "../models/user.js";
import APIFilters from "../utils/apiFilters.js";
import mongoose from "mongoose";

// ============================================================
// CREATE new course  →  /api/v1/courses
// ============================================================
export const newCourse = catchAsyncErrors(async (req, res, next) => {
  const { campus } = req.cookies;
  const { selectedYear } = req.cookies;

  const { courseName, description, code, teacher, grade } = req.body;

  // Validate teacher if provided
  let teacherDetail;
  if (teacher) {
    teacherDetail = await Teacher.findById(teacher);
    if (!teacherDetail) {
      return next(new ErrorHandler("Teacher not found", 404));
    }
  }
  const teacherId = teacher === "" ? null : teacher;

  // Validate grade (required)
  if (!grade) {
    return next(new ErrorHandler("Please select a grade for the course", 400));
  }
  const gradeDoc = await Grade.findById(grade);
  if (!gradeDoc) {
    return next(new ErrorHandler("Grade not found", 404));
  }

  // Create course
  const course = await Course.create({
    courseName,
    description,
    code,
    teacher: teacherId,
    grade,
    campus,
    year: selectedYear,
  });

  // Add course to grade.courses array
  if (!gradeDoc.courses) gradeDoc.courses = [];
  gradeDoc.courses.push(course._id);
  await gradeDoc.save();

  res.status(200).json({ course });
});

// ============================================================
// GET all courses (with filters, pagination, counts)
// ============================================================
export const getCourses = catchAsyncErrors(async (req, res, next) => {
  const { campus, selectedYear } = req.cookies;
  const limit = Number(req.query.limit);
  const isDropdownRequest = limit === 0;

  // campus & year filter (skip for dropdown)
  if (campus && !isDropdownRequest) req.query.campus = campus;
  if (selectedYear && !isDropdownRequest) req.query.year = selectedYear;

  // status filter handling
  if (req.query.status) {
    req.query.status = req.query.status === "active" ? true : false;
  }

  // Base query for counting
  const baseApiFilters = new APIFilters(Course, req.query)
    .setSearchFields(["courseName", "code", "description"])
    .search()
    .filters()
    .sort();
  const baseQuery = baseApiFilters.query;
  const total = await baseApiFilters.model.countDocuments(baseQuery._conditions);

  // Active/Deactive counts
  let active = 0, deactive = 0;
  try {
    active = await Course.countDocuments({ ...baseQuery._conditions, status: true });
    deactive = await Course.countDocuments({ ...baseQuery._conditions, status: false });
  } catch (error) {
    active = total;
    deactive = 0;
  }

  // Query for actual data with pagination
  const apiFilters = new APIFilters(Course, req.query)
    .setSearchFields(["courseName", "code", "description"])
    .search()
    .filters()
    .sort()
    .pagination();

  // ✅ Populate grade with correct field names
  const populateOptions = [
    "campus",
    { path: "grade", select: "gradeName level" } // 👈 FIXED: 'gradeName' instead of 'name'
  ];

  // Teacher population
  if (req.query.teacher || (req.query.keyword && req.query.keyword.includes("teacher"))) {
    populateOptions.push({
      path: "teacher",
      select: "name email phone department",
      populate: { path: "campus", select: "name" },
    });
  } else {
    populateOptions.push({ path: "teacher", select: "name email" });
  }

  // Students population (optional)
  if (req.query.populateStudents === "true") {
    populateOptions.push({
      path: "students",
      select: "name email rollNumber grade",
      populate: { path: "grade.gradeId", select: "gradeName" },
    });
  }

  apiFilters.populate(populateOptions);
  let courses = await apiFilters.query;

  // Additional filtering by keyword (teacher name etc.)
  let finalCourses = courses;
  if (req.query.keyword && req.query.keyword.trim()) {
    const keyword = req.query.keyword.trim().toLowerCase();
    finalCourses = courses.filter((course) => {
      const courseMatches =
        course.courseName?.toLowerCase().includes(keyword) ||
        course.code?.toLowerCase().includes(keyword) ||
        course.description?.toLowerCase().includes(keyword);
      const teacherMatches = course.teacher && (
        course.teacher.name?.toLowerCase().includes(keyword) ||
        course.teacher.email?.toLowerCase().includes(keyword)
      );
      return courseMatches || teacherMatches;
    });

    if (!apiFilters.shouldPaginate) {
      const filteredActive = finalCourses.filter((c) => c.status !== false).length;
      const filteredDeactive = finalCourses.filter((c) => c.status === false).length;
      active = filteredActive;
      deactive = filteredDeactive;
      total = finalCourses.length;
    }
  }

  // Pagination meta
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
    courses: finalCourses,
  });
});

// ============================================================
// UPDATE course  →  /api/v1/courses/:id
// ============================================================
export const updateCourse = catchAsyncErrors(async (req, res, next) => {
  let course = await Course.findById(req.params.id);
  if (!course) {
    return next(new ErrorHandler("Course not found", 404));
  }

  const { campus, selectedYear } = req.cookies;
  const { courseName, description, code, teacher, grade } = req.body;

  // Teacher handling
  const teacherId = teacher === "" ? null : teacher;
  let selectedCampus;
  let teacherDetail;
  if (teacher) {
    teacherDetail = await Teacher.findById(teacher);
    if (!teacherDetail) {
      return next(new ErrorHandler("Teacher not found", 404));
    }
    selectedCampus = teacherDetail.campus;
  } else {
    selectedCampus = campus;
  }

  // ✅ Grade handling – agar grade change hui hai to references update karo
  const oldGradeId = course.grade;
  if (grade && grade !== oldGradeId?.toString()) {
    // Validate new grade
    const newGrade = await Grade.findById(grade);
    if (!newGrade) {
      return next(new ErrorHandler("Grade not found", 404));
    }

    // Remove course from old grade's courses array
    if (oldGradeId) {
      const oldGrade = await Grade.findById(oldGradeId);
      if (oldGrade && oldGrade.courses) {
        oldGrade.courses = oldGrade.courses.filter(
          (cId) => cId.toString() !== course._id.toString()
        );
        await oldGrade.save();
      }
    }

    // Add course to new grade's courses array
    if (!newGrade.courses) newGrade.courses = [];
    if (!newGrade.courses.includes(course._id)) {
      newGrade.courses.push(course._id);
      await newGrade.save();
    }
  }

  // Update course document – grade field explicitly set karo
  course = await Course.findByIdAndUpdate(
    req.params.id,
    {
      courseName,
      description,
      code,
      teacher: teacherId,
      grade: grade || course.grade,  // agar grade nahi bheji to purani rahe
      campus: selectedCampus,
      year: selectedYear,
    },
    { new: true }
  );

  res.status(200).json({ course });
});

// ============================================================
// DELETE course  →  /api/v1/courses/:id
// ============================================================
export const deleteCourse = catchAsyncErrors(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(new ErrorHandler("Course not found", 404));
  }

  // Remove course reference from associated grade
  if (course.grade) {
    const grade = await Grade.findById(course.grade);
    if (grade && grade.courses) {
      grade.courses = grade.courses.filter(
        (cId) => cId.toString() !== course._id.toString()
      );
      await grade.save();
    }
  }

  await Course.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "Course deleted successfully" });
});

// ============================================================
// GET single course details  →  /api/v1/courses/:id
// ============================================================
export const getCourseDetails = catchAsyncErrors(async (req, res, next) => {
  const course = await Course.findById(req.params.id)
    .populate("campus")
    .populate("grade", "gradeName level") // 👈 FIXED: 'gradeName' select karo
    .populate("teacher", "name email");

  if (!course) {
    return next(new ErrorHandler("Course not found", 404));
  }

  res.status(200).json({ course });
});

// ============================================================
// GET courses by grade & teacher (teacher dashboard)
// ============================================================
export const getCoursesByGradeAndTeacherID = catchAsyncErrors(async (req, res) => {
  const { campus, year } = req.cookies;
  const { gradeId, teacherId, userRole } = req.body;

  const grade = await Grade.findOne({
    _id: new mongoose.Types.ObjectId(gradeId),
    campus: new mongoose.Types.ObjectId(campus),
  }).populate("courses");

  if (!grade) {
    return res.status(404).json({
      success: false,
      message: "Grade not found",
    });
  }

  const courses =
    userRole === "teacher"
      ? grade.courses.filter(
          (course) => course.teacher && course.teacher.toString() === teacherId
        )
      : grade.courses;

  if (courses.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No courses found for the given grade and teacher",
    });
  }

  res.status(200).json({
    success: true,
    courses,
  });
});