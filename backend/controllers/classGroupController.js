import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ClassGroup from "../models/classGroup.js";
import APIFilters from "../utils/apiFilters.js";
import ErrorHandler from "../utils/errorHandler.js";

export const newClassGroup = catchAsyncErrors(async (req, res) => {
  const classGroup = await ClassGroup.create(req.body);
  res.status(200).json({ classGroup });
});

export const getClassGroups = catchAsyncErrors(async (req, res) => {
  if (req.query.paginate === "false") {
    const classGroups = await ClassGroup.find()
      .populate("grade academicLevel");
    return res.status(200).json({ success: true, classGroups });
  }

  const resPerPage = 10;
  const apiFilters = new APIFilters(ClassGroup, req.query).search().filters();

  let classGroups = await apiFilters.query.populate("grade academicLevel");
  const filteredCount = classGroups.length;

  apiFilters.pagination(resPerPage);
  classGroups = await apiFilters.query.clone();

  res.status(200).json({
    success: true,
    resPerPage,
    filteredCount,
    classGroups,
  });
});

export const getClassGroupDetails = catchAsyncErrors(async (req, res, next) => {
  const classGroup = await ClassGroup.findById(req.params.id)
    .populate("grade academicLevel");

  if (!classGroup) {
    return next(new ErrorHandler("Class group not found", 404));
  }

  res.status(200).json({ classGroup });
});

export const updateClassGroup = catchAsyncErrors(async (req, res, next) => {
  let classGroup = await ClassGroup.findById(req.params.id);

  if (!classGroup) {
    return next(new ErrorHandler("Class group not found", 404));
  }

  classGroup = await ClassGroup.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json({ classGroup });
});

export const deleteClassGroup = catchAsyncErrors(async (req, res, next) => {
  const classGroup = await ClassGroup.findById(req.params.id);

  if (!classGroup) {
    return next(new ErrorHandler("Class group not found", 404));
  }

  await ClassGroup.findByIdAndDelete(req.params.id);

  res.status(200).json({
    message: "Class group deleted successfully",
  });
});
