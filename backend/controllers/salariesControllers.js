import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Salary from "../models/salaries.js";
import ErrorHandler from "../utils/errorHandler.js";
import APIFilters from "../utils/apiFilters.js";

// Create new salary entry => /api/v1/salaries
export const newSalary = catchAsyncErrors(async (req, res, next) => {
    const { employeeId, amount, month, status, paymentDate, deductions, netSalary } = req.body;
    console.log("req.body", req.body)

    const salary = await Salary.create({
        employeeId,
        amount,
        month,
        status,
        paymentDate,
        deductions,
        netSalary,
    });

    res.status(200).json({
        success: true,
        salary,
    });
});

// Get all salaries => /api/v1/salaries
export const getSalaries = catchAsyncErrors(async (req, res, next) => {
    const resPerPage = 10;
    const apiFilters = new APIFilters(Salary, req.query).search().filters().populate("employeeId");

    let salaries = await apiFilters.query;
    const filteredSalariesCount = salaries.length;

    apiFilters.pagination(resPerPage);
    salaries = await apiFilters.query.clone();

    res.status(200).json({
        success: true,
        resPerPage,
        filteredSalariesCount,
        salaries,
    });
});

// Get single salary details => /api/v1/salaries/:id
export const getSalaryDetails = catchAsyncErrors(async (req, res, next) => {
    const salary = await Salary.findById(req.params.id).populate("employeeId");

    if (!salary) {
        return next(new ErrorHandler("Salary record not found", 404));
    }

    res.status(200).json({
        success: true,
        salary,
    });
});

// Update salary record => /api/v1/salaries/:id
export const updateSalary = catchAsyncErrors(async (req, res, next) => {
    let salary = await Salary.findById(req.params.id);

    if (!salary) {
        return next(new ErrorHandler("Salary record not found", 404));
    }

    const { employeeId, amount, month, status, paymentDate, deductions, netSalary } = req.body;

    salary = await Salary.findByIdAndUpdate(
        req.params.id,
        { employeeId, amount, month, status, paymentDate, deductions, netSalary },
        { new: true }
    );

    res.status(200).json({
        success: true,
        salary,
    });
});

// Delete salary record => /api/v1/salaries/:id
export const deleteSalary = catchAsyncErrors(async (req, res, next) => {
    const salary = await Salary.findById(req.params.id);

    if (!salary) {
        return next(new ErrorHandler("Salary record not found", 404));
    }

    await Salary.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        message: "Salary record deleted successfully",
    });
});

// Get all salaries for a specific employee => /api/v1/salaries/employee/:id
export const getSalariesByEmployee = catchAsyncErrors(async (req, res, next) => {
    const salaries = await Salary.find({ employeeId: req.params.id });

    if (!salaries.length) {
        return next(new ErrorHandler("No salary records found for this employee", 404));
    }

    res.status(200).json({
        success: true,
        salaries,
    });
});

// Get unpaid salaries => /api/v1/salaries/unpaid
export const getUnpaidSalaries = catchAsyncErrors(async (req, res, next) => {
    const unpaidSalaries = await Salary.find({ status: "Unpaid" });

    if (!unpaidSalaries.length) {
        return next(new ErrorHandler("No unpaid salary records found", 404));
    }

    res.status(200).json({
        success: true,
        unpaidSalaries,
    });
});
