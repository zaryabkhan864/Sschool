import Course from "../models/Course.js";
import Grade from "../models/grade.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
//CRUD operations for courses

// Create new course => /api/v1/courses
export const newCourse = catchAsyncErrors(async (req, res, next) => {
  try {
    const course = await Course.create(req.body);

    res.status(200).json({
      course,
    });
  } catch (error) {
    next(new ErrorHandler(error.message || "Failed to create course", 500));
  }
});
//Create get all course => /api/v1/courses
export const getCourses = catchAsyncErrors(async (req, res, next) => {
  const resPerPage = 8;
  const apiFilters = new APIFilters(Course, req.query).search().filters();
  try {
    let courses = await apiFilters.query;
    let filteredCoursesCount = courses.length;
    apiFilters.pagination(resPerPage);
    courses = await apiFilters.query.clone();
    res.status(200).json({
      resPerPage,
      filteredCoursesCount,
      courses,
    });
  } catch (error) {
    next(new ErrorHandler(error.message || "Failed to fetch courses", 500));
  }
});


// Update course => /api/v1/courses/:id
export const updateCourse = catchAsyncErrors(async (req, res, next) => {
  try {
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
  } catch (error) {
    next(new ErrorHandler(error.message || "Failed to update course", 500));
  }
});
// Delete course => /api/v1/courses/:id
export const deleteCourse = catchAsyncErrors(async (req, res, next) => {
  try {
    //check if there are any grades associated with this course
    const associatedGrades = await Grade.find({ courseId: req?.params?.id });
    if (associatedGrades.length > 0) {
      return next(
        new ErrorHandler(
          "Can not delete Course , it is associated with grades",
          400
        )
      );
    }
    //if no grades are associated , delete the course
    const course = await Course.findById(req?.params?.id);
    if (!course) {
      return next(new ErrorHandler("Course not found", 404));
    }
    await course.deleteOne();
    res.status(200).json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    next(new ErrorHandler(error.message || "Failed to delete course", 500));
  }
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

})

