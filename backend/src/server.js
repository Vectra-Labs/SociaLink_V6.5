import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from "dotenv";
import { disconnectDB, connectDB } from "./config/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";

//Import routes
import authRoutes from "./routes/authRoutes.js"
import workerRoutes from "./routes/workerRoutes.js"
import establishmentRoutes from "./routes/establishmentRoutes.js";
import missionRoutes from "./routes/missionRoutes.js";
import specialityRoutes from "./routes/specialityRoutes.js";
import diplomaRoutes from "./routes/diplomaRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import generalRoutes from "./routes/generalRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import privilegeRoutes from "./routes/privilegeRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import establishmentDocumentRoutes from "./routes/establishmentDocuments.js";
import { getPublicHeroStats, getPublicFeatures, getUIFeatures } from './controllers/superAdminController.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config();

connectDB();


const app = express();

//swagger 
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Body parsing middlwares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Enable CORS
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// Serve uploaded files (documents, images)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


//API routes    
app.use("/api/auth", authRoutes);
app.use("/api/worker", workerRoutes);
app.use("/api/establishment", establishmentRoutes);
app.use("/api/missions", missionRoutes);
app.use("/api/specialities", specialityRoutes);
app.use("/api/diplomas", diplomaRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/general", generalRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/privileges", privilegeRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api", establishmentDocumentRoutes); // Mount at /api base because routes define full path like /admin/establishment-documents

// Public endpoint for homepage stats (no auth required)
app.get('/api/public/hero-stats', getPublicHeroStats);

// Public endpoint for feature flags (audio/video calls enabled)
app.get('/api/public/features', getPublicFeatures);

// Public endpoint for UI features (dark mode, language switcher enabled)
app.get('/api/public/ui-features', getUIFeatures);

// Import Socket.io
import { initializeSocket } from './config/socket.js';

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);

  // Initialize Socket.io
  initializeSocket(server);
  console.log('Socket.io initialized');
})

// Hundle unhandled promise rejections
process.on("unhandledRejection", async (err) => {
  console.error("Unhandled Rejection:", err);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", async (err) => {
  console.error("Uncaught Exception:", err);

  await disconnectDB();
  process.exit(1);

});

// Graceful shutdown 

process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Shutting down gracefully");
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
});