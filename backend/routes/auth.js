import express from "express";
import {
  registerUser,
  loginUser,
  logout,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateProfile,
  updatePassword,
  uploadAvatar,
  allUsers,
  getUserDetails,
  updateUser,
  deleteUser,
  getUsersByType,
  getUsersByTypeForEnrollment,
  getYearlyCampusWiseCounts,
  bulkRegisterTeachers, 
  bulkRegisterStudents 
} from "../controllers/authControllers.js";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

// ========== Auth ==========
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logout);

// ========== Password ==========
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/password/update").put(isAuthenticatedUser, updatePassword);

// ========== Current user ==========
router.route("/me").get(isAuthenticatedUser, getUserProfile);
router.route("/me/update").put(isAuthenticatedUser, updateProfile);
router.route("/me/upload_avatar").put(isAuthenticatedUser, uploadAvatar);

// ========== Admin: Users ==========
router
  .route("/admin/users")
  .get(isAuthenticatedUser, authorizeRoles("admin"), allUsers);

router
  .route("/admin/users/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getUserDetails)
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateUser)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser);

// ========== Users by type ==========
router.route("/users/:type").get(getUsersByType);
router.route("/users/enrollment/:type").get(getUsersByTypeForEnrollment);

// 👇 FIX: removed the duplicate `GET /class-groups` route that used to live
// here (calling authControllers.js's own getClassGroups). Since this file
// (authRoutes) is registered in app.js BEFORE classGroupRoutes.js, Express
// matched this route first for every request, so the real controller in
// classGroupController.js (with populate('academicLevel'), pagination, etc.)
// was never reached — explaining the missing academicLevel/pagination data.
// The real, actively-maintained route lives in classGroupRoutes.js.

// ========== Naya stats route ==========
router
  .route("/stats/yearly-campus-counts")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getYearlyCampusWiseCounts);



  router.post("/admin/users/bulk", bulkRegisterTeachers);
  router.post("/admin/users/bulkRegisterStudents", bulkRegisterStudents);

export default router;