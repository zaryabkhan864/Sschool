import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import User from "../models/user.js";
import Quiz from "../models/quiz.js";
import APIFilters from "../utils/apiFilters.js";
import ErrorHandler from "../utils/errorHandler.js";
import _ from "lodash";

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
  const student = await User.findById(req?.params?.id)
    .select('-password -resetPasswordToken -resetPasswordExpire') // Password fields exclude karen
    .populate({
      path: 'campus',
      model: 'Campus'
    })
    .populate({
      path: 'grade.gradeId',
      model: 'Grade',
      populate: {
        path: 'courses',
        model: 'Course',
        populate: {
          path: 'teacher',
          model: 'User',
          select: 'name email' // Sirf teacher ki basic details
        }
      }
    })
    .populate({
      path: 'siblings',
      model: 'User',
      select: 'name userId email'
    });

  if (!student) {
    return next(new ErrorHandler("Student not found", 404));
  }

  // Check karein ke user student hai ya nahi
  if (student.role !== 'student') {
    return next(new ErrorHandler("User is not a student", 400));
  }

  // Agar koi specific grade ki details chahiye to
  // ya phir latest grade ki details
  let currentGrade = null;
  let currentGradeDetails = null;
  
  if (student.grade && student.grade.length > 0) {
    // Latest grade find karein (maan lein ke grade array time ke hisaab se sorted hai)
    const latestGrade = student.grade[student.grade.length - 1];
    currentGrade = latestGrade.gradeId;
    
    // Agar grade populate ho gaya hai to details le lein
    if (currentGrade && currentGrade._id) {
      currentGradeDetails = currentGrade;
    }
  }

  // Courses ki details prepare karein
  let coursesDetails = [];
  if (currentGradeDetails && currentGradeDetails.courses) {
    coursesDetails = currentGradeDetails.courses.map(course => ({
      _id: course._id,
      courseName: course.courseName,
      code: course.code,
      description: course.description,
      year: course.year,
      teacher: course.teacher ? {
        _id: course.teacher._id,
        name: course.teacher.name,
        email: course.teacher.email
      } : null
    }));
  }

  res.status(200).json({
    success: true,
    student: {
      _id: student._id,
      name: student.name,
      userId: student.userId,
      email: student.email,
      avatar: student.avatar,
      role: student.role,
      dateOfBirth: student.dateOfBirth,
      gender: student.gender,
      nationality: student.nationality,
      passportNumber: student.passportNumber,
      phoneNumber: student.phoneNumber,
      secondaryPhoneNumber: student.secondaryPhoneNumber,
      address: student.address,
      year: student.year,
      status: student.status,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt
    },
    campus: student.campus ? {
      _id: student.campus._id,
      name: student.campus.name,
      location: student.campus.location,
      contactNumber: student.campus.contactNumber
    } : null,
    currentGrade: currentGradeDetails ? {
      _id: currentGradeDetails._id,
      gradeName: currentGradeDetails.gradeName,
      description: currentGradeDetails.description,
      year: currentGradeDetails.year
    } : null,
    gradesHistory: student.grade ? student.grade.map(g => ({
      gradeId: g.gradeId,
      yearFrom: g.yearFrom,
      yearTo: g.yearTo
    })) : [],
    courses: coursesDetails,
    siblings: student.siblings ? student.siblings.map(sibling => ({
      _id: sibling._id,
      name: sibling.name,
      userId: sibling.userId,
      email: sibling.email
    })) : []
  });
});
// export const getStudentDetails = catchAsyncErrors(async (req, res, next) => {
//   const student = await Student.findById(req?.params?.id);
//   if (!student) {
//     return next(new ErrorHandler("Student not found", 404));
//   }
//   res.status(200).json({
//     student,
//   });
// });

// Get all students by grade =>  /api/v1/student/grade/:gradeId



export const getStudentsQuizRecord = catchAsyncErrors(async (req, res, next) => {
  const { grade, course, semester, quarter, quizNumber, user } = req.body;


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
  let students = await apiFilters.query;

  apiFilters.pagination(resPerPage);
  students = await apiFilters.query.clone();

  res.status(200).json({
    success: true,
    students,
  });
});