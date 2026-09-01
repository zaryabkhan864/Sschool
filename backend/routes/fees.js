// routes 
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
    getRevenueVsExpenses,
    getFeesByCurrency,   // 👈 yeh import add karo
    getUpcomingFeeDues,   // 👈 finance reminder list
    markFeeReminderSent,  // 👈 finance: mark reminder as sent
    getPendingDuesByStudent, // 👈 NEW: ListFees screen (one row per student)
    getClearedDuesStudents,  // 👈 NEW: ListDues screen (dues fully clear)
    payFees,                 // 👈 NEW: bulk mark-as-paid for CollectFee screen
    getPaidFeesList,         // 👈 NEW: paid fees history (PaidFeesStudentDetails screen)
    getUpcomingDuesByStudent,   // 👈 NEW: upcoming dues, one row per student
    markFeeRemindersSentBulk,   // 👈 NEW: bulk "mark reminded"
    getPaidDuesByStudent,       // 👈 NEW: paid fees, one row per student
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

// 👇 New: fee installments due soon that need a finance reminder
// (must be registered before "/fees/:id" below, or Express would treat
// "reminders" as an :id).
router.route("/fees/reminders/upcoming")
    .get(isAuthenticatedUser, authorizeRoles("admin", "finance"), getUpcomingFeeDues);

// 👇 New: mark a specific installment's reminder as sent
router.route("/fees/:id/reminder-sent")
    .patch(isAuthenticatedUser, authorizeRoles("admin", "finance"), markFeeReminderSent);

// 👇 NEW: students with pending dues (ListFees screen) — must also be
// registered before "/fees/:id" for the same reason as /fees/reminders.
router.route("/fees/dues/pending")
    .get(isAuthenticatedUser, authorizeRoles("admin", "finance"), getPendingDuesByStudent);

// 👇 NEW: students whose dues are fully clear (ListDues screen)
router.route("/fees/dues/cleared")
    .get(isAuthenticatedUser, authorizeRoles("admin", "finance"), getClearedDuesStudents);

// 👇 NEW: bulk mark-as-paid, used by the CollectFee screen
router.route("/fees/pay")
    .patch(isAuthenticatedUser, authorizeRoles("admin", "finance"), payFees);

// 👇 NEW: paid fees history, with student details (PaidFeesStudentDetails
// screen) — also must be registered before "/fees/:id".
router.route("/fees/paid")
    .get(isAuthenticatedUser, authorizeRoles("admin", "finance"), getPaidFeesList);

// 👇 NEW: upcoming dues grouped one row per student (PaidFeesOrDueList screen)
router.route("/fees/dues/upcoming")
    .get(isAuthenticatedUser, authorizeRoles("admin", "finance"), getUpcomingDuesByStudent);

// 👇 NEW: bulk "mark reminded" for a whole group of feeIds at once
router.route("/fees/reminders/mark-sent-bulk")
    .patch(isAuthenticatedUser, authorizeRoles("admin", "finance"), markFeeRemindersSentBulk);

// 👇 NEW: paid fees summary, one row per student (PaidFeesList screen)
router.route("/fees/dues/paid")
    .get(isAuthenticatedUser, authorizeRoles("admin", "finance"), getPaidDuesByStudent);

// Get all fees statistics
router.route("/fees/statistics")
    .get(isAuthenticatedUser, authorizeRoles("admin", "finance"), getFeesStats);

// 👇 New Route: Get fees grouped by currency
router.route("/fees/statistics/currency")
    .get(isAuthenticatedUser, authorizeRoles("admin", "finance"), getFeesByCurrency);

// Get revenue vs expenses
router.route("/revenue/expenses")
    .get(isAuthenticatedUser, authorizeRoles("admin", "finance"), getRevenueVsExpenses);

// Get single fee details
router.route("/fees/:id")
    .get(isAuthenticatedUser, authorizeRoles("admin", "finance"), getFeeDetails);

export default router;
