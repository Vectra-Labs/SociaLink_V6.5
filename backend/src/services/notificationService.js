import { prisma } from '../config/db.js';
import { emitNotification } from '../config/socket.js';

/**
 * Create a new notification and emit it via Socket.io
 * @param {Object} params
 * @param {number} params.userId - Recipient User ID
 * @param {string} params.type - Notification Type (INFO, SUCCESS, WARNING, etc.)
 * @param {string} params.message - Notification Content
 * @param {string} params.link - Optional link
 * @returns {Promise<Object>} Created notification
 */
export const createNotification = async ({ userId, type, message, link = null }) => {
    try {
        const notification = await prisma.notification.create({
            data: {
                user_id: userId,
                type,
                message,
                link
            }
        });

        // Emit real-time event
        emitNotification(userId, notification);
        
        return notification;
    } catch (error) {
        console.error('CREATE NOTIFICATION ERROR:', error);
        // Don't convert to error, just log it to prevent breaking main flow
        return null;
    }
};

export default {
    createNotification
};
