import Course from "../models/course.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";

import APIFilters from "../utils/apiFilters.js";

//CRUD operations for courses

// Create new course => /api/v1/courses
export const newCourse = catchAsyncErrors(async (req, res, next) => {
  const course = await Course.create(req.body);

  res.status(200).json({
    course,
  });
});

//Create get all course => /api/v1/courses
export const getCourses = catchAsyncErrors(async (req, res, next) => {
  const resPerPage = 8;
  const apiFilters = new APIFilters(Course, req.query).search().filters();

  let courses = await apiFilters.query;
  const filteredCoursesCount = courses.length;

  apiFilters.pagination(resPerPage);
  courses = await apiFilters.query.clone();

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

  if (!course) {
    return next(new ErrorHandler("Course not found", 404));
  }

  course = await Course.findByIdAndUpdate(req?.params?.id, req.body, {
    new: true,
  });

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

// add created course to its teacher
const addCourseInTeacher = async (req, res) => {
  const { teacherId, courseId } = req.body;
  const teacher = await Teacher.findById(teacherId);
  const course = await Course.findById(courseId);

  teacher.assignedCourses.push(courseId);
  await teacher.save();
  res.status(200).json({ message: "Course added to teacher" });
};

const deleteCourseInTeacher = async (req, res) => {
  const { teacherId, courseId } = req.body;
  const teacher = await Teacher.findById(teacherId);

  teacher.assignedCourses = teacher.assignedCourses.filter(
    (course) => course.toString() !== courseId
  );
  await teacher.save();

  res.status(200).json({ message: "Course removed from teacher" });
};
const addCourseInGrade = async (req, res) => {
  const { gradeId, courseId } = req.body;
  const grade = await Grade.findById(gradeId);
  const course = await Course.findById(courseId);

  grade.courses.push(courseId);
  await grade.save();
  res.status(200).json({ message: "Course added to teacher" });
};
const deleteCourseInGrade = async (req, res) => {
  const { gradeId, courseId } = req.body;
  const grade = await Grade.findById(gradeId);

  grade.courses = grade.courses.filter(
    (course) => course.toString() !== courseId
  );
  await grade.save();

  res.status(200).json({ message: "Course removed from grade" });
};
