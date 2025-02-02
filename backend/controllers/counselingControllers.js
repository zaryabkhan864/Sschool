import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Counseling from "../models/counseling.js";
//CRUD operations for courses

// Create new counseling => /api/v1/counselings
export const newCounseling = catchAsyncErrors(async (req, res, next) => {
  console.log("Yes i am hit");
  const { student, complain, comment } = req.body;
  console.log("Yes i am hit", student, complain, comment);
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
    filteredCoursesCount,
    counselings,
  });
});
