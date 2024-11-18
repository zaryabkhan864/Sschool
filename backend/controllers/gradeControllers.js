import Grade from "../models/grade.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";

//CRUD operations for grades
// Create new grade => /api/v1/grades
export const newGrade = catchAsyncErrors(async (req, res) => {

    const grade = Grade.create(req.body);

    res.status(200).json({
        grade,
    });
})
//Create get all grades => /api/v1/grades
export const getGrades = catchAsyncErrors(async (req, res) => {
    const grades = Grade.find();
    res.status(200).json({
        grades,
    });
});
// Update grade => /api/v1/grades/:id
export const updateGrade = catchAsyncErrors(async (req, res) => {
    let grade = await Grade.findById(req?.params?.id);
    if (!grade) {
        return next(new ErrorHandler("Grade not found", 404));
    }
    grade = Grade.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    })
    res.status(200).json({
        grade,
    });
})
// Delete grade => /api/v1/grades/:id
export const deleteGrade = catchAsyncErrors(async(req, res) => {
        const grade = await Grade.findById(req?.params?.id);
        if (!grade) {
            return next(new ErrorHandler("Grade not found", 404));
        }
        await grade.deleteOne();
        res.status(200).json({
            message: "Grade deleted successfully",
        });
    }
) 

// extra controller for Grade
// Get single grade details => /api/v1/grades/:id
export const getGradeDetails = catchAsyncErrors(async(req, res) => {
    const grade = await Grade.findById(req?.params?.id);
    if(!grade){
        return next(new ErrorHandler("Grade not found", 404));
    }
    res.status(200).json({
        grade,
    });
})

// 