import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Teacher from "../models/teacher.js";
import ErrorHandler from "../utils/errorHandler.js";

// CRUD operations for courses

// Create new teacher => /api/v1/teachers
export const newTeacher = catchAsyncErrors(async (req, res, next) => {
  try {
    const teacher = await Teacher.create(req.body);

    res.status(200).json({
      teacher,
    });
  } catch (error) {
    next(new ErrorHandler(error.message || "Failed to create teacher", 500));
  }
});

// Create get all teacher => /api/v1/teachers
<<<<<<< HEAD
export const getTeachers = catchAsyncErrors(async (req, res, next) => {
=======
export const getTeachers = async (req, res, next) => {
  const resPerPage = 8;
  const apiFilters = new APIFilters(Teacher, req.query).search().filters();
>>>>>>> e050d08a96a11c36d72ba4e5671a0b64ff075462
  try {
    let teachers = await apiFilters.query;
    let filteredTeachersCount = teachers.length;
    apiFilters.pagination(resPerPage);
    teachers = await apiFilters.query.clone();
    res.status(200).json({
      resPerPage,
      filteredTeachersCount,
      teachers,
    });
  } catch (error) {
    next(new ErrorHandler(error.message || "Failed to fetch teachers", 500));
  }
});

// Update teacher => /api/v1/teachers/:id
export const updateTeacher = catchAsyncErrors(async (req, res, next) => {
  try {
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
  } catch (error) {
    next(new ErrorHandler(error.message || "Failed to update teacher", 500));
  }
});

// Delete teacher => /api/v1/teachers/:id
export const deleteTeacher = catchAsyncErrors(async (req, res, next) => {
  try {
    //check if there is any teacher with req id

    const teacher = await Teacher.findById(req?.params?.id);
    if (!teacher) {
      return next(new ErrorHandler("teacher not found", 404));
    }

    //check if there are any courses associated with this teacher
    if (teacher.assignedCourses.length > 0) {
      return next(new ErrorHandler("First delete courses pa", 404));
    }
    //if no courses are associated, delte the teacher
    await teacher.deleteOne();
    res.status(200).json({
      message: "Teacher deleted successfully",
    });
  } catch (error) {
    next(new ErrorHandler(error.message || "Failed to delete teacher", 500));
  }
});

// extra controller for teacher

// Get single teacher details => /api/v1/teachers/:id
export const getTeacherDetails = catchAsyncErrors(async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req?.params?.id);

    if (!teacher) {
      return next(new ErrorHandler("Teacher not found", 404));
    }

    res.status(200).json({
      teacher,
    });
  } catch (error) {
    next(new ErrorHandler(error.message || "Failed to fetch teacher", 500));
  }
});