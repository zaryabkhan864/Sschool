import Quiz from "../models/quiz.js";
import Student from "../models/user.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import mongoose from "mongoose";
// Create a new quiz =>  /api/v1/quiz/create_quiz
export const newQuiz = catchAsyncErrors(async (req, res) => {

    const quiz = await Quiz.create(req.body);
    res.status(200).json({
        success: true,
        quiz,
    });
});

export const getStudentsQuizRecord = catchAsyncErrors(async (req, res, next) => {
  const { grade, course, semester, quarter, quizNumber, user } = req.body;
  
  // Extract year from cookies or request body
  const { campus, selectedYear } = req.cookies;
  const year = selectedYear || req.body.year;
  
  if (!year) {
    return next(new ErrorHandler("Year is required", 400));
  }

  // Step 1: Check if a quiz exists with the given details
  let existingQuiz = await Quiz.findOne({
    grade,
    course,
    semester,
    quarter,
    quizNumber,
    user,
    campus,
    year: Number(year) // Ensure year is a number
  }).populate({
    path: "marks.student",
    select: "name", // Populate student names
  });

  if (existingQuiz) {
    const quizWithStudentNames = {
      ...existingQuiz.toObject(),
      marks: existingQuiz.marks.map((mark) => ({
        ...mark.toObject(),
        studentName: mark.student?.name || "Unknown",
        student: mark.student?._id
      })),
    };

    return res.status(200).json({
      success: true,
      message: "Quiz data retrieved successfully.",
      quiz: quizWithStudentNames,
    });
  }

  // If no quiz exists, fetch students by grade

  const students = await Student.aggregate([
    {
      $match: {
        "campus": new mongoose.Types.ObjectId(campus)
      }
    },
    {
      $addFields: {
        currentGrade: { 
          $arrayElemAt: ["$grade", -1]
        }
      }
    },
    {
      $match: {
        "currentGrade.gradeId": new mongoose.Types.ObjectId(grade)
      }
    }
  ]);
  if (!students || students.length === 0) {
    return next(new ErrorHandler("Students not found", 404));
  }

  // Create a new quiz with initial marks for each student
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
    campus,
    year: Number(year), // Add the year here
    marks: initialMarks,
  });

  // Return the new quiz data along with student names
  const newQuizWithStudentNames = {
    ...newQuiz.toObject(),
    marks: newQuiz.marks.map((mark) => {
      const student = students.find((s) => s._id.toString() === mark.student.toString());
      return {
        ...mark.toObject(),
        studentName: student?.name || "Unknown",
      };
    }),
  };

  return res.status(201).json({
    success: true,
    message: "No quiz found. New quiz record created.",
    quiz: newQuizWithStudentNames,
  });
});

export const updateQuiz = catchAsyncErrors(async (req, res, next) => {
  let quiz = await Quiz.findById(req.params.id);

  if (!quiz) {
    return next(new ErrorHandler("Quiz not found", 404));
  }

  // If year is being updated, ensure it's a number
  if (req.body.year) {
    req.body.year = Number(req.body.year);
  }

  quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    quiz,
    message: "Quiz marks updated successfully",
  });
});
