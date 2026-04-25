import express from "express";

import {
  getCampusDetails,
  getCampus,
  newCampus,
  updateCampus,
  setCampusIDinToken,
  deleteCampus,
} from "../controllers/campusControllers.js";

import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

router.route("/campus").get(getCampus);

router
  .route("/admin/campus")
  .post(isAuthenticatedUser, authorizeRoles("admin"), newCampus);

router
  .route("/admin/campus/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateCampus);

router
  .route("/campus/:id")
  .get(getCampusDetails)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteCampus);

router
  .route("/campus/token/:id")
  .get(isAuthenticatedUser, setCampusIDinToken);

export default router;