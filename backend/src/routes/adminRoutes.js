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


// --- MERGED SUPER ADMIN ROUTES ---
import { getAllAdmins, createAdmin, updateAdmin, getAuditLogs, getDashboardStats, getPlans, createPlan, updatePlan, getBanners, upsertBanner, deleteBanner, sendGlobalNotification, getAllUsers, updateUserStatus, getUserDetails, getFinancialStats, getTransactions, getQualityStats, getPendingVerifications, reviewProfile, getWorkerFullDetails, getEstablishmentFullDetails, updateDocumentStatus, getSystemSettings, updateSystemSettings, getDisputes, resolveDispute, getAdminMessages, sendAdminMessage, markMessageRead, markConversationRead, getAdminMissions, reviewMission, seedDemoData, updateUserSubscription } from '../controllers/superAdminController.js';

// Dashboard Stats
router.get('/stats', getDashboardStats);

// User Management (Expanded)
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id/status', updateUserStatus);

// Quality Control (Expanded)
router.get('/quality/stats', getQualityStats);
router.get('/quality/pending', getPendingVerifications);
router.put('/quality/profiles/:type/:id/review', reviewProfile);
router.get('/quality/worker/:id/details', getWorkerFullDetails);
router.get('/quality/establishment/:id/details', getEstablishmentFullDetails);
router.put('/quality/document/:id/status', updateDocumentStatus);

// Mission Validation
router.get('/missions', getAdminMissions);
router.put('/missions/:id/review', reviewMission);

// Disputes
router.get('/disputes', getDisputes);
router.put('/disputes/:id/resolve', resolveDispute);

// Marketing
router.get('/banners', getBanners);
router.post('/banners', upsertBanner);
router.put('/banners/:id', upsertBanner);
router.delete('/banners/:id', deleteBanner);
router.post('/notifications/broadcast', sendGlobalNotification);

// Admin Management (Formerly SuperAdmin Only)
router.get('/admins', getAllAdmins);
router.post('/admins', createAdmin);
router.put('/admins/:id', updateAdmin);

// Subscription Plans
router.get('/plans', getPlans);
router.post('/plans', createPlan);
router.put('/plans/:id', updatePlan);

// Finance
router.get('/finance/stats', getFinancialStats);
router.get('/finance/transactions', getTransactions);

// System Settings
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);

// Logs
router.get('/logs', getAuditLogs);

// Admin Messaging
// router.get('/messages', getAdminMessages); // Old legacy
// router.post('/messages', sendAdminMessage); // Old legacy

// New Messaging System
import { getUsersForMessaging, sendBulkMessage } from "../controllers/adminController.js";
router.get('/messaging/users', getUsersForMessaging);
router.post('/messaging/send', sendBulkMessage);

router.put('/messages/:id/read', markMessageRead);
router.post('/messages/read-all', markConversationRead);

// Demo & Utils
router.post('/seed-demo-data', seedDemoData);
router.put('/users/:id/subscription', updateUserSubscription);


export default router;

