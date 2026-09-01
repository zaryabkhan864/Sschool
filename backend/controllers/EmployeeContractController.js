//controllers
// controllers
// employee contract controllers
import mongoose from "mongoose";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import EmployeeContract from "../models/employeeContract.js";
import PositionHistory from "../models/positionHistory.js";
import User from "../models/user.js";
import AcademicYear from "../models/academicYear.js";
import Campus from "../models/campus.js";
import ErrorHandler from "../utils/errorHandler.js";
import APIFilters from "../utils/apiFilters.js";

// ============================================================
// CREATE employee contract
// ============================================================
export const createEmployeeContract = catchAsyncErrors(async (req, res, next) => {
  const {
    employee, role, designationLevel, campus, academicYear,
    startDate, endDate, status, note, reHireAllowed,
  } = req.body;

  const salaryObj = req.body.salary || {};
  const baseSalary   = salaryObj.baseSalary   ?? req.body.baseSalary;
  const paymentType  = salaryObj.paymentType  ?? req.body.paymentType  ?? "monthly";
  const currency     = salaryObj.currency     ?? req.body.currency     ?? "USD";
  const allowances   = salaryObj.allowances   ?? req.body.allowances   ?? {};
  // ✅ NEW: annual paid-leave allowance for this contract (defaults to 0 = not tracked)
  const annualLeaveAllowanceRaw =
    salaryObj.annualLeaveAllowance ?? req.body.annualLeaveAllowance ?? 0;
  const annualLeaveAllowance = Number(annualLeaveAllowanceRaw) || 0;

  if (!employee || !role || !campus || !academicYear || !startDate || baseSalary == null) {
    return next(
      new ErrorHandler(
        "employee, role, campus, academicYear, startDate, and baseSalary are required",
        400
      )
    );
  }

  if (annualLeaveAllowance < 0) {
    return next(new ErrorHandler("annualLeaveAllowance cannot be negative", 400));
  }

  const employeeDoc = await User.findById(employee);
  if (!employeeDoc) {
    return next(new ErrorHandler("Employee not found", 404));
  }
  if (employeeDoc.role === "student") {
    return next(
      new ErrorHandler("Cannot create a contract for a student. Use student enrollment.", 400)
    );
  }

  if (!(await Campus.findById(campus))) {
    return next(new ErrorHandler("Campus not found", 404));
  }

  if (!(await AcademicYear.findById(academicYear))) {
    return next(new ErrorHandler("Academic year not found", 404));
  }

  const contract = await EmployeeContract.create({
    employee,
    role,
    designationLevel,
    campus,
    academicYear,
    startDate,
    endDate: endDate || undefined,
    status: status || "active",
    note,
    reHireAllowed: reHireAllowed || false,
    salary: { baseSalary, paymentType, currency, allowances, annualLeaveAllowance },
    audit: { createdBy: req.user._id },
  });

  if (["active", "draft"].includes(contract.status)) {
    employeeDoc.accountStatus = "active";
    employeeDoc.lifecycleStatus = "contracted";
    employeeDoc.currentContract = contract._id;
    await employeeDoc.save({ validateBeforeSave: false });
  }

  res.status(201).json({
    success: true,
    message: "Employee contract created successfully",
    contract,
  });
});

