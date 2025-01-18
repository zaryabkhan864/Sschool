import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Student from "../models/student.js";
import user from "../models/user.js";
import APIFilters from "../utils/apiFilters.js";
import { upload_file } from "../utils/cloudinary.js";
import ErrorHandler from "../utils/errorHandler.js";
// CRUD operations for students

// Create a new student =>  /api/v1/student/create_student
export const newStudent = catchAsyncErrors(async (req, res, next) => {
  let avatar = {};
  const role = "student";

  // Check if avatar is provided and upload it
  if (req?.body?.avatar) {
    avatar = await upload_file(req.body.avatar, "project/students");
  }

  // Extract data from request body
  const {
    studentName,
    age,
    gender,
    nationality,
    passportNumber,
    studentPhoneNumber,
    parentOnePhoneNumber,
    parentTwoPhoneNumber,
    address,
    grade,
    email,
    password,
  } = req.body;

  //step1:create the user
  const newUser = await user.create({
    name: studentName,
    email,
    password,
    avatar,
    role,
  });
  if (!newUser) {
    return next(new ErrorHandler("User creation failed", 400));
  }
  // Step 2: Use the user ID to create the student
  const student = await Student.create({
    studentName,
    age,
    gender,
    nationality,
    passportNumber,
    studentPhoneNumber,
    parentOnePhoneNumber,
    parentTwoPhoneNumber,
    address,
    grade,
    user: newUser._id, // Referencing the user ID here
  });
  if (student) {
    res.status(200).json({
      success: true,
      student,
    });
  } else {
    return next(new ErrorHandler("Student Not created", 404));
  }
});

// Get all students =>  /api/v1/students
export const getStudents = catchAsyncErrors(async (req, res, next) => {
  const resPerPage = 8;
  const apiFilters = new APIFilters(Student, req.query).search().filters();

  let students = await apiFilters.query;
  let filteredStudentsCount = students.length;

  apiFilters.pagination(resPerPage);
  students = await apiFilters.query.clone();

  res.status(200).json({
    success: true,
    resPerPage,
    filteredStudentsCount,
    students,
  });
});

// update student =>  /api/v1/student/:id
export const updateStudent = catchAsyncErrors(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) {
    return res.status(404).json({
      message: "Student not found",
    });
  }
  const newStudentData = {
    name: req.body.name,
    age: req.body.age,
    gender: req.body.gender,
    nationality: req.body.nationality,
    images: req.body.images,
    studentPhoneNumber: req.body.studentPhoneNumber,
    parentOnePhoneNumber: req.body.parentOnePhoneNumber,
    parentTwoPhoneNumber: req.body.parentTwoPhoneNumber,
    user: req.body.user,
    grade: req.body.grade,
    enrolledCourses: req.body.enrolledCourses,
  };
  const updatedStudent = await Student.findByIdAndUpdate(
    req.params.id,
    newStudentData,
    {
      new: true,
    }
  );
  res.status(200).json({
    updatedStudent,
  });
});

// Delete student =>  /api/v1/student/:id
export const deleteStudent = catchAsyncErrors(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) {
    return res.status(404).json({
      message: "Student not found",
    });
  }
  await student.deleteOne();
  res.status(200).json({
    message: "Student deleted successfully",
  });
});

// Get student details =>  /api/v1/student/:id
export const getStudentDetails = catchAsyncErrors(async (req, res, next) => {
  const student = await Student.findById(req?.params?.id).populate("user");
  if (!student) {
    return next(new ErrorHandler("Student not found", 404));
  }
  res.status(200).json({
    student,
  });
});

// Get all students by grade =>  /api/v1/student/grade/:gradeId
export const getStudentsByGrade = catchAsyncErrors(async (req, res, next) => {
  console.log("yes i am hit ")
  // const students = await Student.find({ grade: req.params.id }).populate(
  //   "user"
  // );
  // if (!students) {
  //   return next(new ErrorHandler("Students not found", 404));
  // }
  // res.status(200).json({
  //   students,
  // });

});
