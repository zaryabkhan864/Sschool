import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import AcademicLevel from "../models/academicLevel.js";
import APIFilters from "../utils/apiFilters.js";
import ErrorHandler from "../utils/errorHandler.js";

// Create Academic Level
export const newAcademicLevel = catchAsyncErrors(async (req, res) => {
  const { campus } = req.cookies;
  const { selectedYear } = req.cookies;

  const data = {
    ...req.body,
    campus,
    year: selectedYear
  };

  const level = await AcademicLevel.create(data);
  res.status(200).json({ level });
});

// Get all Academic Levels
export const getAcademicLevels = catchAsyncErrors(async (req, res) => {
  if (req.query.paginate === "false") {
    const levels = await AcademicLevel.find();
    return res.status(200).json({ success: true, levels });
  }

  const resPerPage = 10;
  const apiFilters = new APIFilters(AcademicLevel, req.query).search().filters();

  let levels = await apiFilters.query;
  const filteredCount = levels.length;

  apiFilters.pagination(resPerPage);
  levels = await apiFilters.query.clone();

  res.status(200).json({
    success: true,
    resPerPage,
    filteredCount,
    levels,
  });
});

// Get Academic Level Details
export const getAcademicLevelDetails = catchAsyncErrors(async (req, res, next) => {
  const level = await AcademicLevel.findById(req.params.id);

  if (!level) {
    return next(new ErrorHandler("Academic level not found", 404));
  }

  res.status(200).json({ level });
});

// Update Academic Level
export const updateAcademicLevel = catchAsyncErrors(async (req, res, next) => {
  let level = await AcademicLevel.findById(req.params.id);

  if (!level) {
    return next(new ErrorHandler("Academic level not found", 404));
  }

  level = await AcademicLevel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json({ level });
});

// Delete Academic Level
export const deleteAcademicLevel = catchAsyncErrors(async (req, res, next) => {
  const level = await AcademicLevel.findById(req.params.id);

  if (!level) {
    return next(new ErrorHandler("Academic level not found", 404));
  }

  await AcademicLevel.findByIdAndDelete(req.params.id);

  res.status(200).json({
    message: "Academic level deleted successfully",
  });
});
