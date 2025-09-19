import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Course from "../models/course.js";
import ErrorHandler from "../utils/errorHandler.js";
import Grade from "../models/grade.js";
import Teacher from "../models/user.js";
import APIFilters from "../utils/apiFilters.js";
import mongoose from "mongoose";

//CRUD operations for courses

// Create new course => /api/v1/courses
export const newCourse = catchAsyncErrors(async (req, res, next) => {
  const { campus } = req.cookies
  const { selectedYear } = req.cookies;

  const { courseName, description, code, teacher ,year} = req.body;
  let teacherDetail

  if(teacher){
    teacherDetail = await Teacher.findById(teacher)
    if (!teacherDetail) {
      return next(new ErrorHandler("Teacher not found", 404));
    }
  }
  const teacherId = teacher === "" ? null : teacher;
  const course = await Course.create({
    courseName,
    description,
    code,
    teacher: teacherId,
    campus,
    year:selectedYear,
  });

  res.status(200).json({
    course,
  });
});

//Create get all course => /api/v1/courses
export const getCourses = catchAsyncErrors(async (req, res, next) => {
  const { campus, selectedYear } = req.cookies;

  // Inject filters from cookies into query
  req.query.campus = campus;
  if (selectedYear) {
    req.query.year = selectedYear; // or 'session', depending on your schema
  }

  const resPerPage = 8;

  const apiFilters = new APIFilters(Course, req.query)
    .search()
    .filters()
    .populate("campus");

  let courses = await apiFilters.query.populate("teacher", "name email");
  const filteredCoursesCount = courses.length;

  apiFilters.pagination(resPerPage);
  courses = await apiFilters.query.clone().populate("teacher", "name email");

  res.status(200).json({
    success: true,
    resPerPage,
    filteredCoursesCount,
    courses,
  });
});



// Update course => /api/v1/courses/:id
export const updateCourse = catchAsyncErrors(async (req, res, next) => {
  let course = await Course.findById(req?.params?.id);

  const { campus } = req.cookies;
  const { selectedYear } = req.cookies;

  if (!course) {
    return next(new ErrorHandler("Course not found", 404));
  }

  const { courseName, description, code, teacher } = req.body;

  const teacherId = teacher === "" ? null : teacher;
  let selectedCampus;
  let teacherDetail;

  if(teacher){
    teacherDetail = await Teacher.findById(teacher);
    if (!teacherDetail) {
      return next(new ErrorHandler("Teacher not found", 404));
    }
    selectedCampus = teacherDetail.campus;
  }
  else{
    selectedCampus = campus;
  }

  // Update course with campus and year from cookies
  course = await Course.findByIdAndUpdate(
    req?.params?.id,
    { 
      courseName, 
      description, 
      code, 
      teacher: teacherId,
      campus: selectedCampus, // Use campus from cookie or teacher
      year: selectedYear // Use year from cookie
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    course,
  });
});

// Delete course => /api/v1/courses/:id
export const deleteCourse = catchAsyncErrors(async (req, res, next) => {
  const course = await Course.findById(req?.params?.id);
  if (!course) {
    return next(new ErrorHandler("Course not found", 404));
  }
  await Course.findOneAndDelete({ _id: req?.params?.id });
  res.status(200).json({
    message: "Course deleted successfully",
  });
});

// extra controller for course

// Get single course details => /api/v1/courses/:id
export const getCourseDetails = catchAsyncErrors(async (req, res) => {
  const course = await Course.findById(req?.params?.id);

  if (!course) {
    return next(new ErrorHandler("Course not found", 404));
  }

  res.status(200).json({
    course,
  });
});

// Get all courses for a grade of teacher => /api/v1/courses/grade/teacher/:id
export const getCoursesByGradeAndTeacherID = catchAsyncErrors(async (req, res) => {
  const { campus ,year} = req.cookies
  const { gradeId, teacherId , userRole} = req.body; 
 
  // Step 1: Find the grade
  const grade = await Grade.findOne({_id: new mongoose.Types.ObjectId(gradeId), campus:new mongoose.Types.ObjectId(campus)}).populate("courses"); // Populate courses array from Grade

  if (!grade) {
    return res.status(404).json({
      success: false,
      message: "Grade not found",
    });
  }

  // Step 2: Filter courses by teacherId
  const courses = userRole === 'teacher' ? grade.courses.filter((course) => {
    return course.teacher && course.teacher.toString() === teacherId;
  }):grade.courses;

  if (courses.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No courses found for the given grade and teacher",
    });
  }

  // Step 3: Send response
  res.status(200).json({
    success: true,
    courses,
  });
});
