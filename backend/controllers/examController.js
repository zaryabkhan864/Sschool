import Exam from "../models/exam.js";
import Student from "../models/user.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import mongoose from "mongoose";

export const newExam = catchAsyncErrors(async (req, res) => {
  const exam = await Exam.create(req.body);
  res.status(200).json({
    success: true,
    exam,
  });
});

export const getStudentsExamRecord = catchAsyncErrors(async (req, res, next) => {
  const { grade, course, semester, quarter, user } = req.body; 

  // Extract year from cookies or request body
  const { campus, selectedYear } = req.cookies;
  const year = selectedYear || req.body.year;

  if (!year) {
    return next(new ErrorHandler("Year is required", 400));
  }

  // Step 1: Check if an exam exists with the given details
  let existingExam = await Exam.findOne({
    grade,
    course,
    semester,
    quarter,
    user,
    campus,
    year: Number(year)
  }).populate({
    path: "marks.student",
    select: "name",
  });

  if (existingExam) {
    const examWithStudentNames = {
      ...existingExam.toObject(),
      marks: existingExam.marks.map((mark) => ({
        ...mark.toObject(),
        studentName: mark.student?.name || "Unknown",
        student: mark.student?._id
      })),
    };

    return res.status(200).json({
      success: true,
      message: "Exam data retrieved successfully.",
      exam: examWithStudentNames,
    });
  }

  // If no exam exists, fetch students by grade
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

  // Create a new exam with initial marks for each student
  const initialMarks = students.map((student) => ({
    student: student._id,
    question1: 0,
    question2: 0,
    question3: 0,
    question4: 0,
    question5: 0,
    question6: 0,
    question7: 0,
    question8: 0,
    question9: 0,
    question10: 0,
  }));

  const newExam = await Exam.create({
    semester,
    quarter,
    course,
    grade,
    user,
    campus,
    year: Number(year),
    marks: initialMarks,
  });

  const newExamWithStudentNames = {
    ...newExam.toObject(),
    marks: newExam.marks.map((mark) => {
      const student = students.find((s) => s._id.toString() === mark.student.toString());
      return {
        ...mark.toObject(),
        studentName: student?.name || "Unknown",
      };
    }),
  };

  return res.status(201).json({
    success: true,
    message: "No Exam found. New exam record created.",
    exam: newExamWithStudentNames,
  });
});

export const updateExam = catchAsyncErrors(async (req, res, next) => {
  let exam = await Exam.findById(req.params.id);

  if (!exam) {
    return next(new ErrorHandler("Exam not found", 404));
  }

  // If year is being updated, ensure it's a number
  if (req.body.year) {
    req.body.year = Number(req.body.year);
  }

  exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false // Add this for better compatibility
  });

  res.status(200).json({
    success: true,
    exam,
    message: "Exam marks updated successfully",
  });
});