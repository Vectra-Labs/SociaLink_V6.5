import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// GET /api/notifications - List notifications for current user
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const notifications = await prisma.notification.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
            take: limit,
            skip: skip
        });

        // Get unread count
        const unreadCount = await prisma.notification.count({
            where: {
                user_id: userId,
                is_read: false
            }
        });

        res.json({
            success: true,
            data: notifications,
            meta: {
                page,
                limit,
                unreadCount
            }
        });
    } catch (error) {
        console.error('GET MATCHING NOTIFICATIONS ERROR:', error);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération des notifications' });
    }
};

// GET /api/notifications/unread-count - Get just the count
export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const count = await prisma.notification.count({
            where: {
                user_id: userId,
                is_read: false
            }
        });

        res.json({ success: true, count });
    } catch (error) {
        console.error('GET UNREAD COUNT ERROR:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// PUT /api/notifications/:id/read - Mark single as read
export const markAsRead = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const notificationId = parseInt(req.params.id);

        const notification = await prisma.notification.findFirst({
            where: {
                notification_id: notificationId,
                user_id: userId
            }
        });

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification non trouvée' });
        }

        await prisma.notification.update({
            where: { notification_id: notificationId },
            data: { is_read: true }
        });

        res.json({ success: true, message: 'Marquée comme lue' });
    } catch (error) {
        console.error('MARK READ ERROR:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};

// PUT /api/notifications/read-all - Mark all as read
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.user_id;

        await prisma.notification.updateMany({
            where: {
                user_id: userId,
                is_read: false
            },
            data: { is_read: true }
        });

        res.json({ success: true, message: 'Toutes les notifications marquées comme lues' });
    } catch (error) {
        console.error('MARK ALL READ ERROR:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
};
