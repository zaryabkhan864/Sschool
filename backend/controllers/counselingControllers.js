import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Counseling from "../models/counseling.js";
import APIFilters from "../utils/apiFilters.js";
import ErrorHandler from "../utils/errorHandler.js";
//CRUD operations for courses

// Create new counseling => /api/v1/counselings
export const newCounseling = catchAsyncErrors(async (req, res, next) => {
  const { student, complain, comment } = req.body;
  // const studentId = student === "" ? null : student;
  const counseling = await Counseling.create({
    student,
    complain,
    comment,
  });

  res.status(200).json({
    counseling,
  });
});
//Create get all counseling => /api/v1/counselings
export const getCounselings = catchAsyncErrors(async (req, res, next) => {
  const resPerPage = 8;
  const apiFilters = new APIFilters(Counseling, req.query).search().filters();

  let counselings = await apiFilters.query;
  const filteredCounselingsCount = counselings.length;

  apiFilters.pagination(resPerPage);
  counselings = await apiFilters.query.clone();

  res.status(200).json({
    success: true,
    resPerPage,
    filteredCounselingsCount,
    counselings,
  });
});

// Update counseling => /api/v1/counselings/:id
export const updateCounseling = catchAsyncErrors(async (req, res, next) => {
  let counseling = await Counseling.findById(req?.params?.id);

  if (!counseling) {
    return next(new ErrorHandler("counseling not found", 404));
  }

  const { student, complain, comment } = req.body;

  const studentId = student === "" ? null : student;
  counseling = await Counseling.findByIdAndUpdate(
    req?.params?.id,
    { student: studentId, complain, comment },
    {
      new: true,
    }
  );

  res.status(200).json({
    counseling,
  });
});

// Delete counseling => /api/v1/counselings/:id
export const deleteCounseling = catchAsyncErrors(async (req, res, next) => {
  const counseling = await Counseling.findById(req?.params?.id);
  if (!counseling) {
    return next(new ErrorHandler("Counseling not found", 404));
  }
  await Counseling.findOneAndDelete({ _id: req?.params?.id });
  res.status(200).json({
    message: "Counseling deleted successfully",
  });
});

// extra controller for counseling

// Get single counseling details => /api/v1/counselings/:id
export const getCounselingDetails = catchAsyncErrors(async (req, res) => {
  const counseling = await Counseling.findById(req?.params?.id);

  if (!counseling) {
    return next(new ErrorHandler("Counseling not found", 404));
  }

  res.status(200).json({
    counseling,
  });
});
