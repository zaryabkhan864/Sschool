import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Salary from "../models/salaries.js";
import ErrorHandler from "../utils/errorHandler.js";
import APIFilters from "../utils/apiFilters.js";

// Create new salary record => /api/v1/salaries
export const newSalary = catchAsyncErrors(async (req, res, next) => {
  const { employeeId, amount, month, status, paymentDate, deductions, netSalary } = req.body;

  if (!employeeId || !amount || !month) {
    return next(new ErrorHandler("employeeId, amount, and month are required", 400));
  }

  const salary = await Salary.create({
    employeeId,
    amount,
    month,
    status,
    paymentDate,
    deductions,
    netSalary,
  });

  res.status(201).json({
    success: true,
    salary,
  });
});

// Get all salary records => /api/v1/salaries
export const getSalaries = catchAsyncErrors(async (req, res, next) => {
  const limit = Number(req.query.limit);
  const isDropdownRequest = limit === 0 || req.query.paginate === "false";

  const baseApiFilters = new APIFilters(Salary, req.query).search().filters();
  const total = await Salary.countDocuments(baseApiFilters.query._conditions);

  const apiFilters = new APIFilters(Salary, req.query).search().filters().sort();

  if (!isDropdownRequest) {
    apiFilters.pagination();
  }

  const salaries = await apiFilters.query.populate(
    "employeeId",
    "firstName middleName lastName email role"
  );

  let pagination = null;
  if (!isDropdownRequest && apiFilters.shouldPaginate) {
    pagination = {
      total,
      page: apiFilters.page,
      limit: apiFilters.limit,
      totalPages: Math.ceil(total / apiFilters.limit),
    };
  }

  res.status(200).json({
    success: true,
    count: salaries.length,
    ...(pagination && { pagination }),
    salaries,
  });
});

// Get single salary record => /api/v1/salaries/:id
export const getSalaryDetails = catchAsyncErrors(async (req, res, next) => {
  const salary = await Salary.findById(req.params.id).populate(
    "employeeId",
    "firstName middleName lastName email role"
  );

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
    { new: true, runValidators: true }
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

// Get all salary records for a specific employee => /api/v1/salaries/employee/:id
export const getSalariesByEmployee = catchAsyncErrors(async (req, res, next) => {
  const salaries = await Salary.find({ employeeId: req.params.id })
    .sort({ month: -1 })
    .populate("employeeId", "firstName middleName lastName email role");

  if (!salaries.length) {
    return next(new ErrorHandler("No salary records found for this employee", 404));
  }

  res.status(200).json({
    success: true,
    count: salaries.length,
    salaries,
  });
});

// Get unpaid salaries => /api/v1/salaries/unpaid
export const getUnpaidSalaries = catchAsyncErrors(async (req, res, next) => {
  const { campus } = req.cookies;

  const filter = { status: "Unpaid" };

  const unpaidSalaries = await Salary.find(filter)
    .populate("employeeId", "firstName middleName lastName email role campus")
    .sort({ month: -1 });

  if (!unpaidSalaries.length) {
    return next(new ErrorHandler("No unpaid salary records found", 404));
  }

  res.status(200).json({
    success: true,
    count: unpaidSalaries.length,
    unpaidSalaries,
  });
});

// Get salary summary for an employee (total paid, total unpaid, total deductions)
// => /api/v1/salaries/summary/:employeeId
export const getEmployeeSalarySummary = catchAsyncErrors(async (req, res, next) => {
  const salaries = await Salary.find({ employeeId: req.params.employeeId });

  if (!salaries.length) {
    return next(new ErrorHandler("No salary records found for this employee", 404));
  }

  const totalPaid = salaries
    .filter((s) => s.status === "Paid")
    .reduce((sum, s) => sum + (s.netSalary || s.amount || 0), 0);

  const totalUnpaid = salaries
    .filter((s) => s.status === "Unpaid")
    .reduce((sum, s) => sum + (s.netSalary || s.amount || 0), 0);

  const totalDeductions = salaries.reduce((sum, s) => sum + (s.deductions || 0), 0);

  res.status(200).json({
    success: true,
    summary: {
      totalRecords: salaries.length,
      totalPaid,
      totalUnpaid,
      totalDeductions,
    },
  });
});

// Mark salary as paid => /api/v1/salaries/:id/pay
export const markSalaryAsPaid = catchAsyncErrors(async (req, res, next) => {
  const salary = await Salary.findById(req.params.id);

  if (!salary) {
    return next(new ErrorHandler("Salary record not found", 404));
  }

  if (salary.status === "Paid") {
    return next(new ErrorHandler("Salary is already marked as paid", 400));
  }

  salary.status = "Paid";
  salary.paymentDate = req.body.paymentDate || new Date();
  await salary.save();

  res.status(200).json({
    success: true,
    message: "Salary marked as paid",
    salary,
  });
});
