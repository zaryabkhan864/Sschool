import express from "express";
import {
    newSalary,
    getSalaries,
    getSalaryDetails,
    updateSalary,
    deleteSalary,
    getSalariesByEmployee,
    getUnpaidSalaries
} from "../controllers/salariesControllers.js";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

export const router = express.Router();

// Create new salary entry
router
    .route("/finance/salaries")
    .post(isAuthenticatedUser, authorizeRoles("admin", "finance"), newSalary);

// Get all salaries
router
    .route("/finance/get/salaries")
    .get(isAuthenticatedUser, authorizeRoles("admin", "finance"), getSalaries);

// Get single salary details
router.route("/salaries/:id")
    .get(isAuthenticatedUser, authorizeRoles("admin", "finance"), getSalaryDetails);

// Update salary record
router.route("/salaries/:id")
    .put(isAuthenticatedUser, authorizeRoles("admin", "finance"), updateSalary);

// Delete salary record
router.route("/salaries/:id")
    .delete(isAuthenticatedUser, authorizeRoles("admin", "finance"), deleteSalary);

// Get all salaries for a specific employee
router.route("/salaries/employee/:id")
    .get(isAuthenticatedUser, authorizeRoles("admin", "finance"), getSalariesByEmployee);

// Get unpaid salaries
router.route("/salaries/unpaid")
    .get(isAuthenticatedUser, authorizeRoles("admin", "finance"), getUnpaidSalaries);

export default router;
