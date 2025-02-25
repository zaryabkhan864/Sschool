import express from "express";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";
import { newAttendace,updateAttendance } from "../controllers/attendanceController.js";

const router = express.Router();

router.route("/attendance/new").post(newAttendace);
router.route("/attendance/:id").put(updateAttendance);
export default router;