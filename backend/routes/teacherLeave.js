import express from "express";
import {
  deleteTeacherLeave,
  getTeacherLeaveDetails,
  getTeachersLeave,
  newTeacherLeave,
  updateTeacherLeave,
} from "../controllers/teacherLeaveControllers.js";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();
router
  .route("/admin/teacherleave")
  .post(isAuthenticatedUser, authorizeRoles("teacher"), newTeacherLeave);

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

export default router;
