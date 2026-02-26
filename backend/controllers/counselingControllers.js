import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Counseling from "../models/counseling.js";
import ErrorHandler from "../utils/errorHandler.js";
import APIFilters from "../utils/apiFilters.js";
import mongoose from "mongoose";

// -------------------- Create new counseling --------------------
export const newCounseling = catchAsyncErrors(async (req, res) => {
  const { campus, selectedYear } = req.cookies;

  // Cookies validation
  if (!campus || !selectedYear) {
    return res.status(400).json({
      success: false,
      message: "Campus and year cookies are required",
    });
  }

  const { student, issueType, complainDescription, incidentDate } = req.body;

  // Required fields validation
  if (!student || !issueType || !complainDescription) {
    return res.status(400).json({
      success: false,
      message: "Student, issueType and complainDescription are required",
    });
  }

  // ReportedBy aur reporterRole logged-in user se lein
  const reportedBy = req.user._id;
  const reporterRole = req.user.role;

  // Counseling create karein – incidentDate optional (model default use karega)
  const counseling = await Counseling.create({
    student,
    issueType,
    complainDescription,
    incidentDate: incidentDate || undefined, // agar client ne diya to use karo, warna default
    reportedBy,
    reporterRole,
    campus,
    year: selectedYear,
    status: "pending",
  });

  // Populate karke response bhejein (course controller ki tarah)
  const populatedCounseling = await Counseling.findById(counseling._id)
    .populate({ path: "student", select: "name grade" })
    .populate({ path: "reportedBy", select: "name role" })
    .populate({ path: "campus", select: "name" });

  res.status(201).json({
    success: true,
    counseling: populatedCounseling,
  });
});

