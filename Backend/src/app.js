
import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import verificationRoutes from "./routes/verificationRoutes.js";

const app = express();

app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173"
}));

app.use(express.json({ limit: "1mb" }));
app.use(pinoHttp());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    service: "ProofLens AI Backend",
    status: "running"
  });
});

app.use("/api/verification", verificationRoutes);

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.status || err.statusCode || 500;

  if (err instanceof Error && err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: err.code === "LIMIT_FILE_SIZE"
        ? "Image size must not exceed 10 MB."
        : err.message
    });
  }

  if (statusCode >= 400 && statusCode < 500) {
    return res.status(statusCode).json({
      success: false,
      message: err.message
    });
  }

  console.error("API error:", err.message);

  return res.status(500).json({
    success: false,
    message: "Something went wrong while processing your request."
  });
});

export default app;
