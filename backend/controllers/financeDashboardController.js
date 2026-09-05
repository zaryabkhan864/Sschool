// backend/controllers/financeDashboardController.js
//
// Purpose: give the Finance Dashboard a single, real endpoint for its
// "Recent Transactions" panel, merging the three sources finance cares
// about (student fees paid, other expenses, staff salaries paid) into one
// sorted feed, the same way the existing getRevenueVsExpenses controller
// already merges Revenue/Fees/Salary/Expense for the monthly chart.

import mongoose from "mongoose";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Fees from "../models/fees.js";
import Expense from "../models/expenses.js";
import Salary from "../models/salaries.js";
import EmployeeContract from "../models/employeeContract.js";
import AcademicYear from "../models/academicYear.js";

// Small helper so a malformed/empty campus or academicYear cookie never
// crashes a query with a Mongoose CastError — same guard every other
// finance controller already uses before putting a cookie value into a
// filter.
const validObjectIdOrUndefined = (value) =>
    value && mongoose.Types.ObjectId.isValid(value) ? value : undefined;

// ============================================================
// Live currency conversion — Fees can come in in several currencies
// (USD, EUR, GBP, ...) while salaries/expenses might all be paid in one
// local currency (e.g. Turkish Lira). Rates come from frankfurter.app
// (free, no API key, ECB reference rates), cached in memory for an hour
// so the dashboard never hits the external API on every single request.
// Requires Node 18+ for the built-in global `fetch` — if you're on an
// older Node version, swap the fetch call for `node-fetch` instead.
// ============================================================
let ratesCache = { rates: null, fetchedAt: 0 };
const RATES_TTL_MS = 60 * 60 * 1000; // 1 hour

const getExchangeRates = async () => {
    const now = Date.now();
    if (ratesCache.rates && now - ratesCache.fetchedAt < RATES_TTL_MS) {
        return ratesCache.rates;
    }
    try {
        const response = await fetch("https://api.frankfurter.app/latest?from=USD");
        const data = await response.json();
        // data.rates = { EUR: 0.92, GBP: 0.79, TRY: 34.5, ... } — units of
        // that currency per 1 USD.
        const rates = { USD: 1, ...data.rates };
        ratesCache = { rates, fetchedAt: now };
        return rates;
    } catch (err) {
        // Network hiccup or the free API is temporarily down — fall back
        // to whatever was last cached (even if stale) rather than
        // breaking the whole dashboard. If we've never fetched
        // successfully at all yet, fall back to USD-only (no conversion
        // possible, but nothing crashes).
        console.error("Exchange rate fetch failed, using cached/fallback rates:", err.message);
        return ratesCache.rates || { USD: 1 };
    }
};

// amount in `currency` -> amount in `targetCurrency`, using USD as the
// pivot (rates are always expressed as "units of X per 1 USD"). Returns
// null if either currency isn't covered by the rate source (e.g. AED —
// ECB doesn't publish a reference rate for it), so callers can skip it
// instead of silently producing a wrong number.
const convertAmount = (amount, currency, targetCurrency, rates) => {
    if (currency === targetCurrency) return amount;
    const rateFrom = rates[currency];
    const rateTo = rates[targetCurrency];
    if (!rateFrom || !rateTo) return null;
    const amountInUSD = amount / rateFrom;
    return amountInUSD * rateTo;
};

// Sums a [{ currency, total }] list into two combined figures — USD and
// TRY — skipping any currency the rate source doesn't cover.
const convertBucketToUSDAndTRY = (bucket, rates) => {
    let usd = 0;
    let tryTotal = 0;
    bucket.forEach(({ currency, total }) => {
        const inUSD = convertAmount(total, currency, "USD", rates);
        const inTRY = convertAmount(total, currency, "TRY", rates);
        if (inUSD != null) usd += inUSD;
        if (inTRY != null) tryTotal += inTRY;
    });
    return {
        USD: Math.round(usd * 100) / 100,
        TRY: Math.round(tryTotal * 100) / 100,
    };
};

