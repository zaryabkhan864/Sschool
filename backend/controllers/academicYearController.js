import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import APIFilters from "../utils/apiFilters.js";
import AcademicYear from "../models/academicYear.js";

// Helper: get campus from cookie
const getCampusFilter = (req) => {
  const campus = req.cookies?.campus;
  if (!campus) {
    throw new ErrorHandler("Please select a campus first", 400);
  }
  return campus;
};

// Create academic year => /api/v1/admin/academic-years
export const createAcademicYear = catchAsyncErrors(async (req, res, next) => {
  const campus = getCampusFilter(req);
  const { name, startDate, endDate, isCurrent } = req.body;

  // campus is only taken from cookie, never from req.body
  const year = await AcademicYear.create({
    name,
    startDate,
    endDate,
    isCurrent,
    campus,
  });

  res.status(201).json({
    success: true,
    year,
  });
});

// Get all academic years (scoped to campus) => /api/v1/academic-years
export const getAcademicYears = catchAsyncErrors(async (req, res, next) => {
  const campus = getCampusFilter(req);
  req.query.campus = campus;

  if (!req.query.sort) {
    req.query.sort = "name";
  }

  const limit = Number(req.query.limit);
  const isDropdownRequest = limit === 0;

  // Base query for counts
  const baseApiFilters = new APIFilters(AcademicYear, req.query)
    .setSearchFields(["name"])
    .search()
    .filters()
    .sort();

  const baseQuery = baseApiFilters.query;
  const total = await AcademicYear.countDocuments(baseQuery._conditions);

  let current = 0;
  let notCurrent = 0;
  try {
    current = await AcademicYear.countDocuments({ ...baseQuery._conditions, isCurrent: true });
    notCurrent = await AcademicYear.countDocuments({ ...baseQuery._conditions, isCurrent: false });
  } catch (error) {
    current = total;
    notCurrent = 0;
  }

  // Query with pagination
  const apiFilters = new APIFilters(AcademicYear, req.query)
    .setSearchFields(["name"])
    .search()
    .filters()
    .sort()
    .pagination();

  const years = await apiFilters.query;

  let pagination = null;
  if (apiFilters.shouldPaginate) {
    pagination = {
      total: years.length,
      page: apiFilters.page,
      limit: apiFilters.limit,
      totalPages: Math.ceil(total / apiFilters.limit),
    };
  }

  res.status(200).json({
    success: true,
    ...(pagination && {
      pagination: { ...pagination, counts: { total, current, notCurrent } },
    }),
    ...(!pagination && { counts: { total, current, notCurrent } }),
    academicYears: years,
  });
});

// Get single academic year => /api/v1/academic-years/:id
export const getAcademicYearDetails = catchAsyncErrors(async (req, res, next) => {
  const campus = getCampusFilter(req);

  const academicYear = await AcademicYear.findById(req.params.id);
  if (!academicYear) {
    return next(new ErrorHandler("Academic year not found", 404));
  }

  if (academicYear.campus.toString() !== campus.toString()) {
    return next(new ErrorHandler("Not authorised to view this academic year", 403));
  }

  res.status(200).json({
    success: true,
    academicYear,
  });
});

// Update academic year => /api/v1/admin/academic-years/:id
export const updateAcademicYear = catchAsyncErrors(async (req, res, next) => {
  const campus = getCampusFilter(req);

  let academicYear = await AcademicYear.findById(req.params.id);
  if (!academicYear) {
    return next(new ErrorHandler("Academic year not found", 404));
  }

  if (academicYear.campus.toString() !== campus.toString()) {
    return next(new ErrorHandler("Not authorised to update this academic year", 403));
  }

  const { name, startDate, endDate, isCurrent } = req.body;

  academicYear.name = name ?? academicYear.name;
  academicYear.startDate = startDate ?? academicYear.startDate;
  academicYear.endDate = endDate ?? academicYear.endDate;
  academicYear.isCurrent = isCurrent ?? academicYear.isCurrent;

  await academicYear.save(); // pre-save hook handles current year logic

  res.status(200).json({
    success: true,
    academicYear,
  });
});

// Delete academic year => /api/v1/admin/academic-years/:id
export const deleteAcademicYear = catchAsyncErrors(async (req, res, next) => {
  const campus = getCampusFilter(req);

  const academicYear = await AcademicYear.findById(req.params.id);
  if (!academicYear) {
    return next(new ErrorHandler("Academic year not found", 404));
  }

  if (academicYear.campus.toString() !== campus.toString()) {
    return next(new ErrorHandler("Not authorised to delete this academic year", 403));
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

// Get academic years list for dropdowns => /api/v1/academic-years/list
export const getAcademicYearsList = catchAsyncErrors(async (req, res, next) => {
  const campus = getCampusFilter(req);
  const limit = parseInt(req.query.limit) || 10;

  req.query.campus = campus;

  const apiFilters = new APIFilters(AcademicYear, req.query)
    .setSearchFields(["name"])
    .search()
    .filters()
    .sort();

  const years = await apiFilters.query.limit(limit);

  res.status(200).json({
    success: true,
    academicYears: years,
  });
});
