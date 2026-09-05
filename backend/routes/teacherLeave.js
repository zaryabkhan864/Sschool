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

// Allow both admin/principle and teacher to create a leave request — the
// controller forces `teacher` to the logged-in user when the caller is a
// teacher, so a teacher can never file on someone else's behalf.
router
  .route("/admin/teacherleave")
  .post(isAuthenticatedUser, authorizeRoles("admin", "principle", "teacher"), newTeacherLeave);

// 👇 FIX: had NO auth middleware at all — anyone could list every
// teacher's leave records. Now requires login; the controller itself
// scopes a teacher caller down to their own requests only.
router.route("/teacherleaves").get(isAuthenticatedUser, getTeachersLeave);

router
  .route("/admin/teacherleave/:id")
  // 👇 FIX: "principle" was missing from this list entirely — a principal
  // could never approve/reject/edit a leave via this route. "teacher" stays
  // allowed so an owner can edit their own still-pending request, but the
  // controller itself blocks a non-approver from ever changing `status`.
  .put(isAuthenticatedUser, authorizeRoles("admin", "principle", "teacher"), updateTeacherLeave)
  .delete(isAuthenticatedUser, authorizeRoles("admin", "principle", "teacher"), deleteTeacherLeave);

// 👇 FIX: also had no auth middleware — added; ownership check lives in
// the controller (owner or admin/principle only).
router.route("/teacherleave/:id").get(isAuthenticatedUser, getTeacherLeaveDetails);

// Leave balance endpoint
router.route("/teacherleave/balance/:id").get(isAuthenticatedUser, getTeacherLeaveBalance);

export default router;