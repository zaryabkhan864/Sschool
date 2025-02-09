import express from "express";
import {
    newExpense,
    getExpenses,
    getExpenseDetails,
    updateExpense,
    deleteExpense,
    getExpensesByCategory,
    getExpensesByVendor,
} from "../controllers/expensesController.js";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

export const router = express.Router();

// Create new expense entry
router
    .route("/finance/expenses")
    .post(isAuthenticatedUser, authorizeRoles("admin", "finance"), newExpense);

// Get all expenses
router
    .route("/finance/get/expenses")
    .get(isAuthenticatedUser, authorizeRoles("admin", "finance"), getExpenses);

// Get single expense details
router
    .route("/expenses/:id")
    .get(isAuthenticatedUser, authorizeRoles("admin", "finance"), getExpenseDetails);

// Update expense record
router
    .route("/expenses/:id")
    .put(isAuthenticatedUser, authorizeRoles("admin", "finance"), updateExpense);

// Delete expense record
router
    .route("/expenses/:id")
    .delete(isAuthenticatedUser, authorizeRoles("admin", "finance"), deleteExpense);

// Get expenses by category
router
    .route("/expenses/category/:category")
    .get(isAuthenticatedUser, authorizeRoles("admin", "finance"), getExpensesByCategory);

// Get expenses by vendor
router
    .route("/expenses/vendor/:vendor")
    .get(isAuthenticatedUser, authorizeRoles("admin", "finance"), getExpensesByVendor);

export default router;