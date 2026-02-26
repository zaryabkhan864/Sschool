import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Campus from "../models/campus.js";
import APIFilters from "../utils/apiFilters.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendCampusIDToken from "../utils/sendCampusIDToken.js";


// Create new campus => /api/v1/campus
export const newCampus = catchAsyncErrors(async (req, res, next) => {
  const campus = await Campus.create( req.body);
  res.status(200).json({
    campus,
  });
});

//Create get all campus => /api/v1/campus
export const getCampus = catchAsyncErrors(async (req, res, next) => {
  // Determine if this is a “dropdown” request (no pagination, no extra filters)
  const limit = Number(req.query.limit);
  const isDropdownRequest =
    limit === 0 ||
    req.query.paginate === 'false' ||
    req.query.paginate === false;

  if (req.query.status) {
    req.query.status = req.query.status === 'active';
  }

  // ---------- Base query for counting (total, active, deactive) ----------
  const baseApiFilters = new APIFilters(Campus, req.query)
    .setSearchFields(['name', 'location', 'address']) // adjust fields as per your schema
    .search()
    .filters()
    .sort();

  const baseQuery = baseApiFilters.query;
  const total = await baseApiFilters.model.countDocuments(baseQuery._conditions);

  // Count active / deactive (if status field exists, otherwise fallback)
  let active = 0,
    deactive = 0;
  try {
    active = await Campus.countDocuments({ ...baseQuery._conditions, status: true });
    deactive = await Campus.countDocuments({ ...baseQuery._conditions, status: false });
  } catch (error) {
    // Status field probably doesn't exist – fallback to total only
    active = total;
    deactive = 0;
  }

  // ---------- Query for actual data (with pagination unless it's a dropdown) ----------
  const apiFilters = new APIFilters(Campus, req.query)
    .setSearchFields(['name', 'location', 'address'])
    .search()
    .filters()
    .sort();

  if (!isDropdownRequest) {
    apiFilters.pagination(); // uses req.query.limit internally
  }

  // (Optional) Populate relations if needed – e.g., courses, users, etc.
  // const populateOptions = [{ path: 'courses', select: 'name' }];
  // apiFilters.populate(populateOptions);

  let campuses = await apiFilters.query;

  // ---------- Client‑side keyword filtering (searches teacher name etc.) ----------
  let finalCampuses = campuses;
  if (req.query.keyword && req.query.keyword.trim()) {
    const keyword = req.query.keyword.trim().toLowerCase();
    finalCampuses = campuses.filter((campus) => {
      return (
        campus.name?.toLowerCase().includes(keyword) ||
        campus.location?.toLowerCase().includes(keyword) ||
        campus.address?.toLowerCase().includes(keyword)
        // add more fields as needed
      );
    });

    // If it's a dropdown request, we already have all records, so update counts
    if (isDropdownRequest) {
      const filteredActive = finalCampuses.filter((c) => c.status !== false).length;
      const filteredDeactive = finalCampuses.filter((c) => c.status === false).length;
      active = filteredActive;
      deactive = filteredDeactive;
      total = finalCampuses.length;
    }
  }

  // ---------- Build pagination metadata ----------
  let pagination = null;
  if (!isDropdownRequest) {
    pagination = {
      total,
      page: apiFilters.page,
      limit: apiFilters.limit,
      totalPages: Math.ceil(total / apiFilters.limit),
    };
  }

  // ---------- Send response ----------
  res.status(200).json({
    success: true,
    ...(pagination && { pagination: { ...pagination, counts: { total, active, deactive } } }),
    ...(!pagination && { counts: { total, active, deactive } }),
    campuses: finalCampuses,
  });
});



// Update campus => /api/v1/campus/:id
export const updateCampus = catchAsyncErrors(async (req, res, next) => {
  let campus = await Campus.findById(req?.params?.id);

  if (!campus) {
    return next(new ErrorHandler("campus not found", 404));
  }

  campus = await Campus.findByIdAndUpdate(
    req?.params?.id,
    req.body,
    {
      new: true,
    }
  );

  res.status(200).json({
    campus,
  });
});

// Get single campus details => /api/v1/campus/:id
export const getCampusDetails = catchAsyncErrors(async (req, res) => {
  const campus = await Campus.findById(req?.params?.id);

  if (!campus) {
    return next(new ErrorHandler("Campus not found", 404));
  }

  res.status(200).json({
    campus,
  });
});


// Set campus ID in the token and update cookie
export const setCampusIDinToken = catchAsyncErrors(async (req, res, next) => {
  const campusID = await Campus.findById(req?.params?.id);
  if (!campusID) {
    return next(new ErrorHandler("Campus not found", 404));
  }

  // Call the utility function and pass status code 200
  sendCampusIDToken(campusID, 200, res);
});

// Delete campus => /api/v1/campus/:id
export const deleteCampus = catchAsyncErrors(async (req, res, next) => {
  const campus = await Campus.findById(req?.params?.id);
  if (!campus) {
    return next(new ErrorHandler("Campus not found", 404));
  }
  await Campus.findOneAndDelete({ _id: req?.params?.id });
  res.status(200).json({
    message: "Campus deleted successfully",
  });
});
