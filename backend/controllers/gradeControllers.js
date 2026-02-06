import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Course from "../models/course.js";
import Grade from "../models/grade.js";
import user from "../models/user.js";
import APIFilters from "../utils/apiFilters.js";
import ErrorHandler from "../utils/errorHandler.js";

//CRUD operations for grades

// Create new grade => /api/v1/grades
export const newGrade = catchAsyncErrors(async (req, res) => {
  const { campus } = req.cookies;
  const { selectedYear } = req.cookies;

  const grade = await Grade.create({
    ...req.body, 
    campus, // Campus from cookie
    year: selectedYear // Year from cookie
  });

  res.status(200).json({
    grade,
  });
});

//Create get all grades => /api/v1/grades
// Get grades with pagination - UPDATED VERSION
export const getGrades = catchAsyncErrors(async (req, res, next) => {
  const { campus, selectedYear } = req.cookies;

  // 1. Cookie Filters - IMPORTANT CHANGE
  const limit = Number(req.query.limit);
  const isDropdownRequest = limit === 0;
  
  if (campus && !isDropdownRequest) {
    req.query.campus = campus;
  }
  
  if (selectedYear && !isDropdownRequest) {
    req.query.year = selectedYear;
  }

  // 2. Status handle karo
  if (req.query.status) {
    if (req.query.status === 'active') {
      req.query.status = true;
    } else if (req.query.status === 'deactive') {
      req.query.status = false;
    }
  }

  // 3. Base query for counting
  const baseApiFilters = new APIFilters(Grade, req.query)
    .setSearchFields(['gradeName', 'description', 'code'])
    .search()
    .filters()
    .sort();

  // 4. Get counts using the base query
  const baseQuery = baseApiFilters.query;
  const total = await baseApiFilters.model.countDocuments(baseQuery._conditions);
  
  // 5. Get active/deactive counts
  let active = 0;
  let deactive = 0;
  
  try {
    const activeQuery = Grade.find({
      ...baseQuery._conditions,
      status: true
    });
    active = await activeQuery.countDocuments();
    
    const deactiveQuery = Grade.find({
      ...baseQuery._conditions,
      status: false
    });
    deactive = await deactiveQuery.countDocuments();
  } catch (error) {
    console.log('Status field not found in Grade model, ignoring counts');
    active = total;
    deactive = 0;
  }

  // 6. Create query for actual data
  const apiFilters = new APIFilters(Grade, req.query)
    .setSearchFields(['gradeName', 'description', 'code'])
    .search()
    .filters()
    .sort()
    .pagination();

  // 7. Populate options
  const populateOptions = [];
  
  // Campus populate karo
  populateOptions.push({
    path: "campus",
    select: "name _id"
  });
  
  // Academic Level populate karo
  populateOptions.push({
    path: "academicLevel",
    select: "name _id level order"
  });
  
  // Class Teacher populate karo
  if (req.query.populateTeacher === 'true' || req.query.keyword?.includes('teacher')) {
    populateOptions.push({
      path: "classTeacher",
      select: "name email phone department",
      populate: {
        path: "campus",
        select: "name"
      }
    });
  } else if (req.query.includeTeacher === 'true') {
    populateOptions.push({
      path: "classTeacher",
      select: "name email"
    });
  }
  
  // Students populate karo
  if (req.query.populateStudents === 'true') {
    populateOptions.push({
      path: "students",
      select: "name email rollNumber admissionDate",
      options: {
        sort: { rollNumber: 1 },
        limit: req.query.studentsLimit ? Number(req.query.studentsLimit) : 10
      }
    });
  }
  
  // Subjects populate karo
  if (req.query.populateSubjects === 'true') {
    populateOptions.push({
      path: "subjects",
      select: "subjectName code teacher",
      populate: {
        path: "teacher",
        select: "name email"
      }
    });
  }

  apiFilters.populate(populateOptions);

  // 8. Execute the query
  const grades = await apiFilters.query;

  // 9. ✅ Fix: Declare pagination variable at the top
  let pagination = null;
  
  // ✅ Check if pagination should be included
  if (apiFilters.shouldPaginate) {
    pagination = {
      total,
      page: apiFilters.page,
      limit: apiFilters.limit,
      totalPages: Math.ceil(total / apiFilters.limit),
      counts: { total, active, deactive }
    };
  }

  // 10. Additional filtering by teacher name
  let finalGrades = grades;
  
  if (req.query.keyword && req.query.keyword.trim()) {
    const keyword = req.query.keyword.trim().toLowerCase();
    
    // Agar teacher ke naam se bhi filter karna hai
    finalGrades = grades.filter(grade => {
      const gradeMatches = 
        grade.gradeName?.toLowerCase().includes(keyword) ||
        grade.code?.toLowerCase().includes(keyword) ||
        grade.description?.toLowerCase().includes(keyword);
      
      const teacherMatches = grade.classTeacher && (
        grade.classTeacher.name?.toLowerCase().includes(keyword) ||
        grade.classTeacher.email?.toLowerCase().includes(keyword)
      );
      
      const academicLevelMatches = grade.academicLevel && (
        grade.academicLevel.name?.toLowerCase().includes(keyword) ||
        grade.academicLevel.level?.toString().includes(keyword)
      );
      
      return gradeMatches || teacherMatches || academicLevelMatches;
    });
    
    // Agar frontend pagination nahi use kar raha to yahan filter ke baad count update karo
    if (!apiFilters.shouldPaginate) {
      const filteredTotal = finalGrades.length;
      
      let filteredActive = 0;
      let filteredDeactive = 0;
      
      finalGrades.forEach(grade => {
        if (grade.status === true) filteredActive++;
        else if (grade.status === false) filteredDeactive++;
        else filteredActive++;
      });
      
      // Update counts for filtered results
      active = filteredActive;
      deactive = filteredDeactive;
      total = filteredTotal;
    }
  }

  // 11. Final Response - ✅ Now pagination is properly defined
  res.status(200).json({
    success: true,
    ...(pagination && { 
      pagination: pagination 
    }),
    ...(!pagination && { 
      counts: { total, active, deactive } 
    }),
    grades: finalGrades,
  });
});
// Update grade => /api/v1/grades/:id
export const updateGrade = catchAsyncErrors(async (req, res, next) => {
  const { campus, selectedYear } = req.cookies;
  
  let grade = await Grade.findById(req?.params?.id);

  // Check if there is any grade with req id
  if (!grade) {
    return next(new ErrorHandler("Grade not found", 404));
  }

  // Update with campus and year from cookies
  const updateData = {
    ...req.body,
    campus: campus, // Campus from cookie
    year: selectedYear // Year from cookie
  };

  grade = await Grade.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
  });

  res.status(200).json({
    grade,
    message: "Grade Updated successfully",
  });
});
// Delete grade => /api/v1/grades/:id
export const deleteGrade = catchAsyncErrors(async (req, res, next) => {
  const grade = await Grade.findById(req?.params?.id);
  //check if there is any grade with req id
  if (!grade) {
    return next(new ErrorHandler("Grade not found", 404));
  }

  await grade.deleteOne();

  res.status(200).json({
    message: "Grade deleted successfully",
  });
});

