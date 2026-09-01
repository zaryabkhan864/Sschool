import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import WeekDay from "../models/weekDay.js";
import APIFilters from "../utils/apiFilters.js";
import ErrorHandler from "../utils/errorHandler.js";

// ➕ Create Week Day
export const newWeekDay = catchAsyncErrors(async (req, res) => {
  const { campus, academicYear } = req.cookies;

  const data = {
    ...req.body,
    campus,
    academicYear,
  };

  const day = await WeekDay.create(data);
  res.status(200).json({ day });
});

// 📋 Get all Week Days (with pagination, search, filtering)
export const getWeekDays = catchAsyncErrors(async (req, res) => {
  const { campus, academicYear } = req.cookies;

  // ---------- Base filter: always filter by campus and academicYear ----------
  let baseFilter = { campus, academicYear };

  // ---------- Handle additional query filters (only schema fields) ----------
  const allowedFilters = ["isWorkingDay"]; // extend if you add more filterable fields
  const filters = {};
  allowedFilters.forEach((field) => {
    if (req.query[field] !== undefined) filters[field] = req.query[field];
  });

  // Merge with base campus & academicYear filter
  const queryFilters = { ...baseFilter, ...filters };

  // ---------- APIFilters instance ----------
  const apiFilters = new APIFilters(WeekDay, queryFilters)
    .search();               // searches in "name" and "shortName" (must be defined in APIFilters.search())

  // ---------- Sorting ----------
  apiFilters.query = apiFilters.query.sort({ order: 1 });

  // ---------- Count total documents (after search & filters, before pagination) ----------
  const total = await apiFilters.query.clone().countDocuments();

  // ---------- Pagination (unless disabled) ----------
  let days;
  let resPerPage = 10;
  let currentPage = 1;

  if (req.query.paginate === "false") {
    // No pagination – return all
    days = await apiFilters.query;
  } else {
    // Pagination active
    resPerPage = parseInt(req.query.limit) || 10;
    currentPage = parseInt(req.query.page) || 1;

    apiFilters.pagination(resPerPage, currentPage);
    days = await apiFilters.query.clone();
  }

  // ---------- Response with pagination object (compatible with frontend) ----------
  res.status(200).json({
    success: true,
    days,
    pagination: {
      total,
      page: currentPage,
      limit: resPerPage,
      pages: Math.ceil(total / resPerPage),
    },
  });
});

// 🔍 Get Single Week Day Details
export const getWeekDayDetails = catchAsyncErrors(async (req, res, next) => {
  const { campus, academicYear } = req.cookies;

  const day = await WeekDay.findOne({
    _id: req.params.id,
    campus,
    academicYear,
  });

  if (!day) {
    return next(new ErrorHandler("Week day not found", 404));
  }

  res.status(200).json({ day });
});

// ✏️ Update Week Day
export const updateWeekDay = catchAsyncErrors(async (req, res, next) => {
  const { campus, academicYear } = req.cookies;

  let day = await WeekDay.findOne({
    _id: req.params.id,
    campus,
    academicYear,
  });

  if (!day) {
    return next(new ErrorHandler("Week day not found", 404));
  }

  day = await WeekDay.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json({ day });
});

// ❌ Delete Week Day
export const deleteWeekDay = catchAsyncErrors(async (req, res, next) => {
  const { campus, academicYear } = req.cookies;

  const day = await WeekDay.findOne({
    _id: req.params.id,
    campus,
    academicYear,
  });

  if (!day) {
    return next(new ErrorHandler("Week day not found", 404));
  }

  await WeekDay.findByIdAndDelete(req.params.id);

  res.status(200).json({
    message: "Week day deleted successfully",
  });
});