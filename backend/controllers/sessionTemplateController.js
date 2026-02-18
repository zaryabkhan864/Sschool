import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import SessionTemplate from "../models/sessionTemplate.js";
import ErrorHandler from "../utils/errorHandler.js";

// ✅ NEW – create session template (پہلے جیسا ہی ہے)
export const newSessionTemplate = catchAsyncErrors(async (req, res) => {
  const { campus, selectedYear } = req.cookies;

  if (!campus || !selectedYear) {
    return res.status(400).json({
      success: false,
      message: "Campus and year cookies are required",
    });
  }

  const {
    name,
    type,
    order,
    startTime,
    endTime,
    academicLevel,
    year,
  } = req.body;

  if (!name || !order || !startTime || !endTime || !academicLevel) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  const sessionYear = year || parseInt(selectedYear);

  const existing = await SessionTemplate.findOne({
    name,
    campus,
    year: sessionYear,
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
    year: sessionYear,
  });

  res.status(201).json({
    success: true,
    session,
  });
});


export const getSessionTemplates = catchAsyncErrors(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    keyword = "",
    campus,
    year,
    academicLevel,
    // getAll = false,   // 👈 (optional) agar purana flag bhi support karna ho to rakh sakte hain
  } = req.query;

  // 🆕 dropdown flag aur limit 0 ka check
  const dropdown = req.query.dropdown === 'true';      // ✅ explicit dropdown flag
  const isDropdownRequest = dropdown || Number(limit) === 0; // ✅ dono conditions

  // 🆕 dropdown ko query se hatao taake model filter mein na jaye
  delete req.query.dropdown;

  // Filter object (same as before)
  const filter = {};

  if (campus) filter.campus = campus;
  if (year) filter.year = parseInt(year);
  if (academicLevel) filter.academicLevel = academicLevel;
  if (keyword) {
    filter.name = { $regex: keyword, $options: "i" };
  }

  // Base query build karo
  let query = SessionTemplate.find(filter)
    .populate("academicLevel")
    .populate("campus")
    .sort({ order: 1 });

  // 🔁 Agar dropdown request hai to saare records bhejo (bina pagination)
  if (isDropdownRequest) {
    const sessions = await query;
    return res.status(200).json({
      success: true,
      sessions,
      count: sessions.length,          // total count bhi bhejo
    });
  }

  // Varna pagination apply karo
  const pageNumber = parseInt(page);
  const pageSize = parseInt(limit);
  const skip = (pageNumber - 1) * pageSize;

  const total = await SessionTemplate.countDocuments(filter);
  const sessions = await query.skip(skip).limit(pageSize);

  res.status(200).json({
    success: true,
    sessions,
    pagination: {
      page: pageNumber,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
});

// ✅ UPDATE – پہلے جیسا
export const updateSessionTemplate = catchAsyncErrors(async (req, res, next) => {
  let session = await SessionTemplate.findById(req.params.id);

  if (!session) {
    return next(new ErrorHandler("Session template not found", 404));
  }

  session = await SessionTemplate.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json({ session });
});

// ✅ DELETE – پہلے جیسا
export const deleteSessionTemplate = catchAsyncErrors(async (req, res, next) => {
  const session = await SessionTemplate.findById(req.params.id);

  if (!session) {
    return next(new ErrorHandler("Session template not found", 404));
  }

  await SessionTemplate.findByIdAndDelete(req.params.id);

  res.status(200).json({
    message: "Session template deleted successfully",
  });
});