import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Fees from "../models/fees.js";
import ErrorHandler from "../utils/errorHandler.js";
import APIFilters from "../utils/apiFilters.js";
import User from "../models/user.js";
import Salary from "../models/salaries.js";
import Expense from "../models/expenses.js";
import Revenue from "../models/revenue.js";
import mongoose from "mongoose"; // ← Yahaan add karo
// Create new fee entry => /api/v1/fees
export const newFee = catchAsyncErrors(async (req, res, next) => {
    const { campus, selectedYear } = req.cookies;
    const { student, amount, feeType, currency, dueDate, status, paymentDate, paymentMethod } = req.body;

    // Check if the referenced user is a student
    const user = await User.findById(student);
    if (!user || user.role !== "student") {
        return next(new ErrorHandler("The referenced user must be a student.", 400));
    }

    const fee = await Fees.create({
        student,
        amount,
        feeType,
        currency,
        dueDate,
        status,
        paymentDate,
        paymentMethod,
        campus,          // added from cookies
        year: selectedYear // added from cookies
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

    const { studentId, amount, feeType, dueDate, status, paymentDate, paymentMethod } = req.body;

    fee = await Fees.findByIdAndUpdate(
        req.params.id,
        { studentId, amount, feeType, dueDate, status, paymentDate, paymentMethod, campus, year: selectedYear },
        { new: true }
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

// Get all fees for a specific student => /api/v1/fees/student/:id
export const getFeesByStudent = catchAsyncErrors(async (req, res, next) => {
    const { campus, selectedYear } = req.cookies;
    const fees = await Fees.find({ student: req.params.id, campus, year: selectedYear });

    if (!fees.length) {
        return next(new ErrorHandler("No fee records found for this student", 404));
    }

    res.status(200).json({
        success: true,
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
    const { campus, selectedYear } = req.cookies;

    // Calculate monthly revenue
    const monthlyRevenue = await Revenue.aggregate([
        { $match: { campus, year: selectedYear } },
        {
            $group: {
                _id: { month: { $month: "$date" }, year: { $year: "$date" } },
                totalRevenue: { $sum: "$amount" }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Calculate monthly fees
    const monthlyFees = await Fees.aggregate([
        { $match: { campus, year: selectedYear } },
        {
            $group: {
                _id: { month: { $month: "$dueDate" }, year: { $year: "$dueDate" } },
                totalFees: { $sum: "$amount" }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Calculate monthly salaries
    const monthlySalaries = await Salary.aggregate([
        { $match: { campus, year: selectedYear } },
        {
            $group: {
                _id: { month: { $month: "$paymentDate" }, year: { $year: "$paymentDate" } },
                totalSalaries: { $sum: "$amount" }
            }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Calculate monthly other expenses
    const monthlyOtherExpenses = await Expense.aggregate([
        { $match: { campus, year: selectedYear } },
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
