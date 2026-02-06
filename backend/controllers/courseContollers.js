import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Course from "../models/course.js";
import ErrorHandler from "../utils/errorHandler.js";
import Grade from "../models/grade.js";
import Teacher from "../models/user.js";
import APIFilters from "../utils/apiFilters.js";
import mongoose from "mongoose";

//CRUD operations for courses

// Create new course => /api/v1/courses
export const newCourse = catchAsyncErrors(async (req, res, next) => {
  const { campus } = req.cookies
  const { selectedYear } = req.cookies;

  const { courseName, description, code, teacher ,year} = req.body;
  let teacherDetail

  if(teacher){
    teacherDetail = await Teacher.findById(teacher)
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
    year:selectedYear,
  });

  res.status(200).json({
    course,
  });
});

export const getCourses = catchAsyncErrors(async (req, res, next) => {
  const { campus, selectedYear } = req.cookies;

  // 1. Cookie Filters - IMPORTANT CHANGE
  // Dropdown ke liye campus filter skip karo (taki sare courses dikhein)
  // Agar limit=0 hai (dropdown case) to campus filter na lagao
  const limit = Number(req.query.limit);
  const isDropdownRequest = limit === 0;
  
  if (campus && !isDropdownRequest) {
    req.query.campus = campus;
  }
  
  if (selectedYear && !isDropdownRequest) {
    req.query.year = selectedYear;
  }

  // 2. Status handle karo (agar Course model me status field hai)
  if (req.query.status) {
    if (req.query.status === 'active') {
      req.query.status = true;
    } else if (req.query.status === 'deactive') {
      req.query.status = false;
    }
  }

  // 3. Teacher filter ko handle karo (agar search me teacher ka naam bhi dekhna hai)
  // Agar teacher search keyword me hai to populate ke liye alag handle karna hoga
  // Par pehle base query banao

  // 4. Base query for counting
  const baseApiFilters = new APIFilters(Course, req.query)
    .setSearchFields(['courseName', 'code', 'description'])
    .search()
    .filters()
    .sort();

  // 5. Get counts using the base query
  const baseQuery = baseApiFilters.query;
  const total = await baseApiFilters.model.countDocuments(baseQuery._conditions);
  
  // 6. Get active/deactive counts (agar status field hai to)
  let active = 0;
  let deactive = 0;
  
  // Check karo ke Course model me status field hai ya nahi
  try {
    // Active courses count
    const activeQuery = Course.find({
      ...baseQuery._conditions,
      status: true
    });
    active = await activeQuery.countDocuments();
    
    // Deactive courses count
    const deactiveQuery = Course.find({
      ...baseQuery._conditions,
      status: false
    });
    deactive = await deactiveQuery.countDocuments();
  } catch (error) {
    // Agar status field nahi hai model me to ignore karo
    console.log('Status field not found in Course model, ignoring counts');
    active = total;
    deactive = 0;
  }

  // 7. Now create a NEW query for actual data WITH/WITHOUT pagination
  const apiFilters = new APIFilters(Course, req.query)
    .setSearchFields(['courseName', 'code', 'description'])
    .search()
    .filters()
    .sort()
    .pagination(); // ✅ This will handle limit=0 case automatically

  // 8. Conditionally populate
  // Agar teacher search ya filter laga ho to teacher ke details bhi populate karo
  const populateOptions = ["campus"];
  
  // Teacher ko bhi populate karo, lekin selective fields ke sath
  if (req.query.teacher || (req.query.keyword && req.query.keyword.includes('teacher'))) {
    populateOptions.push({
      path: "teacher",
      select: "name email phone department",
      populate: {
        path: "campus",
        select: "name"
      }
    });
  } else {
    populateOptions.push({
      path: "teacher",
      select: "name email"
    });
  }

  // Agar students bhi populate karne hain (agar Course model me students field hai)
  if (req.query.populateStudents === 'true') {
    populateOptions.push({
      path: "students",
      select: "name email rollNumber grade",
      populate: {
        path: "grade.gradeId",
        select: "name"
      }
    });
  }

  apiFilters.populate(populateOptions);

  // 9. Execute the query
  const courses = await apiFilters.query;

  // 10. ✅ Get pagination meta ONLY if pagination is enabled
  let pagination = null;
  if (apiFilters.shouldPaginate) {
    pagination = {
      total,
      page: apiFilters.page,
      limit: apiFilters.limit,
      totalPages: Math.ceil(total / apiFilters.limit)
    };
  }

  // 11. Additional filtering by teacher name (agar search keyword me teacher ka naam hai)
  let finalCourses = courses;
  
  if (req.query.keyword && req.query.keyword.trim()) {
    const keyword = req.query.keyword.trim().toLowerCase();
    
    // Agar teacher ke naam se bhi filter karna hai
    finalCourses = courses.filter(course => {
      const courseMatches = 
        course.courseName?.toLowerCase().includes(keyword) ||
        course.code?.toLowerCase().includes(keyword) ||
        course.description?.toLowerCase().includes(keyword);
      
      const teacherMatches = course.teacher && (
        course.teacher.name?.toLowerCase().includes(keyword) ||
        course.teacher.email?.toLowerCase().includes(keyword)
      );
      
      return courseMatches || teacherMatches;
    });
    
    // Agar frontend pagination nahi use kar raha to yahan filter ke baad count update karo
    if (!apiFilters.shouldPaginate) {
      const filteredTotal = finalCourses.length;
      
      // Active/Deactive counts bhi update karo
      let filteredActive = 0;
      let filteredDeactive = 0;
      
      finalCourses.forEach(course => {
        if (course.status === true) filteredActive++;
        else if (course.status === false) filteredDeactive++;
        else filteredActive++; // Agar status undefined hai to active consider karo
      });
      
      // Update counts for filtered results
      active = filteredActive;
      deactive = filteredDeactive;
      total = filteredTotal;
    }
  }

  // 12. Final Response
  res.status(200).json({
    success: true,
    ...(pagination && { 
      pagination: { 
        ...pagination, 
        counts: { total, active, deactive } 
      } 
    }),
    ...(!pagination && { 
      counts: { total, active, deactive } 
    }),
    courses: finalCourses,
  });
});




