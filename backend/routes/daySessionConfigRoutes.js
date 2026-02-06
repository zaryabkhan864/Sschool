import express from "express";
import {
  newDaySessionConfig,
  getDaySessionConfigs,
  updateDaySessionConfig,
  deleteDaySessionConfig,
} from "../controllers/daySessionConfigController.js";

import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

// Create Day Session Config
router
  .route("/admin/day-session-config")
  .post(isAuthenticatedUser, authorizeRoles("admin"), newDaySessionConfig);

// Get Day Session Configs
router.route("/day-session-config").get(getDaySessionConfigs);

// Update / Delete Day Session Config
router
  .route("/admin/day-session-config/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateDaySessionConfig)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteDaySessionConfig);

export default router;
