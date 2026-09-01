import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import DaySessionConfig from "../models/daySessionConfig.js";
import WeekDay from "../models/weekDay.js";          // 👈 added for lookup
import ErrorHandler from "../utils/errorHandler.js";

// ---------- Helper: resolve weekday string to ObjectId ----------
const resolveWeekDay = async (weekDayInput, next) => {
  // If it's already a valid ObjectId, assume it's the _id
  if (weekDayInput.match(/^[0-9a-fA-F]{24}$/)) {
    return weekDayInput;
  }

  // Otherwise treat as day name (case-insensitive)
  const weekDayDoc = await WeekDay.findOne({
    name: { $regex: new RegExp(`^${weekDayInput}$`, "i") },
  });

  if (!weekDayDoc) {
    return next(new ErrorHandler(`Week day "${weekDayInput}" not found`, 404));
  }

  return weekDayDoc._id;
};

// ✅ CREATE – now accepts weekday as name or ID
export const newDaySessionConfig = catchAsyncErrors(async (req, res, next) => {
  const { campus, academicYear } = req.cookies;
  if (!campus || !academicYear) {
    return res.status(400).json({
      success: false,
      message: "Campus and year cookies are required",
    });
  }

  let { academicLevel, weekDay, sessions, year } = req.body;
  if (!academicLevel || !weekDay) {
    return res.status(400).json({
      success: false,
      message: "Academic level and week day are required",
    });
  }

  // --- Convert weekday name → ObjectId if needed ---
  weekDay = await resolveWeekDay(weekDay, next);
  if (!weekDay) return; // resolveWeekDay already called next()

  const configYear = year || parseInt(academicYear);

  // Duplicate check
  const existing = await DaySessionConfig.findOne({
    academicLevel,
    weekDay,
    campus,
    year: configYear,
  });
  if (existing) {
    return res.status(400).json({
      success: false,
      message:
        "Day session config already exists for this academic level, week day, campus and year",
    });
  }

  // Create config
  let config = await DaySessionConfig.create({
    academicLevel,
    weekDay,
    sessions: sessions || [],
    campus,
    year: configYear,
  });

  // Populate before sending
  config = await DaySessionConfig.findById(config._id)
    .populate("academicLevel", "name")
    .populate("weekDay", "name shortName order isWorkingDay")
    .populate("sessions", "name startTime endTime order")
    .populate("campus", "name");

  res.status(201).json({ success: true, config });
});

// ✅ GET – unchanged (works with IDs, no change needed)
export const getDaySessionConfigs = catchAsyncErrors(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    campus,
    year,
    academicLevel,
    weekDay,
  } = req.query;

  const filter = {};
  if (campus) filter.campus = campus;
  if (year) filter.year = parseInt(year);
  if (academicLevel) filter.academicLevel = academicLevel;
  if (weekDay) filter.weekDay = weekDay; // expects ObjectId in query

  const pageNumber = parseInt(page);
  const pageSize = parseInt(limit);
  const skip = (pageNumber - 1) * pageSize;

  const total = await DaySessionConfig.countDocuments(filter);
  const configs = await DaySessionConfig.find(filter)
    .populate("academicLevel", "name")
    .populate("weekDay", "name shortName order isWorkingDay")
    .populate("sessions", "name startTime endTime order")
    .populate("campus", "name")
    .skip(skip)
    .limit(pageSize);

  res.status(200).json({
    success: true,
    configs,
    pagination: {
      page: pageNumber,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
});

// ✅ UPDATE – now accepts weekday as name or ID
export const updateDaySessionConfig = catchAsyncErrors(async (req, res, next) => {
  let config = await DaySessionConfig.findById(req.params.id);
  if (!config) {
    return next(new ErrorHandler("Day session config not found", 404));
  }

  const { academicLevel, weekDay, campus, year } = req.body;

  // --- If weekDay is being updated, resolve it ---
  let resolvedWeekDay = weekDay;
  if (weekDay) {
    resolvedWeekDay = await resolveWeekDay(weekDay, next);
    if (!resolvedWeekDay) return;
  }

  // Duplicate prevention if unique fields are changed
  if (academicLevel || resolvedWeekDay || campus || year) {
    const filter = {
      _id: { $ne: req.params.id },
      academicLevel: academicLevel || config.academicLevel,
      weekDay: resolvedWeekDay || config.weekDay,
      campus: campus || config.campus,
      year: year || config.year,
    };

    const existing = await DaySessionConfig.findOne(filter);
    if (existing) {
      return res.status(400).json({
        success: false,
        message:
          "Day session config already exists with these academic level, week day, campus and year",
      });
    }
  }

  // Prepare update data (replace weekDay with resolved ID if provided)
  const updateData = { ...req.body };
  if (resolvedWeekDay) updateData.weekDay = resolvedWeekDay;

  // Update
  config = await DaySessionConfig.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("academicLevel", "name")
    .populate("weekDay", "name shortName order isWorkingDay")
    .populate("sessions", "name startTime endTime order")
    .populate("campus", "name");

  res.status(200).json({ success: true, config });
});

// ✅ DELETE – unchanged
export const deleteDaySessionConfig = catchAsyncErrors(async (req, res, next) => {
  const config = await DaySessionConfig.findById(req.params.id);
  if (!config) {
    return next(new ErrorHandler("Day session config not found", 404));
  }
  await DaySessionConfig.findByIdAndDelete(req.params.id);
  res.status(200).json({
    success: true,
    message: "Day session config deleted successfully",
  });
});