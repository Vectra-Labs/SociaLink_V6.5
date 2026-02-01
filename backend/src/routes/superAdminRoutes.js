import express from 'express';
import { getAllAdmins, createAdmin, updateAdmin, getAuditLogs, getDashboardStats, getPlans, createPlan, updatePlan, getBanners, upsertBanner, deleteBanner, sendGlobalNotification, getAllUsers, updateUserStatus, getUserDetails, getFinancialStats, getTransactions, getQualityStats, getPendingVerifications, reviewProfile, getWorkerFullDetails, getEstablishmentFullDetails, getSystemSettings, updateSystemSettings, getDisputes, resolveDispute, getAdminMessages, sendAdminMessage, markMessageRead, markConversationRead, getAdminMissions, reviewMission } from '../controllers/superAdminController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Middleware: Authenticated
router.use(authMiddleware);

// --- SHARED ROUTES (ADMIN & SUPER ADMIN) ---

// Dashboard Stats
router.get('/stats', roleMiddleware('ADMIN', 'SUPER_ADMIN'), getDashboardStats);

// User Management
router.get('/users', roleMiddleware('ADMIN', 'SUPER_ADMIN'), getAllUsers);
router.get('/users/:id', roleMiddleware('ADMIN', 'SUPER_ADMIN'), getUserDetails);
router.put('/users/:id/status', roleMiddleware('ADMIN', 'SUPER_ADMIN'), updateUserStatus);

// Quality Control
router.get('/quality/stats', roleMiddleware('ADMIN', 'SUPER_ADMIN'), getQualityStats);
router.get('/quality/pending', roleMiddleware('ADMIN', 'SUPER_ADMIN'), getPendingVerifications);
router.put('/quality/profiles/:type/:id/review', roleMiddleware('ADMIN', 'SUPER_ADMIN'), reviewProfile);
router.get('/quality/worker/:id/details', roleMiddleware('ADMIN', 'SUPER_ADMIN'), getWorkerFullDetails);
router.get('/quality/establishment/:id/details', roleMiddleware('ADMIN', 'SUPER_ADMIN'), getEstablishmentFullDetails);

// Mission Validation
router.get('/missions', roleMiddleware('ADMIN', 'SUPER_ADMIN'), getAdminMissions);
router.put('/missions/:id/review', roleMiddleware('ADMIN', 'SUPER_ADMIN'), reviewMission);

// Disputes
router.get('/disputes', roleMiddleware('ADMIN', 'SUPER_ADMIN'), getDisputes);
router.put('/disputes/:id/resolve', roleMiddleware('ADMIN', 'SUPER_ADMIN'), resolveDispute);

// Marketing (Shared for simplicity, or restrict?)
router.get('/banners', roleMiddleware('ADMIN', 'SUPER_ADMIN'), getBanners);


// --- SUPER ADMIN ONLY ROUTES ---

// Admin Management
router.get('/admins', roleMiddleware('SUPER_ADMIN'), getAllAdmins);
router.post('/admins', roleMiddleware('SUPER_ADMIN'), createAdmin);
router.put('/admins/:id', roleMiddleware('SUPER_ADMIN'), updateAdmin);

// Subscription Plans
router.get('/plans', roleMiddleware('SUPER_ADMIN'), getPlans);
router.post('/plans', roleMiddleware('SUPER_ADMIN'), createPlan);
router.put('/plans/:id', roleMiddleware('SUPER_ADMIN'), updatePlan);

// Marketing Actions
router.post('/banners', roleMiddleware('SUPER_ADMIN'), upsertBanner);
router.put('/banners/:id', roleMiddleware('SUPER_ADMIN'), upsertBanner);
router.delete('/banners/:id', roleMiddleware('SUPER_ADMIN'), deleteBanner);
router.post('/notifications/broadcast', roleMiddleware('SUPER_ADMIN'), sendGlobalNotification);

// Finance
router.get('/finance/stats', roleMiddleware('ADMIN', 'SUPER_ADMIN'), getFinancialStats);
router.get('/finance/transactions', roleMiddleware('ADMIN', 'SUPER_ADMIN'), getTransactions);

// System Settings
router.get('/settings', roleMiddleware('SUPER_ADMIN'), getSystemSettings);
router.put('/settings', roleMiddleware('SUPER_ADMIN'), updateSystemSettings);

// Audit Logs
router.get('/logs', roleMiddleware('SUPER_ADMIN'), getAuditLogs);

// Admin Messaging
router.get('/messages', roleMiddleware('ADMIN', 'SUPER_ADMIN'), getAdminMessages);
router.post('/messages', roleMiddleware('ADMIN', 'SUPER_ADMIN'), sendAdminMessage);
router.put('/messages/:id/read', roleMiddleware('ADMIN', 'SUPER_ADMIN'), markMessageRead);
router.post('/messages/read-all', roleMiddleware('ADMIN', 'SUPER_ADMIN'), markConversationRead);

export default router;
