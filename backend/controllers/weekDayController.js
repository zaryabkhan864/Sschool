import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import WeekDay from "../models/weekDay.js";
import ErrorHandler from "../utils/errorHandler.js";

export const newWeekDay = catchAsyncErrors(async (req, res) => {
  const day = await WeekDay.create(req.body);
  res.status(200).json({ day });
});

export const getWeekDays = catchAsyncErrors(async (req, res) => {
  const days = await WeekDay.find().sort({ order: 1 });
  res.status(200).json({ success: true, days });
});

export const updateWeekDay = catchAsyncErrors(async (req, res, next) => {
  let day = await WeekDay.findById(req.params.id);

  if (!day) {
    return next(new ErrorHandler("Week day not found", 404));
  }

  day = await WeekDay.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json({ day });
});

export const deleteWeekDay = catchAsyncErrors(async (req, res, next) => {
  const day = await WeekDay.findById(req.params.id);

  if (!day) {
    return next(new ErrorHandler("Week day not found", 404));
  }

  await WeekDay.findByIdAndDelete(req.params.id);

  res.status(200).json({
    message: "Week day deleted successfully",
  });
});
