import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Expense from "../models/expenses.js";
import ErrorHandler from "../utils/errorHandler.js";
import APIFilters from "../utils/apiFilters.js";

// Create new expense entry => /api/v1/expenses
export const newExpense = catchAsyncErrors(async (req, res, next) => {
    const { category, amount, description, vendor, campus } = req.body;

    const expense = await Expense.create({
        category,
        amount,
        description,
        vendor,
        campus
    });

    res.status(200).json({
        success: true,
        expense,
    });
});

// Get all expenses => /api/v1/expenses
export const getExpenses = catchAsyncErrors(async (req, res, next) => {
    const resPerPage = 10;
    const apiFilters = new APIFilters(Expense, req.query).search().filters().populate("campus");

    let expenses = await apiFilters.query;
    const filteredExpensesCount = expenses.length;

    apiFilters.pagination(resPerPage);
    expenses = await apiFilters.query.clone();

    res.status(200).json({
        success: true,
        resPerPage,
        filteredExpensesCount,
        expenses,
    });
});

// Get single expense details => /api/v1/expenses/:id
export const getExpenseDetails = catchAsyncErrors(async (req, res, next) => {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
        return next(new ErrorHandler("Expense record not found", 404));
    }

    res.status(200).json({
        success: true,
        expense,
    });
});

// Update expense record => /api/v1/expenses/:id
export const updateExpense = catchAsyncErrors(async (req, res, next) => {
    let expense = await Expense.findById(req.params.id);

    if (!expense) {
        return next(new ErrorHandler("Expense record not found", 404));
    }

    const { category, amount, description, vendor } = req.body;

    expense = await Expense.findByIdAndUpdate(
        req.params.id,
        { category, amount, description, vendor },
        { new: true }
    );

    res.status(200).json({
        success: true,
        expense,
    });
});

// Delete expense record => /api/v1/expenses/:id
export const deleteExpense = catchAsyncErrors(async (req, res, next) => {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
        return next(new ErrorHandler("Expense record not found", 404));
    }

    await Expense.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: "Expense record deleted successfully",
    });
});

// Get expenses by category => /api/v1/expenses/category/:category
export const getExpensesByCategory = catchAsyncErrors(async (req, res, next) => {
    const expenses = await Expense.find({ category: req.params.category, campus: req.query.campus  });

    if (!expenses.length) {
        return next(new ErrorHandler(`No expenses found for category: ${req.params.category}`, 404));
    }

    res.status(200).json({
        success: true,
        expenses,
    });
});

// Get expenses by vendor => /api/v1/expenses/vendor/:vendor
export const getExpensesByVendor = catchAsyncErrors(async (req, res, next) => {
    const expenses = await Expense.find({ vendor: req.params.vendor, campus: req.query.campus });

    if (!expenses.length) {
        return next(new ErrorHandler(`No expenses found for vendor: ${req.params.vendor}`, 404));
    }

    res.status(200).json({
        success: true,
        expenses,
    });
});