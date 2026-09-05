import express from "express";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";
import {
  getAttendanceSheet,
  submitAttendance,
  getAttendanceHistory,
  getClassAttendanceCalendar,
} from "../controllers/attendanceController.js";

const router = express.Router();

router.route("/attendance/sheet").get(isAuthenticatedUser, getAttendanceSheet);
router.route("/attendance").post(isAuthenticatedUser, submitAttendance);
router
  .route("/attendance/history")
  .get(isAuthenticatedUser, authorizeRoles("admin", "principle", "teacher"), getAttendanceHistory);
router
  .route("/attendance/calendar/class")
  .get(isAuthenticatedUser, authorizeRoles("admin", "principle", "teacher"), getClassAttendanceCalendar);

export default router;