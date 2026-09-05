import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Salary from "../models/salaries.js";
import EmployeeContract from "../models/employeeContract.js";
import User from "../models/user.js";
import ErrorHandler from "../utils/errorHandler.js";

const generateReceiptNo = () => {
    const now = new Date();
    const stamp = now.toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `SAL-${stamp}-${rand}`;
};

const sumNumericAllowances = (allowances) => {
    if (!allowances || typeof allowances !== "object") return 0;
    return Object.values(allowances).reduce(
        (sum, v) => sum + (typeof v === "number" && !isNaN(v) ? v : 0),
        0
    );
};

// Same select string used everywhere below — firstName/middleName/
// lastName are what the User model's `fullName` virtual needs, so
// keeping this in one place means every populate automatically has it.
const EMPLOYEE_SELECT = "firstName middleName lastName email phoneNumber gender role avatar";

export const newSalary = catchAsyncErrors(async (req, res, next) => {
    const { campus: cookieCampus, academicYear: cookieAcademicYear } = req.cookies;
    const { employeeId, amount, month, year, currency, deductions, campus, academicYear, contract } = req.body;

    if (!employeeId || amount == null || !month || !year) {
        return next(new ErrorHandler("employeeId, amount, month, and year are required", 400));
    }

    const employee = await User.findById(employeeId);
    if (!employee || employee.role === "student") {
        return next(new ErrorHandler("The referenced user must be a non-student employee", 400));
    }

    const finalDeductions = Number(deductions) || 0;
    const finalAmount = Number(amount);
    const netSalary = Math.max(0, finalAmount - finalDeductions);

    try {
        const salary = await Salary.create({
            employeeId,
            contract: contract || null,
            campus: campus || cookieCampus || null,
            academicYear: academicYear || cookieAcademicYear || null,
            amount: finalAmount,
            currency: currency || "USD",
            month,
            year: Number(year),
            deductions: finalDeductions,
            netSalary,
        });
        res.status(201).json({ success: true, salary });
    } catch (err) {
        if (err.code === 11000) {
            return next(new ErrorHandler("A salary record for this employee/month/year already exists", 409));
        }
        throw err;
    }
});

// ============================================================
// GENERATE MONTHLY SALARIES
// Campus/academicYear scoping comes from cookies by default (same
// pattern as every other finance controller) — the frontend no longer
// needs its own Campus/Academic Year pickers for this. An explicit
// body.campus/body.academicYear (if you ever add one back) still wins.
// ============================================================
export const generateMonthlySalaries = catchAsyncErrors(async (req, res, next) => {
    const { campus: cookieCampus, academicYear: cookieAcademicYear } = req.cookies;
    const { month, year, campus, academicYear } = req.body;

    if (!month || !year) {
        return next(new ErrorHandler("month and year are required", 400));
    }

    const finalCampus = campus || cookieCampus;
    const finalAcademicYear = academicYear || cookieAcademicYear;

    const contractFilter = {
        status: "active",
        isDeleted: false,
        "salary.paymentType": "monthly",
    };
    if (finalCampus) contractFilter.campus = finalCampus;
    if (finalAcademicYear) contractFilter.academicYear = finalAcademicYear;

    const contracts = await EmployeeContract.find(contractFilter).populate(
        "employee",
        "firstName middleName lastName role"
    );

    let created = 0;
    let skipped = 0;
    const createdSalaries = [];

    for (const contract of contracts) {
        if (!contract.employee) {
            skipped++;
            continue;
        }

        const exists = await Salary.findOne({
            employeeId: contract.employee._id,
            month,
            year: Number(year),
        });
        if (exists) {
            skipped++;
            continue;
        }

        const allowancesTotal = sumNumericAllowances(contract.salary?.allowances);
        const amount = Number(contract.salary?.baseSalary || 0) + allowancesTotal;

        const salary = await Salary.create({
            employeeId: contract.employee._id,
            contract: contract._id,
            campus: contract.campus,
            academicYear: contract.academicYear,
            month,
            year: Number(year),
            amount,
            currency: contract.salary?.currency || "USD",
            deductions: 0,
            netSalary: amount,
            status: "Unpaid",
        });
        created++;
        createdSalaries.push(salary);
    }

    res.status(200).json({
        success: true,
        message: `${created} salary record(s) generated for ${month} ${year}, ${skipped} already existed / skipped`,
        created,
        skipped,
        salaries: createdSalaries,
    });
});

