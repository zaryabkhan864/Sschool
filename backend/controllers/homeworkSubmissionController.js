// controllers/homeworkSubmissionController.js
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import HomeworkAssignment from "../models/homeworkAssignment.js";
import HomeworkSubmission from "../models/homeworkSubmission.js";
import StudentEnrollment from "../models/studentEnrollment.js";
import ErrorHandler from "../utils/errorHandler.js";

const studentPopulate = {
  path: "student",
  select: "firstName middleName lastName userId email",
};

// ============================================================
// SUBMIT / RESUBMIT => /api/v1/student/homework-submissions
// One doc per (homeworkAssignment, student) — upsert on resubmission
// ============================================================
export const submitHomework = catchAsyncErrors(async (req, res, next) => {
  const { homeworkAssignment, submissionType, textContent, attachments } = req.body;

  if (!homeworkAssignment) {
    return next(new ErrorHandler("Homework/Assignment reference is required", 400));
  }

  const homework = await HomeworkAssignment.findById(homeworkAssignment);
  if (!homework) {
    return next(new ErrorHandler("Homework/Assignment not found", 404));
  }
  if (!homework.status) {
    return next(new ErrorHandler("This posting is no longer active", 400));
  }

  const studentId = req.user?._id || req.body.student;
  if (!studentId) {
    return next(new ErrorHandler("Student could not be resolved", 400));
  }

  // authorization: student must be targeted (all, or individually named)
  const isTargeted =
    homework.targetType === "all" ||
    (homework.targetType === "individual" &&
      homework.targetStudents.some((id) => id.toString() === studentId.toString()));
  if (!isTargeted) {
    return next(new ErrorHandler("You are not assigned this homework/assignment", 403));
  }

  const enrollment = await StudentEnrollment.findOne({ student: studentId, status: "active" });
  if (!enrollment) {
    return next(new ErrorHandler("No active enrollment found for this student", 404));
  }

  const submittedAt = new Date();
  const status = submittedAt > homework.dueDate ? "late" : "submitted";

  const payload = {
    homeworkAssignment,
    student: studentId,
    classGroup: homework.classGroup,
    course: homework.course,
    campus: homework.campus,
    academicYear: homework.academicYear,
    submissionType,
    textContent: submissionType === "text" ? textContent : undefined,
    attachments: submissionType === "file" ? attachments || [] : [],
    submittedAt,
    status,
  };

  // upsert: create on first submission, overwrite on resubmission
  const submission = await HomeworkSubmission.findOneAndUpdate(
    { homeworkAssignment, student: studentId },
    payload,
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  res.status(200).json({ success: true, submission });
});

// ============================================================
// GET all submissions for one posting (teacher view)
// => /api/v1/teacher/homework-assignments/:id/submissions
// Cross-references targeted students so teacher can see who has NOT submitted
// ============================================================
export const getSubmissionsForAssignment = catchAsyncErrors(async (req, res, next) => {
  const homework = await HomeworkAssignment.findById(req.params.id);
  if (!homework) {
    return next(new ErrorHandler("Homework/Assignment not found", 404));
  }

  const submissions = await HomeworkSubmission.find({ homeworkAssignment: homework._id })
    .populate(studentPopulate)
    .sort({ submittedAt: -1 });

  let targetedStudents = [];
  if (homework.targetType === "all") {
    const enrollments = await StudentEnrollment.find({
      classGroup: homework.classGroup,
      status: "active",
    }).populate(studentPopulate);
    targetedStudents = enrollments.filter((e) => e.student).map((e) => e.student);
  } else {
    targetedStudents = await HomeworkAssignment.findById(homework._id)
      .populate({ path: "targetStudents", select: "firstName middleName lastName userId email" })
      .then((h) => h.targetStudents);
  }

  const submittedIds = new Set(submissions.map((s) => s.student._id.toString()));
  const notSubmitted = targetedStudents.filter((s) => !submittedIds.has(s._id.toString()));

  res.status(200).json({
    success: true,
    homework,
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
// GET single submission details => /api/v1/homework-submissions/:id
// ============================================================
export const getSubmissionDetails = catchAsyncErrors(async (req, res, next) => {
  const submission = await HomeworkSubmission.findById(req.params.id)
    .populate(studentPopulate)
    .populate({ path: "homeworkAssignment", select: "title type dueDate totalMarks" });

  if (!submission) {
    return next(new ErrorHandler("Submission not found", 404));
  }

  res.status(200).json({ success: true, submission });
});

// ============================================================
// GRADE => /api/v1/teacher/homework-submissions/:id/grade
// ============================================================
export const gradeSubmission = catchAsyncErrors(async (req, res, next) => {
  const { marksObtained, feedback } = req.body;

  const submission = await HomeworkSubmission.findById(req.params.id);
  if (!submission) {
    return next(new ErrorHandler("Submission not found", 404));
  }

  submission.marksObtained = marksObtained ?? submission.marksObtained;
  submission.feedback = feedback ?? submission.feedback;
  submission.status = "graded";
  await submission.save();

  res.status(200).json({ success: true, submission });
});

// ============================================================
// DELETE => /api/v1/homework-submissions/:id
// ============================================================
export const deleteSubmission = catchAsyncErrors(async (req, res, next) => {
  const submission = await HomeworkSubmission.findById(req.params.id);
  if (!submission) {
    return next(new ErrorHandler("Submission not found", 404));
  }

  await HomeworkSubmission.findByIdAndDelete(req.params.id);

  res.status(200).json({ success: true, message: "Submission deleted successfully" });
});
