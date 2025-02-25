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

export const updateQuiz = catchAsyncErrors(async (req, res) => {
    let quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
        return next(new ErrorHandler("Quiz not found", 404));
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
