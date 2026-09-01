import express from "express";
import {
  newSalary,
  getSalaries,
  getSalaryDetails,
  updateSalary,
  deleteSalary,
  getSalariesByEmployee,
  getUnpaidSalaries,
  getEmployeeSalarySummary,
  markSalaryAsPaid,
} from "../controllers/salariesControllers.js";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

// ========== Create ==========
router
  .route("/finance/salaries")
  .post(isAuthenticatedUser, authorizeRoles("admin", "finance"), newSalary);

// ========== Read ==========
router
  .route("/finance/salaries")
  .get(isAuthenticatedUser, authorizeRoles("admin", "finance"), getSalaries);

router
  .route("/finance/salaries/unpaid")
  .get(isAuthenticatedUser, authorizeRoles("admin", "finance"), getUnpaidSalaries);

router
  .route("/finance/salaries/employee/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin", "finance"), getSalariesByEmployee);

router
  .route("/finance/salaries/summary/:employeeId")
  .get(isAuthenticatedUser, authorizeRoles("admin", "finance"), getEmployeeSalarySummary);

// ========== Single record ==========
router
  .route("/finance/salaries/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin", "finance"), getSalaryDetails)
  .put(isAuthenticatedUser, authorizeRoles("admin", "finance"), updateSalary)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteSalary);

// ========== Mark as paid ==========
router
  .route("/finance/salaries/:id/pay")
  .patch(isAuthenticatedUser, authorizeRoles("admin", "finance"), markSalaryAsPaid);

export default router;
