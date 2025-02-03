import express from "express";

import { addComment, updateComment, deleteComment } from "../controllers/commentController.js";

const router = express.Router();

router.route("/comment").post(addComment);

router.route("/comment/:id").put(updateComment);

router.route("/comment/:id").delete(deleteComment);

export default router;
