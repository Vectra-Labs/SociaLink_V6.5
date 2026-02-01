import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
} from '../controllers/notificationController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);

export default router;
