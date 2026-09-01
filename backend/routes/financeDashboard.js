// backend/routes/financeDashboard.js
//
// NEW FILE — separate from fees.js/salaries.js/expenses.js so nothing
// existing has to be edited. Only adds one read-only endpoint the
// dashboard needs.

import express from "express";
import {
    getRecentFinanceActivity,
    getPayrollOverview,
} from "../controllers/financeDashboardController.js";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

// Merged recent activity feed (fees paid + expenses + salaries paid)
router
    .route("/finance/dashboard/recent-activity")
    .get(isAuthenticatedUser, authorizeRoles("admin", "finance"), getRecentFinanceActivity);

// Projected/committed monthly payroll from active employee contracts
router
    .route("/finance/dashboard/payroll-overview")
    .get(isAuthenticatedUser, authorizeRoles("admin", "finance"), getPayrollOverview);

export default router;
