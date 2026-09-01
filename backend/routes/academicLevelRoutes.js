import express from "express";
import {
  newAcademicLevel,
  getAcademicLevels,
  getAcademicLevelDetails,
  updateAcademicLevel,
  deleteAcademicLevel,
} from "../controllers/academicLevelController.js";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

// Create Academic Level
router
  .route("/admin/academic-level")
  .post(isAuthenticatedUser, authorizeRoles("admin"), newAcademicLevel);

// Get all Academic Levels
router.route("/academic-level").get(getAcademicLevels);

// Get single Academic Level
router.route("/academic-level/:id").get(getAcademicLevelDetails);

// Update / Delete Academic Level
router
  .route("/admin/academic-level/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateAcademicLevel)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteAcademicLevel);

export default router;
