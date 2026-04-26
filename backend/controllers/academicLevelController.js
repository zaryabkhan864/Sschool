import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import AcademicLevel from "../models/academicLevel.js";
import APIFilters from "../utils/apiFilters.js";
import ErrorHandler from "../utils/errorHandler.js";

// Helper to get required academicYear and campus (query > cookies)
const getContext = (req) => {
  const academicYear = req.query.academicYear || req.cookies.academicYear;
  const campus = req.query.campus || req.cookies.campus;
  return { academicYear, campus };
};

// Create Academic Level
export const newAcademicLevel = catchAsyncErrors(async (req, res, next) => {
  const { academicYear, campus } = getContext(req);

  if (!academicYear) {
    return next(new ErrorHandler("Academic Year not selected", 400));
  }
  if (!campus) {
    return next(new ErrorHandler("Campus not selected", 400));
  }

  const data = {
    ...req.body,
    campus,
    academicYear,
  };

  const level = await AcademicLevel.create(data);
  res.status(200).json({ level });
});

// Get all Academic Levels (FILTERED BY CURRENT CAMPUS & YEAR)
export const getAcademicLevels = catchAsyncErrors(async (req, res, next) => {
  const { academicYear, campus } = getContext(req);

  if (!academicYear) {
    return next(new ErrorHandler("Academic Year not selected", 400));
  }
  if (!campus) {
    return next(new ErrorHandler("Campus not selected", 400));
  }

  // Base query with both campus and academicYear
  const baseQuery = AcademicLevel.find({ campus, academicYear });

  if (req.query.paginate === "false") {
    const levels = await baseQuery.clone().populate("campus").populate("academicYear");
    return res.status(200).json({ success: true, levels });
  }

  const resPerPage = 10;
  const apiFilters = new APIFilters(baseQuery, req.query).search().filters();

  let levels = await apiFilters.query.clone().populate("campus").populate("academicYear");
  const filteredCount = levels.length;

  apiFilters.pagination(resPerPage);
  levels = await apiFilters.query.clone().populate("campus").populate("academicYear");

  res.status(200).json({
    success: true,
    resPerPage,
    filteredCount,
    levels,
  });
});

// Get Academic Level Details (only if belongs to current campus)
export const getAcademicLevelDetails = catchAsyncErrors(async (req, res, next) => {
  const { campus } = getContext(req);

  if (!campus) {
    return next(new ErrorHandler("Campus not selected", 400));
  }

  const level = await AcademicLevel.findOne({
    _id: req.params.id,
    campus,
  })
    .populate("campus")
    .populate("academicYear");

  if (!level) {
    return next(new ErrorHandler("Academic level not found", 404));
  }

  res.status(200).json({ level });
});

// Update Academic Level (only if belongs to current campus)
export const updateAcademicLevel = catchAsyncErrors(async (req, res, next) => {
  const { campus } = getContext(req);

  if (!campus) {
    return next(new ErrorHandler("Campus not selected", 400));
  }

  let level = await AcademicLevel.findOne({
    _id: req.params.id,
    campus,
  });

  if (!level) {
    return next(new ErrorHandler("Academic level not found", 404));
  }

  level = await AcademicLevel.findOneAndUpdate(
    { _id: req.params.id, campus },
    req.body,
    { new: true }
  )
    .populate("campus")
    .populate("academicYear");

  res.status(200).json({ level });
});

// Delete Academic Level (only if belongs to current campus)
export const deleteAcademicLevel = catchAsyncErrors(async (req, res, next) => {
  const { campus } = getContext(req);

  if (!campus) {
    return next(new ErrorHandler("Campus not selected", 400));
  }

  const level = await AcademicLevel.findOne({
    _id: req.params.id,
    campus,
  });

  if (!level) {
    return next(new ErrorHandler("Academic level not found", 404));
  }

  await AcademicLevel.findOneAndDelete({ _id: req.params.id, campus });

  res.status(200).json({
    message: "Academic level deleted successfully",
  });
});