import express from "express";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";
import {getAttendanceDetails,updateAttendance} from "../controllers/attendanceController.js"

const router = express.Router();

router.route("/attendance/new").post(getAttendanceDetails);
router.route("/attendance/:id").put(updateAttendance);
export default router;