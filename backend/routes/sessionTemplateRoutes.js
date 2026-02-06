import express from "express";
import {
  newSessionTemplate,
  getSessionTemplates,
  updateSessionTemplate,
  deleteSessionTemplate,
} from "../controllers/sessionTemplateController.js";

import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

// Create Session Template
router
  .route("/admin/session-template")
  .post(isAuthenticatedUser, authorizeRoles("admin"), newSessionTemplate);

// Get Session Templates
router.route("/session-template").get(getSessionTemplates);

// Update / Delete Session Template
router
  .route("/admin/session-template/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateSessionTemplate)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteSessionTemplate);

export default router;
