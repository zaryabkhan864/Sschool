// controllers/classGroup.js - COMPLETE VERSION
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ClassGroup from "../models/classGroup.js";
import Course from "../models/course.js";
import User from "../models/user.js";
import StudentEnrollment from "../models/studentEnrollment.js"; // ✅ Added import
import APIFilters from "../utils/apiFilters.js";
import ErrorHandler from "../utils/errorHandler.js";

// 1. CREATE ====================================
export const newClassGroup = catchAsyncErrors(async (req, res) => {
  const { grade, academicLevel, section, displayName, courses = [] } = req.body;
  const { campus, academicYearName } = req.cookies;

  // Validation
  const requiredFields = { grade, academicLevel, section, displayName, campus, academicYearName };
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
    year: academicYearName
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
    year: academicYearName
  });

  res.status(201).json({
    success: true,
    classGroup,
  });
});

// 2. READ - ALL ====================================

export const getClassGroups = catchAsyncErrors(async (req, res) => {
  // 1. Cookies se data
  const { campus: cookieCampus, academicYearName: cookieYear } = req.cookies;

  // 2. Query parameters normalize karo
  let {
    campus,
    year,
    academicLevel,
    academicLevelId,
    grade,
    section,
    status,
    keyword,
    page,
    limit,
    sort,
    paginate,
  } = req.query;

  // 3. Pagination decision
  const isDropdownRequest = Number(limit) === 0;              // limit = 0 → dropdown (no pagination, no cookies)
  const shouldPaginate = !isDropdownRequest && paginate !== 'false';

  // 4. Backward compatibility: academicLevelId → academicLevel
  if (academicLevelId && !academicLevel) {
    academicLevel = academicLevelId;
  }

  // 5. Cookies ka istemal sirf tab jab pagination enabled ho aur dropdown na ho
  if (!isDropdownRequest && shouldPaginate) {
    if (!campus && cookieCampus) campus = cookieCampus;
    if (!year && cookieYear) year = cookieYear;
  }

  // 6. Type conversions
  // 🛠️ FIX: year ko parseInt nahi karna (ab string hai)
  // if (year) year = parseInt(year);   // ← YEH LINE HATAI

  if (status === 'active') status = true;
  else if (status === 'deactive') status = false;
  else if (status && status !== 'all') status = undefined;   // invalid value ignore

  // 7. APIFilters ke liye query object tayyar karo (section ko exclude rakha, baad mein handle hoga)
  const apiQuery = {
    ...(campus && { campus }),
    ...(year && { year }),
    ...(academicLevel && { academicLevel }),
    ...(grade && { grade }),
    ...(status !== undefined && { status }),
    keyword: keyword || undefined,
    page,
    limit,
    sort: sort || 'displayName',      // default sort by displayName ASC
  };

  // 8. APIFilters initialize karo
  const apiFilters = new APIFilters(ClassGroup, apiQuery)
    .setSearchFields(['displayName', 'section'])   // keyword in dono fields mein search karega
    .search()
    .filters()
    .sort();                                       // apne set kiye hue sort (ya default) apply hoga

  // 9. Pagination apply / disable
  if (!shouldPaginate || isDropdownRequest) {
    apiFilters.disablePagination();
  } else {
    apiFilters.pagination();                       // limit = 0 ho to ye bhi disable kar dega
  }

  // 10. Sort specification nikal lo (displayName default)
  const sortString = apiFilters.queryStr.sort || 'displayName';
  const sortSpec = sortString.split(',').join(' ');   // e.g. "displayName,-createdAt" → "displayName -createdAt"

  // 11. Base conditions tayyar karo (filters + search) aur section filter manually add karo
  const baseConditions = { ...apiFilters.query._conditions };
  if (section) {
    baseConditions.section = { $regex: new RegExp(`^${section}$`, 'i') };
  }

  // 12. Count totals (active/deactive sab filters ke saath)
  const total = await ClassGroup.countDocuments(baseConditions);
  const active = await ClassGroup.countDocuments({ ...baseConditions, status: true });
  const deactive = await ClassGroup.countDocuments({ ...baseConditions, status: false });

  // 13. Data query build karo with same conditions
  let classGroupsQuery = ClassGroup.find(baseConditions)
    .populate('grade', '_id gradeName')
    .populate('academicLevel', '_id name code')
    .populate('campus', '_id name')
    .populate('courses', '_id name code')
    .sort(sortSpec);   // YAHI SORT APPLY HOGA

  // 14. Pagination agar enabled hai to skip/limit lagao
  if (apiFilters.shouldPaginate) {
    const skip = (apiFilters.page - 1) * apiFilters.limit;
    classGroupsQuery = classGroupsQuery.skip(skip).limit(apiFilters.limit);
  }

  const classGroups = await classGroupsQuery;

  // 15. Response tayyar karo – bilkul courses controller jaisa
  const response = {
    success: true,
    classGroups,
  };

  if (apiFilters.shouldPaginate) {
    const totalPages = Math.ceil(total / apiFilters.limit);
    response.pagination = {
      total,
      active,
      deactive,
      page: apiFilters.page,
      limit: apiFilters.limit,
      totalPages,
    };
  } else {
    response.counts = { total, active, deactive };
  }

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
  const { campus, academicYearName } = req.cookies;
  const { userId, userRole } = req.body;

  if (!userId || !userRole) {
    return next(new ErrorHandler("User ID and role are required", 400));
  }

  let courses, classGroups;

  if (userRole === "admin") {
    courses = await Course.find({ campus, year: academicYearName }).populate("teacher");
    classGroups = await ClassGroup.find({ campus, year: academicYearName }).populate("courses");
  } else if (userRole === "teacher") {
    const teacher = await User.findById(userId);
    if (!teacher) {
      return next(new ErrorHandler("Teacher not found", 404));
    }

    courses = await Course.find({ 
      teacher: teacher._id, 
      campus, 
      year: academicYearName 
    }).populate("teacher");

    classGroups = await ClassGroup.find({
      campus,
      year: academicYearName,
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
  const { campus, academicYearName } = req.cookies;
  const { classGroupId, teacherId } = req.body;

  const classGroup = await ClassGroup.findOne({ 
    _id: classGroupId, 
    campus, 
    year: academicYearName 
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
  const { campus, academicYearName } = req.cookies;

  const classGroups = await ClassGroup.find({
    grade: gradeId,
    campus,
    year: academicYearName,
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

// ✅ Get students enrolled in a class group
export const getClassGroupStudents = catchAsyncErrors(async (req, res, next) => {
  const classGroupId = req.params.id || req.params.classGroupId;

  if (!classGroupId) {
    return next(new ErrorHandler("Class group id is missing in the request", 400));
  }

  const classGroup = await ClassGroup.findById(classGroupId).select(
    "displayName section year grade academicLevel campus"
  );

  if (!classGroup) {
    return next(new ErrorHandler("Class group not found", 404));
  }

  // Sirf "active" enrollments uthao jo isi class group se linked hain.
  const enrollments = await StudentEnrollment.find({
    classGroup: classGroup._id,
    status: "active",
  })
    .populate({
      path: "student",
      select:
        "firstName middleName lastName userId email gender dateOfBirth accountStatus lifecycleStatus",
    })
    .sort({ createdAt: 1 });

  // 🔍 Debug log (remove in production)
  console.log(
    `[getClassGroupStudents] classGroup=${classGroup._id} → ${enrollments.length} active enrollment(s) mile`
  );

  const students = enrollments
    .filter((e) => e.student) // deleted/null student guard
    .map((e) => ({
      ...e.student.toObject(),
      enrollmentId: e._id,
      startDate: e.startDate,
    }));

  res.status(200).json({
    success: true,
    classGroup,
    students,
    total: students.length,
  });
});