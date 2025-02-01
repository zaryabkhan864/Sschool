import express from "express";

import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";
import { newQuiz, updateQuiz } from "../controllers/quizControllers.js";

const router = express.Router();

router.route("/students/quiz/marks").post(newQuiz);
router.route("/students/quiz/:id").put(updateQuiz);
export default router;
