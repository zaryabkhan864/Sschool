import Quiz from "../models/quiz.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import APIFilters from "../utils/apiFilters.js";
import ErrorHandler from "../utils/errorHandler.js";
// CRUD operations for students

// Create a new student =>  /api/v1/student/create_student
export const newQuiz = catchAsyncErrors(async (req, res) => {

    const quiz = await Quiz.create(req.body);
    console.log("quiz added successfully", quiz)
    res.status(200).json({
        success: true,
        quiz,
    });
});
