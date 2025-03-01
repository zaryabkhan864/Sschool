import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import Campus from "../models/campus.js";
import APIFilters from "../utils/apiFilters.js";
import ErrorHandler from "../utils/errorHandler.js";

// Create new campus => /api/v1/campus
export const newCampus = catchAsyncErrors(async (req, res, next) => {
  const campus = await Campus.create( req.body);
  res.status(200).json({
    campus,
  });
});

//Create get all campus => /api/v1/campus
export const getCampus = catchAsyncErrors(async (req, res, next) => {
  console.log(req.query)
  if(req.query.paginate === 'false' ||req.query.paginate === false){
    const campus =await Campus.find()
    return res.status(200).json({
      success: true,
      campus,
    });
  }
  else{
    const resPerPage = 8;
    const apiFilters = new APIFilters(Campus, req.query).search().filters();
  
    let campus = await apiFilters.query;
    const filteredCampusCount = campus.length;
  
    apiFilters.pagination(resPerPage);
    campus = await apiFilters.query.clone();
  
    return res.status(200).json({
      success: true,
      resPerPage,
      filteredCampusCount,
      campus,
    });
  }
 
});



// Update campus => /api/v1/campus/:id
export const updateCampus = catchAsyncErrors(async (req, res, next) => {
  let campus = await Campus.findById(req?.params?.id);

  if (!campus) {
    return next(new ErrorHandler("campus not found", 404));
  }

  campus = await Campus.findByIdAndUpdate(
    req?.params?.id,
    req.body,
    {
      new: true,
    }
  );

  res.status(200).json({
    campus,
  });
});

// Get single campus details => /api/v1/campus/:id
export const getCampusDetails = catchAsyncErrors(async (req, res) => {
  const campus = await Campus.findById(req?.params?.id);

  if (!campus) {
    return next(new ErrorHandler("Campus not found", 404));
  }

  res.status(200).json({
    campus,
  });
});
