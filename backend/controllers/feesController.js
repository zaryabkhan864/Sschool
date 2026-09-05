// controllers 
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Fees from "../models/fees.js";
import ErrorHandler from "../utils/errorHandler.js";
import APIFilters from "../utils/apiFilters.js";
import User from "../models/user.js";
import Salary from "../models/salaries.js";
import Expense from "../models/expenses.js";
import Revenue from "../models/revenue.js";
import mongoose from "mongoose"; 
import AcademicYear from "../models/academicYear.js"; // add if not already imported

const FEE_TYPES = ["Admission", "Tuition", "Exam", "Transport", "Hostel"];
// Create new fee entry => /api/v1/fees
export const newFee = catchAsyncErrors(async (req, res, next) => {
    const { campus, selectedYear } = req.cookies;
    const {
        student,
        amount,
        feeType,
        currency,
        dueDate,
        status,
        paymentDate,
        paymentMethod,
        paymentFrequency, // ← NEW: Monthly / Quarterly / Half Yearly / Annually
        academicYear,      // ← NEW: optional, so this fee can be tied to a year
        enrollment,        // ← NEW: optional, so this fee can be tied to an enrollment
    } = req.body;

    // Check if the referenced user is a student
    const user = await User.findById(student);
    if (!user || user.role !== "student") {
        return next(new ErrorHandler("The referenced user must be a student.", 400));
    }

    if (!paymentFrequency) {
        return next(
            new ErrorHandler(
                "paymentFrequency is required (Monthly / Quarterly / Half Yearly / Annually)",
                400
            )
        );
    }

    const fee = await Fees.create({
        student,
        amount,
        feeType,
        currency,
        paymentFrequency,
        dueDate,
        status,
        paymentDate,
        paymentMethod,
        campus,          // added from cookies
        year: selectedYear, // added from cookies
        academicYear,
        enrollment,
    });

    res.status(200).json({
        success: true,
        fee,
    });
});

// Get all fees => /api/v1/fees
export const getFees = catchAsyncErrors(async (req, res, next) => {
    const { campus, selectedYear } = req.cookies;
    const resPerPage = 10;

    // Inject filters
    req.query.campus = campus;
    if (selectedYear) req.query.year = selectedYear;

    const apiFilters = new APIFilters(Fees, req.query).search().filters().populate("student");

    let fees = await apiFilters.query;
    const filteredFeesCount = fees.length;

    apiFilters.pagination(resPerPage);
    fees = await apiFilters.query.clone();

    res.status(200).json({
        success: true,
        resPerPage,
        filteredFeesCount,
        fees,
    });
});

// Get single fee details => /api/v1/fees/:id
export const getFeeDetails = catchAsyncErrors(async (req, res, next) => {
    const { campus, selectedYear } = req.cookies;
    const fee = await Fees.findOne({ _id: req.params.id, campus, year: selectedYear }).populate("student");

    if (!fee) {
        return next(new ErrorHandler("Fee record not found", 404));
    }

    res.status(200).json({
        success: true,
        fee,
    });
});

// Update fee record => /api/v1/fees/:id
export const updateFee = catchAsyncErrors(async (req, res, next) => {
    const { campus, selectedYear } = req.cookies;
    let fee = await Fees.findOne({ _id: req.params.id, campus, year: selectedYear });

    if (!fee) {
        return next(new ErrorHandler("Fee record not found", 404));
    }

    const {
        studentId,
        amount,
        feeType,
        dueDate,
        status,
        paymentDate,
        paymentMethod,
        paymentFrequency, // ← NEW
    } = req.body;

    fee = await Fees.findByIdAndUpdate(
        req.params.id,
        {
            studentId,
            amount,
            feeType,
            dueDate,
            status,
            paymentDate,
            paymentMethod,
            ...(paymentFrequency && { paymentFrequency }),
            campus,
            year: selectedYear,
        },
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        fee,
    });
});

// Delete fee record => /api/v1/fees/:id
export const deleteFee = catchAsyncErrors(async (req, res, next) => {
    const { campus, selectedYear } = req.cookies;
    const fee = await Fees.findOne({ _id: req.params.id, campus, year: selectedYear });

    if (!fee) {
        return next(new ErrorHandler("Fee record not found", 404));
    }

    await Fees.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: "Fee record deleted successfully",
    });
});

// ============================================================
// Get all fees for a specific student => /api/v1/fees/student/:id
//
// 🐛 FIX: this used to filter by { student, campus, year: selectedYear }.
// `year` is a legacy Number field only set by the old single-fee-entry
// flow (newFee above). Fees generated from a StudentEnrollment's feePlan
// (Admission/Tuition/Exam/etc, via feePlanGenerator.js) never set `year`
// — they carry `academicYear` (ObjectId) + `enrollment` instead. So this
// endpoint was silently returning nothing for any student whose fees came
// from the enrollment flow, which is the flow the Collect-Fee screen
// depends on. Now it filters by campus only (still scoped to the current
// campus) and returns an empty array instead of a 404 when there's
// nothing to show — "no fees yet" isn't an error for a payment screen.
// ============================================================
export const getFeesByStudent = catchAsyncErrors(async (req, res, next) => {
    const { campus } = req.cookies;

    const filter = { student: req.params.id };
    if (campus) filter.campus = campus;

    const fees = await Fees.find(filter)
        .sort({ dueDate: 1 })
        .populate("student", "firstName middleName lastName email phoneNumber")
        .populate({
            path: "enrollment",
            select: "classGroup campus academicYear",
            populate: { path: "classGroup", select: "displayName grade section" },
        });

    res.status(200).json({
        success: true,
        count: fees.length,
        fees,
    });
});

