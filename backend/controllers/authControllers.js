import crypto from "crypto";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import User from "../models/user.js";
import { delete_file, upload_file } from "../utils/cloudinary.js";
import { getResetPasswordTemplate } from "../utils/emailTemplates.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendEmail from "../utils/sendEmail.js";
import sendToken from "../utils/sendToken.js";
import APIFilters from "../utils/apiFilters.js";
import _ from "lodash";

// Register user   =>  /api/v1/register
export const registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password, avatar, role, age, gender, nationality, passportNumber, siblings, phoneNumber, secondaryPhoneNumber, address, grade } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    avatar,
    role, // Explicitly passing role from req.body
    age,
    gender,
    nationality,
    passportNumber,
    siblings,
    phoneNumber,
    secondaryPhoneNumber,
    address,
    grade,
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

  sendToken(user, 200, res);
});

// Logout user   =>  /api/v1/logout
export const logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
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

  sendToken(user, 200, res);
});

// Get current user profile  =>  /api/v1/me
export const getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req?.user?._id);

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
    siblings: req.body.siblings,
    phoneNumber: req.body.phoneNumber,
    secondaryPhoneNumber: req.body.secondaryPhoneNumber,
    address: req.body.address,
    grade: req.body.grade,
  };

  const user = await User.findByIdAndUpdate(req.user._id, newUserData, {
    new: true,
  });

  res.status(200).json({
    user,
  });
});

// Get all Users - ADMIN  =>  /api/v1/admin/users
export const allUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();

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
  if(_.isString(req.body?.avatar)){ 
   const avatar = await upload_file(req.body.avatar, "shopit/avatars");
    if(avatar.url){
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
    avatar:req.body.avatar,
    grade:  req.body.grade
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
  let users= []
  let sortedStudents =[]
  if(req.params.type === 'student'){
    req.query.role= "student"
    const apiFilters = new APIFilters(User, req.query).search().filters().populate('grade', 'gradeName');
    const students = await apiFilters.query;
    sortedStudents = _.sortBy(students,[(item) => item.grade?.gradeName?.toLowerCase()],'name')
  }
  else{
    users = await User.find({ role: req.params.type });
  }

  res.status(200).json({
    users: req.params.type === 'student'? sortedStudents: users ,
  });
});
