import catchAsyncErrors from '../middlewares/catchAsyncErrors.js';
import Student from '../models/Student.js';
import APIFilters from '../utils/apiFilters.js';

// Create a new student =>  /api/v1/student/create_student
export const createStudent = catchAsyncErrors(async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json({
      success: true,
      student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
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
})

// update student =>  /api/v1/student/:id
export const updateStudent = catchAsyncErrors(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) {
    return res.status(404).json({
      message: "Student not found",
    });
  }
  try {
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
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
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
export const getStudentDetails = catchAsyncErrors(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) {
    return res.status(404).json({
      message: "Student not found",
    });
  }
  res.status(200).json({
    student,
  });
});
