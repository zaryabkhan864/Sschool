// controllers/userController.js

import crypto from "crypto";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import User from "../models/user.js";
import Campus from "../models/campus.js";
import StudentEnrollment from "../models/studentEnrollment.js";
import AcademicYear from "../models/academicYear.js";
import { delete_file, upload_file } from "../utils/cloudinary.js";
import { getResetPasswordTemplate } from "../utils/emailTemplates.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendEmail from "../utils/sendEmail.js";
import sendToken from "../utils/sendToken.js";
import _ from "lodash";
import { nanoid } from 'nanoid';
import mongoose from "mongoose";
import APIFilters from "../utils/apiFilters.js";

export const registerUser = catchAsyncErrors(async (req, res, next) => {
  const { campus } = req.cookies;

  const {
    firstName,
    middleName,
    lastName,
    email,
    password,
    avatar,
    role,
    designationLevel,
    dateOfBirth,
    gender,
    nationality,
    passportNumber,
    nationalID,
    siblings = [],
    phoneNumber,
    secondaryPhoneNumber,
    address,
    status: incomingStatus,
  } = req.body;

  let avatarData = {};
  if (avatar) {
    avatarData = await upload_file(avatar);
  }

  const cleanSiblings = siblings.filter(
    (s) => s && mongoose.Types.ObjectId.isValid(s)
  );

  let campusId = campus;
  if (!campusId) {
    const defaultCampus = await Campus.findOne();
    campusId = defaultCampus?._id;
  }

  let finalStatus = incomingStatus;
  if (role === "student") {
    finalStatus = "pending";
  }

  const user = await User.create({
    firstName,
    middleName,
    lastName,
    email,
    password,
    avatar: avatarData,
    role,
    designationLevel,
    dateOfBirth,
    status: finalStatus,
    gender,
    nationality,
    passportNumber,
    nationalID,
    siblings: cleanSiblings,
    phoneNumber,
    secondaryPhoneNumber,
    address,
    campus: campusId,
    userId: nanoid(10),
  });

  res.status(201).json({
    success: true,
    user,
  });
});

export const loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please enter email & password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  if (user.role === 'admin') {
    const campus = await Campus.findOne()
    user.campus = campus?._id
  }

  sendToken(user, 200, res);
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.cookie("campus", null, {
    expires: new Date(Date.now()),
  });

  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  res.status(200).json({
    message: "Logged Out",
  });
});