// ============================================================
// GET employee contracts (with optional uncontracted employees)
// ============================================================
// ✅ NOW SUPPORTS server-side keyword search + gender filter, and an
// optional countOnly mode (returns just { total }, used by the stats
// card on the frontend so it doesn't need to pull the whole list).
export const getEmployeeContracts = catchAsyncErrors(async (req, res, next) => {
  req.query.isDeleted = false;

  const limit = Number(req.query.limit);
  const isDropdownRequest = limit === 0 || req.query.paginate === "false";
  const includeUncontracted = req.query.includeUncontracted === "true";
  const countOnly = req.query.countOnly === "true";

  // keyword/gender aren't real fields on EmployeeContract (they live on the
  // populated `employee`), so resolve them into an employee-id filter
  // first, then remove them from req.query so APIFilters.filters() doesn't
  // try to query EmployeeContract directly for a "keyword"/"gender" field.
  const keyword = req.query.keyword?.trim();
  const gender = req.query.gender;
  let employeeIdFilter = null;
  if (keyword || gender) {
    const employeeQuery = { role: { $ne: "student" } };
    if (gender) employeeQuery.gender = gender;
    if (keyword) {
      employeeQuery.$or = [
        { firstName: { $regex: keyword, $options: "i" } },
        { middleName: { $regex: keyword, $options: "i" } },
        { lastName: { $regex: keyword, $options: "i" } },
        { phoneNumber: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
      ];
    }
    employeeIdFilter = await User.find(employeeQuery).distinct("_id");
  }
  delete req.query.keyword;
  delete req.query.gender;
  delete req.query.countOnly;

  // Regular contract fetching
  const baseApiFilters = new APIFilters(EmployeeContract, req.query)
    .search()
    .filters()
    .sort();
  if (employeeIdFilter) {
    baseApiFilters.query._conditions.employee = { $in: employeeIdFilter };
  }

  const totalContracts = await EmployeeContract.countDocuments(
    baseApiFilters.query._conditions
  );

  // ✅ Cheap path: caller only wants the total (e.g. stats card) — skip
  // fetching/populating any documents.
  if (countOnly) {
    return res.status(200).json({ success: true, total: totalContracts });
  }

  const apiFilters = new APIFilters(EmployeeContract, req.query)
    .search()
    .filters()
    .sort();
  if (employeeIdFilter) {
    apiFilters.query._conditions.employee = { $in: employeeIdFilter };
  }

  if (!isDropdownRequest) {
    apiFilters.pagination();
  }

  const contracts = await apiFilters.query
    .populate({
      path: "employee",
      select: "firstName middleName lastName email phoneNumber role accountStatus lifecycleStatus avatar campus gender",
    })
    .populate("campus", "name code")
    .populate("academicYear", "name startDate endDate")
    .populate("audit.createdBy", "firstName lastName email")
    .populate("audit.updatedBy", "firstName lastName email");

  let finalContracts = contracts;
  let totalCount = totalContracts;

  // If includeUncontracted flag is true, also fetch staff without contracts
  if (includeUncontracted) {
    // Build filter for uncontracted employees using same campus/academicYear if present
    const employeeFilter = {
      role: { $ne: "student" },
    };

    let campusFilter = null;
    if (req.query.campus && mongoose.Types.ObjectId.isValid(req.query.campus)) {
      campusFilter = req.query.campus;
    } else if (req.cookies?.campus && mongoose.Types.ObjectId.isValid(req.cookies.campus)) {
      campusFilter = req.cookies.campus;
    }
    if (campusFilter) {
      employeeFilter.campus = campusFilter;
    }

    let academicYearFilter = null;
    if (req.query.academicYear && mongoose.Types.ObjectId.isValid(req.query.academicYear)) {
      academicYearFilter = req.query.academicYear;
    } else if (req.cookies?.academicYear && mongoose.Types.ObjectId.isValid(req.cookies.academicYear)) {
      academicYearFilter = req.cookies.academicYear;
    }

    const candidateEmployees = await User.find(employeeFilter)
      .select("firstName middleName lastName email phoneNumber role accountStatus lifecycleStatus avatar campus")
      .populate("campus", "name code");

    let uncontractedEmployees = candidateEmployees;

    if (candidateEmployees.length > 0) {
      const contractQuery = {
        employee: { $in: candidateEmployees.map((e) => e._id) },
        status: "active",
        isDeleted: false,
      };
      if (campusFilter) contractQuery.campus = campusFilter;
      if (academicYearFilter) contractQuery.academicYear = academicYearFilter;

      const contractedIds = new Set(
        (await EmployeeContract.find(contractQuery).distinct("employee")).map((id) =>
          id.toString()
        )
      );

      uncontractedEmployees = candidateEmployees.filter(
        (e) => !contractedIds.has(e._id.toString())
      );
    }

    const pseudoContracts = uncontractedEmployees.map(emp => ({
      _id: null,
      employee: emp,
      campus: emp.campus || null,
      academicYear: null,
      status: "uncontracted",
      startDate: null,
      endDate: null,
      role: emp.role,
      designationLevel: null,
      salary: null,
      reHireAllowed: false,
      note: null,
      audit: null,
      createdAt: null,
      updatedAt: null,
    }));

    finalContracts = [...contracts, ...pseudoContracts];
    totalCount = totalContracts + uncontractedEmployees.length;
  }

  let pagination = null;
  if (!isDropdownRequest && apiFilters.shouldPaginate) {
    if (includeUncontracted) {
      pagination = null;
    } else {
      pagination = {
        total: totalContracts,
        page: apiFilters.page,
        limit: apiFilters.limit,
        totalPages: Math.ceil(totalContracts / apiFilters.limit),
      };
    }
  }

  res.status(200).json({
    success: true,
    count: finalContracts.length,
    total: totalContracts,
    ...(pagination && { pagination }),
    contracts: finalContracts,
  });
});

// ============================================================
// GET single contract details
// ============================================================
export const getEmployeeContractDetails = catchAsyncErrors(async (req, res, next) => {
  const contract = await EmployeeContract.findOne({
    _id: req.params.id,
    isDeleted: false,
  })
    .populate("employee")
    .populate("campus")
    .populate("academicYear")
    .populate("audit.createdBy", "firstName lastName email")
    .populate("audit.updatedBy", "firstName lastName email")
    .populate("audit.terminatedBy", "firstName lastName email")
    .populate("audit.reHireApprovedBy", "firstName lastName email");

  if (!contract) {
    return next(new ErrorHandler("Contract not found", 404));
  }

  const positionTimeline = await PositionHistory.getTimeline(contract._id);

  res.status(200).json({
    success: true,
    contract,
    positionTimeline,
  });
});

// ============================================================
// UPDATE employee contract
// ============================================================
export const updateEmployeeContract = catchAsyncErrors(async (req, res, next) => {
  const contract = await EmployeeContract.findOne({
    _id: req.params.id,
    isDeleted: false,
  });

  if (!contract) {
    return next(new ErrorHandler("Contract not found", 404));
  }

  if (["expired", "terminated", "cancelled"].includes(contract.status)) {
    return next(
      new ErrorHandler(
        `Contracts with status "${contract.status}" are read-only and cannot be edited`,
        400
      )
    );
  }

  const restrictedFields = [
    "employee", "academicYear", "audit", "role", "designationLevel", "salary",
    "baseSalary", "paymentType", "currency", "allowances", "annualLeaveAllowance",
  ];
  restrictedFields.forEach((field) => {
    if (req.body[field] !== undefined) delete req.body[field];
  });

  Object.keys(req.body).forEach((key) => {
    contract[key] = req.body[key];
  });

  contract.audit.updatedBy = req.user._id;

  await contract.save();

  if (contract.status === "active") {
    const user = await User.findById(contract.employee);
    if (user && user.accountStatus !== "active") {
      user.accountStatus = "active";
      user.lifecycleStatus = "contracted";
      user.currentContract = contract._id;
      await user.save({ validateBeforeSave: false });
    }
  }

  res.status(200).json({
    success: true,
    message: "Contract updated successfully",
    contract,
  });
});

// ============================================================
// UPDATE leave allowance only
// (salary block, including annualLeaveAllowance, is intentionally
// locked out of the generic update above — this is the one sanctioned
// way to adjust it after the contract is created)
// ============================================================
export const updateLeaveAllowance = catchAsyncErrors(async (req, res, next) => {
  const { annualLeaveAllowance } = req.body;

  if (
    annualLeaveAllowance === undefined ||
    annualLeaveAllowance === null ||
    isNaN(Number(annualLeaveAllowance)) ||
    Number(annualLeaveAllowance) < 0
  ) {
    return next(
      new ErrorHandler("A valid non-negative annualLeaveAllowance is required", 400)
    );
  }

  const contract = await EmployeeContract.findOne({
    _id: req.params.id,
    isDeleted: false,
  });

  if (!contract) {
    return next(new ErrorHandler("Contract not found", 404));
  }

  if (["expired", "terminated", "cancelled"].includes(contract.status)) {
    return next(
      new ErrorHandler(
        `Contracts with status "${contract.status}" are read-only and cannot be edited`,
        400
      )
    );
  }

  contract.salary.annualLeaveAllowance = Number(annualLeaveAllowance);
  contract.audit.updatedBy = req.user._id;
  await contract.save();

  res.status(200).json({
    success: true,
    message: "Leave allowance updated successfully",
    contract,
  });
});

// ============================================================
// SOFT DELETE contract
// ============================================================
export const deleteEmployeeContract = catchAsyncErrors(async (req, res, next) => {
  const contract = await EmployeeContract.findOne({
    _id: req.params.id,
    isDeleted: false,
  });

  if (!contract) {
    return next(new ErrorHandler("Contract not found", 404));
  }

  await EmployeeContract.softDelete(req.params.id, req.user._id);

  res.status(200).json({
    success: true,
    message: "Contract deleted successfully",
  });
});

// ============================================================
// TERMINATE contract
// ============================================================
export const terminateContract = catchAsyncErrors(async (req, res, next) => {
  try {
    const contract = await EmployeeContract.terminateContract({
      contractId: req.params.id,
      terminatedBy: req.user._id,
      reason: req.body.reason,
      terminationDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
    });

    if (req.body.note) {
      contract.note = req.body.note;
      await contract.save();
    }

    // Update the User model when contract is terminated
    await User.findByIdAndUpdate(contract.employee, {
      accountStatus: "inactive",
      lifecycleStatus: "terminated",
      currentContract: null,
    });

    res.status(200).json({
      success: true,
      message: "Contract terminated successfully",
      contract,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// ============================================================
// RESIGN contract
// ============================================================
export const resignContract = catchAsyncErrors(async (req, res, next) => {
  const contract = await EmployeeContract.findOneAndUpdate(
    { _id: req.params.id, isDeleted: false, status: "active" },
    {
      status: "resigned",
      endDate: req.body.endDate || new Date(),
      note: req.body.note,
      "audit.updatedBy": req.user._id,
    },
    { new: true }
  );

  if (!contract) {
    return next(new ErrorHandler("Only active contracts can be resigned (or contract not found)", 400));
  }

  await User.findByIdAndUpdate(contract.employee, {
    accountStatus: "inactive",
    lifecycleStatus: "resigned",
    currentContract: null,
  });

  res.status(200).json({
    success: true,
    message: "Contract resigned successfully",
    contract,
  });
});

// ============================================================
// TRANSFER employee
// ============================================================
export const transferEmployee = catchAsyncErrors(async (req, res, next) => {
  const { employeeId, newCampusId, transferDate, newRole, newBaseSalary, newContractStartDate } = req.body;

  if (!employeeId || !newCampusId || !transferDate) {
    return next(
      new ErrorHandler("employeeId, newCampusId, and transferDate are required", 400)
    );
  }

  if (!(await Campus.findById(newCampusId))) {
    return next(new ErrorHandler("New campus not found", 404));
  }

  const newContract = await EmployeeContract.transferEmployee({
    employeeId,
    newCampusId,
    newRole,
    transferDate: new Date(transferDate),
    newContractStartDate: newContractStartDate ? new Date(newContractStartDate) : undefined,
    newBaseSalary,
    transferredBy: req.user._id,
  });

  await User.findByIdAndUpdate(employeeId, {
    campus: newCampusId,
    accountStatus: "active",
    lifecycleStatus: "contracted",
    currentContract: newContract._id,
  });

  res.status(200).json({
    success: true,
    message: "Employee transferred successfully",
    contract: newContract,
  });
});

// ============================================================
// APPROVE RE-HIRE
// ============================================================
export const approveReHire = catchAsyncErrors(async (req, res, next) => {
  const contract = await EmployeeContract.findOne({
    _id: req.params.id,
    isDeleted: false,
    status: "terminated",
  });

  if (!contract) {
    return next(new ErrorHandler("Terminated contract not found", 404));
  }

  contract.reHireAllowed = true;
  contract.audit.reHireApprovedBy = req.user._id;
  contract.audit.updatedBy = req.user._id;
  await contract.save();

  res.status(200).json({
    success: true,
    message: "Re-hire approved. A new contract can now be created for this employee.",
    contract,
  });
});

// ============================================================
// GET active contracts
// ============================================================
export const getActiveContracts = catchAsyncErrors(async (req, res, next) => {
  const { campus } = req.cookies;
  const filter = { status: "active", isDeleted: false };
  if (campus) filter.campus = campus;

  const contracts = await EmployeeContract.find(filter)
    .populate({
      path: "employee",
      select: "firstName middleName lastName email phoneNumber role accountStatus lifecycleStatus",
    })
    .populate("campus", "name code")
    .populate("academicYear", "name startDate endDate");

  res.status(200).json({
    success: true,
    count: contracts.length,
    contracts,
  });
});

// ============================================================
// GET uncontracted employees
//
// ✅ FIX: previously this relied on User.currentContract === null, but
// that field was never being kept in sync with actual contract records
// (it wasn't set on contract creation), so it always returned every
// non-student employee — wrong counts. It also completely ignored
// academicYear, so switching academic year on the dashboard had no effect.
//
// Now: an employee counts as "uncontracted" for the selected
// campus + academicYear if they do NOT have an active (non-deleted)
// EmployeeContract matching that campus/academicYear. If no
// academicYear is selected, we fall back to checking for any active
// contract (regardless of year) so the widget still makes sense
// without a year filter.
// ============================================================
export const getUncontractedEmployees = catchAsyncErrors(async (req, res, next) => {
  let { campus, academicYear } = req.query;

  if (!campus && req.cookies?.campus && mongoose.Types.ObjectId.isValid(req.cookies.campus)) {
    campus = req.cookies.campus;
  }
  if (!academicYear && req.cookies?.academicYear && mongoose.Types.ObjectId.isValid(req.cookies.academicYear)) {
    academicYear = req.cookies.academicYear;
  }

  const employeeFilter = {
    role: { $ne: "student" },
  };
  if (campus) {
    employeeFilter.campus = campus;
  }

  const employees = await User.find(employeeFilter).select(
    "firstName middleName lastName email phoneNumber role accountStatus lifecycleStatus avatar campus"
  );

  if (employees.length === 0) {
    return res.status(200).json({
      success: true,
      count: 0,
      employees: [],
    });
  }

  const contractQuery = {
    employee: { $in: employees.map((e) => e._id) },
    status: "active",
    isDeleted: false,
  };
  if (campus) contractQuery.campus = campus;
  if (academicYear) contractQuery.academicYear = academicYear;

  const contractedIds = new Set(
    (await EmployeeContract.find(contractQuery).distinct("employee")).map((id) =>
      id.toString()
    )
  );

  const uncontractedEmployees = employees.filter(
    (e) => !contractedIds.has(e._id.toString())
  );

  res.status(200).json({
    success: true,
    count: uncontractedEmployees.length,
    employees: uncontractedEmployees,
  });
});

// ============================================================
// GET staff needing contract
// ============================================================
// ✅ NOW SUPPORTS: page + limit (real server-side pagination), keyword
// (name/phone/email search), gender filter, and countOnly (returns just
// { total }, used by the stats card on the frontend).
//
// ✅ ALSO FIXED: the "only lifecycleStatus === 'uncontracted' counts as
// needing a contract" rule used to be applied client-side, after fetching
// and N+1-checking EVERY teacher on the campus. It's now applied directly
// in the DB query (much cheaper, and works correctly together with
// pagination). The "already has an active contract for this exact
// campus + academicYear" exclusion is expressed as a direct $nin so it
// still composes with server-side pagination.
export const getStaffNeedingContract = catchAsyncErrors(async (req, res, next) => {
  let { campus, academicYear, keyword, gender, page, limit, countOnly } = req.query;

  if (!campus && req.cookies?.campus) campus = req.cookies.campus;
  if (!academicYear && req.cookies?.academicYear) academicYear = req.cookies.academicYear;

  if (!campus || !academicYear) {
    return next(new ErrorHandler("campus and academicYear are required", 400));
  }

  const teacherFilter = {
    role: "teacher",
    campus,
    lifecycleStatus: "uncontracted",
  };
  if (gender) {
    teacherFilter.gender = gender;
  }

  const trimmedKeyword = keyword?.trim();
  if (trimmedKeyword) {
    teacherFilter.$or = [
      { firstName: { $regex: trimmedKeyword, $options: "i" } },
      { middleName: { $regex: trimmedKeyword, $options: "i" } },
      { lastName: { $regex: trimmedKeyword, $options: "i" } },
      { phoneNumber: { $regex: trimmedKeyword, $options: "i" } },
      { email: { $regex: trimmedKeyword, $options: "i" } },
    ];
  }

  // Exclude teachers who already have an active contract for this exact
  // campus + academicYear.
  const contractedIds = await EmployeeContract.find({
    campus,
    academicYear,
    status: "active",
    isDeleted: false,
  }).distinct("employee");
  if (contractedIds.length > 0) {
    teacherFilter._id = { $nin: contractedIds };
  }

  const total = await User.countDocuments(teacherFilter);

  // ✅ Cheap path: caller only wants the total (e.g. stats card) — skip
  // fetching the actual documents / per-teacher contract lookups.
  if (countOnly === "true") {
    return res.status(200).json({ success: true, total });
  }

  const numericLimit = limit === undefined || limit === null || limit === "" ? undefined : Number(limit);
  const hasPaginationParams = numericLimit !== undefined && numericLimit !== 0;

  let query = User.find(teacherFilter)
    .select("firstName middleName lastName email phoneNumber role accountStatus lifecycleStatus avatar gender")
    .sort("-createdAt");

  let paginationMeta = null;
  if (hasPaginationParams) {
    const finalLimit = Math.max(numericLimit, 1);
    const finalPage = Math.max(Number(page) || 1, 1);
    query = query.skip((finalPage - 1) * finalLimit).limit(finalLimit);
    paginationMeta = {
      total,
      page: finalPage,
      limit: finalLimit,
      totalPages: Math.ceil(total / finalLimit),
    };
  }

  const teachers = await query;

  // For each teacher on this page, surface any existing active contract
  // for this academic year (possibly at a different campus) so the
  // frontend can offer "Update Contract" instead of "Create Contract".
  // This per-teacher lookup now only runs for the current page (a
  // handful of rows), not every teacher on the whole campus.
  const result = [];
  for (const teacher of teachers) {
    const existingContract = await EmployeeContract.findOne({
      employee: teacher._id,
      academicYear,
      status: "active",
      isDeleted: false,
    });

    result.push({
      user: teacher,
      existingContract: existingContract || null,
    });
  }

  res.status(200).json({
    success: true,
    count: result.length,
    total,
    ...(paginationMeta && { pagination: paginationMeta }),
    staff: result,
  });
});

// ============================================================
// EXPIRE overdue contracts (cron)
// ============================================================
export const expireOverdueContracts = catchAsyncErrors(async (req, res, next) => {
  const count = await EmployeeContract.expireOverdueContracts();
  res.status(200).json({
    success: true,
    message: `${count} contract(s) expired automatically`,
  });
});

// ============================================================
// GET expiring contracts
// ============================================================
export const getExpiringContracts = catchAsyncErrors(async (req, res, next) => {
  const days = parseInt(req.query.days) || 30;
  const contracts = await EmployeeContract.getExpiringContracts(days);

  res.status(200).json({
    success: true,
    count: contracts.length,
    message: `Contracts expiring within ${days} days`,
    contracts,
  });
});

// ============================================================
// MARK expiry alert sent
// ============================================================
export const markExpiryAlertSent = catchAsyncErrors(async (req, res, next) => {
  const contract = await EmployeeContract.findByIdAndUpdate(
    req.params.id,
    { expiryAlertSent: true },
    { new: true }
  );

  if (!contract) {
    return next(new ErrorHandler("Contract not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Expiry alert marked as sent",
    contract,
  });
});

// ============================================================
// GET contract history for an employee
// ============================================================
export const getEmployeeContractHistory = catchAsyncErrors(async (req, res, next) => {
  const { academicYear } = req.query;

  const contracts = await EmployeeContract.getHistory(
    req.params.employeeId,
    academicYear || null
  )
    .populate("campus", "name code")
    .populate("academicYear", "name startDate endDate");

  if (!contracts.length) {
    return next(new ErrorHandler("No contract history found for this employee", 404));
  }

  res.status(200).json({
    success: true,
    count: contracts.length,
    contracts,
  });
});

// ============================================================
// CHECK active contract on date
// ============================================================
export const checkActiveContractOnDate = catchAsyncErrors(async (req, res, next) => {
  const { employeeId, campusId, date } = req.query;

  if (!employeeId || !campusId) {
    return next(new ErrorHandler("employeeId and campusId are required", 400));
  }

  const checkDate = date ? new Date(date) : new Date();

  const hasContract = await EmployeeContract.hasActiveContractOn(
    employeeId,
    campusId,
    checkDate
  );

  res.status(200).json({
    success: true,
    hasActiveContract: hasContract,
    date: checkDate,
  });
});
