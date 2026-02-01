import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

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
import adminProfileRoutes from "./routes/adminProfile.js";
import establishmentDocumentRoutes from "./routes/establishmentDocuments.js";
import { getPublicHeroStats, getPublicFeatures, getUIFeatures } from './controllers/superAdminController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config();

const app = express();

// Body parsing middlewares
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
app.use("/api", adminProfileRoutes);
app.use("/api", establishmentDocumentRoutes);

// Public endpoint for homepage stats (no auth required)
app.get('/api/public/hero-stats', getPublicHeroStats);

// Public endpoint for feature flags (audio/video calls enabled)
app.get('/api/public/features', getPublicFeatures);

// Public endpoint for UI features (dark mode, language switcher enabled)
app.get('/api/public/ui-features', getUIFeatures);

export default app;
