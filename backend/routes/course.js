import express from "express";
import {
  getCourses,
  newCourse,
  getCourseDetails,
  updateCourse,
  deleteCourse,
} from "../controllers/courseContollers.js";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

router
  .route("/admin/courses")
  .post(isAuthenticatedUser, authorizeRoles("admin"), newCourse);

router.route("/courses").get(getCourses);
router
  .route("/admin/courses/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateCourse)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteCourse);

router.route("/courses/:id").get(getCourseDetails);

export default router;
