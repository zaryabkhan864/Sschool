// controllers
// Note: Isme cookies se campus ya academicYear nahi liye, kuin k School
// singleton ha aur kisi cheez se linked nahi.

import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import School from "../models/school.js";
import ErrorHandler from "../utils/errorHandler.js";
import { delete_file, upload_file } from "../utils/cloudinary.js";

// Get school info => /api/v1/school
// Public/authenticated route — jahan bhi school ka data (name/logo/desc)
// dikhana ho, wahan se ye endpoint hit kar sakte ho.
export const getSchool = catchAsyncErrors(async (req, res, next) => {
  const school = await School.findOne();
  res.status(200).json({ success: true, school });
});

// Create or update school info (singleton) => /api/v1/admin/school
// Agar school record already exist karta ha to update ho jaye ga,
// warna naya bann jaye ga. Isi liye alag se "create" route ki
// zaroorat nahi.
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
    logo, // base64 / data-url string, jaise avatar handle hota ha
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

  // undefined fields ko hata do taky existing values overwrite na ho
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
