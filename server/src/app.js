import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import documentRequestRoutes from "./routes/documentRequestRoutes.js";
import externalRecipientRoutes from "./routes/externalRecipientRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import agentRoutes from "./routes/agentRoutes.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  "/api/notifications",
  notificationRoutes
);

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "PrivateAI Agent API is running"
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/document-requests", documentRequestRoutes);
app.use("/api/external-recipients", externalRecipientRoutes);
app.use("/api/agent", agentRoutes);

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

app.use((err, req, res, next) => {
  if (err?.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      success: false,
      message: "Document file exceeds the 10 MB upload limit.",
    });
  }

  if (err?.message === "Unsupported document type.") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  console.error(err);

  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error"
  });
});

export default app;