// Get all salary records => /api/v1/finance/salaries
// campus/academicYear default from cookies, same as the rest of the app;
// query params still override when explicitly passed.
export const getSalaries = catchAsyncErrors(async (req, res, next) => {
    const { campus: cookieCampus, academicYear: cookieAcademicYear } = req.cookies;
    const { month, year, status, campus, academicYear, keyword, gender, page, limit, paginate, countOnly } = req.query;

    const filter = {};
    if (month) filter.month = month;
    if (year) filter.year = Number(year);
    if (status) filter.status = status;

    const finalCampus = campus || cookieCampus;
    if (finalCampus) filter.campus = finalCampus;
    const finalAcademicYear = academicYear || cookieAcademicYear;
    if (finalAcademicYear) filter.academicYear = finalAcademicYear;

    const trimmedKeyword = keyword?.trim();
    if (trimmedKeyword || gender) {
        const employeeQuery = { role: { $ne: "student" } };
        if (gender) employeeQuery.gender = gender;
        if (trimmedKeyword) {
            employeeQuery.$or = [
                { firstName: { $regex: trimmedKeyword, $options: "i" } },
                { middleName: { $regex: trimmedKeyword, $options: "i" } },
                { lastName: { $regex: trimmedKeyword, $options: "i" } },
                { phoneNumber: { $regex: trimmedKeyword, $options: "i" } },
                { email: { $regex: trimmedKeyword, $options: "i" } },
            ];
        }
        const employeeIds = await User.find(employeeQuery).distinct("_id");
        filter.employeeId = { $in: employeeIds };
    }

    const total = await Salary.countDocuments(filter);
    if (countOnly === "true") return res.status(200).json({ success: true, total });

    const isDropdownRequest = Number(limit) === 0 || paginate === "false";
    let query = Salary.find(filter)
        .sort({ year: -1, createdAt: -1 })
        .populate("employeeId", EMPLOYEE_SELECT)
        .populate("campus", "name code");

    let paginationMeta = null;
    if (!isDropdownRequest) {
        const finalLimit = limit ? Number(limit) : 10;
        const finalPage = Math.max(Number(page) || 1, 1);
        query = query.skip((finalPage - 1) * finalLimit).limit(finalLimit);
        paginationMeta = { total, page: finalPage, limit: finalLimit, totalPages: Math.ceil(total / finalLimit) };
    }

    const salaries = await query;

    res.status(200).json({
        success: true,
        count: salaries.length,
        total,
        ...(paginationMeta && { pagination: paginationMeta }),
        salaries,
    });
});

export const getSalaryDetails = catchAsyncErrors(async (req, res, next) => {
    const salary = await Salary.findById(req.params.id)
        .populate("employeeId", "firstName middleName lastName email phoneNumber role")
        .populate("campus", "name code")
        .populate("contract", "role designationLevel");

    if (!salary) return next(new ErrorHandler("Salary record not found", 404));

    res.status(200).json({ success: true, salary });
});

export const updateSalary = catchAsyncErrors(async (req, res, next) => {
    let salary = await Salary.findById(req.params.id);
    if (!salary) return next(new ErrorHandler("Salary record not found", 404));

    if (salary.status === "Paid") {
        return next(new ErrorHandler("Paid salary records are read-only and cannot be edited", 400));
    }

    const { amount, month, year, currency, campus } = req.body;
    if (amount != null) salary.amount = Number(amount);
    if (month) salary.month = month;
    if (year != null) salary.year = Number(year);
    if (currency) salary.currency = currency;
    if (campus) salary.campus = campus;
    salary.netSalary = Math.max(0, salary.amount - salary.deductions);

    await salary.save();

    res.status(200).json({ success: true, salary });
});

export const deleteSalary = catchAsyncErrors(async (req, res, next) => {
    const salary = await Salary.findById(req.params.id);
    if (!salary) return next(new ErrorHandler("Salary record not found", 404));

    if (salary.status === "Paid") {
        return next(new ErrorHandler("Paid salary records cannot be deleted", 400));
    }

    await Salary.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Salary record deleted successfully" });
});

export const getSalariesByEmployee = catchAsyncErrors(async (req, res, next) => {
    const salaries = await Salary.find({ employeeId: req.params.id })
        .sort({ year: -1, createdAt: -1 })
        .populate("employeeId", "firstName middleName lastName email role")
        .populate("campus", "name code");

    if (!salaries.length) {
        return next(new ErrorHandler("No salary records found for this employee", 404));
    }

    res.status(200).json({ success: true, count: salaries.length, salaries });
});

