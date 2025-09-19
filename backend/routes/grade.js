import express from "express";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";
const router = express.Router();

import {
  newGrade,
  getGrades,
  updateGrade,
  deleteGrade,
  getGradeDetails,
  addCourseInGrade,
  deleteCourseInGrade,
  getCoursesAndGradeByRole,
  getCourseByGradeAndTeacherID,
  // getGradesByUserIdAndRole,
} from "../controllers/gradeControllers.js";

router.route("/admin/grades").post(isAuthenticatedUser, newGrade);

router.route("/grades").get(getGrades);
router
  .route("/admin/grades/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateGrade)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteGrade);

router.route("/grade/:id").get(getGradeDetails);

router
  .route("/admin/grade/add/:id")
  .patch(isAuthenticatedUser, authorizeRoles("admin"), addCourseInGrade);

router
  .route("/grade/grade-by-role")
  .post(getCoursesAndGradeByRole);

router
  .route("/admin/grade/remove/:id")
  .patch(isAuthenticatedUser, authorizeRoles("admin"), deleteCourseInGrade);

  router.post("/grades/getCourseByGradeAndTeacherID", getCourseByGradeAndTeacherID);
// router.route("/grades/user/:id").get(getGradesByUserIdAndRole);

export default router;
