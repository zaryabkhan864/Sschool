// controllers/projectController.js
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Project from "../models/project.js";
import ProjectSubmission from "../models/projectSubmission.js";
import ClassGroup from "../models/classGroup.js";
import StudentEnrollment from "../models/studentEnrollment.js";
import ErrorHandler from "../utils/errorHandler.js";

const getContext = (req) => {
  const academicYear = req.query.academicYear || req.cookies.academicYear;
  const campus = req.query.campus || req.cookies.campus;
  return { academicYear, campus };
};

const populateOptions = [
  {
    path: "classGroup",
    select: "displayName section grade academicLevel",
    populate: { path: "academicLevel", select: "name" },
  },
  { path: "course", select: "courseName code" },
  { path: "teacher", select: "firstName middleName lastName email" },
  { path: "campus", select: "name" },
  { path: "academicYear", select: "name" },
  { path: "targetStudents", select: "firstName middleName lastName userId" },
];

// ============================================================
// CREATE => /api/v1/teacher/projects
// ============================================================
export const newProject = catchAsyncErrors(async (req, res, next) => {
  const { academicYear, campus } = getContext(req);
  if (!academicYear) return next(new ErrorHandler("Academic Year not selected", 400));
  if (!campus) return next(new ErrorHandler("Campus not selected", 400));

  const { title, description, classGroup, course, targetType, targetStudents, dueDate, totalMarks, attachments } =
    req.body;

  if (!classGroup) {
    return next(new ErrorHandler("Class group is required", 400));
  }

  const classGroupDoc = await ClassGroup.findOne({ _id: classGroup, campus });
  if (!classGroupDoc) {
    return next(new ErrorHandler("Class group not found for this campus", 404));
  }

  const teacher = req.user?._id;
  if (!teacher) return next(new ErrorHandler("Teacher could not be resolved", 400));

  const project = await Project.create({
    title,
    description,
    classGroup,
    course: course || null,
    teacher,
    campus,
    academicYear,
    targetType: targetType || "all",
    targetStudents: targetType === "individual" ? targetStudents : [],
    dueDate,
    totalMarks: totalMarks ?? null,
    attachments: attachments || [],
  });

  const populated = await Project.findById(project._id).populate(populateOptions);

  res.status(201).json({ success: true, project: populated });
});

// ============================================================
// GET (teacher-facing list) => /api/v1/teacher/projects
// ============================================================
export const getProjects = catchAsyncErrors(async (req, res, next) => {
  const { academicYear, campus } = getContext(req);
  if (!academicYear) return next(new ErrorHandler("Academic Year not selected", 400));
  if (!campus) return next(new ErrorHandler("Campus not selected", 400));

  const { classGroup, course, status, teacher, keyword } = req.query;

  const baseConditions = { campus, academicYear };
  if (classGroup) baseConditions.classGroup = classGroup;
  if (course) baseConditions.course = course;
  if (teacher) baseConditions.teacher = teacher;
  if (status === "active") baseConditions.status = true;
  else if (status === "deactive") baseConditions.status = false;
  if (keyword && keyword.trim()) {
    baseConditions.title = { $regex: keyword.trim(), $options: "i" };
  }

  if (req.query.paginate === "false") {
    const projects = await Project.find(baseConditions).populate(populateOptions).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, projects });
  }

  const resPerPage = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  const total = await Project.countDocuments(baseConditions);
  const active = await Project.countDocuments({ ...baseConditions, status: true });
  const deactive = await Project.countDocuments({ ...baseConditions, status: false });

  const projects = await Project.find(baseConditions)
    .populate(populateOptions)
    .sort({ createdAt: -1 })
    .skip((page - 1) * resPerPage)
    .limit(resPerPage);

  res.status(200).json({
    success: true,
    projects,
    pagination: {
      total,
      page,
      limit: resPerPage,
      totalPages: Math.ceil(total / resPerPage),
      counts: { total, active, deactive },
    },
  });
});

// ============================================================
// GET single => /api/v1/projects/:id
// ============================================================
export const getProjectDetails = catchAsyncErrors(async (req, res, next) => {
  const { campus } = getContext(req);
  if (!campus) return next(new ErrorHandler("Campus not selected", 400));

  const project = await Project.findOne({ _id: req.params.id, campus }).populate(populateOptions);
  if (!project) return next(new ErrorHandler("Project not found", 404));

  res.status(200).json({ success: true, project });
});

// ============================================================
// UPDATE => /api/v1/teacher/projects/:id
// ============================================================
export const updateProject = catchAsyncErrors(async (req, res, next) => {
  const { campus } = getContext(req);
  if (!campus) return next(new ErrorHandler("Campus not selected", 400));

  const existing = await Project.findOne({ _id: req.params.id, campus });
  if (!existing) return next(new ErrorHandler("Project not found", 404));

  if (req.body.targetType === "all") {
    req.body.targetStudents = [];
  }
  if (req.body.course === "") {
    req.body.course = null;
  }

  const project = await Project.findOneAndUpdate({ _id: req.params.id, campus }, req.body, {
    new: true,
    runValidators: true,
  }).populate(populateOptions);

  res.status(200).json({ success: true, project });
});

// ============================================================
// DELETE => /api/v1/teacher/projects/:id
// ============================================================
export const deleteProject = catchAsyncErrors(async (req, res, next) => {
  const { campus } = getContext(req);
  if (!campus) return next(new ErrorHandler("Campus not selected", 400));

  const project = await Project.findOne({ _id: req.params.id, campus });
  if (!project) return next(new ErrorHandler("Project not found", 404));

  await ProjectSubmission.deleteMany({ project: project._id });
  await Project.findByIdAndDelete(req.params.id);

  res.status(200).json({ success: true, message: "Project deleted successfully" });
});

// ============================================================
// GET (student-facing list) => /api/v1/student/projects
// ============================================================
export const getProjectsForStudent = catchAsyncErrors(async (req, res, next) => {
  const { academicYear, campus } = getContext(req);
  if (!academicYear) return next(new ErrorHandler("Academic Year not selected", 400));
  if (!campus) return next(new ErrorHandler("Campus not selected", 400));

  const studentId = req.query.studentId || req.user?._id;
  if (!studentId) return next(new ErrorHandler("Student could not be resolved", 400));

  const enrollment = await StudentEnrollment.findOne({ student: studentId, status: "active" });
  if (!enrollment) return next(new ErrorHandler("No active enrollment found for this student", 404));

  const { classGroup, status } = req.query;
  const targetClassGroup = classGroup || enrollment.classGroup;

  const baseConditions = {
    campus,
    academicYear,
    classGroup: targetClassGroup,
    $or: [{ targetType: "all" }, { targetType: "individual", targetStudents: studentId }],
  };
  if (status === "active") baseConditions.status = true;
  else if (status === "deactive") baseConditions.status = false;
  else baseConditions.status = true;

  const projects = await Project.find(baseConditions).populate(populateOptions).sort({ dueDate: 1 });

  const submissions = await ProjectSubmission.find({
    project: { $in: projects.map((p) => p._id) },
    student: studentId,
  });
  const submissionMap = new Map(submissions.map((s) => [s.project.toString(), s]));

  const projectsWithSubmission = projects.map((p) => ({
    ...p.toObject(),
    mySubmission: submissionMap.get(p._id.toString()) || null,
  }));

  res.status(200).json({
    success: true,
    classGroup: targetClassGroup,
    projects: projectsWithSubmission,
    total: projectsWithSubmission.length,
  });
});