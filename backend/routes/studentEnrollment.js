import express from "express";
import {
  createStudentEnrollment,
  getStudentEnrollments,
  getStudentEnrollmentDetails,
  updateStudentEnrollment,
  deleteStudentEnrollment,
  getUnenrolledStudents,
  getEnrolledStudentsWithDetails,
  getStudentsNeedingEnrollment,
  getExpiringEnrollments,
  checkActiveEnrollmentOnDate,
  terminateEnrollment,
  resignEnrollment,
  approveReEnroll,
  markEnrollmentExpiryAlertSent,
  expireOverdueEnrollments,
  transferStudent,
  getStudentEnrollmentHistory,
} from "../controllers/studentEnrollmentController.js";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

// ========== Student lists (backend reads campus+year from cookie) ==========
router.route("/students/unenrolled").get(getUnenrolledStudents);
router.route("/students/enrolled").get(getEnrolledStudentsWithDetails);
router.route("/students/needing-enrollment").get(
  isAuthenticatedUser,
  getStudentsNeedingEnrollment
);

// ========== Expiring & checks ==========
router.route("/student-enrollments/expiring-soon").get(
  isAuthenticatedUser,
  getExpiringEnrollments
);
router.route("/student-enrollments/check").get(
  isAuthenticatedUser,
  checkActiveEnrollmentOnDate
);

// ========== History ==========
router.route("/student-enrollments/history/:studentId").get(
  isAuthenticatedUser,
  getStudentEnrollmentHistory
);

// ========== Authenticated reads ==========
router.route("/student-enrollments").get(getStudentEnrollments);
router.route("/student-enrollments/:id").get(getStudentEnrollmentDetails);

// ========== Admin: Create ==========
router
  .route("/admin/student-enrollments")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createStudentEnrollment);

// ========== Admin: Update / Delete ==========
router
  .route("/admin/student-enrollments/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateStudentEnrollment)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteStudentEnrollment);

// ========== Admin: Terminate ==========
router
  .route("/admin/student-enrollments/:id/terminate")
  .patch(isAuthenticatedUser, authorizeRoles("admin"), terminateEnrollment);

// ========== Admin: Resign ==========
router
  .route("/admin/student-enrollments/:id/resign")
  .patch(isAuthenticatedUser, authorizeRoles("admin"), resignEnrollment);

// ========== Admin: Re-enroll ==========
router
  .route("/admin/student-enrollments/:id/re-enroll")
  .patch(isAuthenticatedUser, authorizeRoles("admin"), approveReEnroll);

// ========== Admin: Mark expiry alert ==========
router
  .route("/admin/student-enrollments/:id/alert-sent")
  .patch(isAuthenticatedUser, authorizeRoles("admin"), markEnrollmentExpiryAlertSent);

// ========== Admin: Expire overdue (cron) ==========
router
  .route("/admin/student-enrollments/expire-overdue")
  .post(isAuthenticatedUser, authorizeRoles("admin"), expireOverdueEnrollments);

// ========== Admin: Transfer ==========
router
  .route("/admin/student-enrollments/transfer")
  .post(isAuthenticatedUser, authorizeRoles("admin"), transferStudent);

export default router;
