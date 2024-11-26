import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Teacher from "../models/teacher.js";
import APIFilters from "../utils/apiFilters.js";
import ErrorHandler from "../utils/errorHandler.js";

// CRUD operations for courses

// Create new teacher => /api/v1/teachers
export const newTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.create(req.body);

    res.status(200).json({
      teacher,
    });
  } catch (error) {
    next(new ErrorHandler(error.message || "Failed to create teacher", 500));
  }
};
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
export const updateTeacher = async (req, res, next) => {
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
};
// Delete teacher => /api/v1/teachers/:id
export const deleteTeacher = async (req, res, next) => {
  try {
    //check if there are any course associated with this teacher
    const associatedCourses = await Teacher.find({
      teacherId: req?.params?.id,
    });
    if (associatedCourses.length > 0) {
      return next(
        new ErrorHandler(
          "Can not delete course, it is associated with grades",
          400
        )
      );
    }
    //if no courses are associated, delte the teacher
    const teacher = await Teacher.findById(req?.params?.id);
    if (!teacher) {
      return next(new ErrorHandler("Course not found", 404));
    }
    await teacher.deleteOne();
    res.status(200).json({
      message: "Teacher deleted successfully",
    });
  } catch (error) {
    next(new ErrorHandler(error.message || "Failed to delete teacher", 500));
  }
};

// extra controller for teacher

// Get single teacher details => /api/v1/teachers/:id
export const getTeacherDetails = catchAsyncErrors(async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req?.params?.id)

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
