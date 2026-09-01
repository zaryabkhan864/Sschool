import crypto from "crypto";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import User from "../models/user.js";
import Campus from "../models/campus.js";
import StudentEnrollment from "../models/studentEnrollment.js";
import AcademicYear from "../models/academicYear.js";
import EmployeeContract from "../models/employeeContract.js";
import ClassGroup from "../models/classGroup.js";
import { delete_file, upload_file } from "../utils/cloudinary.js";
import { getResetPasswordTemplate } from "../utils/emailTemplates.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendEmail from "../utils/sendEmail.js";
import sendToken from "../utils/sendToken.js";
import mongoose from "mongoose";
import APIFilters from "../utils/apiFilters.js";
import { nanoid } from "nanoid";

export const registerUser = catchAsyncErrors(async (req, res, next) => {
  const { campus } = req.cookies;

  const {
    firstName,
    middleName,
    lastName,
    fatherName,          // ✅ added
    motherName,          // ✅ added
    email,
    password,
    avatar,
    role,
    dateOfBirth,
    gender,
    nationality,
    passportNumber,
    nationalID,
    siblings = [],
    phoneNumber,
    secondaryPhoneNumber,
    address,
    accountStatus,
  } = req.body;

  let avatarData = {};
  if (avatar) {
    avatarData = await upload_file(avatar);
  }

  const cleanSiblings = siblings.filter(
    (s) => s && mongoose.Types.ObjectId.isValid(s)
  );

  let campusId = campus || null;
  if (role !== "student" && !campusId) {
    const defaultCampus = await Campus.findOne();
    campusId = defaultCampus?._id;
  }

  if (role === "student") {
    const existingStudent = await User.findExistingStudent({ email, nationalID });
    if (existingStudent) {
      return res.status(200).json({
        success: true,
        existingUser: true,
        message: "Student record already exists. Use enrollment to assign to campus/year.",
        user: existingStudent,
      });
    }
  }

  const user = await User.create({
    firstName,
    middleName,
    lastName,
    fatherName,          // ✅ added
    motherName,          // ✅ added
    email,
    password,
    avatar: avatarData,
    role,
    dateOfBirth,
    accountStatus: accountStatus || "pending",
    lifecycleStatus: role === "student" ? "unenrolled" : "uncontracted",
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
    existingUser: false,
    user,
  });
});

export const bulkRegisterTeachers = catchAsyncErrors(async (req, res) => {
  const { teachers } = req.body;
  const created = await User.insertMany(teachers);
  res.status(201).json({ success: true, count: created.length });
});

export const bulkRegisterStudents = catchAsyncErrors(async (req, res) => {
  const { students } = req.body;
  const created = await User.insertMany(students);
  res.status(201).json({ success: true, count: created.length });
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

  if (user.role === "admin") {
    const campus = await Campus.findOne();
    user.campus = campus?._id;
  }

  sendToken(user, 200, res);
});

export const logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, { expires: new Date(Date.now()), httpOnly: true });
  res.cookie("campus", null, { expires: new Date(Date.now()) });
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.status(200).json({ message: "Logged Out" });
});

export const getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req?.user?._id)
    .populate("campus")
    .populate({
      path: "currentContract",
      select: "role designationLevel campus academicYear status startDate endDate",
      populate: { path: "campus", select: "name code" },
    });
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
  const newUserData = {
    email: req.body.email,
    dateOfBirth: req.body.dateOfBirth,
    gender: req.body.gender,
    nationality: req.body.nationality,
    passportNumber: req.body.passportNumber,
    nationalID: req.body.nationalID,
    phoneNumber: req.body.phoneNumber,
    secondaryPhoneNumber: req.body.secondaryPhoneNumber,
    avatar: req.body.avatar,
    fatherName: req.body.fatherName,   // ✅ added
    motherName: req.body.motherName,   // ✅ added
  };

  const user = await User.findByIdAndUpdate(req.user._id, newUserData, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, user });
});

export const uploadAvatar = catchAsyncErrors(async (req, res, next) => {
  if (!req.body.avatar) {
    return res.status(400).json({ success: false, message: "No avatar provided" });
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
  res.status(200).json({ success: true, user });
});

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorHandler("User not found with this email", 404));
  }
  const resetToken = user.getResetPasswordToken();
  await user.save();
  const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
  const message = getResetPasswordTemplate(
    `${user.firstName} ${user.lastName}`,
    resetUrl
  );
  try {
    await sendEmail({ email: user.email, subject: "Sschool Password Recovery", message });
    res.status(200).json({ message: `Email sent to: ${user.email}` });
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
    return next(new ErrorHandler("Password reset token is invalid or has been expired", 400));
  }
  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Passwords does not match", 400));
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  if (user.role === "admin") {
    const campus = await Campus.findOne();
    user.campus = campus?._id;
  }
  sendToken(user, 200, res);
});

