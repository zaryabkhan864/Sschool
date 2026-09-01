import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Campus from "../models/campus.js";
import APIFilters from "../utils/apiFilters.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendCampusIDToken from "../utils/sendCampusIDToken.js";

// Create new campus => /api/v1/admin/campus
export const newCampus = catchAsyncErrors(async (req, res, next) => {
  const campus = await Campus.create(req.body);

  res.status(201).json({
    success: true,
    campus,
  });
});

// Get all campuses => /api/v1/campus
export const getCampus = catchAsyncErrors(async (req, res, next) => {
  const limit = Number(req.query.limit);

  const isDropdownRequest =
    limit === 0 ||
    req.query.paginate === "false" ||
    req.query.paginate === false;

  // Status mapping: "active"/"inactive" → isActive boolean
  if (req.query.status === "active") {
    req.query.isActive = true;
    delete req.query.status;
  } else if (req.query.status === "inactive") {
    req.query.isActive = false;
    delete req.query.status;
  } else {
    delete req.query.status;
  }

  // Overall stats (without status filter)
  const { isActive: __, ...queryWithoutStatus } = req.query;
  const baseQueryForStats = new APIFilters(Campus, queryWithoutStatus)
    .setSearchFields(["name", "location", "code"])
    .search()
    .filters();

  const overallConditions = baseQueryForStats.query._conditions;
  const totalOverall = await Campus.countDocuments(overallConditions);
  const activeOverall = await Campus.countDocuments({ ...overallConditions, isActive: true });
  const deactiveOverall = await Campus.countDocuments({ ...overallConditions, isActive: false });

  // Actual data query (with status filter if applied)
  const apiFilters = new APIFilters(Campus, req.query)
    .setSearchFields(["name", "location", "code"])
    .search()
    .filters()
    .sort();

  if (!isDropdownRequest) {
    apiFilters.pagination();
  }

  const campuses = await apiFilters.query;

  let pagination = null;
  if (!isDropdownRequest) {
    pagination = {
      total: totalOverall,
      page: apiFilters.page,
      limit: apiFilters.limit,
      totalPages: Math.ceil(totalOverall / apiFilters.limit),
    };
  }

  res.status(200).json({
    success: true,
    ...(pagination && {
      pagination: {
        ...pagination,
        counts: { total: totalOverall, active: activeOverall, deactive: deactiveOverall },
      },
    }),
    ...(!pagination && {
      counts: { total: totalOverall, active: activeOverall, deactive: deactiveOverall },
    }),
    campuses,
  });
});

// Get single campus => /api/v1/campus/:id
export const getCampusDetails = catchAsyncErrors(async (req, res, next) => {
  const campus = await Campus.findById(req.params.id);

  if (!campus) {
    return next(new ErrorHandler("Campus not found", 404));
  }

  res.status(200).json({
    success: true,
    campus,
  });
});

// Update campus => /api/v1/admin/campus/:id
export const updateCampus = catchAsyncErrors(async (req, res, next) => {
  let campus = await Campus.findById(req.params.id);

  if (!campus) {
    return next(new ErrorHandler("Campus not found", 404));
  }

  campus = await Campus.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    campus,
  });
});

// Delete campus => /api/v1/admin/campus/:id
export const deleteCampus = catchAsyncErrors(async (req, res, next) => {
  const campus = await Campus.findByIdAndDelete(req.params.id);

  if (!campus) {
    return next(new ErrorHandler("Campus not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Campus deleted successfully",
  });
});

// Set campus token => /api/v1/campus/token/:id
export const setCampusIDinToken = catchAsyncErrors(async (req, res, next) => {
  const campus = await Campus.findById(req.params.id);

  if (!campus) {
    return next(new ErrorHandler("Campus not found", 404));
  }

  sendCampusIDToken(campus, 200, res);
});
