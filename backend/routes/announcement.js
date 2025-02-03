import express from "express";

import {
  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcementController.js";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

router
  .route("/annoucement")
  .post(isAuthenticatedUser, authorizeRoles("admin","teacher"), createAnnouncement);

router.route("/annoucement").get(getAnnouncements);

router.route("/annoucement/:id").put(updateAnnouncement);

router.route("/annoucements/:id").delete(deleteAnnouncement);

export default router;
