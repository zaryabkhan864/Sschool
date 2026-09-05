import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Expense from "../models/expenses.js";
import ErrorHandler from "../utils/errorHandler.js";
import mongoose from "mongoose";

const EMPLOYEE_SELECT = "firstName middleName lastName email";

// Create new expense entry => /api/v1/finance/expenses
// campus/academicYear default from cookies (same pattern as every other
// finance controller) if not explicitly passed; audit.createdBy is
// always the logged-in user, never trusted from the request body.
export const newExpense = catchAsyncErrors(async (req, res, next) => {
    const { campus: cookieCampus, academicYear: cookieAcademicYear } = req.cookies;
    const { category, amount, date, description, vendor, campus, academicYear, paymentMethod, reference } = req.body;

    if (!category || amount == null) {
        return next(new ErrorHandler("category and amount are required", 400));
    }

    const expense = await Expense.create({
        category,
        amount: Number(amount),
        date: date || undefined,
        description,
        vendor,
        paymentMethod: paymentMethod || "Cash",
        reference: reference || null,
        campus: campus || cookieCampus || undefined,
        academicYear: academicYear || cookieAcademicYear || null,
        audit: { createdBy: req.user._id },
    });

    res.status(201).json({ success: true, expense });
});

// Get all expenses => /api/v1/finance/get/expenses
// Supports category, campus/academicYear (cookie fallback), keyword
// (vendor/description), dateFrom/dateTo, page/limit/countOnly.
export const getExpenses = catchAsyncErrors(async (req, res, next) => {
    const { campus: cookieCampus, academicYear: cookieAcademicYear } = req.cookies;
    const { category, campus, academicYear, keyword, dateFrom, dateTo, page, limit, paginate, countOnly } = req.query;

    const filter = {};
    if (category) filter.category = category;

    const finalCampus = campus || cookieCampus;
    if (finalCampus && mongoose.Types.ObjectId.isValid(finalCampus)) filter.campus = finalCampus;
    const finalAcademicYear = academicYear || cookieAcademicYear;
    if (finalAcademicYear && mongoose.Types.ObjectId.isValid(finalAcademicYear)) filter.academicYear = finalAcademicYear;

    if (dateFrom || dateTo) {
        filter.date = {};
        if (dateFrom) filter.date.$gte = new Date(dateFrom);
        if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    const trimmedKeyword = keyword?.trim();
    if (trimmedKeyword) {
        filter.$or = [
            { vendor: { $regex: trimmedKeyword, $options: "i" } },
            { description: { $regex: trimmedKeyword, $options: "i" } },
        ];
    }

    const total = await Expense.countDocuments(filter);
    if (countOnly === "true") return res.status(200).json({ success: true, total });

    const isDropdownRequest = Number(limit) === 0 || paginate === "false";
    let query = Expense.find(filter)
        .sort({ date: -1, createdAt: -1 })
        .populate("campus", "name code")
        .populate("audit.createdBy", EMPLOYEE_SELECT)
        .populate("audit.updatedBy", EMPLOYEE_SELECT);

    let paginationMeta = null;
    if (!isDropdownRequest) {
        const finalLimit = limit ? Number(limit) : 10;
        const finalPage = Math.max(Number(page) || 1, 1);
        query = query.skip((finalPage - 1) * finalLimit).limit(finalLimit);
        paginationMeta = { total, page: finalPage, limit: finalLimit, totalPages: Math.ceil(total / finalLimit) };
    }

    const expenses = await query;

    res.status(200).json({
        success: true,
        count: expenses.length,
        total,
        ...(paginationMeta && { pagination: paginationMeta }),
        expenses,
    });
});

// Get single expense details => /api/v1/expenses/:id
export const getExpenseDetails = catchAsyncErrors(async (req, res, next) => {
    const expense = await Expense.findById(req.params.id)
        .populate("campus", "name code")
        .populate("audit.createdBy", EMPLOYEE_SELECT)
        .populate("audit.updatedBy", EMPLOYEE_SELECT);

    if (!expense) {
        return next(new ErrorHandler("Expense record not found", 404));
    }

    res.status(200).json({ success: true, expense });
});

// Update expense record => /api/v1/expenses/:id
// audit.updatedBy is always set to the logged-in user, never trusted
// from the request body — same rule as EmployeeContract's audit block.
export const updateExpense = catchAsyncErrors(async (req, res, next) => {
    let expense = await Expense.findById(req.params.id);

    if (!expense) {
        return next(new ErrorHandler("Expense record not found", 404));
    }

    const { category, amount, date, description, vendor, paymentMethod, reference, campus, academicYear } = req.body;

    if (category) expense.category = category;
    if (amount != null) expense.amount = Number(amount);
    if (date) expense.date = date;
    if (description !== undefined) expense.description = description;
    if (vendor !== undefined) expense.vendor = vendor;
    if (paymentMethod) expense.paymentMethod = paymentMethod;
    if (reference !== undefined) expense.reference = reference;
    if (campus) expense.campus = campus;
    if (academicYear) expense.academicYear = academicYear;
    expense.audit.updatedBy = req.user._id;

    await expense.save();

    res.status(200).json({ success: true, expense });
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
    const { campus: cookieCampus } = req.cookies;
    const filter = { category: req.params.category };
    const finalCampus = req.query.campus || cookieCampus;
    if (finalCampus) filter.campus = finalCampus;

    const expenses = await Expense.find(filter).sort({ date: -1 });

    if (!expenses.length) {
        return next(new ErrorHandler(`No expenses found for category: ${req.params.category}`, 404));
    }

    res.status(200).json({ success: true, expenses });
});

// Get expenses by vendor => /api/v1/expenses/vendor/:vendor
export const getExpensesByVendor = catchAsyncErrors(async (req, res, next) => {
    const { campus: cookieCampus } = req.cookies;
    const filter = { vendor: req.params.vendor };
    const finalCampus = req.query.campus || cookieCampus;
    if (finalCampus) filter.campus = finalCampus;

    const expenses = await Expense.find(filter).sort({ date: -1 });

    if (!expenses.length) {
        return next(new ErrorHandler(`No expenses found for vendor: ${req.params.vendor}`, 404));
    }

    res.status(200).json({ success: true, expenses });
});

// ============================================================
// NEW: STATS — total spent per category (+ grand total) for a period,
// used by ListExpenses' stat cards. Same cookie-scoping as everywhere
// else; optional dateFrom/dateTo narrows the period (defaults to
// everything).
// ============================================================
export const getExpenseStats = catchAsyncErrors(async (req, res, next) => {
    const { campus: cookieCampus, academicYear: cookieAcademicYear } = req.cookies;
    const { campus, academicYear, dateFrom, dateTo } = req.query;

    const matchStage = {};
    const finalCampus = campus || cookieCampus;
    if (finalCampus && mongoose.Types.ObjectId.isValid(finalCampus)) matchStage.campus = new mongoose.Types.ObjectId(finalCampus);
    const finalAcademicYear = academicYear || cookieAcademicYear;
    if (finalAcademicYear && mongoose.Types.ObjectId.isValid(finalAcademicYear)) matchStage.academicYear = new mongoose.Types.ObjectId(finalAcademicYear);
    if (dateFrom || dateTo) {
        matchStage.date = {};
        if (dateFrom) matchStage.date.$gte = new Date(dateFrom);
        if (dateTo) matchStage.date.$lte = new Date(dateTo);
    }

    const byCategory = await Expense.aggregate([
        { $match: matchStage },
        { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
    ]);

    const grandTotal = byCategory.reduce((sum, c) => sum + c.total, 0);
    const totalCount = byCategory.reduce((sum, c) => sum + c.count, 0);

    res.status(200).json({
        success: true,
        stats: { byCategory, grandTotal, totalCount },
    });
});
