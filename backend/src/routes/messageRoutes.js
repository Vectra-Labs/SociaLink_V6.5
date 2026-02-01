import express from 'express';
import * as messageController from '../controllers/messageController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/conversations', messageController.getConversations);
router.get('/unread-count', messageController.getUnreadMessagesCount);
router.get('/:conversationId/messages', messageController.getMessages);
router.post('/', messageController.sendMessage);

export default router;
