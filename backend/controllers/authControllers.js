import crypto from "crypto";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import User from "../models/user.js";
import Campus from "../models/campus.js";
import { delete_file, upload_file } from "../utils/cloudinary.js";
import { getResetPasswordTemplate } from "../utils/emailTemplates.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendEmail from "../utils/sendEmail.js";
import sendToken from "../utils/sendToken.js";
import _ from "lodash";
import { nanoid } from 'nanoid';
import mongoose from "mongoose";

// Register user   =>  /api/v1/register
export const registerUser = catchAsyncErrors(async (req, res, next) => {
  const { campus } = req.cookies
  
  const {
    name,
    email,
    password,
    avatar,
    role,
    age,
    gender,
    year,
    status,
    nationality,
    passportNumber,
    siblings,
    phoneNumber,
    secondaryPhoneNumber,
    address,
    grade,
    yearFrom,
    yearTo,
  } = req.body;

  let gradeDetails = []

  if (grade && yearFrom && yearTo) {
    gradeDetails.push({
      gradeId: grade,
      yearFrom,
      yearTo
    })
  }

  const user = await User.create({
    name,
    email,
    password,
    avatar,
    role, // Explicitly passing role from req.body
    age,
    gender,
    year,
    status,
    nationality,
    passportNumber,
    siblings,
    phoneNumber,
    secondaryPhoneNumber,
    address,
    grade: gradeDetails,
    campus,
    userId: nanoid(10)
  });
  res.status(201).json({
    success: true,
    user,
  });
  // sendToken(user, 201, res);
});

// Login user   =>  /api/v1/login
export const loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please enter email & password", 400));
  }

  // Find user in the database
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  // Check if password is correct
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

// Logout user   =>  /api/v1/logout
export const logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.cookie("campus", null, {
    expires: new Date(Date.now()),
  });

  // Disable caching
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

// Upload user avatar   =>  /api/v1/me/upload_avatar
export const uploadAvatar = catchAsyncErrors(async (req, res, next) => {
  const avatarResponse = await upload_file(req.body.avatar, "shopit/avatars");

  // Remove previous avatar
  if (req?.user?.avatar?.url) {
    await delete_file(req?.user?.avatar?.public_id);
  }

  const user = await User.findByIdAndUpdate(req?.user?._id, {
    avatar: avatarResponse,
  });

  res.status(200).json({
    user,
  });
});

// Forgot password   =>  /api/v1/password/forgot
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  // Find user in the database
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found with this email", 404));
  }

  // Get reset password token
  const resetToken = user.getResetPasswordToken();

  await user.save();

  // Create reset password url
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

// Reset password   =>  /api/v1/password/reset/:token
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  // Hash the URL Token
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

  // Set the new password
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

// Get current user profile  =>  /api/v1/me
export const getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req?.user?._id).populate('campus');

  res.status(200).json({
    user,
  });
});

// Update Password  =>  /api/v1/password/update
export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req?.user?._id).select("+password");

  // Check the previous user password
  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Old Password is incorrect", 400));
  }

  user.password = req.body.password;
  user.save();

  res.status(200).json({
    success: true,
  });
});

// Update User Profile  =>  /api/v1/me/update
export const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    age: req.body.age,
    gender: req.body.gender,
    nationality: req.body.nationality,
    passportNumber: req.body.passportNumber,
    phoneNumber: req.body.phoneNumber,
    secondaryPhoneNumber: req.body.secondaryPhoneNumber,
    year: req.body.year,
    status: req.body.status,
    avatar: req.body.avatar,
  };

  const user = await User.findByIdAndUpdate(req.user._id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

// Get all Users - ADMIN  =>  /api/v1/admin/users
export const allUsers = catchAsyncErrors(async (req, res, next) => {
  const { campus } = req.cookies

  const users = await User.find({ campus: new mongoose.Types.ObjectId(campus) });

  res.status(200).json({
    users,
  });
});

// Get User Details - ADMIN  =>  /api/v1/admin/users/:id
export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User not found with id: ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    user,
  });
});

// Update User Details - ADMIN  =>  /api/v1/admin/users/:id
export const updateUser = catchAsyncErrors(async (req, res, next) => {
  if (_.isString(req.body?.avatar)) {
    const avatar = await upload_file(req.body.avatar, "shopit/avatars");
    if (avatar.url) {
      req.body.avatar = avatar
    }
  }

  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    age: req.body.age,
    gender: req.body.gender,
    nationality: req.body.nationality,
    passportNumber: req.body.passportNumber,
    siblings: req.body.siblings,
    phoneNumber: req.body.phoneNumber,
    secondaryPhoneNumber: req.body.secondaryPhoneNumber,
    address: req.body.address,
    avatar: req.body.avatar,
    grade: req.body.grade,
    campus: req.body.campus,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
  });

  res.status(200).json({
    user,
  });
});

// Delete User - ADMIN  =>  /api/v1/admin/users/:id
export const deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User not found with id: ${req.params.id}`, 404)
    );
  }

  // Remove user avatar from cloudinary
  if (user?.avatar?.public_id) {
    await delete_file(user?.avatar?.public_id);
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
  });
});


// Get all Users -  /api/v1/users
export const getUsersByType = catchAsyncErrors(async (req, res, next) => {
  let users = []
  let sortedStudents = []
  const { campus } = req.cookies
  const match = {}
  if (campus) {
    match.campus = new mongoose.Types.ObjectId(campus)
  }

  if (req.params.type === 'student') {
    match.role = "student"
    const users = await User
      .aggregate([
        { $match: match, },
        {
          $lookup: {
            from: 'grades',
            localField: 'grade.gradeId',
            foreignField: '_id',
            as: 'populatedGrades'
          }
        },
        {
          $lookup: {
            from: 'campus',
            localField: 'campus',
            foreignField: '_id',
            as: 'campus'
          }
        },
        {
          $addFields: {
            'grade': {
              $slice: ['$populatedGrades', -1]
            }
          }
        },
        {
          $unwind: {
            path: '$campus',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: '$grade',
            preserveNullAndEmptyArrays: true
          }
        }
      ]);
    sortedStudents = _.sortBy(users, [(item) => item.grade?.gradeName?.toLowerCase()], (item) => item?.name?.toLowerCase())
  }
  if (req.params.type === 'employee') {
    users = await User.find({ ...match, role: { $ne: 'student' } });
  }
  else {
    users = await User.find({ ...match, role: req.params.type }).populate('campus', 'name');
  }

  res.status(200).json({
    users: req.params.type === 'student' ? sortedStudents : users,
  });
});
