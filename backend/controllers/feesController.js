import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Fees from "../models/fees.js";
import ErrorHandler from "../utils/errorHandler.js";
import APIFilters from "../utils/apiFilters.js";
import User from "../models/user.js";

import Salary from "../models/salaries.js"; // Adjust the path as needed
import Expense from "../models/expenses.js"; // Adjust the path as needed
import Revenue from "../models/revenue.js"; // Adjust the path as needed




// Create new fee entry => /api/v1/fees
export const newFee = catchAsyncErrors(async (req, res, next) => {
    const { student, amount, feeType, currency, dueDate, status, paymentDate, paymentMethod } = req.body;
    console.log("student data of fees", req.body)

    // Check if the referenced user is a student
    const user = await User.findById(student); // Use the imported User model
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
    });

    res.status(200).json({
        success: true,
        fee,
    });
});
// Get all fees => /api/v1/fees
export const getFees = catchAsyncErrors(async (req, res, next) => {
    const resPerPage = 10;
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
    const fee = await Fees.findById(req.params.id).populate("studentId");

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
    let fee = await Fees.findById(req.params.id);

    if (!fee) {
        return next(new ErrorHandler("Fee record not found", 404));
    }

    const { studentId, amount, feeType, dueDate, status, paymentDate, paymentMethod } = req.body;

    fee = await Fees.findByIdAndUpdate(
        req.params.id,
        { studentId, amount, feeType, dueDate, status, paymentDate, paymentMethod },
        { new: true }
    );

    res.status(200).json({
        success: true,
        fee,
    });
});

// Delete fee record => /api/v1/fees/:id
export const deleteFee = catchAsyncErrors(async (req, res, next) => {
    const fee = await Fees.findById(req.params.id);

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
    const fees = await Fees.find({ studentId: req.params.id });

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
    const unpaidFees = await Fees.find({ status: "Unpaid" });

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
    const today = new Date();
    const overdueFees = await Fees.find({ status: "Overdue", dueDate: { $lt: today } });

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
    const stats = await Fees.aggregate([
        {
            $group: {
                _id: "$currency", // Group by currency
                totalAmount: { $sum: "$amount" }, // Sum of amounts for each currency
                totalFees: { $sum: 1 }, // Count of fees for each currency
            },
        },
    ]);

    res.status(200).json({
        success: true,
        stats,
    });
});
// Get Revenue Vs Expenses => /api/v1/fees/stats


export const getRevenueVsExpenses = catchAsyncErrors(async (req, res, next) => {
    // Calculate monthly revenue
    const monthlyRevenue = await Revenue.aggregate([
        {
            $group: {
                _id: { month: { $month: "$date" }, year: { $year: "$date" } }, // Group by month and year
                totalRevenue: { $sum: "$amount" }
            }
        },
        {
            $sort: { "_id.year": 1, "_id.month": 1 } // Sort by year and month
        }
    ]);

    // Calculate monthly fees (part of revenue)
    const monthlyFees = await Fees.aggregate([
        {
            $group: {
                _id: { month: { $month: "$dueDate" }, year: { $year: "$dueDate" } }, // Group by month and year
                totalFees: { $sum: "$amount" }
            }
        },
        {
            $sort: { "_id.year": 1, "_id.month": 1 } // Sort by year and month
        }
    ]);

    // Calculate monthly salaries (part of expenses)
    const monthlySalaries = await Salary.aggregate([
        {
            $group: {
                _id: { month: { $month: "$paymentDate" }, year: { $year: "$paymentDate" } }, // Group by month and year
                totalSalaries: { $sum: "$amount" }
            }
        },
        {
            $sort: { "_id.year": 1, "_id.month": 1 } // Sort by year and month
        }
    ]);

    // Calculate monthly other expenses
    const monthlyOtherExpenses = await Expense.aggregate([
        {
            $group: {
                _id: { month: { $month: "$date" }, year: { $year: "$date" } }, // Group by month and year
                totalOtherExpenses: { $sum: "$amount" }
            }
        },
        {
            $sort: { "_id.year": 1, "_id.month": 1 } // Sort by year and month
        }
    ]);

    // Combine all monthly data
    const monthlyData = {};

    // Add revenue to monthlyData
    monthlyRevenue.forEach(entry => {
        const key = `${entry._id.year}-${entry._id.month}`;
        if (!monthlyData[key]) {
            monthlyData[key] = { year: entry._id.year, month: entry._id.month, totalRevenue: 0, totalFees: 0, totalSalaries: 0, totalOtherExpenses: 0 };
        }
        monthlyData[key].totalRevenue += entry.totalRevenue;
    });

    // Add fees to monthlyData
    monthlyFees.forEach(entry => {
        const key = `${entry._id.year}-${entry._id.month}`;
        if (!monthlyData[key]) {
            monthlyData[key] = { year: entry._id.year, month: entry._id.month, totalRevenue: 0, totalFees: 0, totalSalaries: 0, totalOtherExpenses: 0 };
        }
        monthlyData[key].totalFees += entry.totalFees;
    });

    // Add salaries to monthlyData
    monthlySalaries.forEach(entry => {
        const key = `${entry._id.year}-${entry._id.month}`;
        if (!monthlyData[key]) {
            monthlyData[key] = { year: entry._id.year, month: entry._id.month, totalRevenue: 0, totalFees: 0, totalSalaries: 0, totalOtherExpenses: 0 };
        }
        monthlyData[key].totalSalaries += entry.totalSalaries;
    });

    // Add other expenses to monthlyData
    monthlyOtherExpenses.forEach(entry => {
        const key = `${entry._id.year}-${entry._id.month}`;
        if (!monthlyData[key]) {
            monthlyData[key] = { year: entry._id.year, month: entry._id.month, totalRevenue: 0, totalFees: 0, totalSalaries: 0, totalOtherExpenses: 0 };
        }
        monthlyData[key].totalOtherExpenses += entry.totalOtherExpenses;
    });

    // Convert monthlyData to an array and calculate net profit for each month
    const result = Object.values(monthlyData).map(month => ({
        ...month,
        totalRevenue: month.totalRevenue + month.totalFees,
        totalExpenses: month.totalSalaries + month.totalOtherExpenses,
        netProfit: (month.totalRevenue + month.totalFees) - (month.totalSalaries + month.totalOtherExpenses)
    }));

    // Send the response
    res.status(200).json({
        success: true,
        data: result
    });
});