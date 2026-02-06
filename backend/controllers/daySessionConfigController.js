import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import DaySessionConfig from "../models/daySessionConfig.js";
import ErrorHandler from "../utils/errorHandler.js";

export const newDaySessionConfig = catchAsyncErrors(async (req, res) => {
  const config = await DaySessionConfig.create(req.body);
  res.status(200).json({ config });
});

export const getDaySessionConfigs = catchAsyncErrors(async (req, res) => {
  const configs = await DaySessionConfig.find()
    .populate("academicLevel weekDay sessions");

  res.status(200).json({ success: true, configs });
});

export const updateDaySessionConfig = catchAsyncErrors(async (req, res, next) => {
  let config = await DaySessionConfig.findById(req.params.id);

  if (!config) {
    return next(new ErrorHandler("Day session config not found", 404));
  }

  config = await DaySessionConfig.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json({ config });
});

export const deleteDaySessionConfig = catchAsyncErrors(async (req, res, next) => {
  const config = await DaySessionConfig.findById(req.params.id);

  if (!config) {
    return next(new ErrorHandler("Day session config not found", 404));
  }

  await DaySessionConfig.findByIdAndDelete(req.params.id);

  res.status(200).json({
    message: "Day session config deleted successfully",
  });
});
