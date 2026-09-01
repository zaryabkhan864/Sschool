import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import SessionTemplate from "../models/sessionTemplate.js";
import ErrorHandler from "../utils/errorHandler.js";
import APIFilters from "../utils/apiFilters.js";

// ============================================================
// Create a new session template
// ============================================================
export const newSessionTemplate = catchAsyncErrors(async (req, res, next) => {
  const { campus, academicYear } = req.cookies;

  if (!campus || !academicYear) {
    return res.status(400).json({
      success: false,
      message: "Campus and year cookies are required",
    });
  }

  const { name, type, order, startTime, endTime, academicLevel } = req.body;

  if (!name || !order || !startTime || !endTime || !academicLevel) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  const existing = await SessionTemplate.findOne({
    name,
    campus,
    academicYear,
    academicLevel,
  });

  if (existing) {
    return res.status(400).json({
      success: false,
      message: `Session template "${name}" already exists for this campus, year and academic level`,
    });
  }

  const session = await SessionTemplate.create({
    name,
    type: type || "CLASS",
    order,
    startTime,
    endTime,
    academicLevel,
    campus,
    academicYear,
  });

  res.status(201).json({
    success: true,
    session,
  });
});

// ============================================================
// Get all session templates (with pagination, filters, search)
// ============================================================
export const getSessionTemplates = catchAsyncErrors(async (req, res, next) => {
  const { campus, academicYear } = req.cookies;

  if (!campus || !academicYear) {
    return res.status(400).json({
      success: false,
      message: "Campus and year cookies are required",
    });
  }

  // Always filter by campus and academic year from cookies
  req.query.campus = campus;
  req.query.academicYear = academicYear;

  // Apply APIFilters for search, filters, sort, pagination
  const baseApiFilters = new APIFilters(SessionTemplate, req.query)
    .setSearchFields(["name", "type"]) // searchable fields
    .search()
    .filters()
    .sort(); // default sort by order (will be handled in model schema)

  const baseQuery = baseApiFilters.query;

  // Total count for pagination
  const total = await SessionTemplate.countDocuments(baseQuery._conditions);

  // Apply pagination
  const apiFilters = new APIFilters(SessionTemplate, req.query)
    .setSearchFields(["name", "type"])
    .search()
    .filters()
    .sort()
    .pagination();

  // Populate academic level, campus and academic year
  const populateOptions = [
    { path: "academicLevel", select: "name code" },
    { path: "campus", select: "name" },
    { path: "academicYear", select: "name" }, // so the frontend can show a readable year label
  ];
  apiFilters.populate(populateOptions);

  const sessions = await apiFilters.query;

  let pagination = null;
  if (apiFilters.shouldPaginate) {
    pagination = {
      total,
      page: apiFilters.page,
      limit: apiFilters.limit,
      totalPages: Math.ceil(total / apiFilters.limit),
    };
  }

  res.status(200).json({
    success: true,
    ...(pagination && { pagination }),
    sessions,
    count: total, // total number of sessions (useful for stats)
  });
});

// ============================================================
// Update session template
// ============================================================
export const updateSessionTemplate = catchAsyncErrors(async (req, res, next) => {
  const { campus, academicYear } = req.cookies;

  if (!campus || !academicYear) {
    return res.status(400).json({
      success: false,
      message: "Campus and year cookies are required",
    });
  }

  let session = await SessionTemplate.findById(req.params.id);
  if (!session) {
    return next(new ErrorHandler("Session template not found", 404));
  }

  const { name, type, order, startTime, endTime, academicLevel } = req.body;

  const updateData = {
    name,
    type,
    order,
    startTime,
    endTime,
    academicLevel,
    academicYear, // keep in sync with the current cookie context
    campus, // ensure campus remains consistent
  };

  session = await SessionTemplate.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  }).populate("academicLevel campus academicYear");

  res.status(200).json({ success: true, session });
});

// ============================================================
// Delete session template
// ============================================================
export const deleteSessionTemplate = catchAsyncErrors(async (req, res, next) => {
  const session = await SessionTemplate.findById(req.params.id);
  if (!session) {
    return next(new ErrorHandler("Session template not found", 404));
  }

  await SessionTemplate.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Session template deleted successfully",
  });
});
