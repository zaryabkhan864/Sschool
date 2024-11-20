import Course from "../models/Course.js";
import Grade from "../models/Grade.js";
import ErrorHandler from "../utils/errorHandler.js";

//CRUD operations for courses

// Create new course => /api/v1/courses
export const newCourse = async (req, res) => {

  // req.body.course = await req.course._id;
  console.log(req.body);



  const course = await Course.create(req.body);

  res.status(200).json({
    course,
  });
};

//Create get all course => /api/v1/courses
export const getCourses = async (req, res) => {
  const courses = await Course.create(req.body);
  console.log("courses.....", courses)
  res.status(200).json({
    courses,
    message: "courses",
bf921d0b676284edf77d7eec14be67e40c9c40d6
  });
};

// Update course => /api/v1/courses/:id
export const updateCourse = async (req, res) => {
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
};

// Delete course => /api/v1/courses/:id
export const deleteCourse = async (req, res, next) => {
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
};

// extra controller for course

// Get single course details => /api/v1/courses/:id
export const getCourseDetails = async (res, req, next) => {
  const course = await Course.findById(req?.params?.id);
  if (!course) {
    return next(new ErrorHandler("Course not found", 404));
  }
  res.status(200).json({
    course,
  });
};
 