export const uploadAvatar = catchAsyncErrors(async (req, res, next) => {
  if (!req.body.avatar) {
    return res.status(400).json({
      success: false,
      message: "No avatar provided",
    });
  }

  const avatarResponse = await upload_file(req.body.avatar);

  if (req.user?.avatar?.public_id) {
    await delete_file(req.user.avatar.public_id);
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: avatarResponse },
    { new: true }
  );

  res.status(200).json({
    success: true,
    user,
  });
});

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found with this email", 404));
  }

  const resetToken = user.getResetPasswordToken();
  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
  const message = getResetPasswordTemplate(user?.name, resetUrl);

  try {
    await sendEmail({
      email: user.email,
      subject: "Sschool Password Recovery",
      message,
    });

    res.status(200).json({
      message: `Email sent to: ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    return next(new ErrorHandler(error?.message, 500));
  }
});

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler(
        "Password reset token is invalid or has been expired",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Passwords does not match", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  if (user.role === 'admin') {
    const campus = await Campus.findOne()
    user.campus = campus?._id
  }

  sendToken(user, 200, res);
});

export const getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req?.user?._id).populate('campus');
  res.status(200).json({ user });
});

export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req?.user?._id).select("+password");
  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Old Password is incorrect", 400));
  }
  user.password = req.body.password;
  await user.save();
  res.status(200).json({ success: true });
});

export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const { campus, academicYear } = req.cookies;
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    dateOfBirth: req.body.dateOfBirth,
    gender: req.body.gender,
    nationality: req.body.nationality,
    passportNumber: req.body.passportNumber,
    nationalID: req.body.nationalID,
    phoneNumber: req.body.phoneNumber,
    secondaryPhoneNumber: req.body.secondaryPhoneNumber,
    year: req.body.year,
    status: req.body.status,
    avatar: req.body.avatar,
  };
  if (campus) newUserData.campus = campus;
  if (academicYear) newUserData.year = academicYear;

  const user = await User.findByIdAndUpdate(req.user._id, newUserData, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, user });
});

export const allUsers = catchAsyncErrors(async (req, res, next) => {
  const { campus, academicYear } = req.cookies;
  const filter = {};
  if (campus) filter.campus = new mongoose.Types.ObjectId(campus);
  if (academicYear) filter.year = academicYear;
  const users = await User.find(filter).populate('campus', 'name');
  res.status(200).json({ users });
});

export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .populate({
      path: 'campus',
      model: 'Campus',
      select: 'name'
    })
    .populate({
      path: 'siblings',
      model: 'User',
      select: 'firstName lastName email userId avatar'
    });

  if (!user) {
    return next(new ErrorHandler(`User not found with id: ${req.params.id}`, 404));
  }

  res.status(200).json({ success: true, user });
});

// ==================== CORRECTED updateUser FUNCTION ====================
export const updateUser = catchAsyncErrors(async (req, res, next) => {
  const { campus: cookieCampus, academicYear: cookieAcademicYear } = req.cookies;
  
  // 1. User ko DB se fetch karo
  const user = await User.findById(req.params.id).select("+password");
  if (!user) {
    return next(new ErrorHandler(`User not found with id: ${req.params.id}`, 404));
  }

  // 2. Original campus aur role yaad rakho
  const originalCampus = user.campus;
  const isStudent = user.role === "student";

  // 3. Avatar handling
  if (req.body.avatar && typeof req.body.avatar === 'string') {
    try {
      const avatarData = await upload_file(req.body.avatar);
      if (user.avatar && user.avatar.public_id) {
        await delete_file(user.avatar.public_id);
      }
      req.body.avatar = avatarData;
    } catch (error) {
      return next(new ErrorHandler(`Avatar upload failed: ${error.message}`, 500));
    }
  } else if (req.body.avatar === null || req.body.avatar === '') {
    if (user.avatar && user.avatar.public_id) {
      await delete_file(user.avatar.public_id);
    }
    req.body.avatar = null;
  }

  // 4. Allowed fields update
  const fieldsToUpdate = [
    "firstName", "middleName", "lastName", "email", "role", "dateOfBirth", "gender", 
    "nationality", "passportNumber", "nationalID", "siblings", "phoneNumber", 
    "secondaryPhoneNumber", "address", "campus", "status", "year", "avatar"
  ];

  fieldsToUpdate.forEach((field) => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });

  // 5. Agar campus body mein nahi hai lekin cookie mein hai to use karo
  if (req.body.campus === undefined && cookieCampus) {
    user.campus = cookieCampus;
  }

  // 6. ✅ CORRECT TRANSFER LOGIC
  const newCampus = user.campus;
  const campusChanged = originalCampus && newCampus && 
                        originalCampus.toString() !== newCampus.toString();

  if (isStudent && campusChanged) {
    // Student ka status active hi rehne do
    // Sirf enrollments ka status transferred karo, campus mat badlo
    try {
      const result = await StudentEnrollment.updateMany(
        { student: user._id, status: "active" },
        { status: "transferred" }
      );
      console.log(`✅ ${result.modifiedCount} active enrollment(s) marked as transferred.`);
    } catch (err) {
      console.error("❌ Failed to update enrollments:", err);
    }
  }

  // 7. Academic year cookie se (agar body mein nahi hai)
  if (req.body.year === undefined && cookieAcademicYear) {
    user.year = cookieAcademicYear;
  }

  // 8. Password update (agar diya ho)
  if (req.body.password && req.body.password.trim() !== "") {
    user.password = req.body.password;
  }

  // 9. Save karo
  await user.save();

  // 10. Populated user return karo
  const updatedUser = await User.findById(req.params.id)
    .populate({ path: 'siblings', model: 'User', select: 'firstName lastName email userId avatar' })
    .populate({ path: 'campus', model: 'Campus', select: 'name' });

  res.status(200).json({ success: true, user: updatedUser });
});
// ==================== END OF CORRECTED FUNCTION ====================

export const deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorHandler(`User not found with id: ${req.params.id}`, 404));
  }
  if (user?.avatar?.public_id) {
    await delete_file(user?.avatar?.public_id);
  }
  await user.deleteOne();
  res.status(200).json({ success: true });
});

export const getUsersByType = catchAsyncErrors(async (req, res, next) => {
  const { type } = req.params;
  const { campus, academicYear: academicYearFromCookie } = req.cookies;

  if (type === 'employee') {
    req.query.role = { $ne: 'student' };
  } else {
    req.query.role = type;
  }

  // Student list ke liye default filter - sirf active status
  const limit = Number(req.query.limit);
  const dropdown = req.query.dropdown === 'true';
  const isDropdownRequest = dropdown || limit === 0;
  
  if (type === 'student' && !req.query.status && !isDropdownRequest) {
    req.query.status = 'active';
  }

  const shouldSkipCookieFilters = dropdown || limit === 0;

  let enrolledIdFilter = null;
  if (type === 'student' && req.query.enrolled !== undefined) {
    let targetAcademicYearId = academicYearFromCookie;

    if (!targetAcademicYearId) {
      const currentYear = await AcademicYear.findOne({ isCurrent: true });
      targetAcademicYearId = currentYear?._id;
    }

    if (!targetAcademicYearId) {
      return res.status(200).json({
        success: true,
        users: [],
        counts: { total: 0, active: 0, deactive: 0 }
      });
    }

    const enrolledStudentIds = await StudentEnrollment.find({
      academicYear: targetAcademicYearId,
      status: "active"
    }).distinct("student");

    if (req.query.enrolled === 'true') {
      if (enrolledStudentIds.length === 0) {
        return res.status(200).json({
          success: true,
          users: [],
          counts: { total: 0, active: 0, deactive: 0 }
        });
      }
      enrolledIdFilter = { $in: enrolledStudentIds };
    } else if (req.query.enrolled === 'false') {
      if (enrolledStudentIds.length > 0) {
        enrolledIdFilter = { $nin: enrolledStudentIds };
      }
    }
    delete req.query.enrolled;
  }

  const isStudentList = type === 'student';
  
  if (!shouldSkipCookieFilters) {
    if (campus) {
      req.query.campus = campus;
    }
    if (academicYearFromCookie && !isStudentList) {
      req.query.year = academicYearFromCookie;
    }
  }

  delete req.query.dropdown;

  if (req.query.gender) {
    const genderValue = req.query.gender.toLowerCase();
    if (['male', 'female', 'other'].includes(genderValue)) {
      req.query.gender = genderValue.charAt(0).toUpperCase() + genderValue.slice(1);
    }
  }

  const baseApiFilters = new APIFilters(User, req.query)
    .setSearchFields(['name', 'email', 'gender', 'nationality'])
    .search()
    .filters()
    .sort();

  if (enrolledIdFilter) {
    baseApiFilters.query._conditions._id = enrolledIdFilter;
  }

  const baseQuery = baseApiFilters.query;
  const total = await baseApiFilters.model.countDocuments(baseQuery._conditions);
  const active = await User.countDocuments({ ...baseQuery._conditions, status: 'active' });
  const deactive = await User.countDocuments({ ...baseQuery._conditions, status: { $in: ['inactive', 'pending', 'suspended', 'expelled'] } });

  const apiFilters = new APIFilters(User, req.query)
    .setSearchFields(['name', 'email', 'gender', 'nationality'])
    .search()
    .filters()
    .sort();

  if (enrolledIdFilter) {
    apiFilters.query._conditions._id = enrolledIdFilter;
  }

  if (!dropdown && limit !== 0) {
    apiFilters.pagination();
  }

  apiFilters.populate({ path: 'campus', model: 'Campus', select: 'name' });

  let users = await apiFilters.query;

  let formattedUsers = users;
  if (type === 'student') {
    formattedUsers = users.map(user => {
      const userObj = user.toObject ? user.toObject() : user;
      return userObj;
    });
  }

  let pagination = null;
  if (!dropdown && limit !== 0 && apiFilters.shouldPaginate) {
    pagination = {
      total,
      page: apiFilters.page,
      limit: apiFilters.limit,
      totalPages: Math.ceil(total / apiFilters.limit),
      counts: { total, active, deactive }
    };
  }

  res.status(200).json({
    success: true,
    ...(pagination && { pagination }),
    ...(!pagination && { counts: { total, active, deactive } }),
    users: formattedUsers,
  });
});

export const getUsersByTypeForEnrollment = catchAsyncErrors(async (req, res, next) => {
  const { type } = req.params;
  const { campus } = req.cookies;

  if (type === 'employee') {
    req.query.role = { $ne: 'student' };
  } else {
    req.query.role = type;
  }

  const limit = Number(req.query.limit);
  const dropdown = req.query.dropdown === 'true';
  const isDropdownRequest = dropdown || limit === 0;
  const shouldSkipCookieFilters = dropdown || limit === 0;
  
  if (campus && !isDropdownRequest) {
    req.query.campus = campus;
  }

  delete req.query.dropdown;

  if (req.query.gender) {
    const genderValue = req.query.gender.toLowerCase();
    if (['male', 'female', 'other'].includes(genderValue)) {
      req.query.gender = genderValue.charAt(0).toUpperCase() + genderValue.slice(1);
    }
  }

  const baseApiFilters = new APIFilters(User, req.query)
    .setSearchFields(['name', 'email', 'gender', 'nationality'])
    .search()
    .filters()
    .sort();

  let baseQuery = baseApiFilters.query;

  if (type === 'student') {
    baseQuery = baseQuery.where('status').in(['active', 'transferred', 'pending']);
  }

  const total = await baseApiFilters.model.countDocuments(baseQuery._conditions);
  const active = await User.countDocuments({ ...baseQuery._conditions, status: 'active' });
  const deactive = await User.countDocuments({ ...baseQuery._conditions, status: 'inactive' });

  const apiFilters = new APIFilters(User, req.query)
    .setSearchFields(['name', 'email', 'gender', 'nationality'])
    .search()
    .filters()
    .sort();

  let mainQuery = apiFilters.query;

  if (type === 'student') {
    mainQuery = mainQuery.where('status').in(['active', 'transferred', 'pending']);
  }

  if (!dropdown && limit !== 0) {
    apiFilters.pagination();
    mainQuery = apiFilters.query;
  }

  apiFilters.populate({ path: 'campus', model: 'Campus', select: 'name' });

  let users = await mainQuery;

  let formattedUsers = users;
  if (type === 'student') {
    formattedUsers = users.map(user => {
      const userObj = user.toObject ? user.toObject() : user;
      if (userObj.grade && Array.isArray(userObj.grade)) {
        userObj.grade = userObj.grade.map(gradeItem => ({
          ...gradeItem,
          gradeDetails: gradeItem.gradeId || null,
          gradeId: gradeItem.gradeId?._id || gradeItem.gradeId
        }));
      }
      return userObj;
    });
  }

  let pagination = null;
  if (!dropdown && limit !== 0 && apiFilters.shouldPaginate) {
    pagination = {
      total,
      page: apiFilters.page,
      limit: apiFilters.limit,
      totalPages: Math.ceil(total / apiFilters.limit),
      counts: { total, active, deactive }
    };
  }

  res.status(200).json({
    success: true,
    ...(pagination && { pagination }),
    ...(!pagination && { counts: { total, active, deactive } }),
    users: formattedUsers,
  });
});