export const getUnpaidSalaries = catchAsyncErrors(async (req, res, next) => {
    // 👇 FIX: was campus-only — academicYear was never applied, so this
    // showed unpaid salaries across every academic year regardless of
    // what's currently selected (inconsistent with every other panel on
    // the Finance Dashboard, which do scope by both).
    const { campus: cookieCampus, academicYear: cookieAcademicYear } = req.cookies;
    const filter = { status: "Unpaid" };
    if (cookieCampus) filter.campus = cookieCampus;
    if (cookieAcademicYear) filter.academicYear = cookieAcademicYear;

    const unpaidSalaries = await Salary.find(filter)
        .populate("employeeId", "firstName middleName lastName email role campus")
        .sort({ year: -1, createdAt: -1 });

    if (!unpaidSalaries.length) {
        return next(new ErrorHandler("No unpaid salary records found", 404));
    }

    res.status(200).json({ success: true, count: unpaidSalaries.length, unpaidSalaries });
});

// ============================================================
// UNPAID SALARIES GROUPED BY EMPLOYEE (PaySalary picker screen)
// Also scoped by the campus cookie by default.
// ============================================================
export const getUnpaidSalariesByEmployee = catchAsyncErrors(async (req, res, next) => {
    const { campus: cookieCampus } = req.cookies;
    const { keyword, gender, page, limit, countOnly } = req.query;

    const salaryFilter = { status: "Unpaid" };
    if (cookieCampus) salaryFilter.campus = cookieCampus;

    const salaries = await Salary.find(salaryFilter).select(
        "employeeId currency amount deductions netSalary month year"
    );

    const byEmployee = new Map();
    salaries.forEach((s) => {
        const id = s.employeeId.toString();
        if (!byEmployee.has(id)) {
            byEmployee.set(id, { totalsByCurrency: {}, count: 0, months: [], salaryIds: [] });
        }
        const entry = byEmployee.get(id);
        entry.totalsByCurrency[s.currency] = (entry.totalsByCurrency[s.currency] || 0) + s.netSalary;
        entry.count += 1;
        entry.months.push(`${s.month} ${s.year}`);
        entry.salaryIds.push(s._id);
    });

    const employeeIds = Array.from(byEmployee.keys());
    const employeeFilter = { _id: { $in: employeeIds } };
    if (gender) employeeFilter.gender = gender;
    const trimmedKeyword = keyword?.trim();
    if (trimmedKeyword) {
        employeeFilter.$or = [
            { firstName: { $regex: trimmedKeyword, $options: "i" } },
            { middleName: { $regex: trimmedKeyword, $options: "i" } },
            { lastName: { $regex: trimmedKeyword, $options: "i" } },
            { phoneNumber: { $regex: trimmedKeyword, $options: "i" } },
            { email: { $regex: trimmedKeyword, $options: "i" } },
        ];
    }

    const employees = await User.find(employeeFilter).select(EMPLOYEE_SELECT);

    let rows = employees
        .filter((e) => byEmployee.has(e._id.toString()))
        .map((e) => {
            const entry = byEmployee.get(e._id.toString());
            return {
                employee: e,
                totals: Object.entries(entry.totalsByCurrency).map(([currency, amount]) => ({ currency, amount })),
                unpaidCount: entry.count,
                months: entry.months,
                salaryIds: entry.salaryIds,
            };
        });

    const total = rows.length;
    if (countOnly === "true") return res.status(200).json({ success: true, total });

    const numericLimit = limit ? Number(limit) : undefined;
    let paginationMeta = null;
    if (numericLimit) {
        const finalPage = Math.max(Number(page) || 1, 1);
        paginationMeta = { total, page: finalPage, limit: numericLimit, totalPages: Math.ceil(total / numericLimit) };
        rows = rows.slice((finalPage - 1) * numericLimit, finalPage * numericLimit);
    }

    res.status(200).json({
        success: true,
        count: rows.length,
        total,
        ...(paginationMeta && { pagination: paginationMeta }),
        salaries: rows,
    });
});

export const getEmployeeSalarySummary = catchAsyncErrors(async (req, res, next) => {
    const salaries = await Salary.find({ employeeId: req.params.employeeId });

    if (!salaries.length) {
        return next(new ErrorHandler("No salary records found for this employee", 404));
    }

    const totalPaid = salaries.filter((s) => s.status === "Paid").reduce((sum, s) => sum + (s.netSalary || 0), 0);
    const totalUnpaid = salaries.filter((s) => s.status === "Unpaid").reduce((sum, s) => sum + (s.netSalary || 0), 0);
    const totalDeductions = salaries.reduce((sum, s) => sum + (s.deductions || 0), 0);

    res.status(200).json({
        success: true,
        summary: { totalRecords: salaries.length, totalPaid, totalUnpaid, totalDeductions },
    });
});

