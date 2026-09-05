// backend/routes/financeDashboard.js
import express from "express";
import {
    getRecentFinanceActivity,
    getPayrollOverview,
    getAcademicYearFinanceSummary, // 👈 NEW
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

// 👇 NEW: whole-academic-year collected / due / paid-out / payable-pending
router
    .route("/finance/dashboard/academic-year-summary")
    .get(isAuthenticatedUser, authorizeRoles("admin", "finance"), getAcademicYearFinanceSummary);

export default router;