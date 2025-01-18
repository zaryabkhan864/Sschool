import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Quiz from "../models/quiz.js";
import APIFilters from "../utils/apiFilters.js";
import ErrorHandler from "../utils/errorHandler.js";
// CRUD operations for students

// Create a new student =>  /api/v1/student/create_student
export const newQuiz = catchAsyncErrors(async (req, res, next) => {
    console.log("I AM HIT",req.body)
    // const { semester, quarter, quizNumber, course, grade, teacher, marks } = req.body;

    // // Check if a quiz already exists with the specified semester, quarter, quizNumber, course, and grade
    // const existingQuiz = await Quiz.findOne({
    //     semester,
    //     quarter,
    //     quizNumber,
    //     course,
    //     grade,
    // }).populate("course grade teacher marks.student");

    // if (existingQuiz) {
    //     return res.status(200).json({
    //         success: true,
    //         message: "Quiz already exists",
    //         data: existingQuiz,
    //     });
    // }

    // // If no quiz exists, create a new one
    // const newQuizData = {
    //     semester,
    //     quarter,
    //     quizNumber,
    //     course,
    //     grade,
    //     teacher,
    //     marks: marks.map((mark) => ({
    //         student: mark.student,
    //         question1: 0,
    //         question2: 0,
    //         question3: 0,
    //         question4: 0,
    //         question5: 0,
    //     })),
    // };

    // const quiz = await Quiz.create(newQuizData);

    // return res.status(201).json({
    //     success: true,
    //     message: "New quiz created successfully",
    //     data: quiz,
    // });
});

