import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Fees from "../models/fees.js";
import ErrorHandler from "../utils/errorHandler.js";
import APIFilters from "../utils/apiFilters.js";

// Create new fee entry => /api/v1/fees
export const newFee = catchAsyncErrors(async (req, res, next) => {
    const { studentId, amount, feeType, dueDate, status, paymentDate, paymentMethod } = req.body;

    const fee = await Fees.create({
        studentId,
        amount,
        feeType,
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
    const apiFilters = new APIFilters(Fees, req.query).search().filters();

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