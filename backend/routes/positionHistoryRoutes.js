import express from "express";
import {
  recordPositionChange,
  getContractPositionTimeline,
  getContractCurrentPosition,
  getEmployeeCareerTimeline,
} from "../controllers/positionHistory.js";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

// ========== Position History ==========

// Record a promotion / raise / demotion / lateral move.
// This is the only write-path for role/designationLevel/salary changes —
// the employee-contracts PUT endpoint blocks direct edits to those fields.
router
  .route("/position-history")
  .post(
    isAuthenticatedUser,
    authorizeRoles("admin", "principle", "superadmin"),
    recordPositionChange
  );

// Full role/designation/salary timeline for one contract
router
  .route("/position-history/contract/:contractId")
  .get(
    isAuthenticatedUser,
    authorizeRoles("admin", "principle", "vice_principal", "superadmin"),
    getContractPositionTimeline
  );

// Current position snapshot for one contract
router
  .route("/position-history/contract/:contractId/current")
  .get(
    isAuthenticatedUser,
    authorizeRoles("admin", "principle", "vice_principal", "superadmin"),
    getContractCurrentPosition
  );

// Full career timeline for an employee, stitched across ALL their contracts
// (e.g. promotions that happened at different campuses over the years)
router
  .route("/position-history/employee/:employeeId")
  .get(
    isAuthenticatedUser,
    authorizeRoles("admin", "principle", "vice_principal", "superadmin"),
    getEmployeeCareerTimeline
  );

export default router;
