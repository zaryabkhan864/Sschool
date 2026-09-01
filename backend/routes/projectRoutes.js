// routes/projectRoutes.js
import express from "express";

import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.js";
import {
  newProject,
  getProjects,
  getProjectDetails,
  updateProject,
  deleteProject,
  getProjectsForStudent,
} from "../controllers/projectController.js";

import {
  submitProject,
  getSubmissionsForProject,
  getSubmissionDetails,
  gradeSubmission,
  deleteSubmission,
} from "../controllers/projectSubmissionController.js";

const router = express.Router();

// ---------------- Teacher-facing: postings ----------------
router
  .route("/teacher/projects")
  .post(isAuthenticatedUser, authorizeRoles("teacher", "admin"), newProject)
  .get(isAuthenticatedUser, authorizeRoles("teacher", "admin"), getProjects);

router
  .route("/teacher/projects/:id")
  .put(isAuthenticatedUser, authorizeRoles("teacher", "admin"), updateProject)
  .delete(isAuthenticatedUser, authorizeRoles("teacher", "admin"), deleteProject);

router
  .route("/teacher/projects/:id/submissions")
  .get(isAuthenticatedUser, authorizeRoles("teacher", "admin"), getSubmissionsForProject);

router
  .route("/teacher/project-submissions/:id/grade")
  .put(isAuthenticatedUser, authorizeRoles("teacher", "admin"), gradeSubmission);

// ---------------- Shared: details / delete ----------------
router.route("/projects/:id").get(isAuthenticatedUser, getProjectDetails);

router
  .route("/project-submissions/:id")
  .get(isAuthenticatedUser, getSubmissionDetails)
  .delete(isAuthenticatedUser, deleteSubmission);

// ---------------- Student-facing ----------------
router
  .route("/student/projects")
  .get(isAuthenticatedUser, authorizeRoles("student", "admin"), getProjectsForStudent);

router
  .route("/student/project-submissions")
  .post(isAuthenticatedUser, authorizeRoles("student"), submitProject);

export default router;