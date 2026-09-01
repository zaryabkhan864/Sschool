// scholarshipRoutes.js
import express from "express";
import {
  getScholarshipByStudent,
  getScholarships,
  getScholarshipDetails,
  createScholarship,
  updateScholarship,
  deleteScholarship,
} from "../controllers/scholarshipController.js";

import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();
router
  .route("/scholarships/student/:studentId")
  .get(isAuthenticatedUser, getScholarshipByStudent);

// Admin scholarship list + create
router
  .route("/admin/scholarships")
  .get(isAuthenticatedUser, authorizeRoles("admin", "superadmin"), getScholarships)
  .post(isAuthenticatedUser, authorizeRoles("admin", "superadmin"), createScholarship);
router
  .route("/admin/scholarships/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin", "superadmin"), getScholarshipDetails)
  .put(isAuthenticatedUser, authorizeRoles("admin", "superadmin"), updateScholarship)
  .delete(isAuthenticatedUser, authorizeRoles("admin", "superadmin"), deleteScholarship);

export default router;
