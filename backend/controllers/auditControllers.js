import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import EmployeeContract from "../models/employeeContract.js";
import ErrorHandler from "../utils/errorHandler.js";

export const getContractAudit = catchAsyncErrors(async (req, res, next) => {
  const contract = await EmployeeContract.findOne({
    _id: req.params.id,
    isDeleted: false,
  })
    .select("employee campus academicYear role status startDate endDate audit note createdAt updatedAt")
    .populate("employee", "firstName middleName lastName email role")
    .populate("campus", "name code")
    .populate("academicYear", "name")
    .populate("audit.createdBy", "firstName lastName email role")
    .populate("audit.updatedBy", "firstName lastName email role")
    .populate("audit.terminatedBy", "firstName lastName email role")
    .populate("audit.reHireApprovedBy", "firstName lastName email role");

  if (!contract) {
    return next(new ErrorHandler("Contract not found", 404));
  }

  res.status(200).json({
    success: true,
    audit: {
      contractId: contract._id,
      employee: contract.employee,
      campus: contract.campus,
      academicYear: contract.academicYear,
      role: contract.role,
      status: contract.status,
      startDate: contract.startDate,
      endDate: contract.endDate,
      note: contract.note,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
      trail: contract.audit,
    },
  });
});

// ============================================================
// GET all contracts with audit trail => /api/v1/audit/contracts
// Supports filters: campus, academicYear, status, terminatedBy, createdBy
// ============================================================
export const getAllContractsAudit = catchAsyncErrors(async (req, res, next) => {
  const { campus, academicYear, status, createdBy, terminatedBy } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = { isDeleted: false };
  if (campus) filter.campus = campus;
  if (academicYear) filter.academicYear = academicYear;
  if (status) filter.status = status;
  if (createdBy) filter["audit.createdBy"] = createdBy;
  if (terminatedBy) filter["audit.terminatedBy"] = terminatedBy;

  const total = await EmployeeContract.countDocuments(filter);

  const contracts = await EmployeeContract.find(filter)
    .select("employee campus academicYear role status startDate endDate audit createdAt updatedAt")
    .populate("employee", "firstName middleName lastName email role")
    .populate("campus", "name code")
    .populate("academicYear", "name")
    .populate("audit.createdBy", "firstName lastName email")
    .populate("audit.updatedBy", "firstName lastName email")
    .populate("audit.terminatedBy", "firstName lastName email")
    .populate("audit.reHireApprovedBy", "firstName lastName email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    contracts,
  });
});

// ============================================================
// GET audit history for a specific employee (all their contracts)
// => /api/v1/audit/employee/:employeeId
// ============================================================
export const getEmployeeAuditHistory = catchAsyncErrors(async (req, res, next) => {
  const contracts = await EmployeeContract.find({
    employee: req.params.employeeId,
    isDeleted: false,
  })
    .select("campus academicYear role status startDate endDate audit note createdAt updatedAt")
    .populate("campus", "name code")
    .populate("academicYear", "name")
    .populate("audit.createdBy", "firstName lastName email")
    .populate("audit.updatedBy", "firstName lastName email")
    .populate("audit.terminatedBy", "firstName lastName email")
    .populate("audit.reHireApprovedBy", "firstName lastName email")
    .sort({ startDate: 1 });

  if (!contracts.length) {
    return next(new ErrorHandler("No contract audit history found for this employee", 404));
  }

  res.status(200).json({
    success: true,
    count: contracts.length,
    employeeId: req.params.employeeId,
    history: contracts,
  });
});

