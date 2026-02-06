import express from "express";
import {
  newClassGroup,
  getClassGroups,
  getClassGroupDetails,
  updateClassGroup,
  deleteClassGroup,
} from "../controllers/classGroupController.js";

import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

// Create Class Group
router
  .route("/admin/class-group")
  .post(isAuthenticatedUser, authorizeRoles("admin"), newClassGroup);

// Get all Class Groups
router.route("/class-group").get(getClassGroups);

// Get / Update / Delete Class Group
router
  .route("/admin/class-group/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateClassGroup)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteClassGroup);

router.route("/class-group/:id").get(getClassGroupDetails);

export default router;