// ============================================================
// GET recent finance activity (fees paid + expenses + salaries paid)
// => GET /api/v1/finance/dashboard/recent-activity?limit=8
//
// 👇 FIX: previously only scoped by campus — academicYear was
// deliberately left out, but that made this panel inconsistent with
// every other panel on the Finance Dashboard (which do scope by both),
// so a "recent transaction" from a different academic year could show
// up here even while the rest of the dashboard is scoped to the
// currently-selected year. Now scoped by both, same as everywhere else.
// ============================================================
export const getRecentFinanceActivity = catchAsyncErrors(async (req, res, next) => {
    const campus = validObjectIdOrUndefined(req.cookies.campus);
    const academicYear = validObjectIdOrUndefined(req.cookies.academicYear);
    const limit = parseInt(req.query.limit) || 10;

    const scopeFilter = {
        ...(campus && { campus }),
        ...(academicYear && { academicYear }),
    };

    const [recentFees, recentExpenses, recentSalaries] = await Promise.all([
        Fees.find({ ...scopeFilter, status: "Paid" })
            .sort({ paymentDate: -1, updatedAt: -1 })
            .limit(limit)
            .populate("student", "firstName middleName lastName"),

        Expense.find(scopeFilter)
            .sort({ date: -1 })
            .limit(limit),

        Salary.find({ ...scopeFilter, status: "Paid" })
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
        // Expense has no currency field of its own (single-currency
        // expenses only, unlike Fees/Salary) — USD here reflects that
        // model limitation, not a bug.
        currency: "USD",
        date: expense.date,
        status: "completed",
        type: "expense",
    }));

    const salaryTransactions = recentSalaries.map((salary) => ({
        id: `salary-${salary._id}`,
        description: `Salary - ${employeeName(salary.employeeId)} (${salary.month})`,
        amount: salary.netSalary || salary.amount,
        // 👇 FIX: was hardcoded "USD" even though Salary already tracks
        // its own currency per record — use it.
        currency: salary.currency || "USD",
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
    hourly: 160,          // ⚠️ rough estimate: assumes ~160 hrs/month (full-time)
    daily: 22,             // ⚠️ rough estimate: assumes ~22 working days/month
    weekly: 52 / 12,       // exact
    bi_weekly: 26 / 12,    // exact
    monthly: 1,            // exact
    quarterly: 1 / 3,      // exact
    yearly: 1 / 12,        // exact
};

export const getPayrollOverview = catchAsyncErrors(async (req, res, next) => {
    const campus = validObjectIdOrUndefined(req.cookies.campus);
    const academicYear = validObjectIdOrUndefined(req.cookies.academicYear);

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


// ============================================================
// GET academic-year finance summary — answers "how much has come in,
// how much is still owed to us, how much have we paid out, and how
// much do we still owe" for the WHOLE selected academic year (not just
// this month vs last month, which is what getRevenueVsExpenses in
// feesController.js shows). Grouped per currency since Fees/Salary can
// each be in different currencies — summing them into one number would
// be misleading.
// => GET /api/v1/finance/dashboard/academic-year-summary
// ============================================================
export const getAcademicYearFinanceSummary = catchAsyncErrors(async (req, res, next) => {
    const campus = validObjectIdOrUndefined(req.cookies.campus);
    let academicYear = validObjectIdOrUndefined(req.cookies.academicYear);
    let academicYearDoc = null;

    // 👇 FIX: previously, even when the cookie WAS present and valid,
    // this still re-verified it via AcademicYear.findById() — and if
    // that lookup failed for any reason, silently swapped `academicYear`
    // to whichever year is flagged isCurrent instead. That meant this
    // endpoint could end up scoped to a COMPLETELY DIFFERENT academic
    // year than every other endpoint (like getUnpaidSalaries), which
    // just trusts the cookie value directly with no such fallback —
    // explaining why a salary visible in the "Unpaid Salaries" panel
    // could still be invisible to "Still Payable This Year": the two
    // were silently scoped to two different years. Now the isCurrent
    // fallback ONLY happens when the cookie is missing entirely; if a
    // cookie value is present, it's trusted exactly like everywhere
    // else, and the lookup below is used only to get a display name for
    // the response, never to override which year is actually queried.
    if (!academicYear) {
        academicYearDoc = await AcademicYear.findOne({ isCurrent: true });
        academicYear = academicYearDoc?._id;
    } else {
        academicYearDoc = await AcademicYear.findById(academicYear).catch(() => null);
    }

    if (!academicYear) {
        return res.status(200).json({
            success: true,
            academicYear: null,
            summary: { collected: [], due: [], paidOut: [], payablePending: [] },
        });
    }

    // 👇 FIX: aggregate() pipelines do NOT auto-cast query values the
    // way Model.find() does — passing the raw cookie string here meant
    // every $match below was comparing a real ObjectId field against a
    // plain string, which never matches, so every total came back empty
    // (hence all four cards showing 0 no matter how much real data
    // existed). Explicitly convert to ObjectId first, same as
    // getRevenueVsExpenses/getFeesStats already do elsewhere.
    const academicYearObjId = new mongoose.Types.ObjectId(academicYear);
    const campusObjId = campus ? new mongoose.Types.ObjectId(campus) : null;

    const feesMatch = { academicYear: academicYearObjId };
    const salaryMatch = { academicYear: academicYearObjId };
    const expenseMatch = { academicYear: academicYearObjId };
    if (campusObjId) {
        feesMatch.campus = campusObjId;
        salaryMatch.campus = campusObjId;
        expenseMatch.campus = campusObjId;
    }

    const [collectedRows, dueRows, paidSalaryRows, unpaidSalaryRows, expenseRows] = await Promise.all([
        // Money actually received this academic year
        Fees.aggregate([
            { $match: { ...feesMatch, status: "Paid" } },
            { $group: { _id: "$currency", total: { $sum: "$amount" } } },
        ]),
        // Money still owed to the school this academic year
        Fees.aggregate([
            { $match: { ...feesMatch, status: { $in: ["Pending", "Overdue"] } } },
            { $group: { _id: "$currency", total: { $sum: "$amount" } } },
        ]),
        // Salaries actually paid out (net, after deductions)
        Salary.aggregate([
            { $match: { ...salaryMatch, status: "Paid" } },
            { $group: { _id: "$currency", total: { $sum: "$netSalary" } } },
        ]),
        // Salaries already generated but not yet paid (this alone
        // understates "still payable" — see the payablePending
        // recalculation further below, which is what actually answers
        // "how much more for the whole academic year").
        Salary.aggregate([
            { $match: { ...salaryMatch, status: "Unpaid" } },
            { $group: { _id: "$currency", total: { $sum: "$netSalary" } } },
        ]),
        // Other expenses (utilities, maintenance, etc.) — no currency
        // field of its own, treated as USD, same simplification used in
        // getRecentFinanceActivity above.
        Expense.aggregate([
            { $match: expenseMatch },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
    ]);

    const expenseTotalUSD = expenseRows[0]?.total || 0;

    const toCurrencyList = (rows, extraUSD = 0) => {
        const byCurrency = {};
        rows.forEach((r) => {
            byCurrency[r._id] = (byCurrency[r._id] || 0) + r.total;
        });
        if (extraUSD) {
            byCurrency.USD = (byCurrency.USD || 0) + extraUSD;
        }
        return Object.entries(byCurrency).map(([currency, total]) => ({
            currency,
            total: Math.round(total * 100) / 100,
        }));
    };

    const collectedList = toCurrencyList(collectedRows);
    const dueList = toCurrencyList(dueRows);
    const paidOutList = toCurrencyList(paidSalaryRows, expenseTotalUSD);

    // 👇 FIX: "Still Payable This Year" used to just be the sum of
    // already-GENERATED Unpaid salary rows — but salaries only exist
    // once "Generate Monthly Salaries" has been run for that month. If
    // you've only generated+paid September so far, October through June
    // simply have no Salary documents yet, so summing Unpaid rows alone
    // showed 0 even though the school clearly still owes 9 more months
    // of pay. Instead: project the FULL year's committed payroll
    // (monthly rate from active contracts × total months in the
    // academic year), then subtract what's actually been paid so far —
    // this covers already-generated-but-unpaid months AND months that
    // haven't been generated yet.
    let payablePendingList = toCurrencyList(unpaidSalaryRows); // fallback if the projection below can't run

    if (academicYearDoc?.startDate && academicYearDoc?.endDate) {
        const start = new Date(academicYearDoc.startDate);
        const end = new Date(academicYearDoc.endDate);
        const totalMonths =
            (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;

        if (totalMonths > 0) {
            // Same "committed monthly payroll per currency" calculation
            // getPayrollOverview uses — active, monthly-paid contracts
            // only, normalized to a per-month figure.
            const contractFilter = { status: "active", isDeleted: false, "salary.paymentType": "monthly" };
            if (campusObjId) contractFilter.campus = campusObjId;
            contractFilter.academicYear = academicYearObjId;

            const activeContracts = await EmployeeContract.find(contractFilter).select("salary");

            const monthlyPayrollByCurrency = {};
            activeContracts.forEach((contract) => {
                const { baseSalary = 0, currency = "USD" } = contract.salary || {};
                monthlyPayrollByCurrency[currency] = (monthlyPayrollByCurrency[currency] || 0) + (Number(baseSalary) || 0);
            });

            const paidByCurrency = {};
            paidSalaryRows.forEach((r) => {
                paidByCurrency[r._id] = (paidByCurrency[r._id] || 0) + r.total;
            });

            const allCurrencies = new Set([...Object.keys(monthlyPayrollByCurrency), ...Object.keys(paidByCurrency)]);
            payablePendingList = Array.from(allCurrencies).map((currency) => {
                const projectedForYear = (monthlyPayrollByCurrency[currency] || 0) * totalMonths;
                const alreadyPaid = paidByCurrency[currency] || 0;
                return {
                    currency,
                    total: Math.round(Math.max(0, projectedForYear - alreadyPaid) * 100) / 100,
                };
            }).filter((row) => row.total > 0);
        }
    }
    // If your AcademicYear model uses different field names than
    // startDate/endDate, this projection silently skips and falls back
    // to the old "sum of generated Unpaid rows" behavior above — let me
    // know the actual field names and I'll adjust them.

    // 👇 NEW: also give finance one combined figure per bucket, in BOTH
    // USD and TRY — since fees come in in whatever currency the parent
    // paid with, but salaries/expenses are typically all paid in one
    // local currency (TRY here), the raw per-currency lists above don't
    // answer "how much is this really, all together". Live rates make
    // that comparison meaningful instead of just adding raw numbers
    // from different currencies together.
    const rates = await getExchangeRates();
    const converted = {
        collected: convertBucketToUSDAndTRY(collectedList, rates),
        due: convertBucketToUSDAndTRY(dueList, rates),
        paidOut: convertBucketToUSDAndTRY(paidOutList, rates),
        payablePending: convertBucketToUSDAndTRY(payablePendingList, rates),
    };

    // 👇 NEW: "how much money do we actually have right now" — Collected
    // minus Paid Out, in the same two converted currencies. This can
    // only be expressed as a converted figure (never a raw per-currency
    // list like the four buckets above) since it's inherently a
    // subtraction ACROSS currencies — e.g. fees collected in EUR minus
    // salaries paid in TRY only means something once both sides are
    // converted to the same currency first.
    const currentBalance = {
        USD: Math.round((converted.collected.USD - converted.paidOut.USD) * 100) / 100,
        TRY: Math.round((converted.collected.TRY - converted.paidOut.TRY) * 100) / 100,
    };

    res.status(200).json({
        success: true,
        academicYear: {
            id: academicYear,
            name: academicYearDoc?.name || academicYearDoc?.year || null,
        },
        summary: {
            collected: collectedList,
            due: dueList,
            paidOut: paidOutList,
            payablePending: payablePendingList,
            converted, // { collected: {USD,TRY}, due: {...}, paidOut: {...}, payablePending: {...} }
            currentBalance, // { USD, TRY } — collected minus paidOut, converted
        },
    });
});