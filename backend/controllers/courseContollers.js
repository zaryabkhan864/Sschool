import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Course from "../models/course.js";
import ErrorHandler from "../utils/errorHandler.js";
import Grade from "../models/grade.js";
import Teacher from "../models/user.js";
import ClassGroup from "../models/classGroup.js";
import StudentEnrollment from "../models/studentEnrollment.js";
import APIFilters from "../utils/apiFilters.js";
import mongoose from "mongoose";

// ============================================================
// CREATE course => /api/v1/admin/courses
// ============================================================
export const newCourse = catchAsyncErrors(async (req, res, next) => {

  const { campus, academicYear } = req.cookies;

  if (!academicYear) {
    return next(new ErrorHandler("Please select an academic year first", 400));
  }

  const { courseName, description, code, teacher } = req.body;

  // Validate teacher if provided
  let teacherDetail;
  if (teacher) {
    teacherDetail = await Teacher.findById(teacher);
    if (!teacherDetail) {
      return next(new ErrorHandler("Teacher not found", 404));
    }
  }
  const teacherId = teacher === "" ? null : teacher;

  const course = await Course.create({
    courseName,
    description,
    code,
    teacher: teacherId,
    campus,
    academicYear,
  });

  res.status(201).json({ success: true, course });
});
// ============================================================
// BULK CREATE courses => /api/v1/admin/courses/bulk
// ============================================================
export const bulkCreateCourses = catchAsyncErrors(async (req, res, next) => {
  // Cookies ki jagah body se campus aur academicYear lo
  const { campus, academicYear } = req.body;

  if (!academicYear) {
    return next(new ErrorHandler("Please select an academic year first", 400));
  }

  // Optional: campus check bhi laga sakte ho
  if (!campus) {
    return next(new ErrorHandler("Please provide a campus", 400));
  }

  const { courses } = req.body; // array of course objects

  if (!courses || !Array.isArray(courses) || courses.length === 0) {
    return next(new ErrorHandler("Please provide an array of courses", 400));
  }

  const courseDocs = [];
  const errors = [];

  for (let i = 0; i < courses.length; i++) {
    const { courseName, description, code, teacher } = courses[i];

    // Validate required fields
    if (!courseName || !description || !code) {
      errors.push(
        `Course at index ${i} is missing required fields (courseName, description, code).`
      );
      continue;
    }

    // Validate teacher if provided
    let teacherId = null;
    if (teacher) {
      const teacherDetail = await Teacher.findById(teacher);
      if (!teacherDetail) {
        errors.push(`Teacher not found for course at index ${i}`);
        continue;
      }
      teacherId = teacher;
    }

    courseDocs.push({
      courseName,
      description,
      code,
      teacher: teacherId,
      campus,        // body se aaya hua
      academicYear,  // body se aaya hua
    });
  }

  if (errors.length > 0) {
    return next(new ErrorHandler(`Validation errors: ${errors.join("; ")}`, 400));
  }

  // Insert many with ordered: true (all or nothing)
  const insertedCourses = await Course.insertMany(courseDocs, { ordered: true });

  res.status(201).json({
    success: true,
    count: insertedCourses.length,
    courses: insertedCourses,
  });
});
// ============================================================
// GET all courses (with filters, pagination, counts)
// ============================================================
export const getCourses = catchAsyncErrors(async (req, res, next) => {
  // ✅ FIX: read the real "academicYear" cookie instead of the
  // nonexistent "academicYear"
  const { campus, academicYear } = req.cookies;
  const limit = Number(req.query.limit);
  const isDropdownRequest = limit === 0;

  if (campus && !isDropdownRequest) req.query.campus = campus;
  if (academicYear && !isDropdownRequest) req.query.academicYear = academicYear;

  // status filter handling
  if (req.query.status) {
    req.query.status = req.query.status === "active" ? true : false;
  }

  // Base query for counting
  const baseApiFilters = new APIFilters(Course, req.query)
    .setSearchFields(["courseName", "code", "description"])
    .search()
    .filters()
    .sort();
  const baseQuery = baseApiFilters.query;
  const total = await baseApiFilters.model.countDocuments(baseQuery._conditions);

  // Active/Deactive counts
  let active = 0, deactive = 0;
  try {
    active = await Course.countDocuments({ ...baseQuery._conditions, status: true });
    deactive = await Course.countDocuments({ ...baseQuery._conditions, status: false });
  } catch (error) {
    active = total;
    deactive = 0;
  }

  // Query for actual data with pagination
  const apiFilters = new APIFilters(Course, req.query)
    .setSearchFields(["courseName", "code", "description"])
    .search()
    .filters()
    .sort()
    .pagination();

  // ✅ FIX: populate academicYear too. Teacher select fields fixed —
  // User model has no `name` field (only firstName/middleName/lastName).
  // ✅ ADDED: status field in teacher select for status badge in frontend
  const populateOptions = ["campus", { path: "academicYear", select: "name" }];

  if (req.query.teacher || (req.query.keyword && req.query.keyword.includes("teacher"))) {
    populateOptions.push({
      path: "teacher",
      select: "firstName middleName lastName email phoneNumber status",  // status added
      populate: { path: "campus", select: "name" },
    });
  } else {
    populateOptions.push({ path: "teacher", select: "firstName middleName lastName email status" }); // status added
  }

  // Students population (optional)
  if (req.query.populateStudents === "true") {
    populateOptions.push({
      path: "students",
      select: "firstName middleName lastName email",
    });
  }

  apiFilters.populate(populateOptions);
  let courses = await apiFilters.query;

  // Additional filtering by keyword (teacher name etc.)
  let finalCourses = courses;
  if (req.query.keyword && req.query.keyword.trim()) {
    const keyword = req.query.keyword.trim().toLowerCase();
    finalCourses = courses.filter((course) => {
      const courseMatches =
        course.courseName?.toLowerCase().includes(keyword) ||
        course.code?.toLowerCase().includes(keyword) ||
        course.description?.toLowerCase().includes(keyword);

      // ✅ FIX: build name from firstName/lastName instead of nonexistent .name
      const teacherFullName = course.teacher
        ? `${course.teacher.firstName || ""} ${course.teacher.lastName || ""}`.toLowerCase()
        : "";
      const teacherMatches =
        course.teacher &&
        (teacherFullName.includes(keyword) ||
          course.teacher.email?.toLowerCase().includes(keyword));

      return courseMatches || teacherMatches;
    });

    if (!apiFilters.shouldPaginate) {
      const filteredActive = finalCourses.filter((c) => c.status !== false).length;
      const filteredDeactive = finalCourses.filter((c) => c.status === false).length;
      active = filteredActive;
      deactive = filteredDeactive;
      total = finalCourses.length;
    }
  }

  // Pagination meta
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
    courses: finalCourses,
  });
});

