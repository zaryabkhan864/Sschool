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

<<<<<<< HEAD
router.route("/courses").post(newCourse);
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
=======
router
  .route("/admin/courses")
  .post(isAuthenticatedUser, authorizeRoles("admin"), newCourse);
router.route("/courses").get(getCourses);
router
  .route("/admin/courses/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateCourse);
router
  .route("/admin/courses/:id")
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteCourse);
router.route("/courses/:id").get(getCourseDetails);

>>>>>>> 5d7da77 (Authentication for POST,PUT and DELETE routes is implemented in course)
export default router;
