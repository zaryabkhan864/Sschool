// controllers/projectSubmissionController.js
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Project from "../models/project.js";
import ProjectSubmission from "../models/projectSubmission.js";
import StudentEnrollment from "../models/studentEnrollment.js";
import ErrorHandler from "../utils/errorHandler.js";

const studentPopulate = { path: "student", select: "firstName middleName lastName userId email" };

// ============================================================
// SUBMIT / RESUBMIT => /api/v1/student/project-submissions
// ============================================================
export const submitProject = catchAsyncErrors(async (req, res, next) => {
  const { project: projectId, submissionType, textContent, attachments } = req.body;

  if (!projectId) return next(new ErrorHandler("Project reference is required", 400));

  const project = await Project.findById(projectId);
  if (!project) return next(new ErrorHandler("Project not found", 404));
  if (!project.status) return next(new ErrorHandler("This project is no longer active", 400));

  const studentId = req.user?._id || req.body.student;
  if (!studentId) return next(new ErrorHandler("Student could not be resolved", 400));

  const isTargeted =
    project.targetType === "all" ||
    (project.targetType === "individual" &&
      project.targetStudents.some((id) => id.toString() === studentId.toString()));
  if (!isTargeted) return next(new ErrorHandler("You are not assigned this project", 403));

  const enrollment = await StudentEnrollment.findOne({ student: studentId, status: "active" });
  if (!enrollment) return next(new ErrorHandler("No active enrollment found for this student", 404));

  const submittedAt = new Date();
  const status = submittedAt > project.dueDate ? "late" : "submitted";

  const payload = {
    project: projectId,
    student: studentId,
    classGroup: project.classGroup,
    course: project.course,
    campus: project.campus,
    academicYear: project.academicYear,
    submissionType,
    textContent: submissionType === "text" ? textContent : undefined,
    attachments: submissionType === "file" ? attachments || [] : [],
    submittedAt,
    status,
  };

  const submission = await ProjectSubmission.findOneAndUpdate(
    { project: projectId, student: studentId },
    payload,
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  res.status(200).json({ success: true, submission });
});

// ============================================================
// GET submissions for one project (teacher view)
// => /api/v1/teacher/projects/:id/submissions
// ============================================================
export const getSubmissionsForProject = catchAsyncErrors(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!project) return next(new ErrorHandler("Project not found", 404));

  const submissions = await ProjectSubmission.find({ project: project._id })
    .populate(studentPopulate)
    .sort({ submittedAt: -1 });

  let targetedStudents = [];
  if (project.targetType === "all") {
    const enrollments = await StudentEnrollment.find({
      classGroup: project.classGroup,
      status: "active",
    }).populate(studentPopulate);
    targetedStudents = enrollments.filter((e) => e.student).map((e) => e.student);
  } else {
    targetedStudents = await Project.findById(project._id)
      .populate({ path: "targetStudents", select: "firstName middleName lastName userId email" })
      .then((p) => p.targetStudents);
  }

  const submittedIds = new Set(submissions.map((s) => s.student._id.toString()));
  const notSubmitted = targetedStudents.filter((s) => !submittedIds.has(s._id.toString()));

  res.status(200).json({
    success: true,
    project,
    submissions,
    notSubmitted,
    counts: {
      targeted: targetedStudents.length,
      submitted: submissions.length,
      pending: notSubmitted.length,
    },
  });
});

// ============================================================
// GET single submission => /api/v1/project-submissions/:id
// ============================================================
export const getSubmissionDetails = catchAsyncErrors(async (req, res, next) => {
  const submission = await ProjectSubmission.findById(req.params.id)
    .populate(studentPopulate)
    .populate({ path: "project", select: "title dueDate totalMarks" });

  if (!submission) return next(new ErrorHandler("Submission not found", 404));

  res.status(200).json({ success: true, submission });
});

// ============================================================
// GRADE => /api/v1/teacher/project-submissions/:id/grade
// ============================================================
export const gradeSubmission = catchAsyncErrors(async (req, res, next) => {
  const { marksObtained, feedback } = req.body;

  const submission = await ProjectSubmission.findById(req.params.id);
  if (!submission) return next(new ErrorHandler("Submission not found", 404));

  submission.marksObtained = marksObtained ?? submission.marksObtained;
  submission.feedback = feedback ?? submission.feedback;
  submission.status = "graded";
  await submission.save();

  res.status(200).json({ success: true, submission });
});

// ============================================================
// DELETE => /api/v1/project-submissions/:id
// ============================================================
export const deleteSubmission = catchAsyncErrors(async (req, res, next) => {
  const submission = await ProjectSubmission.findById(req.params.id);
  if (!submission) return next(new ErrorHandler("Submission not found", 404));

  await ProjectSubmission.findByIdAndDelete(req.params.id);

  res.status(200).json({ success: true, message: "Submission deleted successfully" });
});