// extra controller for Grade
// Get single grade details => /api/v1/grades/:id
export const getGradeDetails = catchAsyncErrors(async (req, res) => {
  const grade = await Grade.findById(req?.params?.id).populate("courses");
  if (!grade) {
    return next(new ErrorHandler("Grade not found", 404));
  }
  res.status(200).json({
    grade,
  });
});

// add course to grade
export const addCourseInGrade = catchAsyncErrors(async (req, res, next) => {
  const { gradeId, courseId } = req.body;
  const grade = await Grade.findById(gradeId);
  if (!grade) {
    return next(new ErrorHandler("Grade not found", 404));
  }
  const course = await Course.findById(courseId);
  if (!course) {
    return next(new ErrorHandler("Course not found", 404));
  }

  const isDuplicate = grade.courses.includes(courseId);
  if (isDuplicate) {
    return next(new ErrorHandler("Course already added to grade", 404));
  }
  grade.courses.push(courseId);
  await grade.save();
  res.status(200).json({ message: "Course added to grade" });
});

//remove course from grade
export const deleteCourseInGrade = catchAsyncErrors(async (req, res, next) => {
  const { gradeId, courseId } = req.body;
  const grade = await Grade.findById(gradeId);
  if (!grade) {
    return next(new ErrorHandler("Grade not found", 404));
  }
  const courseIndex = grade.courses.indexOf(courseId);
  if (courseIndex === -1) {
    return next(new ErrorHandler("Course is not found in Grades Courses", 404));
  }

  grade.courses = grade.courses.filter(
    (course) => course.toString() !== courseId
  );
  await grade.save();

  res.status(200).json({ message: "Course removed from grade" });
});

export const getCoursesAndGradeByRole = catchAsyncErrors(async (req, res, next) => {
  const { campus, selectedYear } = req.cookies;
  const { userId, userRole } = req.body;

  if (!userId || !userRole) {
    return next(new ErrorHandler("User ID and role are required", 400));
  }

  let courses, grades;

  if (userRole === "admin") {
    // Admin: Get all courses and grades by campus & year
    courses = await Course.find({ campus, year: selectedYear }).populate("teacher");
    grades = await Grade.find({ campus, year: selectedYear }).populate("courses");
  } 
  
  else if (userRole === "teacher") {
    const teacher = await user.findById(userId);
    if (!teacher) {
      return next(new ErrorHandler("Teacher not found", 404));
    }

    // Teacher: Get courses by teacher, campus & year
    courses = await Course.find({ teacher: teacher._id, campus, year: selectedYear }).populate("teacher");

    // Only grades which contain these courses and match campus & year
    grades = await Grade.find({
      campus,
      year: selectedYear,
      courses: { $in: courses.map(c => c._id) }
    }).populate("courses");
  } 
  
  else {
    return next(new ErrorHandler("Access denied for the provided role", 403));
  }

  res.status(200).json({
    success: true,
    courses,
    grades,
  });
});

export const getCourseByGradeAndTeacherID = catchAsyncErrors(async (req, res) => {
  const { campus, year } = req.cookies;
  const { gradeId, teacherId, userRole } = req.body;

  const grade = await Grade.findOne({ _id: gradeId, campus, year });
  if (!grade) {
    return res.status(404).json({ success: false, message: "Grade not found" });
  }

  const courses = grade.courses.filter(
    (course) => course.teacher.toString() === teacherId.toString()
  );

  res.status(200).json({ success: true, courses });
});