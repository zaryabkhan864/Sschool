import express from "express";
import {
  getContractAudit,
  getAllContractsAudit,
  getEmployeeAuditHistory,
  getTerminatedContractsAudit,
  getContractsCreatedByAdmin,
  getContractsUpdatedByAdmin,
  getReHireApprovedContracts,
  getAuditStats,
} from "../controllers/auditControllers.js";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

// All audit routes are admin-only — audit data is sensitive

// ========== Stats & Summaries ==========
router
  .route("/audit/stats")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAuditStats);

// ========== All contracts audit trail ==========
router
  .route("/audit/contracts")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAllContractsAudit);

// ========== Single contract audit trail ==========
router
  .route("/audit/contracts/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getContractAudit);

// ========== Terminated contracts ==========
router
  .route("/audit/terminated")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getTerminatedContractsAudit);

// ========== Re-hire approved contracts ==========
router
  .route("/audit/rehire-approved")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getReHireApprovedContracts);

// ========== Employee full audit history ==========
router
  .route("/audit/employee/:employeeId")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getEmployeeAuditHistory);

// ========== Admin-specific audit views ==========
router
  .route("/audit/created-by/:adminId")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getContractsCreatedByAdmin);

router
  .route("/audit/updated-by/:adminId")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getContractsUpdatedByAdmin);

export default router;
