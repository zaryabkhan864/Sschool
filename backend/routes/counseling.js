import express from "express";

import {
  deleteCounseling,
  getCounselingDetails,
  getCounselings,
  newCounseling,
  updateCounseling,
} from "../controllers/counselingControllers.js";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

router
  .route("/admin/counselings")
  .post(isAuthenticatedUser, authorizeRoles("admin"), newCounseling);

router.route("/counselings").get(getCounselings);

router
  .route("/admin/counselings/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateCounseling)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteCounseling);

router.route("/counselings/:id").get(getCounselingDetails);

export default router;