export const allUsers = catchAsyncErrors(async (req, res, next) => {
  const { campus: cookieCampus, academicYear: cookieAcademicYear } = req.cookies;
  const filter = {};

  if (cookieCampus) {
    filter.campus = new mongoose.Types.ObjectId(cookieCampus);
  }

  if (cookieAcademicYear) {
    const academicYearId = new mongoose.Types.ObjectId(cookieAcademicYear);
    const campusId = cookieCampus ? new mongoose.Types.ObjectId(cookieCampus) : null;

    const [studentIds, employeeIds] = await Promise.all([
      StudentEnrollment.getEnrolledIds(academicYearId, campusId),
      EmployeeContract.find({
        academicYear: academicYearId,
        status: "active",
        isDeleted: false,
        ...(campusId && { campus: campusId }),
      }).distinct("employee"),
    ]);

    const allIds = [...new Set([...studentIds, ...employeeIds])];
    if (allIds.length === 0) {
      return res.status(200).json({ users: [] });
    }
    filter._id = { $in: allIds };
  }

  const users = await User.find(filter).populate("campus", "name");
  res.status(200).json({ users });
});

export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .populate({ path: "campus", model: "Campus", select: "name" })
    .populate({
      path: "siblings",
      model: "User",
      select: "firstName middleName lastName email userId avatar",
    })
    .populate({
      path: "currentContract",
      model: "EmployeeContract",
      select: "role designationLevel campus academicYear status startDate endDate salary",
      populate: [
        { path: "campus", select: "name code" },
        { path: "academicYear", select: "name startDate endDate" },
      ],
    });

  if (!user) {
    return next(new ErrorHandler(`User not found with id: ${req.params.id}`, 404));
  }

  let activeEnrollment = null;
  if (user.role === "student") {
    activeEnrollment = await StudentEnrollment.getActiveEnrollment(user._id);
    if (activeEnrollment) {
      // ✅ Populate classGroup and grade so the frontend can display grade
      await activeEnrollment.populate({
        path: "classGroup",
        populate: { path: "grade", select: "gradeName" },
      });
      await activeEnrollment.populate("academicYear", "name");
    }
  }

  res.status(200).json({ success: true, user, activeEnrollment });
});
export const updateUser = catchAsyncErrors(async (req, res, next) => {
  const { campus: cookieCampus } = req.cookies;

  const user = await User.findById(req.params.id).select("+password");
  if (!user) {
    return next(new ErrorHandler(`User not found with id: ${req.params.id}`, 404));
  }

  if (req.body.avatar && typeof req.body.avatar === "string") {
    try {
      const avatarData = await upload_file(req.body.avatar);
      if (user.avatar && user.avatar.public_id) {
        await delete_file(user.avatar.public_id);
      }
      req.body.avatar = avatarData;
    } catch (error) {
      return next(new ErrorHandler(`Avatar upload failed: ${error.message}`, 500));
    }
  } else if (req.body.avatar === null || req.body.avatar === "") {
    if (user.avatar && user.avatar.public_id) {
      await delete_file(user.avatar.public_id);
    }
    req.body.avatar = null;
  }

  const fieldsToUpdate = [
    "firstName", "middleName", "lastName",
    "fatherName",            
    "motherName",          
    "email", "role",
    "dateOfBirth", "gender", "nationality", "passportNumber",
    "nationalID", "siblings", "phoneNumber", "secondaryPhoneNumber",
    "address", "avatar",
    "accountStatus",
    "lifecycleStatus",
  ];

  if (user.role !== "student") {
    fieldsToUpdate.push("campus");
  }

  fieldsToUpdate.forEach((field) => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });

  if (user.role !== "student" && req.body.campus === undefined && cookieCampus) {
    user.campus = cookieCampus;
  }

  if (req.body.password && req.body.password.trim() !== "") {
    user.password = req.body.password;
  }

  await user.save();

  const updatedUser = await User.findById(req.params.id)
    .populate({ path: "siblings", model: "User", select: "firstName middleName lastName email userId avatar" })
    .populate({ path: "campus", model: "Campus", select: "name" });

  res.status(200).json({ success: true, user: updatedUser });
});

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
  const { campus: cookieCampus, academicYear: cookieAcademicYear } = req.cookies;

  if (type === "all") {
  } else if (type === "employee") {
    req.query.role = { $ne: "student" };
  } else {
    req.query.role = type;
  }

  const limit = Number(req.query.limit);
  const dropdown = req.query.dropdown === "true";
  const isDropdownRequest = dropdown || limit === 0;

  const ignoreAcademicYear = req.query.ignoreAcademicYear === "true";
  delete req.query.ignoreAcademicYear;

  const ignoreCampus = req.query.ignoreCampus === "true";
  delete req.query.ignoreCampus;

  if (req.query.status) {
    req.query.accountStatus = req.query.status;
    delete req.query.status;
  }

  if (type === "student" && !req.query.accountStatus && !isDropdownRequest) {
    req.query.accountStatus = "active";
  }

  let cookieBasedIdFilter = null;
  if (
    !isDropdownRequest &&
    req.query.enrolled === undefined &&
    req.query.contracted === undefined &&
    cookieAcademicYear &&
    !ignoreAcademicYear
  ) {
    const academicYearId = new mongoose.Types.ObjectId(cookieAcademicYear);
    const campusId =
      req.query.campus || (!isDropdownRequest ? cookieCampus : null);
    const campusObjId = campusId ? new mongoose.Types.ObjectId(campusId) : null;

    if (type === "student") {
      const ids = await StudentEnrollment.getEnrolledIds(academicYearId, campusObjId);
      if (ids.length === 0) {
        return res.status(200).json({
          success: true,
          users: [],
          counts: { total: 0, active: 0, deactive: 0 },
        });
      }
      cookieBasedIdFilter = { $in: ids };
    } else {
      const contractFilter = {
        academicYear: academicYearId,
        status: "active",
        isDeleted: false,
      };
      if (campusObjId) contractFilter.campus = campusObjId;

      const ids = await EmployeeContract.find(contractFilter).distinct("employee");
      if (ids.length === 0) {
        return res.status(200).json({
          success: true,
          users: [],
          counts: { total: 0, active: 0, deactive: 0 },
        });
      }
      cookieBasedIdFilter = { $in: ids };
    }
  }

  let enrolledIdFilter = null;
  if (type === "student" && req.query.enrolled !== undefined) {
    let targetAcademicYearId = req.query.academicYear || cookieAcademicYear;
    if (!targetAcademicYearId) {
      const currentYear = await AcademicYear.findOne({ isCurrent: true });
      targetAcademicYearId = currentYear?._id;
    }
    if (!targetAcademicYearId) {
      return res.status(200).json({
        success: true,
        users: [],
        counts: { total: 0, active: 0, deactive: 0 },
      });
    }

    const targetCampus = req.query.campus || (!isDropdownRequest ? cookieCampus : null);

    const enrolledStudentIds = await StudentEnrollment.getEnrolledIds(
      targetAcademicYearId,
      targetCampus
    );

    if (req.query.enrolled === "true") {
      if (enrolledStudentIds.length === 0) {
        return res.status(200).json({
          success: true,
          users: [],
          counts: { total: 0, active: 0, deactive: 0 },
        });
      }
      enrolledIdFilter = { $in: enrolledStudentIds };
    } else if (req.query.enrolled === "false") {
      enrolledIdFilter = enrolledStudentIds.length > 0
        ? { $nin: enrolledStudentIds }
        : null;
    }
    delete req.query.enrolled;
    delete req.query.academicYear;
    delete req.query.campus;
  }

  if (type === "student" && req.query.classGroup) {
    const classGroupId = req.query.classGroup;
    const enrollmentQuery = { classGroup: classGroupId, status: "active" };

    const targetAcademicYearId = req.query.academicYear || cookieAcademicYear;
    if (targetAcademicYearId) {
      enrollmentQuery.academicYear = targetAcademicYearId;
    }

    const classGroupStudentIds = await StudentEnrollment.find(enrollmentQuery).distinct("student");

    let existingIds = null;
    if (enrolledIdFilter && enrolledIdFilter.$in) existingIds = enrolledIdFilter.$in;
    else if (cookieBasedIdFilter && cookieBasedIdFilter.$in) existingIds = cookieBasedIdFilter.$in;

    let finalStudentIds = classGroupStudentIds;
    if (existingIds) {
      const existingIdStrSet = new Set(existingIds.map((id) => String(id)));
      finalStudentIds = classGroupStudentIds.filter((id) => existingIdStrSet.has(String(id)));
    }

    if (finalStudentIds.length === 0) {
      return res.status(200).json({
        success: true,
        users: [],
        counts: { total: 0, active: 0, deactive: 0 },
      });
    }

    enrolledIdFilter = { $in: finalStudentIds };
    cookieBasedIdFilter = null;

    delete req.query.classGroup;
  }

  let academicYearContractIds = null;
  const isContractedMode = req.query.contracted !== undefined && type !== "student";

  if (isContractedMode) {
    req.query.lifecycleStatus = "contracted";

    const academicYearForContract = req.query.academicYear || cookieAcademicYear || null;
    const campusForContract = req.query.campus || (!isDropdownRequest ? cookieCampus : null);

    if (academicYearForContract) {
      const contractQuery = {
        status: "active",
        isDeleted: false,
        academicYear: academicYearForContract,
      };
      if (campusForContract) contractQuery.campus = campusForContract;

      const contractedEmployeeIds = await EmployeeContract.find(contractQuery).distinct("employee");

      if (contractedEmployeeIds.length === 0) {
        return res.status(200).json({
          success: true,
          users: [],
          counts: { total: 0, active: 0, deactive: 0 },
        });
      }
      academicYearContractIds = contractedEmployeeIds;
    }

    delete req.query.contracted;
    delete req.query.academicYear;
    delete req.query.campus;

    if (!academicYearForContract && campusForContract) {
      req.query.campus = campusForContract;
    }
  }

  if (
    !isDropdownRequest &&
    cookieCampus &&
    !req.query.campus &&
    type !== "student" &&
    !isContractedMode &&
    !cookieBasedIdFilter &&
    !ignoreCampus
  ) {
    req.query.campus = cookieCampus;
  }

  if (req.query.gender) {
    const genderValue = req.query.gender.toLowerCase();
    if (["male", "female", "other"].includes(genderValue)) {
      req.query.gender = genderValue;
    }
  }

  let baseApiFilters = new APIFilters(User, req.query)
    .setSearchFields(["firstName", "lastName", "email", "nationality"])
    .search()
    .filters()
    .sort();

  if (enrolledIdFilter) {
    baseApiFilters.query._conditions._id = enrolledIdFilter;
  } else if (academicYearContractIds) {
    baseApiFilters.query._conditions._id = { $in: academicYearContractIds };
  } else if (cookieBasedIdFilter) {
    baseApiFilters.query._conditions._id = cookieBasedIdFilter;
  }

  if (isContractedMode && !req.query.accountStatus) {
    baseApiFilters.query = baseApiFilters.query.where("accountStatus").ne("pending");
  }

  const total = await baseApiFilters.model.countDocuments(baseApiFilters.query._conditions);
  const active = await User.countDocuments({
    ...baseApiFilters.query._conditions,
    accountStatus: "active",
  });
  const deactive = await User.countDocuments({
    ...baseApiFilters.query._conditions,
    accountStatus: { $in: ["inactive", "pending"] },
  });

  let apiFilters = new APIFilters(User, req.query)
    .setSearchFields(["firstName", "lastName", "email", "nationality"])
    .search()
    .filters()
    .sort();

  if (enrolledIdFilter) {
    apiFilters.query._conditions._id = enrolledIdFilter;
  } else if (academicYearContractIds) {
    apiFilters.query._conditions._id = { $in: academicYearContractIds };
  } else if (cookieBasedIdFilter) {
    apiFilters.query._conditions._id = cookieBasedIdFilter;
  }

  if (isContractedMode && !req.query.accountStatus) {
    apiFilters.query = apiFilters.query.where("accountStatus").ne("pending");
  }

  if (!dropdown && limit !== 0) {
    apiFilters.pagination();
  }

  const populateOptions = [{ path: "campus", model: "Campus", select: "name" }];
  if (type === "student") {
    populateOptions.push({
      path: "currentEnrollment",
      select: "classGroup academicYear status",
      populate: [
        {
          path: "classGroup",
          select: "displayName grade section",
          populate: { path: "grade", select: "gradeName" },
        },
        { path: "academicYear", select: "name" },
      ],
    });
  }
  apiFilters.populate(populateOptions);

  const users = await apiFilters.query;

  let pagination = null;
  if (!dropdown && limit !== 0 && apiFilters.shouldPaginate) {
    pagination = {
      total,
      page: apiFilters.page,
      limit: apiFilters.limit,
      totalPages: Math.ceil(total / apiFilters.limit),
      counts: { total, active, deactive },
    };
  }

  res.status(200).json({
    success: true,
    ...(pagination && { pagination }),
    ...(!pagination && { counts: { total, active, deactive } }),
    users,
  });
});

