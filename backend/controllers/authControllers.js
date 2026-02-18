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
import APIFilters from "../utils/apiFilters.js";

// Register user   =>  /api/v1/register
export const registerUser = catchAsyncErrors(async (req, res, next) => {
  const { campus } = req.cookies
  const {selectedYear} = req.cookies
  

  const {
    name,
    email,
    password,
    avatar,
    role,
    dateOfBirth,
    gender,
    status,
    nationality,
    passportNumber,
    siblings = [],
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
  const cleanSiblings = siblings.filter(
    (s) => s && mongoose.Types.ObjectId.isValid(s)
  );
  const user = await User.create({
    name,
    email,
    password,
    avatar,
    role, // Explicitly passing role from req.body
    dateOfBirth,
    gender,
    year:selectedYear,
    status,
    nationality,
    passportNumber,
    siblings: cleanSiblings,
    phoneNumber,
    secondaryPhoneNumber,
    address,
    // grade: gradeDetails,
    grade: grade ? [{ gradeId: grade }] : [],
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
  const { campus } = req.cookies;
  const { selectedYear } = req.cookies;
  
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    dateOfBirth: req.body.dateOfBirth,
    gender: req.body.gender,
    nationality: req.body.nationality,
    passportNumber: req.body.passportNumber,
    phoneNumber: req.body.phoneNumber,
    secondaryPhoneNumber: req.body.secondaryPhoneNumber,
    year: req.body.year,
    status: req.body.status,
    avatar: req.body.avatar,
  };

  // Agar cookies se campus aur year values available hain, to unhe bhi include karo
  if (campus) {
    newUserData.campus = campus;
  }
  
  if (selectedYear) {
    newUserData.year = selectedYear;
  }

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
  const { campus, selectedYear } = req.cookies;

  const filter = {};

  if (campus) {
    filter.campus = new mongoose.Types.ObjectId(campus);
  }

  if (selectedYear) {
    filter.year = selectedYear;  // Or filter['grade.session'] if it’s nested
  }

  const users = await User.find(filter).populate('campus', 'name');

  res.status(200).json({
    users,
  });
});

// Get User Details - ADMIN  =>  /api/v1/admin/users/:id
// Get User Details - ADMIN  =>  /api/v1/admin/users/:id
export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  // ✅ Grade ko populate karo
  const user = await User.findById(req.params.id)
    .populate({
      path: 'grade.gradeId',
      model: 'Grade',
      select: 'gradeName description level name'
    })
    .populate({
      path: 'siblings',
      model: 'User',
      select: 'name email grade userId'
    });

  if (!user) {
    return next(
      new ErrorHandler(`User not found with id: ${req.params.id}`, 404)
    );
  }

  // ✅ Grade data ko properly format karo (single grade ke liye)
  let formattedUser = user.toObject ? user.toObject() : user;
  
  if (formattedUser.grade && Array.isArray(formattedUser.grade) && formattedUser.grade.length > 0) {
    // Agar multiple grades hain to first grade use karo
    const firstGrade = formattedUser.grade[0];
    if (firstGrade.gradeId) {
      formattedUser.grade = firstGrade.gradeId; // Grade object assign karo
    } else {
      formattedUser.grade = null;
    }
  } else {
    formattedUser.grade = null;
  }

  res.status(200).json({
    success: true,
    user: formattedUser,
  });
});


