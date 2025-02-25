import catchAsyncErrors from '../middlewares/catchAsyncErrors.js';
import attendance from '../models/attendance.js';


import ErrorHandler from '../utils/errorHandler.js';

// create attendance => /api/v1/attendance/new

export const newAttendace = catchAsyncErrors(async(req,res)=>{
    const attendance = await attendance.create(req.body);
    console.log("Attendance added successfully", attendance)
    res.status(200).json({
        success: true,
        attendance,
    });
})

export const updateAttendance = catchAsyncErrors(async(req,res)=>{
    let attendance = await Attendance.findById(req.params.id);
    if(!attendance){
        return next(new ErrorHandler("Attendance not found",404))
    }
    attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    res.status(200).json({
        success: true,
        attendance,
        message: "Attendance updated successfully",
    });
})