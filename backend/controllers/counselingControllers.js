import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Counseling from "../models/counseling.js";
import ErrorHandler from "../utils/errorHandler.js";
import APIFilters from "../utils/apiFilters.js";
import mongoose from "mongoose";

const getFullName = (user) => {
  if (!user) return "";
  const parts = [user.firstName, user.middleName, user.lastName].filter(Boolean);
  return parts.join(" ");
};

// -------------------- Create new counseling --------------------
export const newCounseling = catchAsyncErrors(async (req, res) => {
  const { campus, academicYear } = req.cookies;

  if (!campus || !academicYear) {
    return res.status(400).json({
      success: false,
      message: "Campus and year cookies are required",
    });
  }

  const { student, teacher, issueType, complainDescription, incidentDate } = req.body;

  if (!student || !issueType || !complainDescription) {
    return res.status(400).json({
      success: false,
      message: "Student, issueType and complainDescription are required",
    });
  }

  // Optional teacher validation
  if (teacher) {
    const teacherUser = await mongoose.model("User").findById(teacher);
    if (!teacherUser || teacherUser.role !== "teacher") {
      return res.status(400).json({
        success: false,
        message: "Selected teacher is invalid",
      });
    }
  }

  const reportedBy = req.user._id;
  const reporterRole = req.user.role;

  const counseling = await Counseling.create({
    student,
    teacher: teacher || null,
    issueType,
    complainDescription,
    incidentDate: incidentDate || undefined,
    reportedBy,
    reporterRole,
    campus,
    year: academicYear,
    status: "pending",
  });

  const populatedCounseling = await Counseling.findById(counseling._id)
    .populate({ path: "student", select: "firstName middleName lastName" })
    .populate({ path: "teacher", select: "firstName middleName lastName" })
    .populate({ path: "reportedBy", select: "firstName middleName lastName role" })
    .populate({ path: "campus", select: "name" })
    .populate({ path: "year", select: "year" });

  res.status(201).json({
    success: true,
    counseling: populatedCounseling,
  });
});

// -------------------- Get all counselings with pagination & filters --------------------
export const getCounselings = catchAsyncErrors(async (req, res, next) => {
  const { campus: cookieCampus, academicYear: cookieYear } = req.cookies;
  const limit = Number(req.query.limit);
  const isDropdownRequest = limit === 0;

  if (cookieCampus && !isDropdownRequest) req.query.campus = cookieCampus;
  if (cookieYear && !isDropdownRequest) req.query.year = cookieYear;

  const baseApiFilters = new APIFilters(Counseling, req.query)
    .setSearchFields(["issueType", "complainDescription"])
    .search()
    .filters()
    .sort();
  const baseQuery = baseApiFilters.query;
  const total = await baseApiFilters.model.countDocuments(baseQuery._conditions);

  let pending = 0,
    under_review = 0,
    resolved = 0,
    closed = 0;

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
    pending = total;
    under_review = 0;
    resolved = 0;
    closed = 0;
  }

  const apiFilters = new APIFilters(Counseling, req.query)
    .setSearchFields(["issueType", "complainDescription"])
    .search()
    .filters()
    .sort()
    .pagination();

  const populateOptions = [
    { path: "student", select: "firstName middleName lastName" },
    { path: "teacher", select: "firstName middleName lastName" },
    { path: "reportedBy", select: "firstName middleName lastName role" },
    { path: "campus", select: "name" },
    { path: "year", select: "year" },
    { path: "teacherComment.author", select: "firstName middleName lastName" },
    { path: "counselorComment.author", select: "firstName middleName lastName" },
    { path: "principalComment.author", select: "firstName middleName lastName" },
  ];

  apiFilters.populate(populateOptions);
  let counselings = await apiFilters.query;

  if (req.query.keyword && req.query.keyword.trim()) {
    const keyword = req.query.keyword.trim().toLowerCase();

    counselings = counselings.filter((item) => {
      const studentMatch = getFullName(item.student).toLowerCase().includes(keyword);
      const issueMatch = item.issueType?.toLowerCase().includes(keyword);
      const descMatch = item.complainDescription?.toLowerCase().includes(keyword);
      const teacherMatch = getFullName(item.teacher).toLowerCase().includes(keyword);
      return studentMatch || issueMatch || descMatch || teacherMatch;
    });

    if (!apiFilters.shouldPaginate) {
      pending = counselings.filter((c) => c.status === "pending").length;
      under_review = counselings.filter((c) => c.status === "under_review").length;
      resolved = counselings.filter((c) => c.status === "resolved").length;
      closed = counselings.filter((c) => c.status === "closed").length;
    }
  }

  let pagination = null;
  if (apiFilters.shouldPaginate) {
    pagination = {
      total,
      page: apiFilters.page,
      limit: apiFilters.limit,
      totalPages: Math.ceil(total / apiFilters.limit),
    };
  }

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
    .populate({ path: "student", select: "firstName middleName lastName" })
    .populate({ path: "teacher", select: "firstName middleName lastName" })
    .populate({ path: "reportedBy", select: "firstName middleName lastName role" })
    .populate({ path: "campus", select: "name" })
    .populate({ path: "year", select: "year" })
    .populate(
      "teacherComment.author counselorComment.author principalComment.author",
      "firstName middleName lastName"
    );

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

  const {
    student,
    teacher,
    issueType,
    complainDescription,
    incidentDate,
    teacherComment,
    counselorComment,
    principalComment,
    actionTaken,
    status
  } = req.body;

  const updateData = {};

  if (student !== undefined) updateData.student = student === "" ? null : student;
  if (teacher !== undefined) updateData.teacher = teacher === "" ? null : teacher;
  if (issueType !== undefined) updateData.issueType = issueType;
  if (complainDescription !== undefined) updateData.complainDescription = complainDescription;
  if (incidentDate !== undefined) updateData.incidentDate = incidentDate;
  if (actionTaken !== undefined) updateData.actionTaken = actionTaken;
  if (status !== undefined) updateData.status = status;

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

  if (status && status !== counseling.status) {
    const now = new Date();
    if (status === "resolved") updateData.resolvedAt = now;
    if (status === "closed") updateData.closedAt = now;
  }

  counseling = await Counseling.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  )
    .populate({ path: "student", select: "firstName middleName lastName" })
    .populate({ path: "teacher", select: "firstName middleName lastName" })
    .populate({ path: "reportedBy", select: "firstName middleName lastName role" })
    .populate({ path: "campus", select: "name" })
    .populate({ path: "year", select: "year" })
    .populate(
      "teacherComment.author counselorComment.author principalComment.author",
      "firstName middleName lastName"
    );

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