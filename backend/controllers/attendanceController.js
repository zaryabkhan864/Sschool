import mongoose  from "mongoose";
import Attendance from "../models/attendance.js";
import Student from "../models/user.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";

export const updateAttendance = catchAsyncErrors(async (req, res, next) => {
    const {records} = req.body
 const updateOperations = []
  if(records.length)
    {
        records.map((item)=>{
            updateOperations.push({
                updateOne: {
                    filter: { _id: new mongoose.Types.ObjectId(item._id) }, 
                    update: { $set: item }
                }
            })
        }
        )

    const attendances = await Attendance.bulkWrite(updateOperations);

    res.status(200).json({
        success: true,
        attendances,
        message: "Attendance updated successfully",
    });
}
    else{
        res.status(200).json({
            success: true,
            message: "Nothing to update.",
        });
    }
});

export const getAttendanceDetails = catchAsyncErrors(async (req, res, next) => {
    const { grade, date } = req.body;

    const { campus } = req.cookies

    // Fetch students by grade

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

    // Extract student IDs
    const studentIds = students.map(student => student._id);

    // Check if attendance records exist for the given date and student IDs
    let existingAttendance = await Attendance.find({
        date,
        student: { $in: studentIds }, // Match attendance records for the students in the grade
    }).populate({
        path: "student",
        select: "name", // Populate student names
    });

    if (existingAttendance && existingAttendance.length > 0) {
        const attendanceWithStudentNames = existingAttendance.map(attendance => ({
            ...attendance.toObject(),
            studentName: attendance.student?.name || "Unknown", // Add student name
        }));

        // Return the updated attendance data with student names
        return res.status(200).json({
            success: true,
            message: "Attendance data retrieved successfully.",
            attendance: attendanceWithStudentNames,
        });
    }

    // If no attendance records exist, create new ones for each student
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
/* export const getAttendanceDetails = catchAsyncErrors(async (req, res, next) => {
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
}); */