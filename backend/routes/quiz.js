import express from "express";

import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";
import { newQuiz, updateQuiz, getStudentsQuizRecord } from "../controllers/quizControllers.js";

const router = express.Router();

router.route("/students/quiz/marks").post(newQuiz);
router.route("/students/quiz/:id").put(updateQuiz);
router.route("/students/quiz-record").post(getStudentsQuizRecord);
export default router;
