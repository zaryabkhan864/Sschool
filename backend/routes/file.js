import express from "express";

import { uploadFile, deleteFile } from "../controllers/fileController.js";

const router = express.Router();

router.route("/file").post(uploadFile);

router.route("/file").delete(deleteFile);

export default router;
