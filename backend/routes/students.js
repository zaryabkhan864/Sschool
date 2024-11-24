import express from "express";
import {
  createStudent,
  getStudents,
  updateStudent,
  deleteStudent,
  getStudentDetails,
} from "../controllers/studentControllers.js";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

router
  .route("/admin/student")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createStudent);
router.route("/students").get(getStudents);
router
  .route("/admin/student/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateStudent);
router
  .route("/admin/student/:id")
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteStudent);
router.route("/student/:id").get(getStudentDetails);
export default router;
