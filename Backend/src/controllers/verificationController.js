
import fs from "node:fs/promises";
import Verification from "../models/Verification.js";
import analyzeImage from "../services/aiService.js";

const analyzeVerification = async (req, res, next) => {
  let verification = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image."
      });
    }

    verification = await Verification.create({
      originalFilename: req.file.originalname,
      status: "processing"
    });

    const result = await analyzeImage(req.file);

    if (result.success !== true) {
      throw new Error("AI service could not analyze the image.");
    }

    verification.status = "completed";
    verification.report = result.report ?? result;
    verification.error = null;

    await verification.save();

    return res.status(200).json({
      success: true,
      message: "Image analysis completed successfully.",
      verificationId: verification._id,
      report: verification.report
    });
  } catch (error) {
    if (verification) {
      try {
        verification.status = "failed";
        verification.error = error.message;
        await verification.save();
      } catch (saveError) {
        console.error("Failed to save verification status:", saveError.message);
      }
    }

    next(error);
  } finally {
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (error) {
        if (error.code !== "ENOENT") {
          console.error("Uploaded file cleanup failed:", error.message);
        }
      }
    }
  }
};

export { analyzeVerification };
