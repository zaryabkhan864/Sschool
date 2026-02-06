import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import TimeTableSlot from "../models/timeTableSlot.js";
import ErrorHandler from "../utils/errorHandler.js";

export const newTimeTableSlot = catchAsyncErrors(async (req, res) => {
  const slot = await TimeTableSlot.create(req.body);
  res.status(200).json({ slot });
});

export const getTimeTableSlots = catchAsyncErrors(async (req, res) => {
  const slots = await TimeTableSlot.find()
    .populate("classGroup weekDay sessionTemplate course teacher");

  res.status(200).json({ success: true, slots });
});

export const deleteTimeTableSlot = catchAsyncErrors(async (req, res, next) => {
  const slot = await TimeTableSlot.findById(req.params.id);

  if (!slot) {
    return next(new ErrorHandler("Timetable slot not found", 404));
  }

  await TimeTableSlot.findByIdAndDelete(req.params.id);

  res.status(200).json({
    message: "Timetable slot deleted successfully",
  });
});