// Get unpaid fees => /api/v1/fees/unpaid
export const getUnpaidFees = catchAsyncErrors(async (req, res, next) => {
    const { campus, selectedYear } = req.cookies;
    const unpaidFees = await Fees.find({ status: "Unpaid", campus, year: selectedYear });

    if (!unpaidFees.length) {
        return next(new ErrorHandler("No unpaid fee records found", 404));
    }

    res.status(200).json({
        success: true,
        unpaidFees,
    });
});

// Get overdue fees => /api/v1/fees/overdue
export const getOverdueFees = catchAsyncErrors(async (req, res, next) => {
    const { campus, selectedYear } = req.cookies;
    const today = new Date();
    const overdueFees = await Fees.find({ status: "Overdue", dueDate: { $lt: today }, campus, year: selectedYear });

    if (!overdueFees.length) {
        return next(new ErrorHandler("No overdue fee records found", 404));
    }

    res.status(200).json({
        success: true,
        overdueFees,
    });
});

// ============================================================
// Get fees due soon that need a finance reminder
// => GET /api/v1/fees/reminders/upcoming?days=7
//
// This is what closes the "how does finance know a monthly/quarterly
// payer's next installment is coming" gap: every installment generated
// from an enrollment's feePlan carries its own reminderDate (dueDate
// minus a lead time), so this just lists whichever Pending installments
// fall inside that window and haven't been flagged yet. A student who
// paid Annually only ever has one installment, so nothing extra shows up
// for them once it's been generated/paid.
// ============================================================
export const getUpcomingFeeDues = catchAsyncErrors(async (req, res, next) => {
    const days = parseInt(req.query.days) || 7;
    const now = new Date();
    const windowEnd = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const dues = await Fees.find({
        status: "Pending",
        reminderSent: false,
        reminderDate: { $lte: windowEnd },
    })
        .sort({ dueDate: 1 })
        .populate({ path: "student", select: "firstName middleName lastName email phoneNumber" })
        .populate("campus", "name code")
        .populate("academicYear", "name")
        .populate("enrollment", "status");

    res.status(200).json({
        success: true,
        count: dues.length,
        message: `Fee installments needing a reminder within ${days} day(s)`,
        dues,
    });
});

// ============================================================
// Mark a reminder as sent, so the same installment isn't flagged again
// => PATCH /api/v1/fees/:id/reminder-sent
// ============================================================
export const markFeeReminderSent = catchAsyncErrors(async (req, res, next) => {
    const fee = await Fees.findByIdAndUpdate(
        req.params.id,
        { reminderSent: true },
        { new: true }
    );

    if (!fee) {
        return next(new ErrorHandler("Fee record not found", 404));
    }

    res.status(200).json({
        success: true,
        message: "Reminder marked as sent",
        fee,
    });
});

// Get all fees statistics => /api/v1/fees/stats
export const getFeesStats = catchAsyncErrors(async (req, res, next) => {
    const { campus, selectedYear } = req.cookies;

    const stats = await Fees.aggregate([
        { $match: { campus, year: selectedYear } }, // filter by campus & year
        {
            $group: {
                _id: "$currency",
                totalAmount: { $sum: "$amount" },
                totalFees: { $sum: 1 },
            },
        },
    ]);

    res.status(200).json({
        success: true,
        stats,
    });
});

