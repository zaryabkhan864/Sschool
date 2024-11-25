import express from "express";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";
const router = express.Router();

import {
  createGrade,
  getGrades,
  updateGrade,
  deleteGrade,
  getGradeDetails,
} from "../controllers/gradeControllers.js";

router.route("/admin/grade").post(isAuthenticatedUser, createGrade);

router.route("/grades").get(getGrades);
router.route("/admin/grade/:id").put(isAuthenticatedUser, authorizeRoles("admin"), updateGrade)
  .delete(isAuthenticatedUser,authorizeRoles("admin"),deleteGrade);

router.route("/grade/:id").get(getGradeDetails);

export default router;
