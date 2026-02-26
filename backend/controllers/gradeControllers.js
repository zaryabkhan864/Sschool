// controllers/grade.js
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Grade from "../models/grade.js";
import AcademicLevel from "../models/academicLevel.js"; // assuming this model exists
import ErrorHandler from "../utils/errorHandler.js";
import APIFilters from "../utils/apiFilters.js";

// ============================================================
// Create a new grade  →  /api/v1/grades
// ============================================================
export const newGrade = catchAsyncErrors(async (req, res, next) => {
  const { campus, selectedYear } = req.cookies;
  const { gradeName, academicLevel, description } = req.body;

  // Validate academicLevel if provided
  if (academicLevel) {
    const level = await AcademicLevel.findById(academicLevel);
    if (!level) {
      return next(new ErrorHandler("Academic Level not found", 404));
    }
  }

  const grade = await Grade.create({
    gradeName,
    academicLevel,
    description,
    campus,
    year: selectedYear,
    status: true, // default active
  });

  res.status(201).json({ success: true, grade });
});

// ============================================================
// GET all grades (with filters, pagination, counts)
// ============================================================
export const getGrades = catchAsyncErrors(async (req, res, next) => {
  const { campus, selectedYear } = req.cookies;
  const limit = Number(req.query.limit);
  const isDropdownRequest = limit === 0;

  // Apply campus & year filter (skip for dropdown requests)
  if (campus && !isDropdownRequest) req.query.campus = campus;
  if (selectedYear && !isDropdownRequest) req.query.year = selectedYear;

  // Status filter handling (if provided as "active"/"inactive")
  if (req.query.status) {
    req.query.status = req.query.status === "active" ? true : false;
  }

  // Build base query for counting totals
  const baseApiFilters = new APIFilters(Grade, req.query)
    .setSearchFields(["gradeName", "description"])
    .search()
    .filters()
    .sort();
  const baseQuery = baseApiFilters.query;
  const total = await baseApiFilters.model.countDocuments(baseQuery._conditions);

  // Active/Inactive counts based on status field
  let active = 0,
    deactive = 0;
  try {
    active = await Grade.countDocuments({ ...baseQuery._conditions, status: true });
    deactive = await Grade.countDocuments({ ...baseQuery._conditions, status: false });
  } catch (error) {
    active = total;
    deactive = 0;
  }

  // Build final query with pagination
  const apiFilters = new APIFilters(Grade, req.query)
    .setSearchFields(["gradeName", "description"])
    .search()
    .filters()
    .sort()
    .pagination();

  // Populate related fields: academicLevel and campus
  const populateOptions = [
    { path: "academicLevel", select: "name level" }, // adjust fields as per AcademicLevel schema
    { path: "campus", select: "name" },
  ];
  apiFilters.populate(populateOptions);

  let grades = await apiFilters.query;

  // Additional filtering by keyword if needed (already handled by search, but we might want to search in populated fields)
  // For simplicity, we rely on the base search; you can add extra filtering if required.

  // Pagination metadata
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
    ...(pagination && { pagination: { ...pagination, counts: { total, active, deactive } } }),
    ...(!pagination && { counts: { total, active, deactive } }),
    grades,
  });
});

// ============================================================
// UPDATE grade  →  /api/v1/grades/:id
// ============================================================
export const updateGrade = catchAsyncErrors(async (req, res, next) => {
  let grade = await Grade.findById(req.params.id);
  if (!grade) {
    return next(new ErrorHandler("Grade not found", 404));
  }

  const { campus, selectedYear } = req.cookies;
  const { gradeName, academicLevel, description, status } = req.body;

  // Validate academicLevel if provided
  if (academicLevel) {
    const level = await AcademicLevel.findById(academicLevel);
    if (!level) {
      return next(new ErrorHandler("Academic Level not found", 404));
    }
  }

  // Prepare update data
  const updateData = {
    gradeName,
    academicLevel,
    description,
    campus, // campus may be updated from cookies or kept as is
    year: selectedYear,
    status: status !== undefined ? status : grade.status,
  };

  grade = await Grade.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  }).populate("academicLevel campus");

  res.status(200).json({ success: true, grade });
});

// ============================================================
// DELETE grade  →  /api/v1/grades/:id
// ============================================================
export const deleteGrade = catchAsyncErrors(async (req, res, next) => {
  const grade = await Grade.findById(req.params.id);
  if (!grade) {
    return next(new ErrorHandler("Grade not found", 404));
  }

  // Optionally check for dependencies (e.g., courses linked to this grade) before deleting
  // For now, we just delete
  await Grade.findByIdAndDelete(req.params.id);

  res.status(200).json({ success: true, message: "Grade deleted successfully" });
});

// ============================================================
// GET single grade details  →  /api/v1/grades/:id
// ============================================================
export const getGradeDetails = catchAsyncErrors(async (req, res, next) => {
  const grade = await Grade.findById(req.params.id)
    .populate("academicLevel", "name level")
    .populate("campus", "name");

  if (!grade) {
    return next(new ErrorHandler("Grade not found", 404));
  }

  res.status(200).json({ success: true, grade });
});

export const getGradesByAcademicLevel = catchAsyncErrors(async (req, res, next) => {
  const { campus, selectedYear } = req.cookies;
  const { academicLevelId } = req.params;   // e.g., /api/v1/grades/by-academic-level/:academicLevelId

  if (!academicLevelId) {
    return next(new ErrorHandler("Academic Level ID is required", 400));
  }

  // Find grades that match campus, year, and the given academic level
  const grades = await Grade.find({
    academicLevel: academicLevelId,
    campus,
    year: selectedYear,
    // status: true   // optionally include if you want only active
  }).populate("academicLevel", "name level")
    .populate("campus", "name");

  res.status(200).json({
    success: true,
    grades,
  });
});