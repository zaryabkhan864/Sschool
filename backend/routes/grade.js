// routes/gradeRoutes.js
import express from "express";
import { 
  newGrade, 
  getGrades, 
  getGradeDetails, 
  updateGrade, 
  deleteGrade 
} from "../controllers/gradeControllers.js";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

// ============ PUBLIC ROUTES ============
// Get all grades (Public)
router.route("/grades").get(getGrades);

// Get single grade details (Public)
router.route("/grades/:id").get(getGradeDetails);

// ============ ADMIN ROUTES ============
// Create new grade (Admin only)
router.route("/admin/grades")
  .post(isAuthenticatedUser, authorizeRoles("admin"), newGrade);

// Update grade (Admin only)
router.route("/admin/grades/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateGrade)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteGrade);

export default router;