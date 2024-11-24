import express from "express";
import {
  newTeacher,
  getTeachers,
  updateTeacher,
  deleteTeacher,
  getTeacherDetails,
} from "../controllers/teacherControllers.js";
import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth";

const router = express.Router();

router
  .route("/admin/teacher")
  .post(isAuthenticatedUser, authorizeRoles("admin"), newTeacher);
router.route("/teachers").get(getTeachers);
router
  .route("/admin/teacher/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateTeacher);
router
  .route("/admin/teacher/:id")
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteTeacher);
router.route("/teacher/:id").get(getTeacherDetails);

export default router;
