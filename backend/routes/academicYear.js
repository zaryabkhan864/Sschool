import express from "express";
import {
    createAcademicYear,
    getAcademicYears,
    getAcademicYearDetails,
    updateAcademicYear,
    deleteAcademicYear,
    getAcademicYearsList,
  } from "../controllers/academicYearController.js";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

// Public routes
router.route("/academic-years").get(getAcademicYears);           
router.route("/academic-years/list").get(getAcademicYearsList);   
router.route("/academic-years/:id").get(getAcademicYearDetails);

// Admin-only routes
router
  .route("/admin/academic-years")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createAcademicYear);

router
  .route("/admin/academic-years/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateAcademicYear)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteAcademicYear);

export default router;