import express from "express";
import {
  newTimeTableSlot,
  getTimeTableSlots,
  deleteTimeTableSlot,
} from "../controllers/timeTableSlotController.js";

import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

// Create Timetable Slot
router
  .route("/admin/timetable-slot")
  .post(isAuthenticatedUser, authorizeRoles("admin"), newTimeTableSlot);

// Get Timetable Slots
router.route("/timetable-slot").get(getTimeTableSlots);

// Delete Timetable Slot
router
  .route("/admin/timetable-slot/:id")
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteTimeTableSlot);

export default router;