// Update course => /api/v1/courses/:id
export const updateCourse = catchAsyncErrors(async (req, res, next) => {
  let course = await Course.findById(req?.params?.id);

  const { campus } = req.cookies;
  const { selectedYear } = req.cookies;

  if (!course) {
    return next(new ErrorHandler("Course not found", 404));
  }

  const { courseName, description, code, teacher } = req.body;

  const teacherId = teacher === "" ? null : teacher;
  let selectedCampus;
  let teacherDetail;

  if(teacher){
    teacherDetail = await Teacher.findById(teacher);
    if (!teacherDetail) {
      return next(new ErrorHandler("Teacher not found", 404));
    }
    selectedCampus = teacherDetail.campus;
  }
  else{
    selectedCampus = campus;
  }

  // Update course with campus and year from cookies
  course = await Course.findByIdAndUpdate(
    req?.params?.id,
    { 
      courseName, 
      description, 
      code, 
      teacher: teacherId,
      campus: selectedCampus, // Use campus from cookie or teacher
      year: selectedYear // Use year from cookie
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    course,
  });
});

// Delete course => /api/v1/courses/:id
export const deleteCourse = catchAsyncErrors(async (req, res, next) => {
  const course = await Course.findById(req?.params?.id);
  if (!course) {
    return next(new ErrorHandler("Course not found", 404));
  }
  await Course.findOneAndDelete({ _id: req?.params?.id });
  res.status(200).json({
    message: "Course deleted successfully",
  });
});

// extra controller for course

// Get single course details => /api/v1/courses/:id
export const getCourseDetails = catchAsyncErrors(async (req, res) => {
  const course = await Course.findById(req?.params?.id);

  if (!course) {
    return next(new ErrorHandler("Course not found", 404));
  }

  res.status(200).json({
    course,
  });
});

// Get all courses for a grade of teacher => /api/v1/courses/grade/teacher/:id
export const getCoursesByGradeAndTeacherID = catchAsyncErrors(async (req, res) => {
  const { campus ,year} = req.cookies
  const { gradeId, teacherId , userRole} = req.body; 
 
  // Step 1: Find the grade
  const grade = await Grade.findOne({_id: new mongoose.Types.ObjectId(gradeId), campus:new mongoose.Types.ObjectId(campus)}).populate("courses"); // Populate courses array from Grade

  if (!grade) {
    return res.status(404).json({
      success: false,
      message: "Grade not found",
    });
  }

  // Step 2: Filter courses by teacherId
  const courses = userRole === 'teacher' ? grade.courses.filter((course) => {
    return course.teacher && course.teacher.toString() === teacherId;
  }):grade.courses;

  if (courses.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No courses found for the given grade and teacher",
    });
  }

  // Step 3: Send response
  res.status(200).json({
    success: true,
    courses,
  });
});
