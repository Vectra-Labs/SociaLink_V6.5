import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { createNotification } from "../services/notificationService.js";

// Récupérer les conversations
export const getConversations = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const role = req.user.role;

        let conversations = [];

        if (role === 'WORKER') {
            const rawConversations = await prisma.conversation.findMany({
                where: { worker_id: userId },
                include: {
                    establishment: {
                        select: {
                            user_id: true,
                            name: true,
                            logo_url: true,
                            city: { select: { name: true } }
                        }
                    },
                    messages: {
                        orderBy: { created_at: 'desc' },
                        take: 1
                    }
                },
                orderBy: { last_message_at: 'desc' }
            });

            conversations = rawConversations.map(c => ({
                id: c.conversation_id,
                partner: {
                    id: c.establishment?.user_id,
                    name: c.establishment?.name || 'Établissement',
                    avatar: c.establishment?.logo_url,
                    subtitle: c.establishment?.city?.name || ''
                },
                lastMessage: c.messages[0] ? {
                    content: c.messages[0].content,
                    date: c.messages[0].created_at,
                    isMe: c.messages[0].sender_id === userId,
                    isRead: c.messages[0].is_read
                } : null,
                updatedAt: c.last_message_at
            }));

        } else if (role === 'ESTABLISHMENT') {
            const rawConversations = await prisma.conversation.findMany({
                where: { establishment_id: userId },
                include: {
                    worker: {
                        select: {
                            user_id: true,
                            first_name: true,
                            last_name: true,
                            profile_pic_url: true,
                            title: true,  // Fixed: was job_title
                            city: { select: { name: true } }
                        }
                    },
                    messages: {
                        orderBy: { created_at: 'desc' },
                        take: 1
                    }
                },
                orderBy: { last_message_at: 'desc' }
            });

            conversations = rawConversations.map(c => ({
                id: c.conversation_id,
                partner: {
                    id: c.worker?.user_id,
                    name: c.worker ? `${c.worker.first_name || ''} ${c.worker.last_name || ''}`.trim() || 'Travailleur' : 'Travailleur',
                    avatar: c.worker?.profile_pic_url,
                    subtitle: c.worker?.title || c.worker?.city?.name || ''
                },
                lastMessage: c.messages[0] ? {
                    content: c.messages[0].content,
                    date: c.messages[0].created_at,
                    isMe: c.messages[0].sender_id === userId,
                    isRead: c.messages[0].is_read
                } : null,
                updatedAt: c.last_message_at
            }));
        } else {
            return res.status(403).json({ success: false, message: 'Role non autorisé pour la messagerie' });
        }

        res.json({ success: true, data: conversations });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};

// Récupérer les messages d'une conversation
export const getMessages = async (req, res) => {
    try {
        const conversationId = parseInt(req.params.conversationId);
        const userId = req.user.user_id;

        // Vérifier l'accès
        const conversation = await prisma.conversation.findUnique({
            where: { conversation_id: conversationId }
        });

        if (!conversation || (conversation.worker_id !== userId && conversation.establishment_id !== userId)) {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }

        const messages = await prisma.message.findMany({
            where: { conversation_id: conversationId },
            orderBy: { created_at: 'asc' },
            include: {
                sender: {
                    select: {
                        user_id: true,
                        role: true,
                    }
                }
            }
        });

        // Marquer comme lus
        await prisma.message.updateMany({
            where: {
                conversation_id: conversationId,
                NOT: { sender_id: userId },
                is_read: false
            },
            data: { is_read: true }
        });

        res.json({ success: true, data: messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};

// Récupérer le nombre global de messages non lus
export const getUnreadMessagesCount = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const count = await prisma.message.count({
            where: {
                NOT: { sender_id: userId },
                is_read: false,
                conversation: {
                    OR: [
                        { worker_id: userId },
                        { establishment_id: userId }
                    ]
                }
            }
        });

        res.json({ success: true, count });
    } catch (error) {
        console.error('Error counting unread messages:', error);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};

// Envoyer un message
export const sendMessage = async (req, res) => {
    try {
        const senderId = req.user.user_id;
        const senderRole = req.user.role;
        const { receiverId, content, conversationId } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ success: false, message: 'Message vide' });
        }

        let convId = conversationId;

        // Si pas d'ID de conversation, on essaie de trouver ou créer
        if (!convId && receiverId) {
            let workerId, establishmentId;

            if (senderRole === 'WORKER') {
                workerId = senderId;
                establishmentId = parseInt(receiverId);
            } else if (senderRole === 'ESTABLISHMENT') {
                workerId = parseInt(receiverId);
                establishmentId = senderId;
            } else {
                return res.status(403).json({ success: false, message: 'Role non autorisé' });
            }

            // Chercher conversation existante
            let conv = await prisma.conversation.findUnique({
                where: {
                    worker_id_establishment_id: {
                        worker_id: workerId,
                        establishment_id: establishmentId
                    }
                }
            });

            if (!conv) {
                // Créer nouvelle conversation
                conv = await prisma.conversation.create({
                    data: {
                        worker_id: workerId,
                        establishment_id: establishmentId
                    }
                });
            }
            convId = conv.conversation_id;
        }

        if (!convId) {
            return res.status(400).json({ success: false, message: 'Impossible de déterminer la conversation' });
        }

        // Créer le message
        const message = await prisma.message.create({
            data: {
                conversation_id: convId,
                sender_id: senderId,
                content: content.trim()
            }
        });

        // Update conversation timestamp
        await prisma.conversation.update({
            where: { conversation_id: convId },
            data: { last_message_at: new Date() }
        });

        // Create Notification for receiver
        try {
            // Get the conversation to determine the receiver
            const conv = await prisma.conversation.findUnique({
                where: { conversation_id: convId },
                select: { worker_id: true, establishment_id: true }
            });

            // Determine the receiver (the other party in the conversation)
            const receiverUserId = senderId === conv.worker_id
                ? conv.establishment_id
                : conv.worker_id;

            // Determine link based on receiver role
            const receiver = await prisma.user.findUnique({
                where: { user_id: receiverUserId },
                select: { role: true }
            });

            const messageLink = receiver?.role === 'WORKER'
                ? '/worker/messages'
                : receiver?.role === 'ESTABLISHMENT'
                    ? '/establishment/messages'
                    : '/admin/messages';

            await createNotification({
                userId: receiverUserId,
                type: 'NEW_MESSAGE',
                message: `Vous avez reçu un nouveau message`,
                link: messageLink
            });
        } catch (notifError) {
            console.error('Failed to create notification:', notifError);
            // Non-blocking error
        }

        res.json({ success: true, data: message });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
    }
};
