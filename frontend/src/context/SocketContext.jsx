import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

const SocketContext = createContext(null);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const { user, token } = useAuth();
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (!user || !token) {
            // Disconnect if logged out
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        // Create socket connection
        const socketInstance = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001', {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketInstance.on('connect', () => {
            console.log('Socket connected');
            setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        socketInstance.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
            setIsConnected(false);
        });

        // Listen for notifications
        socketInstance.on('notification', (notification) => {
            setNotifications(prev => [notification, ...prev]);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [user, token]);

    // Join a conversation room
    const joinConversation = useCallback((conversationId) => {
        if (socket && isConnected) {
            socket.emit('join_conversation', conversationId);
        }
    }, [socket, isConnected]);

    // Leave a conversation room
    const leaveConversation = useCallback((conversationId) => {
        if (socket && isConnected) {
            socket.emit('leave_conversation', conversationId);
        }
    }, [socket, isConnected]);

    // Send a message via socket
    const sendMessage = useCallback((conversationId, content) => {
        if (socket && isConnected) {
            socket.emit('send_message', { conversationId, content });
        }
    }, [socket, isConnected]);

    // Typing indicators
    const startTyping = useCallback((conversationId) => {
        if (socket && isConnected) {
            socket.emit('typing_start', conversationId);
        }
    }, [socket, isConnected]);

    const stopTyping = useCallback((conversationId) => {
        if (socket && isConnected) {
            socket.emit('typing_stop', conversationId);
        }
    }, [socket, isConnected]);

    // Subscribe to events
    const on = useCallback((event, callback) => {
        if (socket) {
            socket.on(event, callback);
            return () => socket.off(event, callback);
        }
        return () => { };
    }, [socket]);

    // Clear notifications
    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    const value = {
        socket,
        isConnected,
        notifications,
        joinConversation,
        leaveConversation,
        sendMessage,
        startTyping,
        stopTyping,
        on,
        clearNotifications,
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

export default SocketContext;
