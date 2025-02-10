import express from "express";
import {
    newFee,
    getFees,
    getFeeDetails,
    updateFee,
    deleteFee,
    getFeesByStudent,
    getUnpaidFees,
    getOverdueFees,
    getFeesStats,
    getRevenueVsExpenses
} from "../controllers/feesController.js";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

export const router = express.Router();

// Create new fee entry

router
    .route("/finance/fees")
    .post(isAuthenticatedUser, authorizeRoles("admin", "finance"), newFee);
// Get all fees
router
    .route("/finance/get/fees")
    .get(isAuthenticatedUser, authorizeRoles("admin", "finance"), getFees);

// Update fee record

router.route("/fees/:id")
    .put(isAuthenticatedUser, authorizeRoles("admin", "finance"), updateFee);

// Delete fee record
router.route("/fees/:id")
    .delete(isAuthenticatedUser, authorizeRoles("admin", "finance"), deleteFee);


// Get all fees for a specific student
router.route("/fees/student/:id")
    .get(isAuthenticatedUser, authorizeRoles("admin", "finance"), getFeesByStudent);


// Get unpaid fees
router.route("/fees/unpaid")
    .get(isAuthenticatedUser, authorizeRoles("admin", "finance"), getUnpaidFees);


// Get overdue fees
router.route("/fees/overdue")
    .get(isAuthenticatedUser, authorizeRoles("admin", "finance"), getOverdueFees);

// Get all fees statistics
router.route("/fees/statistics")
    .get(isAuthenticatedUser, authorizeRoles("admin", "finance"), getFeesStats);

// Get revenue vs expenses
router.route("/revenue/expenses")
    .get(isAuthenticatedUser, authorizeRoles
        ("admin", "finance"), getRevenueVsExpenses);

// Get single fee details
router.route("/fees/:id")
    .get(isAuthenticatedUser, authorizeRoles("admin", "finance"), getFeeDetails);

export default router;