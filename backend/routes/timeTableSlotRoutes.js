import express from "express";
import {
  getAndCreateTimeTableSlots,
  updateTimeTableSlots,
  getAvailableCoursesForSlot,
} from "../controllers/timeTableSlotController.js";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

router.route("/timetable-slot/:classGroupId")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAndCreateTimeTableSlots)
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateTimeTableSlots);

router.route("/available-courses")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAvailableCoursesForSlot);

export default router;