// ============================================================
// UPDATE course => /api/v1/admin/courses/:id
// ============================================================
export const updateCourse = catchAsyncErrors(async (req, res, next) => {
  let course = await Course.findById(req.params.id);
  if (!course) {
    return next(new ErrorHandler("Course not found", 404));
  }

  // ✅ FIX: real cookie name is "academicYear"
  const { campus, academicYear } = req.cookies;
  const { courseName, description, code, teacher } = req.body;

  // Teacher handling
  const teacherId = teacher === "" ? null : teacher;
  let selectedCampus;
  let teacherDetail;
  if (teacher) {
    teacherDetail = await Teacher.findById(teacher);
    if (!teacherDetail) {
      return next(new ErrorHandler("Teacher not found", 404));
    }
    selectedCampus = teacherDetail.campus;
  } else {
    selectedCampus = campus;
  }

  course = await Course.findByIdAndUpdate(
    req.params.id,
    {
      courseName,
      description,
      code,
      teacher: teacherId,
      campus: selectedCampus,
      // ✅ FIX: keep the course's existing academicYear if the cookie is
      // missing at update time, instead of overwriting it with undefined
      academicYear: academicYear || course.academicYear,
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({ success: true, course });
});

// ============================================================
// DELETE course => /api/v1/admin/courses/:id
// ============================================================
export const deleteCourse = catchAsyncErrors(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(new ErrorHandler("Course not found", 404));
  }

  await Course.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: "Course deleted successfully" });
});

