import express from "express";
import {
  addCourseInTeacher,
  deleteCourseInTeacher,
  deleteTeacher,
  getGradesByRole,
  getTeacherDetails,
  getTeachers,
  newTeacher,
  updateTeacher,
} from "../controllers/teacherControllers.js";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();
router
  .route("/admin/teacher")
  .post(isAuthenticatedUser, authorizeRoles("admin"), newTeacher);

router.route("/teachers").get(getTeachers);

router
  .route("/admin/teacher/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateTeacher)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteTeacher);

router.route("/teacher/:id").get(getTeacherDetails);

router
  .route("/admin/teacher/add/:id")
  .patch(isAuthenticatedUser, authorizeRoles("admin"), addCourseInTeacher);

router
  .route("/admin/teacher/remove/:id")
  .patch(isAuthenticatedUser, authorizeRoles("admin"), deleteCourseInTeacher);

router
  .route("/teacher/grades-by-role")
  .post(getGradesByRole);

export default router;