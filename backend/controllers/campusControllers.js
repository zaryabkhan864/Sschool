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
// backend/controllers/campusController.js
export const getCampus = catchAsyncErrors(async (req, res, next) => {
  const limit = Number(req.query.limit);

  const isDropdownRequest =
    limit === 0 ||
    req.query.paginate === "false" ||
    req.query.paginate === false;

  // ✅ Sahi status mapping: "active"/"inactive", warna koi filter nahi
  let statusFilterApplied = false;
  if (req.query.status === "active") {
    req.query.isActive = true;
    delete req.query.status;
    statusFilterApplied = true;
  } else if (req.query.status === "inactive") {
    req.query.isActive = false;
    delete req.query.status;
    statusFilterApplied = true;
  } else {
    // Agar "All Status" ya undefined, toh status query hata do
    delete req.query.status;
  }

  // === Pehle overall stats nikaalo (bina status filter ke) ===
  // Search + filters apply karo but isActive condition hatado
  const { status: _, isActive: __, ...queryWithoutStatus } = req.query;
  const baseQueryForStats = new APIFilters(Campus, queryWithoutStatus)
    .setSearchFields(["name", "location", "code"])
    .search()
    .filters();  // yahan status ya isActive nahi hoga

  const overallConditions = baseQueryForStats.query._conditions;

  const totalOverall = await Campus.countDocuments(overallConditions);
  const activeOverall = await Campus.countDocuments({
    ...overallConditions,
    isActive: true,
  });
  const deactiveOverall = await Campus.countDocuments({
    ...overallConditions,
    isActive: false,
  });

  // === Ab actual data ka query banao (with status filter if applied) ===
  const apiFilters = new APIFilters(Campus, req.query)
    .setSearchFields(["name", "location", "code"])
    .search()
    .filters()
    .sort();

  if (!isDropdownRequest) {
    apiFilters.pagination();
  }

  const campuses = await apiFilters.query;

  // === Pagination response (includes overall counts) ===
  let pagination = null;
  if (!isDropdownRequest) {
    pagination = {
      total: totalOverall,           // overall total
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
        counts: {
          total: totalOverall,
          active: activeOverall,
          deactive: deactiveOverall,
        },
      },
    }),
    ...(!pagination && {
      counts: {
        total: totalOverall,
        active: activeOverall,
        deactive: deactiveOverall,
      },
    }),
    campuses,
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

// Get single campus
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

// Set campus token
export const setCampusIDinToken = catchAsyncErrors(async (req, res, next) => {
  const campus = await Campus.findById(req.params.id);

  if (!campus) {
    return next(new ErrorHandler("Campus not found", 404));
  }

  sendCampusIDToken(campus, 200, res);
});

// ❌ HARD DELETE hatao
// ✅ SOFT DELETE use karo
export const deleteCampus = catchAsyncErrors(async (req, res, next) => {
  const campus = await Campus.findById(req.params.id);

  if (!campus) {
    return next(new ErrorHandler("Campus not found", 404));
  }

  campus.isActive = false;
  await campus.save();

  res.status(200).json({
    success: true,
    message: "Campus deactivated successfully",
  });
});