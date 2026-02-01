import { useState, useEffect, useRef } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';

export default function NotificationBell() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/notifications?limit=10');
            setNotifications(data.data);
            setUnreadCount(data.meta.unreadCount);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const { data } = await api.get('/notifications/unread-count');
            setUnreadCount(data.count);
        } catch (error) {
            console.error('Failed to fetch unread count', error);
        }
    };

    const { lastNotification } = useSocket();

    // Initial fetch
    useEffect(() => {
        fetchUnreadCount();
    }, []);

    // Listen for real-time notifications
    useEffect(() => {
        if (lastNotification) {
            setUnreadCount(prev => (prev || 0) + 1);
            if (isOpen) {
                setNotifications(prev => [lastNotification, ...prev]);
            }
        }
    }, [lastNotification, isOpen]);

    // Fetch full list when opening
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n =>
                n.notification_id === id ? { ...n, is_read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read', error);
        }
    };

    const getRedirectionLink = (notif) => {
        if (notif.link) return notif.link;

        // Fallback logic for legacy notifications
        const msg = (notif.message || '').toLowerCase();
        const type = (notif.type || '').toUpperCase();
        const isWorker = user?.role === 'WORKER';
        const isEst = user?.role === 'ESTABLISHMENT';
        const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

        // Messages
        if (type === 'NEW_MESSAGE' || msg.includes('message')) {
            if (isWorker) return '/worker/messages';
            if (isEst) return '/establishment/messages';
            if (isAdmin) return '/admin/messages';
        }

        // Applications / Missions
        if (msg.includes('candidature') || msg.includes('mission') || msg.includes('postuler')) {
            if (isWorker) return '/worker/missions'; // or /worker/applications
            if (isEst) return '/establishment/candidates'; // or /establishment/missions
        }

        // Reviews
        if (msg.includes('avis')) {
            if (isWorker) return '/worker/reviews';
        }

        // Default fallback
        if (isWorker) return '/worker/dashboard';
        if (isEst) return '/establishment/dashboard';
        return '/dashboard';
    };

    const handleNotificationClick = (notif) => {
        setIsOpen(false);
        if (!notif.is_read) markAsRead(notif.notification_id);

        const link = getRedirectionLink(notif);
        if (link) {
            navigate(link);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-all flex items-center justify-center"
                title="Notifications"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm border-2 border-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between p-4 border-b border-slate-50 bg-slate-50/50">
                        <h3 className="font-bold text-slate-800">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                            >
                                Tout marquer comme lu
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center text-slate-500">Chargement...</div>
                        ) : notifications.length > 0 ? (
                            <div className="divide-y divide-slate-50">
                                {notifications.map((notif) => (
                                    <div
                                        key={notif.notification_id}
                                        onClick={() => handleNotificationClick(notif)}
                                        className={`p-4 hover:bg-slate-50 transition-colors relative group cursor-pointer ${!notif.is_read ? 'bg-blue-50/30' : ''}`}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${!notif.is_read ? 'bg-blue-600' : 'bg-slate-300'}`} />
                                            <div className="flex-1 min-w-0 space-y-1">
                                                <p className={`text-sm ${!notif.is_read ? 'font-semibold text-slate-900 message-content' : 'text-slate-600'}`}>
                                                    {notif.message}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {new Date(notif.created_at).toLocaleDateString()} à {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            {!notif.is_read && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        markAsRead(notif.notification_id);
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 transition-all self-start"
                                                    title="Marquer comme lu"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center">
                                <Bell className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                <p className="text-slate-500 font-medium">Aucune notification</p>
                            </div>
                        )}
                    </div>

                    {user?.role === 'WORKER' && (
                        <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
                            <Link
                                to="/worker/notifications"
                                onClick={() => setIsOpen(false)}
                                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center justify-center gap-1"
                            >
                                Voir toutes les notifications
                                <ExternalLink className="w-3 h-3" />
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
