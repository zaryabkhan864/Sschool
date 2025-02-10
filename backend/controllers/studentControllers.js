import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Student from "../models/user.js";
import Quiz from "../models/quiz.js";
import APIFilters from "../utils/apiFilters.js";
import ErrorHandler from "../utils/errorHandler.js";
import _ from "lodash";
import student from "../models/student.js";
// CRUD operations for students

/* // Create a new student =>  /api/v1/student/create_student
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
}); */

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
    avatar: req.body.avatar,
    siblings: req.body.siblings,
    passportNumber: req.body.passportNumber,
    phoneNumber: req.body.phoneNumber,
    secondaryPhoneNumber: req.body.secondaryPhoneNumber,
    address: req.body.address,
    grade: req.body.grade,
    // enrolledCourses: req.body.enrolledCourses,
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
  const student = await Student.findById(req?.params?.id);
  if (!student) {
    return next(new ErrorHandler("Student not found", 404));
  }
  res.status(200).json({
    student,
  });
});

// Get all students by grade =>  /api/v1/student/grade/:gradeId
export const getStudentsQuizRecord = catchAsyncErrors(async (req, res, next) => {
  const { grade, course, semester, quarter, quizNumber, user } = req.body;

  console.log("Received data: ", req.body);

  // Step 1: Check if a quiz exists with the given details
  let existingQuiz = await Quiz.findOne({
    grade,
    course,
    semester,
    quarter,
    quizNumber,
    user,
  }).populate({
    path: "marks.student",
    select: "name", // Populate student names
  });

  console.log("Existing quiz: ", existingQuiz);

  if (existingQuiz) {
    const quizWithStudentNames = {
      ...existingQuiz.toObject(),
      marks: existingQuiz.marks.map((mark) => ({
        ...mark.toObject(),
        studentName: mark.student?.name || "Unknown", // Add student name to each mark
        student: mark.student?._id
      })),
    };

    return res.status(200).json({
      success: true,
      message: "Quiz data retrieved successfully.",
      quiz: quizWithStudentNames,
    });
  }

  // Step 4: If no quiz exists, fetch students by grade
  const students = await Student.find({ grade })

  if (!students || students.length === 0) {
    return next(new ErrorHandler("Students not found", 404));
  }

  // Step 5: Create a new quiz with initial marks for each student
  const initialMarks = students.map((student) => ({
    student: student._id,
    question1: 0,
    question2: 0,
    question3: 0,
    question4: 0,
    question5: 0,
  }));

  const newQuiz = await Quiz.create({
    semester,
    quarter,
    quizNumber,
    course,
    grade,
    user,
    marks: initialMarks, // Initialize marks with student data
  });

  // Return the new quiz data along with student names
  const newQuizWithStudentNames = {
    ...newQuiz.toObject(),
    marks: newQuiz.marks.map((mark) => {
      const student = students.find((s) => s._id.toString() === mark.student.toString());
      return {
        ...mark.toObject(),
        studentName: student?.name || "Unknown", // Add student name to each mark
      };
    }),
  };

  return res.status(201).json({
    success: true,
    message: "No quiz found. New quiz record created.",
    quiz: newQuizWithStudentNames,
  });
});


/* get all students with grades */
// export const getStudentsWithGrades = catchAsyncErrors(async (req, res) => {
//   const apiFilters = new APIFilters(Student, req.query).search().filters().populate('grade', 'gradeName');
//   console.log("apiFilters: ", apiFilters);
//   const students = await apiFilters.query;

//   const sortedStudents = _.sortBy(students, [(item) => item.grade?.gradeName?.toLowerCase()], 'name')

//   res.status(200).json({
//     success: true,
//     students: sortedStudents,
//   });
// });


export const getStudentsWithGrades = catchAsyncErrors(async (req, res) => {
  const apiFilters = new APIFilters(Student, req.query).search().filters();
  console.log("apiFilters: ", apiFilters);
  let students = await apiFilters.query;

  apiFilters.pagination(resPerPage);
  students = await apiFilters.query.clone();

  res.status(200).json({
    success: true,
    students,
  });
});