export const getSalaryStats = catchAsyncErrors(async (req, res, next) => {
    const { campus: cookieCampus } = req.cookies;
    const { month, year } = req.query;
    const matchStage = {};
    if (month) matchStage.month = month;
    if (year) matchStage.year = Number(year);
    if (cookieCampus) matchStage.campus = cookieCampus;

    const stats = await Salary.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: { status: "$status", currency: "$currency" },
                total: { $sum: "$netSalary" },
                count: { $sum: 1 },
            },
        },
    ]);

    res.status(200).json({ success: true, stats });
});

export const applySalaryDeduction = catchAsyncErrors(async (req, res, next) => {
    const { deductions, reason } = req.body;

    if (deductions == null || isNaN(Number(deductions)) || Number(deductions) < 0) {
        return next(new ErrorHandler("A valid non-negative deductions amount is required", 400));
    }

    const salary = await Salary.findById(req.params.id);
    if (!salary) return next(new ErrorHandler("Salary record not found", 404));

    if (salary.status === "Paid") {
        return next(new ErrorHandler("Cannot modify deductions on an already-paid salary record", 400));
    }

    salary.deductions = Number(deductions);
    salary.deductionReason = reason || null;
    salary.netSalary = Math.max(0, salary.amount - salary.deductions);
    await salary.save();

    res.status(200).json({ success: true, message: "Deduction applied", salary });
});

export const markSalaryAsPaid = catchAsyncErrors(async (req, res, next) => {
    const salary = await Salary.findById(req.params.id);
    if (!salary) return next(new ErrorHandler("Salary record not found", 404));
    if (salary.status === "Paid") return next(new ErrorHandler("Salary is already marked as paid", 400));

    const { paymentMethod, paymentDate, paymentReference, amountTendered, changeReturned } = req.body;
    if (!paymentMethod) return next(new ErrorHandler("paymentMethod is required", 400));

    salary.status = "Paid";
    salary.paymentDate = paymentDate ? new Date(paymentDate) : new Date();
    salary.paymentMethod = paymentMethod;
    salary.netSalary = Math.max(0, salary.amount - salary.deductions);
    salary.receiptNo = generateReceiptNo();
    if (paymentReference) salary.paymentReference = paymentReference;
    if (amountTendered != null) salary.amountTendered = amountTendered;
    if (changeReturned != null) salary.changeReturned = changeReturned;

    await salary.save();

    res.status(200).json({
        success: true,
        message: "Salary marked as paid",
        receiptNo: salary.receiptNo,
        salary,
    });
});

export const paySalariesBulk = catchAsyncErrors(async (req, res, next) => {
    const { salaryIds, paymentMethod, paymentDate, paymentReference } = req.body;

    if (!Array.isArray(salaryIds) || salaryIds.length === 0) {
        return next(new ErrorHandler("salaryIds must be a non-empty array", 400));
    }
    if (!paymentMethod) return next(new ErrorHandler("paymentMethod is required", 400));

    const salaries = await Salary.find({ _id: { $in: salaryIds } });
    if (salaries.length !== salaryIds.length) {
        return next(new ErrorHandler("One or more salary records were not found", 404));
    }
    const alreadyPaid = salaries.filter((s) => s.status === "Paid");
    if (alreadyPaid.length > 0) {
        return next(new ErrorHandler(`${alreadyPaid.length} of the selected salary record(s) are already Paid`, 400));
    }

    const resolvedPaymentDate = paymentDate ? new Date(paymentDate) : new Date();

    for (const s of salaries) {
        s.status = "Paid";
        s.paymentDate = resolvedPaymentDate;
        s.paymentMethod = paymentMethod;
        s.netSalary = Math.max(0, s.amount - s.deductions);
        s.receiptNo = generateReceiptNo();
        if (paymentReference) s.paymentReference = paymentReference;
        await s.save();
    }

    const updated = await Salary.find({ _id: { $in: salaryIds } }).populate(
        "employeeId",
        "firstName middleName lastName email phoneNumber"
    );

    res.status(200).json({
        success: true,
        message: `${updated.length} salary record(s) marked as paid`,
        salaries: updated,
    });
});