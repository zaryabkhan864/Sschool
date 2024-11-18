import Course from "../models/Course.js";

import ErrorHandler from "../utils/errorHandler.js";

//CRUD operations for courses

// Create new course => /api/v1/courses
export const newCourse = async (res, req) => {
  req.body.user = req.user._id;

  const course = await Course.create(req.body);

  res.status(200).json({
    course,
  });
};

//Create get all course => /api/v1/courses
export const getCourses = async (req, res) => {
  const courses = await Course.find();
  res.status(200).json({
    // courses,
    message: "courses",
  });
};

// Update course => /api/v1/courses/:id
export const updateCourse = async (req, res) => {
  let course = await Course.findById(req?.params?.id);

  if (!course) {
    return next(new ErrorHandler("Course not found", 404));
  }

  course = await course.findByIdAndUpdate(req?.params?.id, req.body, {
    new: true,
  });

  res.status(200).json({
    course,
  });
};

// Delete course => /api/v1/courses/:id
export const deleteCourse = async (req, res) => {
  const course = await Course.findById(req?.params?.id);
  if (!course) {
    return next(new ErrorHandler("Course not found", 404));
  }
  await course.deleteOne();
  res.status(200).json({
    message: "Course deleted successfully",
  });
};

// extra controller for course

// Get single course details => /api/v1/courses/:id
export const getCourseDetails = async (res, req) => {
  const course = await Course.findById(req?.params?.id);
  if (!course) {
    return next(new ErrorHandler("Course not found", 404));
  }
  res.status(200).json({
    course,
  });
};
