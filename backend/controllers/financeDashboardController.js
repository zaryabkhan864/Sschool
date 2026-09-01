// backend/controllers/financeDashboardController.js
//
// NEW FILE — does not touch any existing controller.
// Purpose: give the Finance Dashboard a single, real endpoint for its
// "Recent Transactions" panel, merging the three sources finance cares
// about (student fees paid, other expenses, staff salaries paid) into one
// sorted feed, the same way the existing getRevenueVsExpenses controller
// already merges Revenue/Fees/Salary/Expense for the monthly chart.

import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Fees from "../models/fees.js";
import Expense from "../models/expenses.js";
import Salary from "../models/salaries.js";
import EmployeeContract from "../models/employeeContract.js";

// ============================================================
// GET recent finance activity (fees paid + expenses + salaries paid)
// => GET /api/v1/finance/dashboard/recent-activity?limit=8
// ============================================================
export const getRecentFinanceActivity = catchAsyncErrors(async (req, res, next) => {
    const { campus, selectedYear } = req.cookies;
    const limit = parseInt(req.query.limit) || 10;

    const [recentFees, recentExpenses, recentSalaries] = await Promise.all([
        Fees.find({ campus, year: selectedYear, status: "Paid" })
            .sort({ paymentDate: -1, updatedAt: -1 })
            .limit(limit)
            .populate("student", "firstName middleName lastName"),

        Expense.find({ campus })
            .sort({ date: -1 })
            .limit(limit),

        Salary.find({ campus, year: selectedYear, status: "Paid" })
            .sort({ paymentDate: -1 })
            .limit(limit)
            .populate("employeeId", "firstName middleName lastName"),
    ]);

    const studentName = (student) =>
        [student?.firstName, student?.middleName, student?.lastName].filter(Boolean).join(" ") || "Student";

    const employeeName = (employee) =>
        [employee?.firstName, employee?.middleName, employee?.lastName].filter(Boolean).join(" ") || "Employee";

    const feeTransactions = recentFees.map((fee) => ({
        id: `fee-${fee._id}`,
        description: `${fee.feeType} Fee - ${studentName(fee.student)}`,
        amount: fee.amount,
        currency: fee.currency,
        date: fee.paymentDate || fee.updatedAt,
        status: "completed",
        type: "revenue",
    }));

    const expenseTransactions = recentExpenses.map((expense) => ({
        id: `expense-${expense._id}`,
        description:
            expense.description ||
            `${expense.category} Expense${expense.vendor ? ` - ${expense.vendor}` : ""}`,
        amount: expense.amount,
        currency: "USD",
        date: expense.date,
        status: "completed",
        type: "expense",
    }));

    const salaryTransactions = recentSalaries.map((salary) => ({
        id: `salary-${salary._id}`,
        description: `Salary - ${employeeName(salary.employeeId)} (${salary.month})`,
        amount: salary.netSalary || salary.amount,
        currency: "USD",
        date: salary.paymentDate,
        status: "completed",
        type: "expense",
    }));

    const transactions = [...feeTransactions, ...expenseTransactions, ...salaryTransactions]
        .filter((transaction) => transaction.date)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit);

    res.status(200).json({
        success: true,
        count: transactions.length,
        transactions,
    });
});

// ============================================================
// GET payroll overview — projected/committed monthly payroll from
// ACTIVE EmployeeContract.salary blocks (this is what finance actually
// owes going forward, decided at contract-creation time). This is
// separate from the Salary collection, which only records what has
// already been paid — both matter, but they answer different questions.
// => GET /api/v1/finance/dashboard/payroll-overview
//
// NOTE ON ESTIMATES: contracts can be paid hourly/daily/weekly/etc, not
// just monthly, so each baseSalary is normalized to a "per month"
// figure using standard conversion factors. weekly/bi_weekly/quarterly/
// yearly conversions are exact (52/12 weeks per month, etc). hourly and
// daily are NOT exact — we don't track actual hours/days worked per
// employee, so a rough full-time assumption is used (160 hrs/month,
// 22 working days/month). Treat those two as ballpark, not accounting-
// grade numbers.
// ============================================================
const MONTHLY_MULTIPLIER = {
    hourly: 160,        // ⚠️ rough estimate: assumes ~160 hrs/month (full-time)
    daily: 22,           // ⚠️ rough estimate: assumes ~22 working days/month
    weekly: 52 / 12,      // exact
    bi_weekly: 26 / 12,   // exact
    monthly: 1,           // exact
    quarterly: 1 / 3,     // exact
    yearly: 1 / 12,       // exact
};

export const getPayrollOverview = catchAsyncErrors(async (req, res, next) => {
    const { campus, academicYear } = req.cookies;

    const filter = { status: "active", isDeleted: false };
    if (campus) filter.campus = campus;
    if (academicYear) filter.academicYear = academicYear;

    const contracts = await EmployeeContract.find(filter).select("employee role salary");

    const byCurrency = {};

    contracts.forEach((contract) => {
        const {
            baseSalary = 0,
            paymentType = "monthly",
            currency = "USD",
            allowances = {},
        } = contract.salary || {};

        const factor = MONTHLY_MULTIPLIER[paymentType] ?? 1;

        // allowances is a free-form Mixed object (e.g. { transport: 50, housing: 100 });
        // only sum keys that are actually numbers, ignore anything else.
        const allowanceTotal = Object.values(allowances || {}).reduce(
            (sum, val) => sum + (typeof val === "number" ? val : 0),
            0
        );

        const estimatedMonthly = (Number(baseSalary) || 0) * factor + allowanceTotal * factor;

        if (!byCurrency[currency]) {
            byCurrency[currency] = { currency, staffCount: 0, estimatedMonthlyPayroll: 0 };
        }
        byCurrency[currency].staffCount += 1;
        byCurrency[currency].estimatedMonthlyPayroll += estimatedMonthly;
    });

    // Round for display after summing (avoid compounding rounding errors)
    const payrollByCurrency = Object.values(byCurrency).map((row) => ({
        ...row,
        estimatedMonthlyPayroll: Math.round(row.estimatedMonthlyPayroll * 100) / 100,
    }));

    res.status(200).json({
        success: true,
        totalActiveContracts: contracts.length,
        payrollByCurrency,
    });
});
