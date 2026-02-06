import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import SessionTemplate from "../models/sessionTemplate.js";
import ErrorHandler from "../utils/errorHandler.js";

export const newSessionTemplate = catchAsyncErrors(async (req, res) => {
  const session = await SessionTemplate.create(req.body);
  res.status(200).json({ session });
});

export const getSessionTemplates = catchAsyncErrors(async (req, res) => {
  const sessions = await SessionTemplate.find()
    .populate("academicLevel")
    .sort({ order: 1 });

  res.status(200).json({ success: true, sessions });
});

export const updateSessionTemplate = catchAsyncErrors(async (req, res, next) => {
  let session = await SessionTemplate.findById(req.params.id);

  if (!session) {
    return next(new ErrorHandler("Session template not found", 404));
  }

  session = await SessionTemplate.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json({ session });
});

export const deleteSessionTemplate = catchAsyncErrors(async (req, res, next) => {
  const session = await SessionTemplate.findById(req.params.id);

  if (!session) {
    return next(new ErrorHandler("Session template not found", 404));
  }

  await SessionTemplate.findByIdAndDelete(req.params.id);

  res.status(200).json({
    message: "Session template deleted successfully",
  });
});
