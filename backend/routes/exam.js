import express from "express";

import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";
import { getStudentsExamRecord, newExam, updateExam } from "../controllers/examController.js";


const router = express.Router();

router.route("/students/exam/marks").post(newExam);
router.route("/students/exam/:id").put(updateExam);
router.route("/students/exam-record").post(getStudentsExamRecord);
export default router;
