import express from "express";

import {
  getCounselings,
  newCounseling,
} from "../controllers/counselingControllers.js";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

router
  .route("/admin/counselings")
  .post(isAuthenticatedUser, authorizeRoles("admin"), newCounseling);

router.route("/counselings").get(getCounselings);

export default router;
