import express from "express";
import {
  getCampus,
  getCampusDetails,
  newCampus,
  updateCampus,
  deleteCampus,
  setCampusIDinToken,
} from "../controllers/campusControllers.js";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

// ========== Public ==========
router.route("/campus").get(getCampus);
router.route("/campus/:id").get(getCampusDetails);

// ========== Admin ==========
router
  .route("/admin/campus")
  .post(isAuthenticatedUser, authorizeRoles("admin"), newCampus);

router
  .route("/admin/campus/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateCampus)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteCampus);

// ========== Authenticated ==========
router
  .route("/campus/token/:id")
  .get(isAuthenticatedUser, setCampusIDinToken);

export default router;