// Get Revenue Vs Expenses => /api/v1/fees/stats/revenue-vs-expenses
export const getRevenueVsExpenses = catchAsyncErrors(async (req, res, next) => {
    const { campus, academicYear } = req.cookies; // 👈 FIX: was `selectedYear`

    const campusObjId =
        campus && mongoose.Types.ObjectId.isValid(campus) ? new mongoose.Types.ObjectId(campus) : null;
    const academicYearObjId =
        academicYear && mongoose.Types.ObjectId.isValid(academicYear)
            ? new mongoose.Types.ObjectId(academicYear)
            : null;

    const scopeMatch = {};
    if (campusObjId) scopeMatch.campus = campusObjId;
    if (academicYearObjId) scopeMatch.academicYear = academicYearObjId;

    // Revenue has no campus/academicYear field on its schema at all, so
    // it can't be scoped the same way — left unfiltered for now (grabs
    // every Revenue record regardless of campus/year). If you want this
    // scoped too, campus/academicYear fields need to be added to
    // models/revenue.js first — happy to do that if you want it.
    const monthlyRevenue = await Revenue.aggregate([
        {
            $group: {
                _id: { month: { $month: "$date" }, year: { $year: "$date" } },
                totalRevenue: { $sum: "$amount" }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Fees: only what's actually been PAID counts as revenue, grouped by
    // when it was paid — not dueDate, and not Pending/Overdue amounts
    // (that's money still owed, not money received).
    const monthlyFees = await Fees.aggregate([
        { $match: { ...scopeMatch, status: "Paid" } },
        {
            $group: {
                _id: { month: { $month: "$paymentDate" }, year: { $year: "$paymentDate" } },
                totalFees: { $sum: "$amount" }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Salaries: only what's actually been PAID counts as an expense,
    // using netSalary (what actually left the bank after deductions) —
    // not the gross amount, and not Unpaid rows.
    const monthlySalaries = await Salary.aggregate([
        { $match: { ...scopeMatch, status: "Paid" } },
        {
            $group: {
                _id: { month: { $month: "$paymentDate" }, year: { $year: "$paymentDate" } },
                totalSalaries: { $sum: "$netSalary" }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const monthlyOtherExpenses = await Expense.aggregate([
        { $match: scopeMatch },
        {
            $group: {
                _id: { month: { $month: "$date" }, year: { $year: "$date" } },
                totalOtherExpenses: { $sum: "$amount" }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Combine all monthly data
    const monthlyData = {};

    monthlyRevenue.forEach(entry => {
        const key = `${entry._id.year}-${entry._id.month}`;
        if (!monthlyData[key]) {
            monthlyData[key] = { year: entry._id.year, month: entry._id.month, totalRevenue: 0, totalFees: 0, totalSalaries: 0, totalOtherExpenses: 0 };
        }
        monthlyData[key].totalRevenue += entry.totalRevenue;
    });

    monthlyFees.forEach(entry => {
        const key = `${entry._id.year}-${entry._id.month}`;
        if (!monthlyData[key]) {
            monthlyData[key] = { year: entry._id.year, month: entry._id.month, totalRevenue: 0, totalFees: 0, totalSalaries: 0, totalOtherExpenses: 0 };
        }
        monthlyData[key].totalFees += entry.totalFees;
    });

    monthlySalaries.forEach(entry => {
        const key = `${entry._id.year}-${entry._id.month}`;
        if (!monthlyData[key]) {
            monthlyData[key] = { year: entry._id.year, month: entry._id.month, totalRevenue: 0, totalFees: 0, totalSalaries: 0, totalOtherExpenses: 0 };
        }
        monthlyData[key].totalSalaries += entry.totalSalaries;
    });

    monthlyOtherExpenses.forEach(entry => {
        const key = `${entry._id.year}-${entry._id.month}`;
        if (!monthlyData[key]) {
            monthlyData[key] = { year: entry._id.year, month: entry._id.month, totalRevenue: 0, totalFees: 0, totalSalaries: 0, totalOtherExpenses: 0 };
        }
        monthlyData[key].totalOtherExpenses += entry.totalOtherExpenses;
    });

    const result = Object.values(monthlyData).map(month => ({
        ...month,
        totalRevenue: month.totalRevenue + month.totalFees,
        totalExpenses: month.totalSalaries + month.totalOtherExpenses,
        netProfit: (month.totalRevenue + month.totalFees) - (month.totalSalaries + month.totalOtherExpenses)
    }));

    res.status(200).json({
        success: true,
        data: result
    });
});

// Get total fees grouped by currency => /api/v1/fees/stats/currency

export const getFeesByCurrency = catchAsyncErrors(async (req, res, next) => {
    const { campus, selectedYear } = req.cookies;
    
    // Campus ko ObjectId mein convert karo
    const campusId = new mongoose.Types.ObjectId(campus);
    const year = parseInt(selectedYear);

    const currencyStats = await Fees.aggregate([
        { 
            $match: { 
                campus: campusId, 
                year: year 
            } 
        },
        {
            $group: {
                _id: "$currency",
                totalAmount: { $sum: "$amount" },
                totalFees: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Agar koi record nahi hai toh empty array return karo, error nahi
    res.status(200).json({
        success: true,
        currencyStats: currencyStats || []
    });
});

// ============================================================
// NEW — Get students with pending dues, grouped one row per student
// => GET /api/v1/fees/dues/pending?keyword=&gender=&page=&limit=&countOnly=
//
// Powers the "ListFees" collection screen: one row per student who has
// at least one Pending/Overdue fee installment, with their total
// outstanding amount, which fee types are involved, and their next due
// date — instead of one row per raw installment.
// ============================================================
export const getPendingDuesByStudent = catchAsyncErrors(async (req, res, next) => {
    const { campus, academicYear } = req.cookies;
    const { keyword, gender, page, limit, countOnly, duePeriod } = req.query;

    const now = new Date();

    // 🐛/UX FIX: previously matched EVERY Pending/Overdue installment,
    // which meant a student paying Monthly had all 12 months' worth of
    // future installments showing up here on day one. Finance only cares
    // about what actually needs action right now: anything already
    // Overdue, anything Pending whose reminder window has opened (7 days
    // out for Monthly, 30 days out for Quarterly/Half Yearly/Annually —
    // see feePlanGenerator.js), or ad-hoc fees with no reminderDate set
    // at all (manually created via NewFees, always actionable since
    // there's no schedule to wait on).
    const dueSoonOrOverdue = {
        $or: [
            { status: "Overdue" },
            { status: "Pending", reminderDate: { $lte: now } },
            { status: "Pending", reminderDate: null },
        ],
    };

    const matchStage = { ...dueSoonOrOverdue };
    if (campus && mongoose.Types.ObjectId.isValid(campus)) {
        matchStage.campus = new mongoose.Types.ObjectId(campus);
    }
    if (academicYear && mongoose.Types.ObjectId.isValid(academicYear)) {
        matchStage.academicYear = new mongoose.Types.ObjectId(academicYear);
    }

    const grouped = await Fees.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: { student: "$student", currency: "$currency" },
                totalDue: { $sum: "$amount" },
                pendingCount: { $sum: 1 },
                nextDueDate: { $min: "$dueDate" },
                feeTypes: { $addToSet: "$feeType" },
                statuses: { $addToSet: "$status" }, // 👈 used to detect if this student has any Overdue fee
            },
        },
    ]);

    // Merge currency sub-totals back onto a single row per student
    // (a student could in theory have fees in more than one currency).
    const byStudent = new Map();
    grouped.forEach((row) => {
        const studentId = row._id.student.toString();
        if (!byStudent.has(studentId)) {
            byStudent.set(studentId, {
                studentId,
                totals: [],
                pendingCount: 0,
                nextDueDate: row.nextDueDate,
                feeTypes: new Set(),
                hasOverdue: false,
            });
        }
        const entry = byStudent.get(studentId);
        entry.totals.push({ currency: row._id.currency, amount: row.totalDue });
        entry.pendingCount += row.pendingCount;
        if (row.nextDueDate && (!entry.nextDueDate || row.nextDueDate < entry.nextDueDate)) {
            entry.nextDueDate = row.nextDueDate;
        }
        row.feeTypes.forEach((t) => entry.feeTypes.add(t));
        if (row.statuses.includes("Overdue")) entry.hasOverdue = true;
    });

    // ── NEW: classify each student's dues into a period bucket ──
    // "overdue"    — at least one fee already past its due date, unpaid
    // "this_month" — earliest due date falls within the current calendar month
    // "next_month" — earliest due date falls within next calendar month
    // "later"      — anything further out (mostly ad-hoc fees with no reminderDate)
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const startOfMonthAfterNext = new Date(now.getFullYear(), now.getMonth() + 2, 1);

    const classifyDuePeriod = (dueDate, hasOverdue) => {
        if (hasOverdue) return "overdue";
        if (!dueDate) return "later";
        const due = new Date(dueDate);
        if (due < startOfNextMonth) return "this_month";
        if (due < startOfMonthAfterNext) return "next_month";
        return "later";
    };

    let studentIds = Array.from(byStudent.keys());

    const studentFilter = { _id: { $in: studentIds } };
    if (gender) studentFilter.gender = gender;
    const trimmedKeyword = keyword?.trim();
    if (trimmedKeyword) {
        studentFilter.$or = [
            { firstName: { $regex: trimmedKeyword, $options: "i" } },
            { middleName: { $regex: trimmedKeyword, $options: "i" } },
            { lastName: { $regex: trimmedKeyword, $options: "i" } },
            { phoneNumber: { $regex: trimmedKeyword, $options: "i" } },
            { email: { $regex: trimmedKeyword, $options: "i" } },
        ];
    }

    const students = await User.find(studentFilter)
        .select("firstName middleName lastName email phoneNumber gender accountStatus avatar currentEnrollment")
        .populate({
            path: "currentEnrollment",
            select: "classGroup campus",
            populate: { path: "classGroup", select: "displayName grade section" },
        });

    let rows = students
        .filter((s) => byStudent.has(s._id.toString()))
        .map((s) => {
            const entry = byStudent.get(s._id.toString());
            return {
                student: s,
                totals: entry.totals, // [{ currency, amount }]
                pendingCount: entry.pendingCount,
                nextDueDate: entry.nextDueDate,
                feeTypes: Array.from(entry.feeTypes),
                duePeriod: classifyDuePeriod(entry.nextDueDate, entry.hasOverdue),
            };
        });

    // 👇 NEW: optional filter — ?duePeriod=overdue|this_month|next_month
    if (duePeriod && duePeriod !== "all") {
        rows = rows.filter((r) => r.duePeriod === duePeriod);
    }

    rows.sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate));

    const total = rows.length;

    if (countOnly === "true") {
        return res.status(200).json({ success: true, total });
    }

    const numericLimit = limit ? Number(limit) : undefined;
    let paginationMeta = null;
    if (numericLimit) {
        const finalPage = Math.max(Number(page) || 1, 1);
        paginationMeta = {
            total,
            page: finalPage,
            limit: numericLimit,
            totalPages: Math.ceil(total / numericLimit),
        };
        rows = rows.slice((finalPage - 1) * numericLimit, finalPage * numericLimit);
    }

    res.status(200).json({
        success: true,
        count: rows.length,
        total,
        ...(paginationMeta && { pagination: paginationMeta }),
        dues: rows,
    });
});

// ============================================================
// NEW — Get enrolled students whose dues are fully clear
// => GET /api/v1/fees/dues/cleared?keyword=&gender=&page=&limit=&countOnly=
//
// "Clear" = actively enrolled (lifecycleStatus "enrolled") AND no
// Pending/Overdue Fees record for the current campus/academicYear.
// ============================================================
export const getClearedDuesStudents = catchAsyncErrors(async (req, res, next) => {
    const { campus, academicYear } = req.cookies;
    const { keyword, gender, page, limit, countOnly } = req.query;

    // 🐛 FIX: this used to only count "due-soon or overdue" fees when
    // deciding who counts as cleared — matching the same due-period
    // window as getPendingDuesByStudent. That meant a student with a
    // brand-new $30,000 Pending balance (just not due for another 2+
    // months) showed up as "Dues Cleared", which is misleading — they
    // haven't paid anything, their bill just isn't due yet.
    //
    // "Cleared" now means what it should: this student has ZERO fee
    // records with status Pending or Overdue, full stop, regardless of
    // due date. A Monthly/Quarterly payer with future installments
    // already generated will correctly stay off this list until every
    // one of those installments is actually paid — that's accurate,
    // not a bug: they genuinely still owe that money.
    const feesMatch = { status: { $in: ["Pending", "Overdue"] } };
    if (campus && mongoose.Types.ObjectId.isValid(campus)) {
        feesMatch.campus = new mongoose.Types.ObjectId(campus);
    }
    if (academicYear && mongoose.Types.ObjectId.isValid(academicYear)) {
        feesMatch.academicYear = new mongoose.Types.ObjectId(academicYear);
    }

    const studentsWithDues = await Fees.find(feesMatch).distinct("student");
    const duesSet = new Set(studentsWithDues.map((id) => id.toString()));

    const studentFilter = { role: "student", lifecycleStatus: "enrolled" };
    if (gender) studentFilter.gender = gender;
    const trimmedKeyword = keyword?.trim();
    if (trimmedKeyword) {
        studentFilter.$or = [
            { firstName: { $regex: trimmedKeyword, $options: "i" } },
            { middleName: { $regex: trimmedKeyword, $options: "i" } },
            { lastName: { $regex: trimmedKeyword, $options: "i" } },
            { phoneNumber: { $regex: trimmedKeyword, $options: "i" } },
            { email: { $regex: trimmedKeyword, $options: "i" } },
        ];
    }

    const enrolledStudents = await User.find(studentFilter)
        .select("firstName middleName lastName email phoneNumber gender accountStatus avatar currentEnrollment")
        .populate({
            path: "currentEnrollment",
            select: "classGroup campus",
            populate: { path: "classGroup", select: "displayName grade section" },
        });

    let cleared = enrolledStudents.filter((s) => !duesSet.has(s._id.toString()));

    if (campus) {
        cleared = cleared.filter(
            (s) => s.currentEnrollment?.campus?.toString?.() === campus
        );
    }

    const total = cleared.length;

    if (countOnly === "true") {
        return res.status(200).json({ success: true, total });
    }

    const numericLimit = limit ? Number(limit) : undefined;
    let paginationMeta = null;
    if (numericLimit) {
        const finalPage = Math.max(Number(page) || 1, 1);
        paginationMeta = {
            total,
            page: finalPage,
            limit: numericLimit,
            totalPages: Math.ceil(total / numericLimit),
        };
        cleared = cleared.slice((finalPage - 1) * numericLimit, finalPage * numericLimit);
    }

    res.status(200).json({
        success: true,
        count: cleared.length,
        total,
        ...(paginationMeta && { pagination: paginationMeta }),
        students: cleared,
    });
});

// ============================================================
// NEW — Bulk mark selected fee installments as Paid in one go
// => PATCH /api/v1/fees/pay
// Body: { feeIds: [...], paymentMethod: "Cash"|"Bank Transfer"|"Online", paymentDate? }
//
// This is what the Collect-Fee screen calls once the admin has ticked
// which pending installments they're collecting right now (could be one
// fee type, or several at once) and picked how it was paid.
// ============================================================
export const payFees = catchAsyncErrors(async (req, res, next) => {
    const {
        feeIds,
        paymentMethod,
        paymentDate,
        paymentReference,   // 👈 NEW: Bank Transfer / Online reference no.
        amountTendered,     // 👈 NEW: Cash only
        changeReturned,     // 👈 NEW: Cash only
    } = req.body;

    if (!Array.isArray(feeIds) || feeIds.length === 0) {
        return next(new ErrorHandler("feeIds must be a non-empty array", 400));
    }
    if (!paymentMethod) {
        return next(new ErrorHandler("paymentMethod is required", 400));
    }

    const fees = await Fees.find({ _id: { $in: feeIds } });
    if (fees.length !== feeIds.length) {
        return next(new ErrorHandler("One or more fee records were not found", 404));
    }

    const alreadyPaid = fees.filter((f) => f.status === "Paid");
    if (alreadyPaid.length > 0) {
        return next(
            new ErrorHandler(
                `${alreadyPaid.length} of the selected fee(s) are already marked Paid`,
                400
            )
        );
    }

    const resolvedPaymentDate = paymentDate ? new Date(paymentDate) : new Date();

    // One receipt can cover several installments paid together in the
    // same physical transaction — they all share this receiptNo, which
    // is what ties them together on the printed slip (FeeReceipt.jsx)
    // and in the per-student payment history (PaidFeesStudentDetails.jsx).
    const receiptNo = `RCPT-${Date.now().toString(36).toUpperCase()}`;

    await Fees.updateMany(
        { _id: { $in: feeIds } },
        {
            status: "Paid",
            paymentMethod,
            paymentDate: resolvedPaymentDate,
            receiptNo,
            ...(paymentReference !== undefined ? { paymentReference } : {}),
            ...(amountTendered !== undefined ? { amountTendered } : {}),
            ...(changeReturned !== undefined ? { changeReturned } : {}),
        }
    );

    const updatedFees = await Fees.find({ _id: { $in: feeIds } }).populate(
        "student",
        "firstName middleName lastName"
    );

    res.status(200).json({
        success: true,
        message: `${updatedFees.length} fee(s) marked as paid`,
        fees: updatedFees,
        receiptNo,
    });
});

// ============================================================
// NEW — Get paid fees list with student details, one row per payment
// => GET /api/v1/fees/paid?keyword=&gender=&feeType=&startDate=&endDate=&page=&limit=&countOnly=
//
// Powers PaidFeesStudentDetails.jsx — a flat, most-recent-first list of
// every Paid fee record (a receipt history), with the paying student's
// details populated inline. Distinct from getPendingDuesByStudent (which
// groups by student and only covers what's still owed) — this is the
// "what's already been collected" side of the same picture.
// ============================================================
export const getPaidFeesList = catchAsyncErrors(async (req, res, next) => {
    const { campus, academicYear } = req.cookies;
    const { studentId, keyword, gender, feeType, startDate, endDate, page, limit, countOnly } = req.query;

    const filter = { status: "Paid" };
    if (campus && mongoose.Types.ObjectId.isValid(campus)) {
        filter.campus = new mongoose.Types.ObjectId(campus);
    }
    if (academicYear && mongoose.Types.ObjectId.isValid(academicYear)) {
        filter.academicYear = new mongoose.Types.ObjectId(academicYear);
    }
    if (feeType) filter.feeType = feeType;
    if (startDate || endDate) {
        filter.paymentDate = {};
        if (startDate) filter.paymentDate.$gte = new Date(startDate);
        if (endDate) filter.paymentDate.$lte = new Date(endDate);
    }

    // 👇 NEW: direct student filter, used by PaidFeesStudentDetails.jsx's
    // drill-down (?studentId=...). Takes priority over keyword/gender
    // below — a specific student was already picked, no need to resolve
    // a name/phone search into an id list.
    if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
        filter.student = new mongoose.Types.ObjectId(studentId);
    } else {
        // keyword/gender target the STUDENT, not the Fees document itself,
        // so resolve them into a student-id filter first (same pattern
        // used by getPendingDuesByStudent / getClearedDuesStudents above).
        const trimmedKeyword = keyword?.trim();
        if (trimmedKeyword || gender) {
            const studentQuery = { role: "student" };
            if (gender) studentQuery.gender = gender;
            if (trimmedKeyword) {
                studentQuery.$or = [
                    { firstName: { $regex: trimmedKeyword, $options: "i" } },
                    { middleName: { $regex: trimmedKeyword, $options: "i" } },
                    { lastName: { $regex: trimmedKeyword, $options: "i" } },
                    { phoneNumber: { $regex: trimmedKeyword, $options: "i" } },
                    { email: { $regex: trimmedKeyword, $options: "i" } },
                ];
            }
            const matchingIds = await User.find(studentQuery).distinct("_id");
            filter.student = { $in: matchingIds };
        }
    }

    const total = await Fees.countDocuments(filter);

    if (countOnly === "true") {
        return res.status(200).json({ success: true, total });
    }

    const numericLimit = limit ? Number(limit) : undefined;
    let paginationMeta = null;
    let query = Fees.find(filter).sort({ paymentDate: -1 });

    if (numericLimit) {
        const finalPage = Math.max(Number(page) || 1, 1);
        paginationMeta = {
            total,
            page: finalPage,
            limit: numericLimit,
            totalPages: Math.ceil(total / numericLimit),
        };
        query = query.skip((finalPage - 1) * numericLimit).limit(numericLimit);
    }

    const paidFees = await query
        .populate("student", "firstName middleName lastName email phoneNumber gender")
        .populate({
            path: "enrollment",
            select: "classGroup",
            populate: { path: "classGroup", select: "displayName grade section" },
        });

    res.status(200).json({
        success: true,
        count: paidFees.length,
        total,
        ...(paginationMeta && { pagination: paginationMeta }),
        paidFees,
    });
});

// ============================================================
// NEW — Get students whose installment(s) fall due within N days,
// grouped one row per student (for PaidFeesOrDueList.jsx)
// => GET /api/v1/fees/dues/upcoming-by-student?days=10&keyword=&gender=&page=&limit=&countOnly=
//
// Different from getPendingDuesByStudent (which is "what needs action
// NOW" — overdue + reminder-window-open) and from the older flat
// getUpcomingFeeDues (one row per installment): this is specifically
// "who's coming due in the next N days", grouped per student, with the
// exact feeIds bundled so the Pay Now button can pre-select only that
// student's due-soon installments (not their whole pending list).
// ============================================================
export const getUpcomingDuesByStudent = catchAsyncErrors(async (req, res, next) => {
    const { campus, academicYear } = req.cookies;
    const { days, keyword, gender, page, limit, countOnly } = req.query;

    const windowDays = parseInt(days) || 7;
    const now = new Date();
    const windowEnd = new Date(now.getTime() + windowDays * 24 * 60 * 60 * 1000);

    const matchStage = {
        status: "Pending",
        reminderSent: false,
        dueDate: { $gte: now, $lte: windowEnd },
    };
    if (campus && mongoose.Types.ObjectId.isValid(campus)) {
        matchStage.campus = new mongoose.Types.ObjectId(campus);
    }
    if (academicYear && mongoose.Types.ObjectId.isValid(academicYear)) {
        matchStage.academicYear = new mongoose.Types.ObjectId(academicYear);
    }

    const grouped = await Fees.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: { student: "$student", currency: "$currency" },
                totalDue: { $sum: "$amount" },
                dueCount: { $sum: 1 },
                nextDueDate: { $min: "$dueDate" },
                feeTypes: { $addToSet: "$feeType" },
                feeIds: { $push: "$_id" },
            },
        },
    ]);

    // Merge currency sub-totals + feeIds back onto a single row per student
    const byStudent = new Map();
    grouped.forEach((row) => {
        const studentId = row._id.student.toString();
        if (!byStudent.has(studentId)) {
            byStudent.set(studentId, {
                totals: [],
                dueCount: 0,
                nextDueDate: row.nextDueDate,
                feeTypes: new Set(),
                feeIds: [],
            });
        }
        const entry = byStudent.get(studentId);
        entry.totals.push({ currency: row._id.currency, amount: row.totalDue });
        entry.dueCount += row.dueCount;
        if (row.nextDueDate && (!entry.nextDueDate || row.nextDueDate < entry.nextDueDate)) {
            entry.nextDueDate = row.nextDueDate;
        }
        row.feeTypes.forEach((t) => entry.feeTypes.add(t));
        entry.feeIds.push(...row.feeIds.map((id) => id.toString()));
    });

    const studentIds = Array.from(byStudent.keys());

    const studentFilter = { _id: { $in: studentIds } };
    if (gender) studentFilter.gender = gender;
    const trimmedKeyword = keyword?.trim();
    if (trimmedKeyword) {
        studentFilter.$or = [
            { firstName: { $regex: trimmedKeyword, $options: "i" } },
            { middleName: { $regex: trimmedKeyword, $options: "i" } },
            { lastName: { $regex: trimmedKeyword, $options: "i" } },
            { phoneNumber: { $regex: trimmedKeyword, $options: "i" } },
            { email: { $regex: trimmedKeyword, $options: "i" } },
        ];
    }

    const students = await User.find(studentFilter).select(
        "firstName middleName lastName email phoneNumber gender"
    );

    let rows = students
        .filter((s) => byStudent.has(s._id.toString()))
        .map((s) => {
            const entry = byStudent.get(s._id.toString());
            return {
                student: s,
                totals: entry.totals,
                dueCount: entry.dueCount,
                nextDueDate: entry.nextDueDate,
                feeTypes: Array.from(entry.feeTypes),
                feeIds: entry.feeIds,
            };
        })
        .sort((a, b) => new Date(a.nextDueDate) - new Date(b.nextDueDate));

    const total = rows.length;

    if (countOnly === "true") {
        return res.status(200).json({ success: true, total });
    }

    const numericLimit = limit ? Number(limit) : undefined;
    let paginationMeta = null;
    if (numericLimit) {
        const finalPage = Math.max(Number(page) || 1, 1);
        paginationMeta = {
            total,
            page: finalPage,
            limit: numericLimit,
            totalPages: Math.ceil(total / numericLimit),
        };
        rows = rows.slice((finalPage - 1) * numericLimit, finalPage * numericLimit);
    }

    res.status(200).json({
        success: true,
        count: rows.length,
        total,
        ...(paginationMeta && { pagination: paginationMeta }),
        dues: rows,
    });
});

// ============================================================
// NEW — Bulk mark multiple installments' reminders as sent in one call
// => PATCH /api/v1/fees/reminders/mark-sent-bulk
// Body: { feeIds: [...] }
//
// Used by PaidFeesOrDueList.jsx's "Mark Reminded" action — clears an
// entire student's group of due-soon installments from the reminder
// queue at once, instead of one PATCH per installment.
// ============================================================
export const markFeeRemindersSentBulk = catchAsyncErrors(async (req, res, next) => {
    const { feeIds } = req.body;

    if (!Array.isArray(feeIds) || feeIds.length === 0) {
        return next(new ErrorHandler("feeIds must be a non-empty array", 400));
    }

    const result = await Fees.updateMany(
        { _id: { $in: feeIds } },
        { reminderSent: true }
    );

    res.status(200).json({
        success: true,
        message: `${result.modifiedCount ?? result.nModified ?? feeIds.length} reminder(s) marked as sent`,
    });
});

// ============================================================
// NEW — Get paid fees summary, grouped ONE ROW PER STUDENT
// => GET /api/v1/fees/dues/paid?keyword=&gender=&page=&limit=&countOnly=
//
// Powers PaidFeesList.jsx (the "Paid Fees — By Student" landing screen).
// Distinct from getPaidFeesList (flat, one row per installment — used by
// the drill-down PaidFeesStudentDetails.jsx via ?studentId=): this one
// stays flat at the STUDENT level as payments accumulate, same reasoning
// as getPendingDuesByStudent for the unpaid side.
// ============================================================
export const getPaidDuesByStudent = catchAsyncErrors(async (req, res, next) => {
    const { campus, academicYear } = req.cookies;
    const { keyword, gender, page, limit, countOnly } = req.query;

    const matchStage = { status: "Paid" };
    if (campus && mongoose.Types.ObjectId.isValid(campus)) {
        matchStage.campus = new mongoose.Types.ObjectId(campus);
    }
    if (academicYear && mongoose.Types.ObjectId.isValid(academicYear)) {
        matchStage.academicYear = new mongoose.Types.ObjectId(academicYear);
    }

    const grouped = await Fees.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: { student: "$student", currency: "$currency" },
                totalPaid: { $sum: "$amount" },
                paidCount: { $sum: 1 },
                lastPaymentDate: { $max: "$paymentDate" },
                feeTypes: { $addToSet: "$feeType" },
            },
        },
    ]);

    // Merge currency sub-totals back onto a single row per student.
    const byStudent = new Map();
    grouped.forEach((row) => {
        const studentId = row._id.student.toString();
        if (!byStudent.has(studentId)) {
            byStudent.set(studentId, {
                totals: [],
                paidCount: 0,
                lastPaymentDate: row.lastPaymentDate,
                feeTypes: new Set(),
            });
        }
        const entry = byStudent.get(studentId);
        entry.totals.push({ currency: row._id.currency, amount: row.totalPaid });
        entry.paidCount += row.paidCount;
        if (row.lastPaymentDate && (!entry.lastPaymentDate || row.lastPaymentDate > entry.lastPaymentDate)) {
            entry.lastPaymentDate = row.lastPaymentDate;
        }
        row.feeTypes.forEach((t) => entry.feeTypes.add(t));
    });

    const studentIds = Array.from(byStudent.keys());

    const studentFilter = { _id: { $in: studentIds } };
    if (gender) studentFilter.gender = gender;
    const trimmedKeyword = keyword?.trim();
    if (trimmedKeyword) {
        studentFilter.$or = [
            { firstName: { $regex: trimmedKeyword, $options: "i" } },
            { middleName: { $regex: trimmedKeyword, $options: "i" } },
            { lastName: { $regex: trimmedKeyword, $options: "i" } },
            { phoneNumber: { $regex: trimmedKeyword, $options: "i" } },
            { email: { $regex: trimmedKeyword, $options: "i" } },
        ];
    }

    const students = await User.find(studentFilter).select(
        "firstName middleName lastName email phoneNumber gender"
    );

    let rows = students
        .filter((s) => byStudent.has(s._id.toString()))
        .map((s) => {
            const entry = byStudent.get(s._id.toString());
            return {
                student: s,
                totals: entry.totals,
                paidCount: entry.paidCount,
                lastPaymentDate: entry.lastPaymentDate,
                feeTypes: Array.from(entry.feeTypes),
            };
        })
        .sort((a, b) => new Date(b.lastPaymentDate) - new Date(a.lastPaymentDate));

    const total = rows.length;

    if (countOnly === "true") {
        return res.status(200).json({ success: true, total });
    }

    const numericLimit = limit ? Number(limit) : undefined;
    let paginationMeta = null;
    if (numericLimit) {
        const finalPage = Math.max(Number(page) || 1, 1);
        paginationMeta = {
            total,
            page: finalPage,
            limit: numericLimit,
            totalPages: Math.ceil(total / numericLimit),
        };
        rows = rows.slice((finalPage - 1) * numericLimit, finalPage * numericLimit);
    }

    res.status(200).json({
        success: true,
        count: rows.length,
        total,
        ...(paginationMeta && { pagination: paginationMeta }),
        paidDues: rows,
    });
});
export const getFeesByFeeType = catchAsyncErrors(async (req, res, next) => {
    const { campus: cookieCampus } = req.cookies;
    let academicYear = req.cookies.academicYear;

    let academicYearDoc = null;
    if (academicYear && mongoose.Types.ObjectId.isValid(academicYear)) {
        academicYearDoc = await AcademicYear.findById(academicYear);
    }
    if (!academicYearDoc) {
        academicYearDoc = await AcademicYear.findOne({ isCurrent: true });
        academicYear = academicYearDoc?._id;
    }

    if (!academicYear) {
        return res.status(200).json({
            success: true,
            academicYear: null,
            byFeeType: FEE_TYPES.map((feeType) => ({ feeType, collected: [], due: [] })),
        });
    }

    // aggregate() needs real ObjectId instances, not the raw cookie
    // strings — same casting rule as getAcademicYearFinanceSummary.
    const academicYearObjId = new mongoose.Types.ObjectId(academicYear);
    const campusObjId =
        cookieCampus && mongoose.Types.ObjectId.isValid(cookieCampus)
            ? new mongoose.Types.ObjectId(cookieCampus)
            : null;

    const match = { academicYear: academicYearObjId };
    if (campusObjId) match.campus = campusObjId;

    const rows = await Fees.aggregate([
        { $match: match },
        {
            $group: {
                _id: { feeType: "$feeType", currency: "$currency", status: "$status" },
                total: { $sum: "$amount" },
            },
        },
    ]);

    const byFeeType = {};
    FEE_TYPES.forEach((feeType) => {
        byFeeType[feeType] = { collected: {}, due: {} };
    });

    rows.forEach((row) => {
        const { feeType, currency, status } = row._id;
        if (!byFeeType[feeType]) byFeeType[feeType] = { collected: {}, due: {} };
        const bucket = status === "Paid" ? "collected" : ["Pending", "Overdue"].includes(status) ? "due" : null;
        if (!bucket) return;
        byFeeType[feeType][bucket][currency] = (byFeeType[feeType][bucket][currency] || 0) + row.total;
    });

    const toCurrencyList = (obj) =>
        Object.entries(obj).map(([currency, total]) => ({ currency, total: Math.round(total * 100) / 100 }));

    const result = FEE_TYPES.map((feeType) => ({
        feeType,
        collected: toCurrencyList(byFeeType[feeType].collected),
        due: toCurrencyList(byFeeType[feeType].due),
    }));

    res.status(200).json({
        success: true,
        academicYear: { id: academicYear, name: academicYearDoc?.name || academicYearDoc?.year || null },
        byFeeType: result,
    });
});
