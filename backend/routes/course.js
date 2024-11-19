import express from "express";
import {
  getCourses,
  newCourse,
  getCourseDetails,
  updateCourse,
  deleteCourse,
} from "../controllers/courseContollers.js";

const router = express.Router();

router.route("/courses").get(getCourses);
router.route("/courses").post(newCourse);
router.route("/courses/:id").get(getCourseDetails);
router.route("/courses/:id").put(updateCourse);
router.route("/courses/:id").delete(deleteCourse);
export default router;



