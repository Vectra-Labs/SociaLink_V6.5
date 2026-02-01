import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './useAuth';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export const useSocket = () => {
    const { user, token } = useAuth();
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [lastNotification, setLastNotification] = useState(null);

    useEffect(() => {
        if (!token) {
            return;
        }

        // Initialize Socket
        const socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket'],
            reconnection: true,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        socket.on('notification', (notification) => {
            console.log('Real-time notification received:', notification);
            setLastNotification(notification);
            // Optional: You can also dispatch a global event or update a context here
            // window.dispatchEvent(new CustomEvent('new_notification', { detail: notification }));
        });

        return () => {
            socket.disconnect();
        };
    }, [token]);

    const emit = (eventName, data) => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit(eventName, data);
        }
    };

    return {
        socket: socketRef.current,
        isConnected,
        lastNotification,
        emit
    };
};
