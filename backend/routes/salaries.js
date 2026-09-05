import express from "express";
import {
  newSalary,
  generateMonthlySalaries,     // 👈 NEW
  getSalaries,
  getSalaryDetails,
  updateSalary,
  deleteSalary,
  getSalariesByEmployee,
  getUnpaidSalaries,
  getUnpaidSalariesByEmployee, // 👈 NEW
  getEmployeeSalarySummary,
  getSalaryStats,              // 👈 NEW
  applySalaryDeduction,        // 👈 NEW
  markSalaryAsPaid,
  paySalariesBulk,             // 👈 NEW
} from "../controllers/salariesControllers.js";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

// ========== Create / Generate ==========
router
  .route("/finance/salaries")
  .post(isAuthenticatedUser, authorizeRoles("admin", "finance"), newSalary)
  .get(isAuthenticatedUser, authorizeRoles("admin", "finance"), getSalaries);

// 👇 NEW: generate one salary row per active monthly contract for a
// given month+year (idempotent — skips employees already generated)
router
  .route("/finance/salaries/generate-monthly")
  .post(isAuthenticatedUser, authorizeRoles("admin", "finance"), generateMonthlySalaries);

// 👇 NEW: pay several salary records at once (one employee's several
// unpaid months, or several employees' current month in one click)
router
  .route("/finance/salaries/pay-bulk")
  .patch(isAuthenticatedUser, authorizeRoles("admin", "finance"), paySalariesBulk);

// 👇 NEW: one row per employee with any Unpaid salary (PaySalary picker)
router
  .route("/finance/salaries/unpaid/by-employee")
  .get(isAuthenticatedUser, authorizeRoles("admin", "finance"), getUnpaidSalariesByEmployee);

router
  .route("/finance/salaries/unpaid")
  .get(isAuthenticatedUser, authorizeRoles("admin", "finance"), getUnpaidSalaries);

// 👇 NEW: aggregate paid/unpaid totals for the stat cards
router
  .route("/finance/salaries/stats")
  .get(isAuthenticatedUser, authorizeRoles("admin", "finance"), getSalaryStats);

router
  .route("/finance/salaries/employee/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin", "finance"), getSalariesByEmployee);

router
  .route("/finance/salaries/summary/:employeeId")
  .get(isAuthenticatedUser, authorizeRoles("admin", "finance"), getEmployeeSalarySummary);

// 👇 NEW: apply/update a deduction with a reason, while still Unpaid
router
  .route("/finance/salaries/:id/deduction")
  .patch(isAuthenticatedUser, authorizeRoles("admin", "finance"), applySalaryDeduction);

// ========== Mark a single record as paid ==========
router
  .route("/finance/salaries/:id/pay")
  .patch(isAuthenticatedUser, authorizeRoles("admin", "finance"), markSalaryAsPaid);

// ========== Single record (kept last: /:id would otherwise swallow the
// more specific routes above) ==========
router
  .route("/finance/salaries/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin", "finance"), getSalaryDetails)
  .put(isAuthenticatedUser, authorizeRoles("admin", "finance"), updateSalary)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteSalary);

export default router;
