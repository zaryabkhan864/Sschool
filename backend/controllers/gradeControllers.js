import Grade from "../models/grade.js";
import Course from "../models/course.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import APIFilters from "../utils/apiFilters.js";

//CRUD operations for grades

// Create new grade => /api/v1/grades
export const createGrade = catchAsyncErrors(async (req, res) => {
  const grade = await Grade.create(req.body);

  res.status(200).json({
    grade,
    message: "Grade Created successfully",
  });
});
//Create get all grades => /api/v1/grades
export const getGrades = catchAsyncErrors(async (req, res, next) => {
  const resPerPage = 8;
  const apiFilters = new APIFilters(Grade, req.query).search().filters();

  let grades = await apiFilters.query;
  let filteredGradesCount = grades.length;

  apiFilters.pagination(resPerPage);

  grades = await apiFilters.query.clone();

  res.status(200).json({
    success: true,
    resPerPage,
    filteredGradesCount,
    grades,
  });
});
// Update grade => /api/v1/grades/:id
export const updateGrade = catchAsyncErrors(async (req, res, next) => {
  let grade = await Grade.findById(req?.params?.id);

  //check if there is any grade with req id
  if (!grade) {
    return next(new ErrorHandler("Grade not found", 404));
  }

  grade = await Grade.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json({
    grade,
    message: "Grade Updated successfully",
  });
});
// Delete grade => /api/v1/grades/:id
export const deleteGrade = catchAsyncErrors(async (req, res, next) => {
  const grade = await Grade.findById(req?.params?.id);
  //check if there is any grade with req id
  if (!grade) {
    return next(new ErrorHandler("Grade not found", 404));
  }
  //check if there are any courses associated with this grade
  if (grade.courses.length > 0) {
    return next(
      new ErrorHandler("Can not delete Grade ,Delete courses inside grade", 400)
    );
  } else {
    await grade.deleteOne();

    res.status(200).json({
      message: "Grade deleted successfully",
    });
  }

  //if no courses are associated, delete the grade
});

// extra controller for Grade
// Get single grade details => /api/v1/grades/:id
export const getGradeDetails = catchAsyncErrors(async (req, res) => {
  const grade = await Grade.findById(req?.params?.id);
  if (!grade) {
    return next(new ErrorHandler("Grade not found", 404));
  }
  res.status(200).json({
    grade,
  });
});

// add course to grade
export const addCourseInGrade = catchAsyncErrors(async (req, res, next) => {
  const { gradeId, courseId } = req.body;
  const grade = await Grade.findById(gradeId);
  if (!grade) {
    return next(new ErrorHandler("Grade not found", 404));
  }
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new ErrorHandler("Course not found", 404));
  }

  const isDuplicate = grade.courses.includes(courseId);
  if (isDuplicate) {
    return next(new ErrorHandler("Course already added to grade", 404));
  }
  grade.courses.push(courseId);
  await grade.save();
  res.status(200).json({ message: "Course added to grade" });
});

//remove course from grade
export const deleteCourseInGrade = catchAsyncErrors(async (req, res, next) => {
  const { gradeId, courseId } = req.body;
  const grade = await Grade.findById(gradeId);
  if (!grade) {
    return next(new ErrorHandler("Grade not found", 404));
  }
  const courseIndex = grade.courses.indexOf(courseId);
  if (courseIndex === -1) {
    return next(new ErrorHandler("Course is not found in Grades Courses", 404));
  }

  grade.courses = grade.courses.filter(
    (course) => course.toString() !== courseId
  );
  await grade.save();

  res.status(200).json({ message: "Course removed from grade" });
});

//
