// routes/homeworkRoutes.js
import express from "express";
import {
  newHomeworkAssignment,
  getHomeworkAssignments,
  getHomeworkAssignmentDetails,
  updateHomeworkAssignment,
  deleteHomeworkAssignment,
  getHomeworkForStudent,
  getTeacherClassGroupsAndCourses,
} from "../controllers/homeworkAssignmentController.js";

import {
  submitHomework,
  getSubmissionsForAssignment,
  getSubmissionDetails,
  gradeSubmission,
  deleteSubmission,
} from "../controllers/homeworkSubmissionController.js";

// ✅ ENABLED — these were commented out before, which is why req.user was
// always undefined and both "Student could not be resolved" and the
// teacher posting flow were failing. Adjust the import path/export names
// below if they differ from the rest of your route files.
import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

// ---------------- Teacher-facing: postings ----------------
router
  .route("/teacher/homework-assignments")
  .post(isAuthenticatedUser, authorizeRoles("teacher", "admin"), newHomeworkAssignment)
  .get(isAuthenticatedUser, authorizeRoles("teacher", "admin"), getHomeworkAssignments);

// ✅ NEW — self-contained replacement for the broken /courses/by-role
// endpoint; returns the current teacher's own class groups + courses.
router
  .route("/teacher/homework-meta")
  .get(isAuthenticatedUser, authorizeRoles("teacher", "admin"), getTeacherClassGroupsAndCourses);

router
  .route("/teacher/homework-assignments/:id")
  .put(isAuthenticatedUser, authorizeRoles("teacher", "admin"), updateHomeworkAssignment)
  .delete(isAuthenticatedUser, authorizeRoles("teacher", "admin"), deleteHomeworkAssignment);

router
  .route("/teacher/homework-assignments/:id/submissions")
  .get(isAuthenticatedUser, authorizeRoles("teacher", "admin"), getSubmissionsForAssignment);

router
  .route("/teacher/homework-submissions/:id/grade")
  .put(isAuthenticatedUser, authorizeRoles("teacher", "admin"), gradeSubmission);

// ---------------- Shared: details / delete ----------------
router.route("/homework-assignments/:id").get(isAuthenticatedUser, getHomeworkAssignmentDetails);

router
  .route("/homework-submissions/:id")
  .get(isAuthenticatedUser, getSubmissionDetails)
  .delete(isAuthenticatedUser, deleteSubmission);

// ---------------- Student-facing ----------------
router
  .route("/student/homework-assignments")
  .get(isAuthenticatedUser, authorizeRoles("student", "admin"), getHomeworkForStudent);

router
  .route("/student/homework-submissions")
  .post(isAuthenticatedUser, authorizeRoles("student"), submitHomework);

export default router;
