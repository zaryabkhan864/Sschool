import express from "express";
import {
  getCourses,
  newCourse,
  bulkCreateCourses,   // <-- import the new controller
  getCourseDetails,
  updateCourse,
  deleteCourse,
  getCoursesByGradeAndTeacherID,
} from "../controllers/courseContollers.js";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

export const router = express.Router();

// Single course creation
router
  .route("/admin/courses")
  .post(isAuthenticatedUser, authorizeRoles("admin"), newCourse);

// ⬇️ NEW bulk creation route (placed before :id)
router
  .route("/admin/courses/bulk")
  .post(bulkCreateCourses);

router.route("/courses").get(getCourses);

router
  .route("/admin/courses/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateCourse)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteCourse);

router.route("/courses/:id").get(getCourseDetails);

router.route("/courses/grade/teacher").post(getCoursesByGradeAndTeacherID);

export default router;