export const updateUser = catchAsyncErrors(async (req, res, next) => {
  const { campus } = req.cookies;
  const { selectedYear } = req.cookies;
  
  // Temporary: Skip avatar handling to avoid errors
  if (req.body.avatar) {
    delete req.body.avatar;
  }

  // Find the user
  const user = await User.findById(req.params.id).select("+password");
  if (!user) {
    return next(new ErrorHandler(`User not found with id: ${req.params.id}`, 404));
  }

  // ✅ Special handling for grade field
  // Agar grade string mein aaya hai, to use array format mein convert karo
  if (req.body.grade && typeof req.body.grade === 'string') {
    // String ko array format mein convert karo
    req.body.grade = [{ gradeId: req.body.grade }];
  } else if (req.body.grade && Array.isArray(req.body.grade)) {
    // Agar array mein aaya hai to use validate karo
    req.body.grade = req.body.grade.map(gradeItem => {
      if (typeof gradeItem === 'string') {
        return { gradeId: gradeItem };
      }
      return gradeItem;
    });
  } else if (req.body.grade === "") {
    // Agar empty string aaya hai to empty array set karo
    req.body.grade = [];
  }

  // Update fields safely
  const fieldsToUpdate = [
    "name",
    "email",
    "role",
    "dateOfBirth",
    "gender",
    "nationality",
    "passportNumber",
    "siblings",
    "phoneNumber",
    "secondaryPhoneNumber",
    "address",
    "grade", // ✅ Ab ye array format mein hai
    "campus",
    "status",
    "year",
  ];

  fieldsToUpdate.forEach((field) => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });

  // Agar cookies se campus aur year values available hain, to unhe bhi update karo
  if (campus) {
    user.campus = campus;
  }
  
  if (selectedYear) {
    user.year = selectedYear;
  }

  // Update password only if provided and not empty
  if (req.body.password && req.body.password.trim() !== "") {
    user.password = req.body.password;
  }

  // Save user
  await user.save();

  // ✅ User ko dobara populate karke bhejo taki frontend ko updated grade details mile
  const updatedUser = await User.findById(req.params.id)
    .populate({
      path: 'grade.gradeId',
      model: 'Grade',
      select: 'gradeName description level name'
    })
    .populate({
      path: 'siblings',
      model: 'User',
      select: 'name email grade userId'
    });

  res.status(200).json({
    success: true,
    user: updatedUser,
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

// Updated getUsersByType function
export const getUsersByType = catchAsyncErrors(async (req, res, next) => {
  const { type } = req.params;
  const { campus, selectedYear } = req.cookies;

  // 1. Role Logic
  if (type === 'employee') {
    req.query.role = { $ne: 'student' };
  } else {
    req.query.role = type;
  }

  // 2. Get dropdown flag from query params
  const limit = Number(req.query.limit);
  const dropdown = req.query.dropdown === 'true'; // ✅ NAYA CHECK
  const isDropdownRequest = dropdown || limit === 0; // ✅ DONO CHECK KARO
  // 3. Cookie Filters - UPDATED LOGIC
  // Agar dropdown request hai ya limit 0 hai to cookie filters skip karo
  const shouldSkipCookieFilters = dropdown || limit === 0;
  
  if (campus && !isDropdownRequest) {
    req.query.campus = campus;
  }
  
  if (selectedYear && !isDropdownRequest) {
    req.query.year = selectedYear;
  }

  // Remove dropdown from query to avoid interfering with other filters
  delete req.query.dropdown;

  // 4. Status handle karo
  if (req.query.status) {
    if (req.query.status === 'active') {
      req.query.status = true;
    } else if (req.query.status === 'deactive') {
      req.query.status = false;
    }
  }

  // 5. Gender ko case-insensitive banao
  if (req.query.gender) {
    const genderValue = req.query.gender.toLowerCase();
    if (genderValue === 'male' || genderValue === 'female' || genderValue === 'other') {
      req.query.gender = genderValue.charAt(0).toUpperCase() + genderValue.slice(1);
    }
  }

  // 6. Base query for counting
  const baseApiFilters = new APIFilters(User, req.query)
    .setSearchFields(['name', 'email', 'gender', 'nationality'])
    .search()
    .filters()
    .sort();

  // 7. Get counts using the base query
  const baseQuery = baseApiFilters.query;
  const total = await baseApiFilters.model.countDocuments(baseQuery._conditions);
  
  // 8. Get active/deactive counts
  const activeQuery = User.find({
    ...baseQuery._conditions,
    status: true
  });
  const active = await activeQuery.countDocuments();
  
  const deactiveQuery = User.find({
    ...baseQuery._conditions,
    status: false
  });
  const deactive = await deactiveQuery.countDocuments();

  // 9. Create new query for actual data
  const apiFilters = new APIFilters(User, req.query)
    .setSearchFields(['name', 'email', 'gender', 'nationality'])
    .search()
    .filters()
    .sort();

  // 10. Agar dropdown request nahi hai to pagination lagao
  if (!dropdown && limit !== 0) {
    apiFilters.pagination();
  }

  // 11. Conditionally populate
  if (type === 'student') {
    apiFilters.populate([
      {
        path: 'grade.gradeId',
        model: 'Grade',
        select: 'gradeName description courses campus year'
      },
      {
        path: 'campus',
        model: 'Campus',
        select: 'name'
      }
    ]);
  } else {
    apiFilters.populate({
      path: 'campus',
      model: 'Campus',
      select: 'name'
    });
  }

  // 12. Execute the query
  const users = await apiFilters.query;

  // 13. Format student data if needed
  let formattedUsers = users;
  if (type === 'student') {
    formattedUsers = users.map(user => {
      const userObj = user.toObject ? user.toObject() : user;
      
      if (userObj.grade && Array.isArray(userObj.grade)) {
        userObj.grade = userObj.grade.map(gradeItem => {
          return {
            ...gradeItem,
            gradeDetails: gradeItem.gradeId || null,
            gradeId: gradeItem.gradeId?._id || gradeItem.gradeId
          };
        });
      }
      
      return userObj;
    });
  }

  // 14. Get pagination meta ONLY if pagination is enabled
  let pagination = null;
  if (!dropdown && limit !== 0 && apiFilters.shouldPaginate) {
    pagination = {
      total,
      page: apiFilters.page,
      limit: apiFilters.limit,
      totalPages: Math.ceil(total / apiFilters.limit)
    };
  }

  // 15. Final Response
  res.status(200).json({
    success: true,
    ...(pagination && { 
      pagination: { 
        ...pagination, 
        counts: { total, active, deactive } 
      } 
    }),
    ...(!pagination && { 
      counts: { total, active, deactive } 
    }),
    users: formattedUsers,
  });
});


// export const getUsersByType = catchAsyncErrors(async (req, res, next) => {
//   const { type } = req.params;
//   const { campus, selectedYear } = req.cookies;

//   // 1. Role Logic
//   if (type === 'employee') {
//     req.query.role = { $ne: 'student' };
//   } else {
//     req.query.role = type;
//   }

//   // 2. Cookie Filters - IMPORTANT CHANGE
//   const limit = Number(req.query.limit);
//   const isDropdownRequest = limit === 0;
  
//   if (campus && !isDropdownRequest) {
//     req.query.campus = campus;
//   }
  
//   if (selectedYear && !isDropdownRequest) {
//     req.query.year = selectedYear;
//   }

//   // 3. Status handle karo
//   if (req.query.status) {
//     if (req.query.status === 'active') {
//       req.query.status = true;
//     } else if (req.query.status === 'deactive') {
//       req.query.status = false;
//     }
//   }

//   // 4. Gender ko case-insensitive banao
//   if (req.query.gender) {
//     const genderValue = req.query.gender.toLowerCase();
//     if (genderValue === 'male' || genderValue === 'female' || genderValue === 'other') {
//       req.query.gender = genderValue.charAt(0).toUpperCase() + genderValue.slice(1);
//     }
//   }

//   // 5. Base query for counting
//   const baseApiFilters = new APIFilters(User, req.query)
//     .setSearchFields(['name', 'email', 'gender', 'nationality'])
//     .search()
//     .filters()
//     .sort();

//   // 6. Get counts using the base query
//   const baseQuery = baseApiFilters.query;
//   const total = await baseApiFilters.model.countDocuments(baseQuery._conditions);
  
//   // 7. Get active/deactive counts
//   const activeQuery = User.find({
//     ...baseQuery._conditions,
//     status: true
//   });
//   const active = await activeQuery.countDocuments();
  
//   const deactiveQuery = User.find({
//     ...baseQuery._conditions,
//     status: false
//   });
//   const deactive = await deactiveQuery.countDocuments();

//   // 8. Now create a NEW query for actual data WITH/WITHOUT pagination
//   const apiFilters = new APIFilters(User, req.query)
//     .setSearchFields(['name', 'email', 'gender', 'nationality'])
//     .search()
//     .filters()
//     .sort()
//     .pagination();

//   // 9. Conditionally populate - FIXED FOR STUDENTS
//   if (type === 'student') {
//     // Student ke liye grade.gradeId ko populate karo Grade model ke sath
//     // Aur campus ko bhi populate karo
//     apiFilters.populate([
//       {
//         path: 'grade.gradeId',
//         model: 'Grade',
//         select: 'gradeName description courses campus year'
//       },
//       {
//         path: 'campus',
//         model: 'Campus',
//         select: 'name'
//       }
//     ]);
//   } else {
//     // Non-student users ke liye sirf campus populate karo
//     apiFilters.populate({
//       path: 'campus',
//       model: 'Campus',
//       select: 'name'
//     });
//   }

//   // 10. Execute the query
//   const users = await apiFilters.query;

//   // 11. Agar student type hai to grade data ko format karo
//   let formattedUsers = users;
//   if (type === 'student') {
//     formattedUsers = users.map(user => {
//       const userObj = user.toObject ? user.toObject() : user;
      
//       // Agar grade array hai to use format karo
//       if (userObj.grade && Array.isArray(userObj.grade)) {
//         userObj.grade = userObj.grade.map(gradeItem => {
//           return {
//             ...gradeItem,
//             // Grade details ko direct access karne ke liye
//             gradeDetails: gradeItem.gradeId || null,
//             // Grade ID ko alag se bhi rakhna
//             gradeId: gradeItem.gradeId?._id || gradeItem.gradeId
//           };
//         });
//       }
      
//       return userObj;
//     });
//   }

//   // 12. ✅ Get pagination meta ONLY if pagination is enabled
//   let pagination = null;
//   if (apiFilters.shouldPaginate) {
//     pagination = {
//       total,
//       page: apiFilters.page,
//       limit: apiFilters.limit,
//       totalPages: Math.ceil(total / apiFilters.limit)
//     };
//   }

//   // 13. Final Response
//   res.status(200).json({
//     success: true,
//     ...(pagination && { 
//       pagination: { 
//         ...pagination, 
//         counts: { total, active, deactive } 
//       } 
//     }),
//     ...(!pagination && { 
//       counts: { total, active, deactive } 
//     }),
//     users: formattedUsers,
//   });
// });

