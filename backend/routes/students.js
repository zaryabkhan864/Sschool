import express from "express";
import {
  deleteStudent,
  getStudentDetails,
  getStudents,
  getStudentsQuizRecord,
  // newStudent,
  updateStudent,
  getStudentsWithGrades
} from "../controllers/studentControllers.js";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

// router
//   .route("/admin/students")
//   .post(isAuthenticatedUser, authorizeRoles("admin"), newStudent);

router.route("/students").get(getStudents);
router.route("/students/grades/:type").get(getStudentsWithGrades);
router
  .route("/admin/student/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateStudent);
router
  .route("/admin/student/:id")
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteStudent);
router.route("/student/:id").get(getStudentDetails);
router.route("/students/quiz-record").post(getStudentsQuizRecord);
export default router;