// ============================================================
// GET all terminated contracts with termination details
// => /api/v1/audit/terminated
// ============================================================
export const getTerminatedContractsAudit = catchAsyncErrors(async (req, res, next) => {
  const { campus, academicYear } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = { status: "terminated", isDeleted: false };
  if (campus) filter.campus = campus;
  if (academicYear) filter.academicYear = academicYear;

  const total = await EmployeeContract.countDocuments(filter);

  const contracts = await EmployeeContract.find(filter)
    .select("employee campus academicYear role startDate endDate audit note createdAt updatedAt")
    .populate("employee", "firstName middleName lastName email role")
    .populate("campus", "name code")
    .populate("academicYear", "name")
    .populate("audit.createdBy", "firstName lastName email")
    .populate("audit.terminatedBy", "firstName lastName email")
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    contracts,
  });
});

// ============================================================
// GET all contracts created by a specific admin
// => /api/v1/audit/created-by/:adminId
// ============================================================
export const getContractsCreatedByAdmin = catchAsyncErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {
    "audit.createdBy": req.params.adminId,
    isDeleted: false,
  };

  const total = await EmployeeContract.countDocuments(filter);

  const contracts = await EmployeeContract.find(filter)
    .select("employee campus academicYear role status startDate endDate audit createdAt")
    .populate("employee", "firstName middleName lastName email role")
    .populate("campus", "name code")
    .populate("academicYear", "name")
    .populate("audit.createdBy", "firstName lastName email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    contracts,
  });
});

// ============================================================
// GET all contracts modified by a specific admin
// => /api/v1/audit/updated-by/:adminId
// ============================================================
export const getContractsUpdatedByAdmin = catchAsyncErrors(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {
    "audit.updatedBy": req.params.adminId,
    isDeleted: false,
  };

  const total = await EmployeeContract.countDocuments(filter);

  const contracts = await EmployeeContract.find(filter)
    .select("employee campus academicYear role status startDate endDate audit updatedAt")
    .populate("employee", "firstName middleName lastName email role")
    .populate("campus", "name code")
    .populate("academicYear", "name")
    .populate("audit.updatedBy", "firstName lastName email")
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    contracts,
  });
});

// ============================================================
// GET re-hire approved contracts => /api/v1/audit/rehire-approved
// ============================================================
export const getReHireApprovedContracts = catchAsyncErrors(async (req, res, next) => {
  const contracts = await EmployeeContract.find({
    reHireAllowed: true,
    isDeleted: false,
  })
    .select("employee campus academicYear role status audit createdAt")
    .populate("employee", "firstName middleName lastName email role")
    .populate("campus", "name code")
    .populate("audit.reHireApprovedBy", "firstName lastName email")
    .sort({ updatedAt: -1 });

  res.status(200).json({
    success: true,
    count: contracts.length,
    contracts,
  });
});

// ============================================================
// GET audit summary stats => /api/v1/audit/stats
// ============================================================
export const getAuditStats = catchAsyncErrors(async (req, res, next) => {
  const { campus, academicYear } = req.query;

  const baseFilter = { isDeleted: false };
  if (campus) baseFilter.campus = campus;
  if (academicYear) baseFilter.academicYear = academicYear;

  const [
    totalContracts,
    activeContracts,
    terminatedContracts,
    resignedContracts,
    expiredContracts,
    transferredContracts,
    draftContracts,
    cancelledContracts,
  ] = await Promise.all([
    EmployeeContract.countDocuments(baseFilter),
    EmployeeContract.countDocuments({ ...baseFilter, status: "active" }),
    EmployeeContract.countDocuments({ ...baseFilter, status: "terminated" }),
    EmployeeContract.countDocuments({ ...baseFilter, status: "resigned" }),
    EmployeeContract.countDocuments({ ...baseFilter, status: "expired" }),
    EmployeeContract.countDocuments({ ...baseFilter, status: "transferred" }),
    EmployeeContract.countDocuments({ ...baseFilter, status: "draft" }),
    EmployeeContract.countDocuments({ ...baseFilter, status: "cancelled" }),
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalContracts,
      byStatus: {
        active: activeContracts,
        terminated: terminatedContracts,
        resigned: resignedContracts,
        expired: expiredContracts,
        transferred: transferredContracts,
        draft: draftContracts,
        cancelled: cancelledContracts,
      },
    },
  });
});
