// routes/examRoutes.js
import express from "express";

import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";
import {
  fetchOrCreateExam,
  getExams,
  getExamDetails,
  updateExamMarks,
  deleteExam,
} from "../controllers/examController.js";

const router = express.Router();

// ✅ FIX: the original routes had NO auth middleware at all — anyone
// could hit these and post/alter marks. Locked down to teacher/admin.
router
  .route("/teacher/exam/fetch-or-create")
  .post(isAuthenticatedUser, authorizeRoles("teacher", "admin"), fetchOrCreateExam);

router.route("/teacher/exams").get(isAuthenticatedUser, authorizeRoles("teacher", "admin"), getExams);

router
  .route("/teacher/exam/:id")
  .put(isAuthenticatedUser, authorizeRoles("teacher", "admin"), updateExamMarks)
  .delete(isAuthenticatedUser, authorizeRoles("teacher", "admin"), deleteExam);

router.route("/exams/:id").get(isAuthenticatedUser, getExamDetails);

export default router;
