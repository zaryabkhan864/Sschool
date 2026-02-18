import express from "express";
import {
  newWeekDay,
  getWeekDays,
  getWeekDayDetails,    // ✅ import kiya
  updateWeekDay,
  deleteWeekDay,
} from "../controllers/weekDayController.js";

import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

// ➕ Create Week Day (admin)
router
  .route("/admin/week-day")
  .post(isAuthenticatedUser, authorizeRoles("admin"), newWeekDay);

// 📋 Get all Week Days (public) — supports pagination, search, filter
router.route("/week-day").get(getWeekDays);

// 🔍 Get single Week Day details (admin)
router
  .route("/admin/week-day/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getWeekDayDetails);  // ✅ add kiya

// ✏️ Update Week Day (admin)
router
  .route("/admin/week-day/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateWeekDay);

// ❌ Delete Week Day (admin)
router
  .route("/admin/week-day/:id")
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteWeekDay);

export default router;