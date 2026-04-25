import express from "express";
import {
  createStudentEnrollment,
  getStudentEnrollments,
  getStudentEnrollmentDetails,
  updateStudentEnrollment,
  deleteStudentEnrollment,
  getUnenrolledStudents,
  getEnrolledStudentsWithDetails,
  transferStudent // ✅ NEW IMPORT
} from "../controllers/studentEnrollmentController.js";

import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

// ========== Student lists ==========
router.route("/students/unenrolled").get(getUnenrolledStudents);
router.route("/students/enrolled").get(getEnrolledStudentsWithDetails);

// ========== Public ==========
router.route("/student-enrollments").get(getStudentEnrollments);
router.route("/student-enrollments/:id").get(getStudentEnrollmentDetails);

// ========== Admin ==========
router
  .route("/admin/student-enrollments")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createStudentEnrollment);

router
  .route("/admin/student-enrollments/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateStudentEnrollment)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteStudentEnrollment);

// 🔥 NEW: TRANSFER ROUTE
router
  .route("/admin/student-enrollments/transfer")
  .post(isAuthenticatedUser, authorizeRoles("admin"), transferStudent);

export default router;