export const getUsersByTypeForEnrollment = catchAsyncErrors(async (req, res, next) => {
  const { type } = req.params;
  const { campus } = req.cookies;

  if (type === "employee") {
    req.query.role = { $ne: "student" };
  } else {
    req.query.role = type;
  }

  const limit = Number(req.query.limit);
  const dropdown = req.query.dropdown === "true";
  const isDropdownRequest = dropdown || limit === 0;

  if (type === "student") {
    // Don't filter by campus
  } else if (campus && !isDropdownRequest) {
    req.query.campus = campus;
  }

  delete req.query.dropdown;

  if (req.query.gender) {
    const genderValue = req.query.gender.toLowerCase();
    if (["male", "female", "other"].includes(genderValue)) {
      req.query.gender = genderValue;
    }
  }

  const baseApiFilters = new APIFilters(User, req.query)
    .setSearchFields(["firstName", "lastName", "email", "nationality"])
    .search()
    .filters()
    .sort();

  let baseQuery = baseApiFilters.query;
  if (type === "student") {
    baseQuery = baseQuery.where("accountStatus").in(["active", "pending"]);
  }

  const total = await baseApiFilters.model.countDocuments(baseQuery._conditions);
  const active = await User.countDocuments({ ...baseQuery._conditions, accountStatus: "active" });
  const deactive = await User.countDocuments({
    ...baseQuery._conditions,
    accountStatus: { $in: ["inactive", "pending"] },
  });

  const apiFilters = new APIFilters(User, req.query)
    .setSearchFields(["firstName", "lastName", "email", "nationality"])
    .search()
    .filters()
    .sort();

  let mainQuery = apiFilters.query;
  if (type === "student") {
    mainQuery = mainQuery.where("accountStatus").in(["active", "pending"]);
  }

  if (!dropdown && limit !== 0) {
    apiFilters.pagination();
    mainQuery = apiFilters.query;
  }

  apiFilters.populate({ path: "campus", model: "Campus", select: "name" });
  const users = await mainQuery;

  let pagination = null;
  if (!dropdown && limit !== 0 && apiFilters.shouldPaginate) {
    pagination = {
      total,
      page: apiFilters.page,
      limit: apiFilters.limit,
      totalPages: Math.ceil(total / apiFilters.limit),
      counts: { total, active, deactive },
    };
  }

  res.status(200).json({
    success: true,
    ...(pagination && { pagination }),
    ...(!pagination && { counts: { total, active, deactive } }),
    users,
  });
});

