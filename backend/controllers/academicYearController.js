import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import APIFilters from "../utils/apiFilters.js";
import AcademicYear from "../models/academicYear.js";

// ============================================================
// CREATE academic year
// ============================================================
export const createAcademicYear = catchAsyncErrors(async (req, res, next) => {
  const { name, startDate, endDate, isCurrent } = req.body;

  const year = await AcademicYear.create({
    name,
    startDate,
    endDate,
    isCurrent,
  });

  res.status(201).json({
    success: true,
    year,
  });
});

// ============================================================
// GET all academic years (with filters, pagination, counts)
// ============================================================
export const getAcademicYears = catchAsyncErrors(async (req, res, next) => {
  const limit = Number(req.query.limit);
  const isDropdownRequest = limit === 0;

  const baseApiFilters = new APIFilters(AcademicYear, req.query)
    .setSearchFields(["name"])
    .search()
    .filters()
    .sort();
  const baseQuery = baseApiFilters.query;
  const total = await baseApiFilters.model.countDocuments(baseQuery._conditions);

  let current = 0,
    notCurrent = 0;
  try {
    current = await AcademicYear.countDocuments({ ...baseQuery._conditions, isCurrent: true });
    notCurrent = await AcademicYear.countDocuments({ ...baseQuery._conditions, isCurrent: false });
  } catch (error) {
    current = total;
    notCurrent = 0;
  }

  const apiFilters = new APIFilters(AcademicYear, req.query)
    .setSearchFields(["name"])
    .search()
    .filters()
    .sort()
    .pagination();

  let years = await apiFilters.query;

  let finalYears = years;
  if (req.query.keyword && req.query.keyword.trim()) {
    const keyword = req.query.keyword.trim().toLowerCase();
    finalYears = years.filter((year) => {
      return (
        year.name?.toLowerCase().includes(keyword) ||
        (year.startDate &&
          new Date(year.startDate).toLocaleDateString().includes(keyword)) ||
        (year.endDate &&
          new Date(year.endDate).toLocaleDateString().includes(keyword))
      );
    });
  }

  let pagination = null;
  if (apiFilters.shouldPaginate) {
    pagination = {
      total: finalYears.length,
      page: apiFilters.page,
      limit: apiFilters.limit,
      totalPages: Math.ceil(total / apiFilters.limit),
    };
  }

  res.status(200).json({
    success: true,
    ...(pagination && { pagination: { ...pagination, counts: { total, current, notCurrent } } }),
    ...(!pagination && { counts: { total, current, notCurrent } }),
    academicYears: finalYears,
  });
});

// ============================================================
// UPDATE academic year
// ============================================================
export const updateAcademicYear = catchAsyncErrors(async (req, res, next) => {
  let academicYear = await AcademicYear.findById(req.params.id);
  if (!academicYear) {
    return next(new ErrorHandler("Academic year not found", 404));
  }

  const { name, startDate, endDate, isCurrent } = req.body;

  // Update only allowed fields
  academicYear.name = name ?? academicYear.name;
  academicYear.startDate = startDate ?? academicYear.startDate;
  academicYear.endDate = endDate ?? academicYear.endDate;
  academicYear.isCurrent = isCurrent ?? academicYear.isCurrent;

  await academicYear.save(); // pre-save middleware will auto-unset previous current

  res.status(200).json({
    success: true,
    academicYear,
  });
});

// ============================================================
// DELETE academic year
// ============================================================
export const deleteAcademicYear = catchAsyncErrors(async (req, res, next) => {
  const academicYear = await AcademicYear.findById(req.params.id);
  if (!academicYear) {
    return next(new ErrorHandler("Academic year not found", 404));
  }

  if (academicYear.isCurrent) {
    return next(new ErrorHandler("Cannot delete the current academic year", 400));
  }

  await AcademicYear.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Academic year deleted successfully",
  });
});

// ============================================================
// GET single academic year details
// ============================================================
export const getAcademicYearDetails = catchAsyncErrors(async (req, res, next) => {
  const academicYear = await AcademicYear.findById(req.params.id);
  if (!academicYear) {
    return next(new ErrorHandler("Academic year not found", 404));
  }

  res.status(200).json({
    success: true,
    academicYear,
  });
});

// ============================================================
// GET academic years list (for dropdowns, with limit)
// ============================================================
export const getAcademicYearsList = catchAsyncErrors(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;

  const apiFilters = new APIFilters(AcademicYear, req.query)
    .setSearchFields(["name"])
    .search()
    .filters()
    .sort();

  let years = await apiFilters.query.limit(limit);

  res.status(200).json({
    success: true,
    academicYears: years,
  });
});