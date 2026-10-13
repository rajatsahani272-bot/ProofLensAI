
import express from "express";
import upload from "../middleware/upload.js";
import { analyzeVerification } from "../controllers/verificationController.js";

const router = express.Router();

router.post("/analyze", upload.single("file"), analyzeVerification);

export default router;
