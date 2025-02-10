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
  .route("/announcement")
  .post(isAuthenticatedUser, authorizeRoles("admin","teacher"), createAnnouncement);

router.route("/announcement").get(isAuthenticatedUser,getAnnouncements);

router.route("/announcement/:id").put(isAuthenticatedUser,updateAnnouncement);

router.route("/announcement/:id").delete(isAuthenticatedUser, deleteAnnouncement);

export default router;
