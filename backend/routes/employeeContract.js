// routes
import express from "express";

import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";
import {
  createEmployeeContract,
  getEmployeeContracts,
  getEmployeeContractDetails,
  updateEmployeeContract,
  updateLeaveAllowance,
  deleteEmployeeContract,
  terminateContract,
  resignContract,
  transferEmployee,
  approveReHire,
  getActiveContracts,
  getUncontractedEmployees,
  getStaffNeedingContract,
  expireOverdueContracts,
  getExpiringContracts,
  markExpiryAlertSent,
  getEmployeeContractHistory,
  checkActiveContractOnDate,
} from "../controllers/EmployeeContractController.js";

const router = express.Router();

// ========== Staff lists ==========
router.route("/staff/uncontracted").get(getUncontractedEmployees);
router.route("/staff/active").get(getActiveContracts);
router.route("/staff/needing-contract").get(getStaffNeedingContract);

// ========== Public / Authenticated read ==========
router.route("/employee-contracts").get(getEmployeeContracts);
router.route("/employee-contracts/expiring-soon").get(getExpiringContracts);
router.route("/employee-contracts/check").get(checkActiveContractOnDate);
router.route("/employee-contracts/history/:employeeId").get(getEmployeeContractHistory);
router.route("/employee-contracts/:id").get(getEmployeeContractDetails);

// ========== Admin: Create ==========
router
  .route("/admin/employee-contracts")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createEmployeeContract);

// ========== Admin: Update / Delete ==========
router
  .route("/admin/employee-contracts/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateEmployeeContract)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteEmployeeContract);

// ========== Admin: Leave allowance (separate from the generic update above,
// since the salary block — including annualLeaveAllowance — is locked there) ==========
router
  .route("/admin/employee-contracts/:id/leave-allowance")
  .patch(isAuthenticatedUser, authorizeRoles("admin"), updateLeaveAllowance);

// ========== Admin: Status changes ==========
router
  .route("/admin/employee-contracts/:id/terminate")
  .patch(isAuthenticatedUser, authorizeRoles("admin"), terminateContract);

router
  .route("/admin/employee-contracts/:id/resign")
  .patch(isAuthenticatedUser, authorizeRoles("admin"), resignContract);

router
  .route("/admin/employee-contracts/:id/rehire")
  .patch(isAuthenticatedUser, authorizeRoles("admin"), approveReHire);

router
  .route("/admin/employee-contracts/:id/alert-sent")
  .patch(isAuthenticatedUser, authorizeRoles("admin"), markExpiryAlertSent);

// ========== Admin: Transfer ==========
router
  .route("/admin/employee-contracts/transfer")
  .post(isAuthenticatedUser, authorizeRoles("admin"), transferEmployee);

// ========== Admin: Cron / Bulk actions ==========
router
  .route("/admin/employee-contracts/expire-overdue")
  .post(isAuthenticatedUser, authorizeRoles("admin"), expireOverdueContracts);

export default router;
