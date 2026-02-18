// controllers/classGroup.js - COMPLETE VERSION
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ClassGroup from "../models/classGroup.js";
import Course from "../models/course.js";
import User from "../models/user.js";
import APIFilters from "../utils/apiFilters.js";
import ErrorHandler from "../utils/errorHandler.js";

// 1. CREATE ====================================
export const newClassGroup = catchAsyncErrors(async (req, res) => {
  const { grade, academicLevel, section, displayName, courses = [] } = req.body;
  const { campus, selectedYear } = req.cookies;

  // Validation
  const requiredFields = { grade, academicLevel, section, displayName, campus, selectedYear };
  const missing = Object.entries(requiredFields)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
      missing
    });
  }

  // Check if class group already exists
  const existingClassGroup = await ClassGroup.findOne({
    grade,
    section,
    campus,
    year: selectedYear
  });

  if (existingClassGroup) {
    return res.status(400).json({
      success: false,
      message: `Class group ${displayName} already exists for this grade`
    });
  }

  const classGroup = await ClassGroup.create({
    grade,
    academicLevel,
    section: section.toUpperCase(),
    displayName,
    courses,
    campus,
    year: selectedYear
  });

  res.status(201).json({
    success: true,
    classGroup,
  });
});

// 2. READ - ALL ====================================
// models/classGroup.js (same as aap ka diya hua, no change needed)
// controllers/classGroupController.js

export const getClassGroups = catchAsyncErrors(async (req, res) => {
  // 1. Cookies se data
  const { campus: cookieCampus, selectedYear: cookieYear } = req.cookies;

  // 2. Pagination flag
  const isPaginationDisabled = req.query.paginate === 'false';
  const shouldPaginate = !isPaginationDisabled;

  console.log("   Should Paginate:", shouldPaginate);

  // 3. IMPORTANT: Parameters normalize karo
  let {
    campus,
    year,
    academicLevel,
    academicLevelId,
    grade,          // optional filter by grade ObjectId
    section,        // optional filter by section (A, B, ENG, etc.)
    status,
    keyword,
    ...otherParams
  } = req.query;

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

  // Status mapping: "active" -> true, "deactive" -> false
  if (status === "active") {
    status = true;
  } else if (status === "deactive") {
    status = false;
  } else if (status && status !== "all") {
    // agar koi aur value aaye to ignore kar do
    status = undefined;
  }

  // 4. Build query object
  const query = {};

  if (campus) query.campus = campus;
  if (year) query.year = year;
  if (academicLevel) query.academicLevel = academicLevel;
  if (grade) query.grade = grade;
  if (section) query.section = { $regex: new RegExp(`^${section}$`, 'i') }; // exact match case-insensitive
  if (status !== undefined) query.status = status;

  // Search keyword handle karo (displayName ya section me search)
  if (keyword) {
    query.$or = [
      { displayName: { $regex: keyword, $options: 'i' } },
      { section: { $regex: keyword, $options: 'i' } }
    ];
  }

  console.log("   Final Query Object:", query);

  // 5. Count total documents
  const total = await ClassGroup.countDocuments(query);
  const active = await ClassGroup.countDocuments({ ...query, status: true });
  const deactive = await ClassGroup.countDocuments({ ...query, status: false });

  console.log("   Counts - Total:", total, "Active:", active, "Deactive:", deactive);

  // 6. Find documents with population
  let classGroupsQuery = ClassGroup.find(query)
    .populate('grade', '_id gradeName')            // assume Grade model has gradeName
    .populate('academicLevel', '_id name code')
    .populate('campus', '_id name')
    .populate('courses', '_id name code')          // optional, jitna zaroori ho
    .sort({ displayName: 1 });                     // alphabetical order

  // 7. Apply pagination if needed
  if (shouldPaginate) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    classGroupsQuery = classGroupsQuery.skip(skip).limit(limit);

    console.log("   Pagination - Page:", page, "Limit:", limit, "Skip:", skip);
  }

  const classGroups = await classGroupsQuery;

  console.log("   ClassGroups found:", classGroups.length);

  // 8. Build response
  const response = {
    success: true,
    classGroups,
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

  console.log("   Sending response with", classGroups.length, "classGroups");
  res.status(200).json(response);
});

// 3. READ - SINGLE ====================================
export const getClassGroupDetails = catchAsyncErrors(async (req, res, next) => {
  const classGroup = await ClassGroup.findById(req.params.id)
    .populate("grade", "gradeName description")
    .populate("academicLevel", "name level code")
    .populate("campus", "name")
    .populate({
      path: "courses",
      select: "courseName code description teacher",
      populate: {
        path: "teacher",
        select: "name email"
      }
    });

  if (!classGroup) {
    return next(new ErrorHandler("Class group not found", 404));
  }

  res.status(200).json({
    success: true,
    classGroup,
  });
});

// 4. UPDATE ====================================
export const updateClassGroup = catchAsyncErrors(async (req, res, next) => {
  let classGroup = await ClassGroup.findById(req.params.id);

  if (!classGroup) {
    return next(new ErrorHandler("Class group not found", 404));
  }

  classGroup = await ClassGroup.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate("grade academicLevel campus courses");

  res.status(200).json({
    success: true,
    classGroup,
    message: "Class group updated successfully",
  });
});

