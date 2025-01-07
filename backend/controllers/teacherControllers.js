import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Course from "../models/course.js";
import Teacher from "../models/teacher.js";
import user from "../models/user.js";
import APIFilters from "../utils/apiFilters.js";
import { upload_file } from "../utils/cloudinary.js";
import ErrorHandler from "../utils/errorHandler.js";
// CRUD operations for courses

// Create new teacher => /api/v1/teachers
export const newTeacher = catchAsyncErrors(async (req, res, next) => {
  let avatar = {};
  const role = "teacher";

  // Check if avatar is provided and upload it
  if (req?.body?.avatar) {
    avatar = await upload_file(req.body.avatar, "project/teachers");
  }

  // Extract data from request body
  const {
    teacherName,
    age,
    gender,
    nationality,
    teacherPhoneNumber,
    teacherSecondPhoneNumber,
    email,
    password,
  } = req.body;

  // Step 1: Create the user
  const newUser = await user.create({
    name: teacherName,
    email,
    password,
    avatar,
    role,
  });

  if (!newUser) {
    return next(new ErrorHandler("User creation failed", 400));
  }

  // Step 2: Use the user ID to create the teacher

  const teacher = await Teacher.create({
    teacherName,
    age,
    gender,
    nationality,
    teacherPhoneNumber,
    teacherSecondPhoneNumber,
    user: newUser._id, // Referencing the user ID here
  });

  if (teacher) {
    res.status(200).json({
      success: true,
      teacher,
    });
  } else {
    return next(new ErrorHandler("Teacher not created", 404));
  }
});

// Create get all teacher => /api/v1/teachers
export const getTeachers = catchAsyncErrors(async (req, res, next) => {
  const resPerPage = 8;
  const apiFilters = new APIFilters(Teacher, req.query).search().filters();

  let teachers = await apiFilters.query;
  let filteredTeachersCount = teachers.length;
  apiFilters.pagination(resPerPage);
  teachers = await apiFilters.query.clone();
  res.status(200).json({
    resPerPage,
    filteredTeachersCount,
    teachers,
  });
});
// Update teacher => /api/v1/teachers/:id
export const updateTeacher = catchAsyncErrors(async (req, res, next) => {
  let teacher = await Teacher.findById(req?.params?.id);
  if (!teacher) {
    return next(new ErrorHandler("Teacher not found", 404));
  }

  teacher = await Teacher.findByIdAndUpdate(req?.params?.id, req.body, {
    new: true,
  });

  res.status(200).json({
    teacher,
  });
});

// Delete teacher => /api/v1/teachers/:id
export const deleteTeacher = catchAsyncErrors(async (req, res, next) => {
  //check if there is any teacher with req id
  const teacher = await Teacher.findById(req?.params?.id);
  if (!teacher) {
    return next(new ErrorHandler("teacher not found", 404));
  }
  if (Course.teacher == req?.params?.id) {
    return next(
      new ErrorHandler(
        "teacher is assigned to a course, first removed this teacher from course",
        404
      )
    );
  }
  //check if there are any courses associated with this teacher
  if (teacher.assignedCourses.length > 0) {
    return next(
      new ErrorHandler("Can not delete Teacher ,Delete teacher courses", 404)
    );
  }
  //if no courses are associated, delete the teacher
  await teacher.deleteOne();
  res.status(200).json({
    message: "Teacher deleted successfully",
  });
});

// extra controller for teacher

// Get single teacher details => /api/v1/teachers/:id
export const getTeacherDetails = catchAsyncErrors(async (req, res, next) => {
  const teacher = await Teacher.findById(req?.params?.id)
    .populate("assignedCourses")
    .populate("user");

  if (!teacher) {
    return next(new ErrorHandler("Teacher not found", 404));
  }

  res.status(200).json({
    teacher,
  });
});

// add course to teacher
export const addCourseInTeacher = catchAsyncErrors(async (req, res, next) => {
  const { teacherId, courseId } = req.body;
  const teacher = await Teacher.findById(teacherId);
  if (!teacher) {
    return next(new ErrorHandler("Teacher not found", 404));
  }
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new ErrorHandler("Course not found", 404));
  }

  const isDuplicate = teacher.assignedCourses.includes(courseId);
  if (isDuplicate) {
    return next(new ErrorHandler("Course already added to teacher", 404));
  }

  teacher.assignedCourses.push(courseId);
  await teacher.save();
  res.status(200).json({ message: "Course added to teacher" });
});

//remove course from teacher
export const deleteCourseInTeacher = catchAsyncErrors(
  async (req, res, next) => {
    const { teacherId, courseId } = req.body;
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return next(new ErrorHandler("Teacher not found", 404));
    }

    const courseIndex = teacher.assignedCourses.indexOf(courseId);
    if (courseIndex === -1) {
      return next(
        new ErrorHandler("Course is not found in Teachers Courses", 404)
      );
    }

    teacher.assignedCourses = teacher.assignedCourses.filter(
      (course) => course.toString() !== courseId
    );
    await teacher.save();

    res.status(200).json({ message: "Course removed from teacher" });
  }
);