export const getClassGroups = catchAsyncErrors(async (req, res, next) => {
  const classGroups = await ClassGroup.find()
    .populate({ path: "grade", select: "gradeName" })
    .sort({ "grade.gradeName": 1, section: 1 });

  res.status(200).json({ success: true, classGroups });
});

export const getYearlyCampusWiseCounts = catchAsyncErrors(async (req, res, next) => {
  const { academicYear, campus } = req.query;

  const campusFilter = campus ? { _id: new mongoose.Types.ObjectId(campus) } : {};
  const campuses = await Campus.find(campusFilter).select("name");

  const yearFilter = academicYear ? { _id: new mongoose.Types.ObjectId(academicYear) } : {};
  const academicYears = await AcademicYear.find(yearFilter).select("year");

  const finalData = [];

  for (const campusDoc of campuses) {
    const uncontractedTeachers = await User.countDocuments({
      role: "teacher",
      isDeleted: { $ne: true },
      campus: campusDoc._id,
      lifecycleStatus: "uncontracted",
    });

    const unenrolledStudents = await User.countDocuments({
      role: "student",
      isDeleted: { $ne: true },
      campus: campusDoc._id,
      lifecycleStatus: "unenrolled",
    });

    for (const yearDoc of academicYears) {
      const teacherAgg = await EmployeeContract.aggregate([
        {
          $match: {
            status: "active",
            isDeleted: false,
            campus: campusDoc._id,
            academicYear: yearDoc._id,
          },
        },
        { $group: { _id: null, employees: { $addToSet: "$employee" } } },
      ]);
      const teacherCount = teacherAgg[0]?.employees?.length || 0;

      const studentAgg = await StudentEnrollment.aggregate([
        {
          $match: {
            status: "active",
            campus: campusDoc._id,
            academicYear: yearDoc._id,
          },
        },
        { $group: { _id: null, students: { $addToSet: "$student" } } },
      ]);
      const studentCount = studentAgg[0]?.students?.length || 0;

      finalData.push({
        academicYear: yearDoc._id,
        yearName: yearDoc.year || "",
        campus: campusDoc._id,
        campusName: campusDoc.name || "",
        teacherCount,
        studentCount,
        uncontractedTeachers,
        unenrolledStudents,
      });
    }
  }

  res.status(200).json({ success: true, data: finalData });
});