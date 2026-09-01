import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import PositionHistory from "../models/positionHistory.js";
import EmployeeContract from "../models/employeeContract.js";
import ErrorHandler from "../utils/errorHandler.js";

const VALID_REASONS = ["initial", "promotion", "demotion", "salary_revision", "lateral_move"];

// ============================================================
// RECORD a position change (promotion, raise, demotion, lateral move)
// => POST /api/v1/position-history
//
// This is the ONLY write-path for role/designationLevel/salary changes.
// The contract's own denormalized snapshot fields are synced automatically
// by PositionHistory.recordChange — never edit those fields directly via
// the contract update endpoint.
// ============================================================
export const recordPositionChange = catchAsyncErrors(async (req, res, next) => {
  const {
    contractId, role, designationLevel, salary,
    effectiveDate, reason, note,
  } = req.body;

  if (!contractId) {
    return next(new ErrorHandler("contractId is required", 400));
  }

  if (!reason || !VALID_REASONS.includes(reason)) {
    return next(
      new ErrorHandler(`reason is required and must be one of: ${VALID_REASONS.join(", ")}`, 400)
    );
  }

  const contract = await EmployeeContract.findOne({ _id: contractId, isDeleted: false });
  if (!contract) {
    return next(new ErrorHandler("Contract not found", 404));
  }

  if (!["active", "draft"].includes(contract.status)) {
    return next(
      new ErrorHandler(
        `Cannot record a position change on a contract with status "${contract.status}"`,
        400
      )
    );
  }

  // salary, if provided, arrives the same way EmployeeContract accepts it —
  // support both nested and flat for frontend compatibility.
  let salaryPayload;
  if (salary || req.body.baseSalary !== undefined) {
    const salaryObj = salary || {};
    salaryPayload = {
      baseSalary: salaryObj.baseSalary ?? req.body.baseSalary ?? contract.salary.baseSalary,
      paymentType: salaryObj.paymentType ?? req.body.paymentType ?? contract.salary.paymentType,
      currency: salaryObj.currency ?? req.body.currency ?? contract.salary.currency,
      allowances: salaryObj.allowances ?? req.body.allowances ?? contract.salary.allowances,
    };
  }

  try {
    const entry = await PositionHistory.recordChange({
      contractId,
      role,
      designationLevel,
      salary: salaryPayload,
      effectiveDate: effectiveDate ? new Date(effectiveDate) : undefined,
      reason,
      approvedBy: req.user._id,
      note,
    });

    res.status(201).json({
      success: true,
      message: "Position change recorded successfully",
      positionHistory: entry,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// ============================================================
// GET full position timeline for ONE contract => /api/v1/position-history/contract/:contractId
// ============================================================
export const getContractPositionTimeline = catchAsyncErrors(async (req, res, next) => {
  const contract = await EmployeeContract.findOne({
    _id: req.params.contractId,
    isDeleted: false,
  });

  if (!contract) {
    return next(new ErrorHandler("Contract not found", 404));
  }

  const timeline = await PositionHistory.getTimeline(req.params.contractId);

  res.status(200).json({
    success: true,
    count: timeline.length,
    contract: {
      _id: contract._id,
      campus: contract.campus,
      academicYear: contract.academicYear,
      status: contract.status,
    },
    timeline,
  });
});

// ============================================================
// GET current position for ONE contract => /api/v1/position-history/contract/:contractId/current
// ============================================================
export const getContractCurrentPosition = catchAsyncErrors(async (req, res, next) => {
  const current = await PositionHistory.getCurrentPosition(req.params.contractId);

  if (!current) {
    return next(new ErrorHandler("No position history found for this contract", 404));
  }

  res.status(200).json({
    success: true,
    currentPosition: current,
  });
});

// ============================================================
// GET full career timeline for an EMPLOYEE, across all their contracts
// => /api/v1/position-history/employee/:employeeId
//
// Useful for "career path" views: Teacher -> Senior Teacher -> Coordinator,
// including moves that happened across different campuses/contracts.
// ============================================================
export const getEmployeeCareerTimeline = catchAsyncErrors(async (req, res, next) => {
  const contracts = await EmployeeContract.find({
    employee: req.params.employeeId,
    isDeleted: false,
  })
    .select("_id campus academicYear status startDate endDate")
    .populate("campus", "name code")
    .populate("academicYear", "name startDate endDate")
    .sort({ startDate: 1 });

  if (!contracts.length) {
    return next(new ErrorHandler("No contracts found for this employee", 404));
  }

  const contractIds = contracts.map((c) => c._id);
  const positionEntries = await PositionHistory.find({ contract: { $in: contractIds } })
    .populate("approvedBy", "firstName lastName email")
    .sort({ effectiveDate: 1 });

  // Stitch each position entry back to its parent contract's campus/status
  // context, so the frontend can render one continuous career timeline.
  const contractById = new Map(contracts.map((c) => [c._id.toString(), c]));
  const timeline = positionEntries.map((entry) => ({
    _id: entry._id,
    role: entry.role,
    designationLevel: entry.designationLevel,
    salary: entry.salary,
    effectiveDate: entry.effectiveDate,
    reason: entry.reason,
    note: entry.note,
    approvedBy: entry.approvedBy,
    contract: contractById.get(entry.contract.toString()),
  }));

  res.status(200).json({
    success: true,
    count: timeline.length,
    timeline,
  });
});
