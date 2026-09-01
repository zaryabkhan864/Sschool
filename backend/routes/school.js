// routes
import express from "express";
import {
  getSchool,
  upsertSchool,
  deleteSchoolLogo,
} from "../controllers/schoolControllers.js";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

// ========== School (singleton) ==========
router.route("/school").get(getSchool);

router
  .route("/admin/school")
  .put(isAuthenticatedUser, authorizeRoles("admin"), upsertSchool);

router
  .route("/admin/school/logo")
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteSchoolLogo);

export default router;
