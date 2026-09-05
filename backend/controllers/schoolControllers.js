import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import School from "../models/school.js";
import ErrorHandler from "../utils/errorHandler.js";
import { delete_file, upload_file } from "../utils/cloudinary.js";
export const getSchool = catchAsyncErrors(async (req, res, next) => {
  const school = await School.findOne();
  res.status(200).json({ success: true, school });
});

export const upsertSchool = catchAsyncErrors(async (req, res, next) => {
  const {
    name,
    description,
    tagline,
    address,
    contactNumber,
    email,
    website,
    establishedYear,
    logo, 
  } = req.body;

  let school = await School.findOne();

  let logoData;
  if (logo) {
    logoData = await upload_file(logo);
    if (school?.logo?.public_id) {
      await delete_file(school.logo.public_id);
    }
  }

  const schoolData = {
    name,
    description,
    tagline,
    address,
    contactNumber,
    email,
    website,
    establishedYear,
    ...(logoData && { logo: logoData }),
  };

  Object.keys(schoolData).forEach(
    (key) => schoolData[key] === undefined && delete schoolData[key]
  );

  if (!school) {
    school = await School.create(schoolData);
    return res.status(201).json({ success: true, school });
  }

  school = await School.findByIdAndUpdate(school._id, schoolData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, school });
});

// Delete school logo only => /api/v1/admin/school/logo
export const deleteSchoolLogo = catchAsyncErrors(async (req, res, next) => {
  const school = await School.findOne();
  if (!school) {
    return next(new ErrorHandler("School record not found", 404));
  }

  if (school.logo?.public_id) {
    await delete_file(school.logo.public_id);
  }

  school.logo = undefined;
  await school.save();

  res.status(200).json({ success: true, school });
});
