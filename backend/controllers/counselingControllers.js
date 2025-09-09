import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Counseling from "../models/counseling.js";
import APIFilters from "../utils/apiFilters.js";
import ErrorHandler from "../utils/errorHandler.js";


//CRUD operations for courses

// Create new counseling => /api/v1/counselings
export const newCounseling = catchAsyncErrors(async (req, res, next) => {
  const { campus,selectedYear } = req.cookies
  const statusPending = "pending"

  const { student, complain, comment } = req.body;

  const counseling = await Counseling.create({
    student,
    complain,
    comment,
    campus: campus,
    year:selectedYear,
    status:statusPending,
  });


  res.status(200).json({
    counseling,
  });
});
//Create get all counseling => /api/v1/counselings
// export const getCounselings = catchAsyncErrors(async (req, res, next) => {
//   const resPerPage = 8;
//   const apiFilters = new APIFilters(Counseling, req.query)
//     .search()
//     .filters()
//     .populate([
//       {
//         path: 'campus',
//         model: 'Campus'
//       },
//       {
//         path: 'student',
//         model: 'User',
//         select: 'name grade', // Select only name and grade fields
//         populate: {
//           path: 'grade.gradeId',
//           model: 'Grade',
//           select: 'gradeName' // Select only gradeName field
//         }
//       }
//     ]);

//   let counselings = await apiFilters.query;
//   const filteredCounselingsCount = counselings.length;

//   apiFilters.pagination(resPerPage);
//   counselings = await apiFilters.query.clone();

//   // Format the response to include student name and grade
//   const formattedCounselings = counselings.map(counseling => {
//     const counselingObj = counseling.toObject();
    
//     // Extract student name
//     counselingObj.studentName = counselingObj.student?.name || 'N/A';
    
//     // Extract grade name (assuming the first grade in the array)
//     counselingObj.studentGrade = counselingObj.student?.grade?.[0]?.gradeId?.gradeName || 'N/A';
    
//     // Remove the full student object if you don't need it
//     delete counselingObj.student;
    
//     return counselingObj;
//   });

//   res.status(200).json({
//     success: true,
//     resPerPage,
//     filteredCounselingsCount,
//     counselings: formattedCounselings,
//   });
// });



export const getCounselings = catchAsyncErrors(async (req, res, next) => {
  const { campus, selectedYear } = req.cookies;

  // Inject filters from cookies into query
  req.query.campus = campus;
  if (selectedYear) {
    req.query.year = selectedYear;
  }

  const resPerPage = 8;

  const apiFilters = new APIFilters(Counseling, req.query)
    .search()
    .filters()
    .populate("student") // basic populate
    .populate("campus");

  // Pehli query for filteredCounselingsCount
  let counselings = await apiFilters.query
    .select("complain comment status year createdAt updatedAt")
    .populate({
      path: "student",
      select: "name grade",
      populate: {
        path: "grade.gradeId",
        model: "Grade",
        select: "gradeName year", // grade ka name + year
      },
    })
    .populate({ path: "campus", select: "name" });

  const filteredCounselingsCount = counselings.length;

  // Paginated query
  apiFilters.pagination(resPerPage);
  counselings = await apiFilters.query.clone()
    .populate({
      path: "student",
      select: "name grade",
      populate: {
        path: "grade.gradeId",
        model: "Grade",
        select: "gradeName year",
      },
    })
    .populate({ path: "campus", select: "name" });

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
export const getCounselingDetails = catchAsyncErrors(async (req, res, next) => {
  const counseling = await Counseling.findById(req?.params?.id)
    .select("complain comment status year createdAt updatedAt")
    .populate({
      path: "student",
      select: "name grade",
      populate: {
        path: "grade.gradeId",
        model: "Grade",
        select: "gradeName year", // grade ka naam aur year
      },
    })
    .populate({ path: "campus", select: "name" });

  if (!counseling) {
    return next(new ErrorHandler("Counseling not found", 404));
  }

  res.status(200).json({
    success: true,
    counseling,
  });
});
