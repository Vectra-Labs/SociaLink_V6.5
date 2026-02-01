import express from "express";
import { getAdminNotifications, getWorkersUnderReview, getWorkerDetails, approveWorker, rejectWorker, markNotificationAsRead, markAllNotificationsAsRead } from "../controllers/adminController.js";
import { getPendingDocuments, verifyDocument, rejectDocument } from "../controllers/documentController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Protection globale ADMIN
router.use(authMiddleware, roleMiddleware("ADMIN"));

router.get("/notifications", getAdminNotifications);
router.get("/workers", getWorkersUnderReview);
router.get("/workers/:id", getWorkerDetails);
router.patch("/workers/:id/approve", approveWorker);
router.patch("/workers/:id/reject", rejectWorker);

router.patch("/notifications/:id/read", markNotificationAsRead);
router.patch("/notifications/read-all", markAllNotificationsAsRead);

// Document Verification
router.get("/documents/pending", getPendingDocuments);
router.put("/documents/:id/verify", verifyDocument);
router.put("/documents/:id/reject", rejectDocument);


export default router;

