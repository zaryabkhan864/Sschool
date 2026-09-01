import express from "express";
import {
  deleteTeacherLeave,
  getTeacherLeaveDetails,
  getTeacherLeaveBalance,
  getTeachersLeave,
  newTeacherLeave,
  updateTeacherLeave,
} from "../controllers/teacherLeaveControllers.js";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

// ✅ Allow both admin and teacher to create teacher leave
router
  .route("/admin/teacherleave")
  .post(isAuthenticatedUser, authorizeRoles("admin", "teacher"), newTeacherLeave);

router.route("/teacherleaves").get(getTeachersLeave);

router
  .route("/admin/teacherleave/:id")
  .put(
    isAuthenticatedUser,
    authorizeRoles("admin", "teacher"),
    updateTeacherLeave
  )
  .delete(
    isAuthenticatedUser,
    authorizeRoles("admin", "teacher"),
    deleteTeacherLeave
  );

router.route("/teacherleave/:id").get(getTeacherLeaveDetails);

// ✅ Leave balance endpoint
router.route("/teacherleave/balance/:id").get(isAuthenticatedUser, getTeacherLeaveBalance);

export default router;