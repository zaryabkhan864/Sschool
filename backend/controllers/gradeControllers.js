import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Grade from "../models/grade.js";
import APIFilters from "../utils/apiFilters.js";
import ErrorHandler from "../utils/errorHandler.js";

// Create new grade => /api/v1/grades
export const newGrade = catchAsyncErrors(async (req, res) => {
  const { campus, selectedYear } = req.cookies;

  // Validation
  if (!campus || !selectedYear) {
    return res.status(400).json({
      success: false,
      message: "Campus and year cookies are required",
    });
  }

  // academicLevel ko req.body se extract kiya
  const { gradeName, description, academicLevel, status = true } = req.body;

  // Validation for academicLevel
  if (!academicLevel) {
    return res.status(400).json({
      success: false,
      message: "Please select an Academic Level",
    });
  }

  // Check if grade already exists for this campus and year
  const existingGrade = await Grade.findOne({
    gradeName,
    campus,
    year: selectedYear,
  });

  if (existingGrade) {
    return res.status(400).json({
      success: false,
      message: `Grade "${gradeName}" already exists for this campus and year`,
    });
  }

  // Grade create karte waqt academicLevel ko save kiya
  const grade = await Grade.create({
    gradeName,
    description,
    academicLevel,
    status,
    campus,
    year: selectedYear,
  });

  res.status(201).json({
    success: true,
    grade,
  });
});

// Get all grades => /api/v1/grades
// gradeController.js - UPDATED VERSION
export const getGrades = catchAsyncErrors(async (req, res) => {
  // 1. Cookies se data
  const { campus: cookieCampus, selectedYear: cookieYear } = req.cookies;
  
  // 2. Pagination flag
  const isPaginationDisabled = req.query.paginate === 'false';
  const shouldPaginate = !isPaginationDisabled;
  
  console.log("   Should Paginate:", shouldPaginate);

  // 3. IMPORTANT: Parameters normalize karo
  let { campus, year, academicLevel, academicLevelId, status, ...otherParams } = req.query;
  
  // academicLevelId ko academicLevel me convert (backward compatibility)
  if (academicLevelId && !academicLevel) {
    academicLevel = academicLevelId;
  }
  
  // Agar pagination enabled hai to cookies use karo
  if (shouldPaginate) {
    if (cookieCampus && !campus) campus = cookieCampus;
    if (cookieYear && !year) year = cookieYear;
  }
  
  // Year ko number me convert
  if (year) {
    year = parseInt(year);
  }
  
  // Status mapping
  if (status === "active") {
    status = true;
  } else if (status === "deactive") {
    status = false;
  }
  
  // 4. Build query object
  const query = {};
  
  if (campus) query.campus = campus;
  if (year) query.year = year;
  if (academicLevel) query.academicLevel = academicLevel;
  if (status !== undefined) query.status = status;
  
  // Search keyword handle karo
  if (req.query.keyword) {
    query.$or = [
      { gradeName: { $regex: req.query.keyword, $options: 'i' } },
      { description: { $regex: req.query.keyword, $options: 'i' } }
    ];
  }
  
  console.log("   Final Query Object:", query);
  
  // 5. Count total documents
  const total = await Grade.countDocuments(query);
  const active = await Grade.countDocuments({ ...query, status: true });
  const deactive = await Grade.countDocuments({ ...query, status: false });
  
  console.log("   Counts - Total:", total, "Active:", active, "Deactive:", deactive);
  
  // 6. Find documents
  let gradesQuery = Grade.find(query)
    .populate('campus', 'name _id')
    .populate('academicLevel', '_id name code')
    .sort({ gradeName: 1 });
  
  // 7. Apply pagination if needed
  if (shouldPaginate) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    gradesQuery = gradesQuery.skip(skip).limit(limit);
    
    console.log("   Pagination - Page:", page, "Limit:", limit, "Skip:", skip);
  }
  
  const grades = await gradesQuery;
  
  console.log("   Grades found:", grades.length);
  
  // 8. Build response
  const response = {
    success: true,
    grades,
  };
  
  if (shouldPaginate) {
    response.pagination = {
      total,
      active,
      deactive,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      totalPages: Math.ceil(total / (parseInt(req.query.limit) || 10)),
    };
  } else {
    response.counts = { total, active, deactive };
  }
  
  console.log("   Sending response with", grades.length, "grades");
  res.status(200).json(response);
});

// Get single grade => /api/v1/grades/:id
export const getGradeDetails = catchAsyncErrors(async (req, res, next) => {
  // Details mein bhi academicLevel populate kiya taake frontend pe show ho sake
  const grade = await Grade.findById(req.params.id)
    .populate("campus", "name")
    .populate("academicLevel", "name code");

  if (!grade) {
    return next(new ErrorHandler("Grade not found", 404));
  }

  res.status(200).json({
    success: true,
    grade,
  });
});

// Update grade => /api/v1/grades/:id
export const updateGrade = catchAsyncErrors(async (req, res, next) => {
  let grade = await Grade.findById(req.params.id);

  if (!grade) {
    return next(new ErrorHandler("Grade not found", 404));
  }

  // AcademicLevel ko allowed updates mein shamil kiya
  const allowedUpdates = ["gradeName", "description", "status", "academicLevel"];
  const updates = {};

  Object.keys(req.body).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  grade = await Grade.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    grade,
    message: "Grade updated successfully",
  });
});

// Delete grade => /api/v1/grades/:id
export const deleteGrade = catchAsyncErrors(async (req, res, next) => {
  const grade = await Grade.findById(req.params.id);

  if (!grade) {
    return next(new ErrorHandler("Grade not found", 404));
  }

  await grade.deleteOne();

  res.status(200).json({
    success: true,
    message: "Grade deleted successfully",
  });
});