// 5. DELETE ====================================
export const deleteClassGroup = catchAsyncErrors(async (req, res, next) => {
  const classGroup = await ClassGroup.findById(req.params.id);

  if (!classGroup) {
    return next(new ErrorHandler("Class group not found", 404));
  }

  await classGroup.deleteOne();

  res.status(200).json({
    success: true,
    message: "Class group deleted successfully",
  });
});

// 6. COURSE MANAGEMENT ===============================

// Add course to class group
export const addCourseInClassGroup = catchAsyncErrors(async (req, res, next) => {
  const { classGroupId, courseId } = req.body;

  const classGroup = await ClassGroup.findById(classGroupId);
  if (!classGroup) {
    return next(new ErrorHandler("Class group not found", 404));
  }

  const course = await Course.findById(courseId);
  if (!course) {
    return next(new ErrorHandler("Course not found", 404));
  }

  // Check if course already exists
  const isDuplicate = classGroup.courses.some(
    id => id.toString() === courseId.toString()
  );

  if (isDuplicate) {
    return next(new ErrorHandler("Course already added to class group", 400));
  }

  classGroup.courses.push(courseId);
  await classGroup.save();

  res.status(200).json({
    success: true,
    message: "Course added to class group successfully",
    classGroup: await ClassGroup.findById(classGroupId).populate("courses"),
  });
});

// Remove course from class group
export const deleteCourseInClassGroup = catchAsyncErrors(async (req, res, next) => {
  const { classGroupId, courseId } = req.body;

  const classGroup = await ClassGroup.findById(classGroupId);
  if (!classGroup) {
    return next(new ErrorHandler("Class group not found", 404));
  }

  const courseIndex = classGroup.courses.findIndex(
    id => id.toString() === courseId.toString()
  );

  if (courseIndex === -1) {
    return next(new ErrorHandler("Course not found in class group", 404));
  }

  classGroup.courses.splice(courseIndex, 1);
  await classGroup.save();

  res.status(200).json({
    success: true,
    message: "Course removed from class group successfully",
    classGroup: await ClassGroup.findById(classGroupId).populate("courses"),
  });
});

// 7. TEACHER & COURSE QUERIES =========================

// Get courses and class groups by role
export const getCoursesAndClassGroupByRole = catchAsyncErrors(async (req, res, next) => {
  const { campus, selectedYear } = req.cookies;
  const { userId, userRole } = req.body;

  if (!userId || !userRole) {
    return next(new ErrorHandler("User ID and role are required", 400));
  }

  let courses, classGroups;

  if (userRole === "admin") {
    courses = await Course.find({ campus, year: selectedYear }).populate("teacher");
    classGroups = await ClassGroup.find({ campus, year: selectedYear }).populate("courses");
  } else if (userRole === "teacher") {
    const teacher = await User.findById(userId);
    if (!teacher) {
      return next(new ErrorHandler("Teacher not found", 404));
    }

    courses = await Course.find({ 
      teacher: teacher._id, 
      campus, 
      year: selectedYear 
    }).populate("teacher");

    classGroups = await ClassGroup.find({
      campus,
      year: selectedYear,
      courses: { $in: courses.map(c => c._id) }
    }).populate("courses");
  } else {
    return next(new ErrorHandler("Access denied for the provided role", 403));
  }

  res.status(200).json({
    success: true,
    courses,
    classGroups,
  });
});

// Get courses by class group and teacher
export const getCourseByClassGroupAndTeacherID = catchAsyncErrors(async (req, res, next) => {
  const { campus, selectedYear } = req.cookies;
  const { classGroupId, teacherId } = req.body;

  const classGroup = await ClassGroup.findOne({ 
    _id: classGroupId, 
    campus, 
    year: selectedYear 
  }).populate({
    path: "courses",
    populate: {
      path: "teacher",
      select: "name email"
    }
  });

  if (!classGroup) {
    return next(new ErrorHandler("Class group not found", 404));
  }

  const courses = classGroup.courses.filter(
    course => course.teacher && course.teacher._id.toString() === teacherId.toString()
  );

  res.status(200).json({
    success: true,
    courses,
  });
});

// 8. EXTRA UTILITIES ===============================

// Get all class groups for a specific grade
export const getClassGroupsByGrade = catchAsyncErrors(async (req, res, next) => {
  const { gradeId } = req.params;
  const { campus, selectedYear } = req.cookies;

  const classGroups = await ClassGroup.find({
    grade: gradeId,
    campus,
    year: selectedYear,
    status: true
  })
  .populate("courses")
  .sort({ section: 1 });

  res.status(200).json({
    success: true,
    classGroups,
  });
});

// Bulk update class group courses
export const updateClassGroupCourses = catchAsyncErrors(async (req, res, next) => {
  const { classGroupId } = req.params;
  const { courses } = req.body;

  const classGroup = await ClassGroup.findById(classGroupId);
  if (!classGroup) {
    return next(new ErrorHandler("Class group not found", 404));
  }

  classGroup.courses = courses;
  await classGroup.save();

  res.status(200).json({
    success: true,
    message: "Class group courses updated successfully",
    classGroup: await ClassGroup.findById(classGroupId).populate("courses"),
  });
});