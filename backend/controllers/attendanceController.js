import Attendance from "../models/attendance.js";
import Student from "../models/user.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";

export const updateAttendance = catchAsyncErrors(async (req, res, next) => {
    let attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
        return next(new ErrorHandler("Attendance record not found", 404));
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
});
export const getAttendanceDetails = catchAsyncErrors(async (req, res, next) => {
    const { grade, date, user } = req.body;

    // Check if an attendance record exists with the given details
    let existingAttendance = await Attendance.findOne({
        date,
        user,
    }).populate({
        path: "student",
        select: "name", // Populate student names
    });

    if (existingAttendance) {
        const attendanceWithStudentNames = {
            ...existingAttendance.toObject(),
            studentName: existingAttendance.student?.name || "Unknown", // Add student name
        };

        // Return the updated attendance data with student names
        return res.status(200).json({
            success: true,
            message: "Attendance data retrieved successfully.",
            attendance: attendanceWithStudentNames,
        });
    }

    // Fetch students by grade
    const students = await Student.find({ grade });

    if (!students || students.length === 0) {
        return next(new ErrorHandler("Students not found", 404));
    }

    // Create a new attendance record for each student
    const initialAttendance = students.map((student) => ({
        student: student._id,
        date,
        status: "present", // Default status
        remarks: "",
    }));

    const newAttendance = await Attendance.create(initialAttendance);

    // Return the new attendance data along with student names
    const newAttendanceWithStudentNames = newAttendance.map((attendance) => {
        const student = students.find((s) => s._id.toString() === attendance.student.toString());
        return {
            ...attendance.toObject(),
            studentName: student?.name || "Unknown", // Add student name
        };
    });

    return res.status(201).json({
        success: true,
        message: "No attendance record found. New attendance record created.",
        attendance: newAttendanceWithStudentNames,
    });
});