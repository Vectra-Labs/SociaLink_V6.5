import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    // Authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication required'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.user_id;
            socket.user = decoded;
            next();
        } catch (err) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.userId}`);

        // Join user's personal room
        socket.join(`user:${socket.userId}`);

        // Handle joining a conversation room
        socket.on('join_conversation', (conversationId) => {
            socket.join(`conversation:${conversationId}`);
            console.log(`User ${socket.userId} joined conversation ${conversationId}`);
        });

        // Handle leaving a conversation room
        socket.on('leave_conversation', (conversationId) => {
            socket.leave(`conversation:${conversationId}`);
        });

        // Handle sending a message
        socket.on('send_message', async (data) => {
            const { conversationId, content } = data;

            // Emit to all users in the conversation
            io.to(`conversation:${conversationId}`).emit('new_message', {
                conversationId,
                content,
                senderId: socket.userId,
                timestamp: new Date().toISOString()
            });
        });

        // Handle typing indicator
        socket.on('typing_start', (conversationId) => {
            socket.to(`conversation:${conversationId}`).emit('user_typing', {
                userId: socket.userId,
                conversationId
            });
        });

        socket.on('typing_stop', (conversationId) => {
            socket.to(`conversation:${conversationId}`).emit('user_stopped_typing', {
                userId: socket.userId,
                conversationId
            });
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.userId}`);
        });
    });

    return io;
};

// Helper to emit events to specific users
export const emitToUser = (userId, event, data) => {
    if (io) {
        io.to(`user:${userId}`).emit(event, data);
    }
};

// Helper to emit to a conversation
export const emitToConversation = (conversationId, event, data) => {
    if (io) {
        io.to(`conversation:${conversationId}`).emit(event, data);
    }
};

// Helper to emit notification
export const emitNotification = (userId, notification) => {
    emitToUser(userId, 'notification', notification);
};

export { io };
