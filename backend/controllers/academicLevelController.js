import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import AcademicLevel from "../models/academicLevel.js";
import APIFilters from "../utils/apiFilters.js";
import ErrorHandler from "../utils/errorHandler.js";

// Helper: get academicYear and campus from query params or cookies
const getContext = (req) => {
  const academicYear = req.query.academicYear || req.cookies.academicYear;
  const campus = req.query.campus || req.cookies.campus;
  return { academicYear, campus };
};

// Create Academic Level => /api/v1/admin/academic-level
export const newAcademicLevel = catchAsyncErrors(async (req, res, next) => {
  const { academicYear, campus } = getContext(req);

  if (!academicYear) {
    return next(new ErrorHandler("Academic Year not selected", 400));
  }
  if (!campus) {
    return next(new ErrorHandler("Campus not selected", 400));
  }

  const level = await AcademicLevel.create({
    ...req.body,
    campus,
    academicYear,
  });

  // ✅ FIX: 201 for resource creation (was 200)
  res.status(201).json({ success: true, level });
});

// Get all Academic Levels => /api/v1/academic-level
export const getAcademicLevels = catchAsyncErrors(async (req, res, next) => {
  const { academicYear, campus } = getContext(req);

  if (!academicYear) {
    return next(new ErrorHandler("Academic Year not selected", 400));
  }
  if (!campus) {
    return next(new ErrorHandler("Campus not selected", 400));
  }

  // No pagination — return all (for dropdowns, selects)
  if (req.query.paginate === "false") {
    const levels = await AcademicLevel.find({ campus, academicYear })
      .populate("campus")
      .populate("academicYear")
      .sort({ order: 1 });

    return res.status(200).json({ success: true, levels });
  }

  // ✅ FIX: respect limit from query (was hardcoded resPerPage=10)
  const resPerPage = parseInt(req.query.limit) || 10;

  const baseQuery = AcademicLevel.find({ campus, academicYear });
  const apiFilters = new APIFilters(baseQuery, req.query).search().filters();

  // Count before pagination
  const filteredCount = await AcademicLevel.countDocuments(
    apiFilters.query.getFilter()
  );

  apiFilters.pagination(resPerPage);

  const levels = await apiFilters.query
    .populate("campus")
    .populate("academicYear")
    .sort({ order: 1 });

  // ✅ FIX: success:true added
  res.status(200).json({
    success: true,
    resPerPage,
    filteredCount,
    levels,
  });
});

// Get single Academic Level => /api/v1/academic-level/:id
export const getAcademicLevelDetails = catchAsyncErrors(async (req, res, next) => {
  const { campus } = getContext(req);

  if (!campus) {
    return next(new ErrorHandler("Campus not selected", 400));
  }

  const level = await AcademicLevel.findOne({ _id: req.params.id, campus })
    .populate("campus")
    .populate("academicYear");

  if (!level) {
    return next(new ErrorHandler("Academic level not found", 404));
  }

  // ✅ FIX: success:true added
  res.status(200).json({ success: true, level });
});

// Update Academic Level => /api/v1/admin/academic-level/:id
export const updateAcademicLevel = catchAsyncErrors(async (req, res, next) => {
  const { campus } = getContext(req);

  if (!campus) {
    return next(new ErrorHandler("Campus not selected", 400));
  }

  const existing = await AcademicLevel.findOne({ _id: req.params.id, campus });

  if (!existing) {
    return next(new ErrorHandler("Academic level not found", 404));
  }

  const level = await AcademicLevel.findOneAndUpdate(
    { _id: req.params.id, campus },
    req.body,
    { new: true, runValidators: true }
  )
    .populate("campus")
    .populate("academicYear");

  // ✅ FIX: success:true added
  res.status(200).json({ success: true, level });
});

// Delete Academic Level => /api/v1/admin/academic-level/:id
export const deleteAcademicLevel = catchAsyncErrors(async (req, res, next) => {
  const { campus } = getContext(req);

  if (!campus) {
    return next(new ErrorHandler("Campus not selected", 400));
  }

  const level = await AcademicLevel.findOne({ _id: req.params.id, campus });

  if (!level) {
    return next(new ErrorHandler("Academic level not found", 404));
  }

  await AcademicLevel.findOneAndDelete({ _id: req.params.id, campus });

  // ✅ FIX: success:true added
  res.status(200).json({ success: true, message: "Academic level deleted successfully" });
});
