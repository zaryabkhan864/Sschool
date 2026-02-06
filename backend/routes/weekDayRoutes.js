import express from "express";
import {
  newWeekDay,
  getWeekDays,
  updateWeekDay,
  deleteWeekDay,
} from "../controllers/weekDayController.js";

import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

// Create Week Day
router
  .route("/admin/week-day")
  .post(isAuthenticatedUser, authorizeRoles("admin"), newWeekDay);

// Get all Week Days
router.route("/week-day").get(getWeekDays);

// Update / Delete Week Day
router
  .route("/admin/week-day/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateWeekDay)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteWeekDay);

export default router;
