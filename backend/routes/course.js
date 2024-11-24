import express from "express";
import {
  getCourses,
  newCourse,
  getCourseDetails,
  updateCourse,
  deleteCourse,
} from "../controllers/courseContollers.js";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth";

const router = express.Router();

router.route("/courses").get(getCourses);
router
  .route("/admin/courses")
  .post(isAuthenticated, authorizeRoles("admin"), newCourse);
router
  .route("/admin/courses/:id")
  .get(isAuthenticated, authorizeRoles("admin"), getCourseDetails);
router
  .route("admin/courses/:id")
  .put(isAuthenticated, authorizeRoles("admin"), updateCourse);
router
  .route("admin/courses/:id")
  .delete(isAuthenticated, authorizeRoles("admin"), deleteCourse);
export default router;