// ============================================================
// GET single course details => /api/v1/courses/:id
// ============================================================
export const getCourseDetails = catchAsyncErrors(async (req, res, next) => {
  // ✅ ADDED: status in teacher select
  const course = await Course.findById(req.params.id)
    .populate("campus", "name")
    .populate("academicYear", "name")
    .populate("teacher", "firstName middleName lastName email avatar status");   // status added

  if (!course) {
    return next(new ErrorHandler("Course not found", 404));
  }

  // Build a clean teacher object with a full name
  let teacherData = null;
  if (course.teacher) {
    const { firstName, middleName, lastName, email, avatar, status } = course.teacher;
    teacherData = {
      _id: course.teacher._id,
      name: [firstName, middleName, lastName].filter(Boolean).join(" "),
      email,
      avatar,
      status,   // include status for details view
    };
  }

  // 👇 FIX: Course doesn't reference a ClassGroup directly — it's the other
  // way round (ClassGroup.courses is an array of course IDs). Find every
  // ClassGroup that includes this course, then pull the actual enrolled
  // students for those class groups via StudentEnrollment. The old code
  // called `Enrollment.countDocuments(...)` — a model that was never
  // imported (only `Course` was) — so it silently threw inside the
  // try/catch below and studentCount was always 0.
  const classGroups = await ClassGroup.find({ courses: course._id })
    .select("displayName section grade academicLevel")
    .populate("grade", "gradeName")
    .populate("academicLevel", "name");

  const classGroupIds = classGroups.map((cg) => cg._id);

  let students = [];
  if (classGroupIds.length > 0) {
    const enrollments = await StudentEnrollment.find({
      classGroup: { $in: classGroupIds },
      status: "active",
      isDeleted: false,
    })
      .populate("student", "firstName middleName lastName email")
      .populate("classGroup", "displayName")
      .sort({ createdAt: 1 });

    students = enrollments
      .filter((e) => e.student) // guard against a deleted/null student
      .map((e) => ({
        _id: e.student._id,
        name: [e.student.firstName, e.student.middleName, e.student.lastName]
          .filter(Boolean)
          .join(" "),
        email: e.student.email,
        classGroup: e.classGroup?.displayName || "",
        enrollmentId: e._id,
      }));
  }

  res.status(200).json({
    success: true,
    course: {
      _id: course._id,
      courseName: course.courseName,
      description: course.description,
      code: course.code,
      campus: course.campus,
      academicYear: course.academicYear,
      academicYearName: course.academicYear?.name || "",
      teacher: teacherData,
      status: course.status ? "Active" : "Inactive",
      createdAt: course.createdAt,
      studentCount: students.length,
      classGroups: classGroups.map((cg) => ({
        _id: cg._id,
        displayName: cg.displayName,
        section: cg.section,
        gradeName: cg.grade?.gradeName || "",
        academicLevelName: cg.academicLevel?.name || "",
      })),
      students,
    },
  });
});

// ============================================================
// GET courses by grade & teacher (teacher dashboard)
// Unchanged logic — this endpoint never actually used `year`
// ============================================================
export const getCoursesByGradeAndTeacherID = catchAsyncErrors(async (req, res) => {
  const { campus } = req.cookies;
  const { gradeId, teacherId, userRole } = req.body;

  const grade = await Grade.findOne({
    _id: new mongoose.Types.ObjectId(gradeId),
    campus: new mongoose.Types.ObjectId(campus),
  }).populate("courses");

  if (!grade) {
    return res.status(404).json({
      success: false,
      message: "Grade not found",
    });
  }

  const courses =
    userRole === "teacher"
      ? grade.courses.filter(
          (course) => course.teacher && course.teacher.toString() === teacherId
        )
      : grade.courses;

  if (courses.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No courses found for the given grade and teacher",
    });
  }

  res.status(200).json({
    success: true,
    courses,
  });
});