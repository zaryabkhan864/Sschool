import express from "express";

import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";
import { newQuiz } from "../controllers/quizControllers.js";

const router = express.Router();

router.route("/students/quiz/marks").post(newQuiz);
export default router;
