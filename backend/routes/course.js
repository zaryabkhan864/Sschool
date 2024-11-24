import express from "express";
import {
  getCourses,
  newCourse,
  getCourseDetails,
  updateCourse,
  deleteCourse,
} from "../controllers/courseContollers.js";

const router = express.Router();

router.route("/courses").post(newCourse);
router.route("/courses").get(getCourses);
router.route("/courses/:id").put(updateCourse);
router.route("/courses/:id").delete(deleteCourse);
router.route("/courses/:id").get(getCourseDetails);

export default router;



