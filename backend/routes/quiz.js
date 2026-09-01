// routes/quizRoutes.js
import express from "express";

import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";
import {
  fetchOrCreateQuiz,
  getQuizzes,
  getQuizDetails,
  updateQuizMarks,
  deleteQuiz,
} from "../controllers/quizControllers.js";

const router = express.Router();

// ✅ FIX: the original routes had NO auth middleware at all — anyone
// could hit these and post/alter marks. Locked down to teacher/admin.
router
  .route("/teacher/quiz/fetch-or-create")
  .post(isAuthenticatedUser, authorizeRoles("teacher", "admin"), fetchOrCreateQuiz);

router.route("/teacher/quizzes").get(isAuthenticatedUser, authorizeRoles("teacher", "admin"), getQuizzes);

router
  .route("/teacher/quiz/:id")
  .put(isAuthenticatedUser, authorizeRoles("teacher", "admin"), updateQuizMarks)
  .delete(isAuthenticatedUser, authorizeRoles("teacher", "admin"), deleteQuiz);

router.route("/quizzes/:id").get(isAuthenticatedUser, getQuizDetails);

export default router;
