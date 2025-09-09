import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Course from "../models/course.js";
import Grade from "../models/grade.js";
import user from "../models/user.js";
import APIFilters from "../utils/apiFilters.js";
import ErrorHandler from "../utils/errorHandler.js";

//CRUD operations for grades

// Create new grade => /api/v1/grades
export const newGrade = catchAsyncErrors(async (req, res) => {
  const { campus } = req.cookies;
  const { selectedYear } = req.cookies;

  const grade = await Grade.create({
    ...req.body, 
    campus, // Campus from cookie
    year: selectedYear // Year from cookie
  });

  res.status(200).json({
    grade,
  });
});

//Create get all grades => /api/v1/grades
export const getGrades = catchAsyncErrors(async (req, res, next) => {
  const { campus, selectedYear } = req.cookies;

  // Inject campus and year into query filters
  req.query.campus = campus;
  if (selectedYear) {
    req.query.year = selectedYear; // Or 'session' depending on your schema
  }

  const apiFilters = new APIFilters(Grade, req.query)
    .search()
    .filters();

  let grades = await apiFilters.query;
  let filteredGradesCount = grades.length;

  res.status(200).json({
    success: true,
    filteredGradesCount,
    grades,
  });
});

// Update grade => /api/v1/grades/:id
export const updateGrade = catchAsyncErrors(async (req, res, next) => {
  const { campus, selectedYear } = req.cookies;
  
  let grade = await Grade.findById(req?.params?.id);

  // Check if there is any grade with req id
  if (!grade) {
    return next(new ErrorHandler("Grade not found", 404));
  }

  // Update with campus and year from cookies
  const updateData = {
    ...req.body,
    campus: campus, // Campus from cookie
    year: selectedYear // Year from cookie
  };

  grade = await Grade.findByIdAndUpdate(req.params.id, updateData, {
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
  // if (grade.courses.length > 0) {
  //   return next(
  //     new ErrorHandler("Can not delete Grade ,Delete courses inside grade", 400)
  //   );
  // } else {

  await grade.deleteOne();

  res.status(200).json({
    message: "Grade deleted successfully",
  });
  // }

  //if no courses are associated, delete the grade
});

// extra controller for Grade
// Get single grade details => /api/v1/grades/:id
export const getGradeDetails = catchAsyncErrors(async (req, res) => {
  const grade = await Grade.findById(req?.params?.id).populate("courses");
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

export const getCoursesAndGradeByRole = catchAsyncErrors(async (req, res, next) => {
  const { userId, userRole } = req.body;

  if (!userId || !userRole) {
    return next(new ErrorHandler("User ID and role are required", 400));
  }

  let courses, grades;

  if (userRole === "admin") {
    // Fetch all courses and grades for admin
    courses = await Course.find().populate("teacher");
    grades = await Grade.find().populate("courses");
  } else if (userRole === "teacher") {
    const teacher = await user.findById(userId);

    if (!teacher) {
      return next(new ErrorHandler("Teacher not found", 404));
    }

    // Fetch courses and grades associated with the teacher
    courses = await Course.find({ teacher: teacher._id }).populate("teacher");
    grades = await Grade.find({ courses: { $in: courses.map(c => c._id) } }).populate("courses");
  } else {
    return next(new ErrorHandler("Access denied for the provided role", 403));
  }

  res.status(200).json({
    success: true,
    courses,
    grades,
  });
});
