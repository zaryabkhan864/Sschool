import express from "express";

import {
  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcementController.js";
import { isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

// 👇 CHANGED: was admin/teacher only — now ANY authenticated role can
// post (students included). The class-group ownership rule ("students
// can only post to their own class or the whole school") depends on
// WHICH classGroup is being posted to, not just the role, so it's
// enforced inside createAnnouncement itself rather than here.
router.route("/announcement").post(isAuthenticatedUser, createAnnouncement);

router.route("/announcement").get(isAuthenticatedUser, getAnnouncements);

// 👇 Ownership (author or admin/principal) is now checked inside the
// controllers themselves — previously ANY authenticated user could
// edit/delete ANY post.
router.route("/announcement/:id").put(isAuthenticatedUser, updateAnnouncement);

router.route("/announcement/:id").delete(isAuthenticatedUser, deleteAnnouncement);

export default router;
