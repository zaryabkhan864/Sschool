// routes/classGroupRoutes.js
import express from "express";
import { 
  newClassGroup,
  getClassGroups,
  getClassGroupDetails,
  updateClassGroup,
  deleteClassGroup,
  addCourseInClassGroup,
  deleteCourseInClassGroup,
  getCoursesAndClassGroupByRole,
  getCourseByClassGroupAndTeacherID,
  getClassGroupsByGrade,
  updateClassGroupCourses
} from "../controllers/classGroupController.js";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

// ============ PUBLIC ROUTES ============
// Get all class groups/sections (Public)
router.route("/class-groups").get(getClassGroups);

// Get single class group details (Public)
router.route("/class-groups/:id").get(getClassGroupDetails);

// Get class groups by grade (Public)
router.route("/class-groups/grade/:gradeId").get(getClassGroupsByGrade);

// ============ TEACHER ROUTES ============
// Get courses by teacher role
router.route("/teacher/class-groups/courses")
  .post(isAuthenticatedUser, authorizeRoles("teacher", "admin"), getCoursesAndClassGroupByRole);

// Get courses by class group and teacher
router.route("/teacher/class-groups/courses-by-teacher")
  .post(isAuthenticatedUser, authorizeRoles("teacher", "admin"), getCourseByClassGroupAndTeacherID);

// ============ ADMIN ROUTES ============
// Create new class group (Admin only)
router.route("/admin/class-groups")
  .post(isAuthenticatedUser, authorizeRoles("admin"), newClassGroup);

// Update/Delete class group (Admin only)
router.route("/admin/class-groups/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateClassGroup)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteClassGroup);

// Course management in class groups (Admin only)
router.route("/admin/class-groups/courses/add")
  .post(isAuthenticatedUser, authorizeRoles("admin"), addCourseInClassGroup);

router.route("/admin/class-groups/courses/remove")
  .post(isAuthenticatedUser, authorizeRoles("admin"), deleteCourseInClassGroup);

// Bulk update courses in class group (Admin only)
router.route("/admin/class-groups/:classGroupId/courses")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateClassGroupCourses);

export default router;