// -------------------- Get all counselings with pagination & filters --------------------
export const getCounselings = catchAsyncErrors(async (req, res, next) => {
  const { campus: cookieCampus, selectedYear: cookieYear } = req.cookies;
  const limit = Number(req.query.limit);
  const isDropdownRequest = limit === 0;

  // campus & year filter (skip for dropdown)
  if (cookieCampus && !isDropdownRequest) req.query.campus = cookieCampus;
  if (cookieYear && !isDropdownRequest) req.query.year = cookieYear;

  // Build base query for counting (without pagination)
  const baseApiFilters = new APIFilters(Counseling, req.query)
    .setSearchFields(["issueType", "complainDescription"]) // direct text search
    .search()
    .filters()
    .sort();
  const baseQuery = baseApiFilters.query;
  const total = await baseApiFilters.model.countDocuments(baseQuery._conditions);

  // =============================
  // STATUS COUNTS (pending, under_review, resolved, closed)
  // =============================
  let pending = 0,
    under_review = 0,
    resolved = 0,
    closed = 0;

  // Clone conditions and remove status filter for status‑wise counts
  const countConditions = { ...baseQuery._conditions };
  delete countConditions.status;

  try {
    const statusCounts = await Counseling.aggregate([
      { $match: countConditions },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    statusCounts.forEach((item) => {
      const s = item._id;
      if (s === "pending") pending = item.count;
      else if (s === "under_review") under_review = item.count;
      else if (s === "resolved") resolved = item.count;
      else if (s === "closed") closed = item.count;
    });
  } catch (error) {
    // fallback – assign all to total
    pending = total;
    under_review = 0;
    resolved = 0;
    closed = 0;
  }

  // Main query with pagination
  const apiFilters = new APIFilters(Counseling, req.query)
    .setSearchFields(["issueType", "complainDescription"])
    .search()
    .filters()
    .sort()
    .pagination();

  // Populate options – same style as course controller
  const populateOptions = [
    {
      path: "student",
      select: "name grade",
      populate: {
        path: "grade.gradeId",
        model: "Grade",
        select: "gradeName year",
      },
    },
    { path: "reportedBy", select: "name role" },
    { path: "campus", select: "name" },
    { path: "teacherComment.author", select: "name" },
    { path: "counselorComment.author", select: "name" },
    { path: "principalComment.author", select: "name" },
  ];

  apiFilters.populate(populateOptions);
  let counselings = await apiFilters.query;

  // =============================
  // EXTRA KEYWORD FILTERING (student name) – like courses teacher search
  // =============================
  if (req.query.keyword && req.query.keyword.trim()) {
    const keyword = req.query.keyword.trim().toLowerCase();

    counselings = counselings.filter((item) => {
      const studentMatch = item.student?.name?.toLowerCase().includes(keyword);
      const issueMatch = item.issueType?.toLowerCase().includes(keyword);
      const descMatch = item.complainDescription?.toLowerCase().includes(keyword);
      return studentMatch || issueMatch || descMatch;
    });

    // If pagination is disabled, update counts to reflect filtered results
    if (!apiFilters.shouldPaginate) {
      // Recalculate status counts from filtered array
      pending = counselings.filter((c) => c.status === "pending").length;
      under_review = counselings.filter((c) => c.status === "under_review").length;
      resolved = counselings.filter((c) => c.status === "resolved").length;
      closed = counselings.filter((c) => c.status === "closed").length;
      // total is the length of filtered array
      // but we keep the original total for consistency? Actually we update total.
      // In courses they update total, active, deactive. So we update total too.
      // We'll set total = counselings.length; but then pagination meta would be wrong.
      // However when !shouldPaginate, pagination is null anyway.
      // So we can safely update total.
    }
  }

  // Prepare pagination meta (same as courses)
  let pagination = null;
  if (apiFilters.shouldPaginate) {
    pagination = {
      total,
      page: apiFilters.page,
      limit: apiFilters.limit,
      totalPages: Math.ceil(total / apiFilters.limit),
    };
  }

  // Final response – exactly like courses
  res.status(200).json({
    success: true,
    ...(pagination && {
      pagination: {
        ...pagination,
        counts: { total, pending, under_review, resolved, closed },
      },
    }),
    ...(!pagination && {
      counts: { total, pending, under_review, resolved, closed },
    }),
    counselings,
  });
});

// -------------------- Get single counseling details --------------------
export const getCounselingDetails = catchAsyncErrors(async (req, res, next) => {
  const counseling = await Counseling.findById(req.params.id)
    .populate({
      path: "student",
      select: "name grade",
      populate: {
        path: "grade.gradeId",
        model: "Grade",
        select: "gradeName year",
      },
    })
    .populate({ path: "reportedBy", select: "name role" })
    .populate({ path: "campus", select: "name" })
    .populate("teacherComment.author counselorComment.author principalComment.author", "name");

  if (!counseling) {
    return next(new ErrorHandler("Counseling not found", 404));
  }

  res.status(200).json({
    success: true,
    counseling,
  });
});

// -------------------- Update counseling --------------------
export const updateCounseling = catchAsyncErrors(async (req, res, next) => {
  let counseling = await Counseling.findById(req.params.id);

  if (!counseling) {
    return next(new ErrorHandler("Counseling not found", 404));
  }

  // Allowed fields for update – same style as course controller
  const { student, issueType, complainDescription, incidentDate, teacherComment, counselorComment, principalComment, actionTaken, status } = req.body;

  // Prepare update object (only include fields that are sent)
  const updateData = {};

  if (student !== undefined) updateData.student = student === "" ? null : student;
  if (issueType !== undefined) updateData.issueType = issueType;
  if (complainDescription !== undefined) updateData.complainDescription = complainDescription;
  if (incidentDate !== undefined) updateData.incidentDate = incidentDate;
  if (actionTaken !== undefined) updateData.actionTaken = actionTaken;
  if (status !== undefined) updateData.status = status;

  // Handle comment fields – set author and date automatically
  if (teacherComment && teacherComment.text) {
    updateData.teacherComment = {
      text: teacherComment.text,
      author: req.user._id,
      date: new Date(),
    };
  }
  if (counselorComment && counselorComment.text) {
    updateData.counselorComment = {
      text: counselorComment.text,
      author: req.user._id,
      date: new Date(),
    };
  }
  if (principalComment && principalComment.text) {
    updateData.principalComment = {
      text: principalComment.text,
      author: req.user._id,
      date: new Date(),
    };
  }

  // Special status timestamps – like courses do (though courses don't have timestamps, we mimic)
  if (status && status !== counseling.status) {
    const now = new Date();
    if (status === "resolved") updateData.resolvedAt = now;
    if (status === "closed") updateData.closedAt = now;
  }

  // Update the document
  counseling = await Counseling.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  )
    .populate({
      path: "student",
      select: "name grade",
      populate: {
        path: "grade.gradeId",
        model: "Grade",
        select: "gradeName year",
      },
    })
    .populate({ path: "reportedBy", select: "name role" })
    .populate({ path: "campus", select: "name" })
    .populate("teacherComment.author counselorComment.author principalComment.author", "name");

  res.status(200).json({
    success: true,
    counseling,
  });
});

// -------------------- Delete counseling --------------------
export const deleteCounseling = catchAsyncErrors(async (req, res, next) => {
  const counseling = await Counseling.findById(req.params.id);

  if (!counseling) {
    return next(new ErrorHandler("Counseling not found", 404));
  }

  await counseling.deleteOne();

  res.status(200).json({
    success: true,
    message: "Counseling deleted successfully",
  });
});