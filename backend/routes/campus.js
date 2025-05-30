import express from "express";

import {
  getCampusDetails,
  getCampus,
  newCampus,
  updateCampus,
  setCampusIDinToken,
} from "../controllers/campusControllers.js";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

router
  .route("/admin/campus")
  .post(isAuthenticatedUser, authorizeRoles("admin"), newCampus);

router.route("/campus").get(getCampus);

router
  .route("/admin/campus/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateCampus)

router.route("/campus/:id").get(getCampusDetails);
router
  .route("/campus/token/:id")
  .get(isAuthenticatedUser, setCampusIDinToken)

export default router;
