import express from "express";

import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";
import { updateExam, getExamDetails } from "../controllers/examController.js";

const router = express.Router();

router.route("/exam/student-marks").post(getExamDetails);
router.route("/exam/:id").put(updateExam);
export default router;
