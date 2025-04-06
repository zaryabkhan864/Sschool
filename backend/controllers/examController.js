import Exam from "../models/exam.js";
import Student from "../models/user.js";

import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import mongoose from "mongoose";


export const updateExam = catchAsyncErrors(async (req, res) => {
    let exam = await Exam.findById(req.params.id);

    if (!exam) {
        return next(new ErrorHandler("Exam not found", 404));
    }

    exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        Exam,
        message: "Exam marks updated successfully",
    });
});

export const getExamDetails = catchAsyncErrors(async (req, res, next) => {
    const { grade, course, semester, quarter, user } = req.body;

    const { campus } = req.cookies

    
    // Check if a exam exists with the given details
    let existingExam = await Exam.findOne({
      grade,
      course,
      semester,
      quarter,
      user,
      campus
    }).populate({
      path: "marks.student",
      select: "name", // Populate student names
    });
  
  
    if (existingExam) {
      const examWithStudentNames = {
        ...existingExam.toObject(),
        marks: existingExam.marks.map((mark) => ({
          ...mark.toObject(),
          studentName: mark.student?.name || "Unknown", // Add student name to each mark
          student: mark.student?._id 
    })),
      };

    /* Return the updated exam data with student names */
      return res.status(200).json({
        success: true,
        message: "Exam data retrieved successfully.",
        exam: examWithStudentNames,
      });
    }
  
    // fetch students by grade
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
  
    // Step 5: Create a new exam with initial marks for each student
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
      question10: 0
    }));
  
    const newExam = await Exam.create({
      semester,
      quarter,
      course,
      grade,
      user,
      campus,
      marks: initialMarks, // Initialize marks with student data
    });
  

    // Return the new exam data along with student names
    const newExamWithStudentNames = {
      ...newExam.toObject(),
      marks: newExam.marks.map((mark) => {
        const student = students.find((s) => s._id.toString() === mark.student.toString());
        return {
          ...mark.toObject(),
          studentName: student?.name || "Unknown", // Add student name to each mark
        };
      }),
    };
  
    return res.status(201).json({
      success: true,
      message: "No exam found. New exam record created.",
      exam: newExamWithStudentNames,
    });
  });
