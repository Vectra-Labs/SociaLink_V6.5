import { useState, useEffect } from 'react';
import {
    Info, CheckCircle, AlertTriangle, AlertCircle, Bell, RefreshCw,
    CheckCheck, Trash2
} from 'lucide-react';
import api from '../../api/client';

const AdminNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [markingRead, setMarkingRead] = useState(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/notifications');
            setNotifications(data.data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        setMarkingRead(notificationId);
        try {
            await api.patch(`/admin/notifications/${notificationId}/read`);
            setNotifications(prev =>
                prev.map(n => n.notification_id === notificationId ? { ...n, is_read: true } : n)
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        } finally {
            setMarkingRead(null);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch('/admin/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'SUCCESS': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'WARNING': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            case 'URGENT': return <AlertCircle className="w-5 h-5 text-red-500" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const getBgColor = (type, isRead) => {
        if (isRead) return 'bg-slate-50';
        switch (type) {
            case 'SUCCESS': return 'bg-green-50 border-l-4 border-green-500';
            case 'WARNING': return 'bg-amber-50 border-l-4 border-amber-500';
            case 'URGENT': return 'bg-red-50 border-l-4 border-red-500';
            default: return 'bg-blue-50 border-l-4 border-blue-500';
        }
    };

    const formatTimeAgo = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "À l'instant";
        if (diffMins < 60) return `Il y a ${diffMins} min`;
        if (diffHours < 24) return `Il y a ${diffHours}h`;
        if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
        return date.toLocaleDateString('fr-FR');
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-16 bg-slate-200 rounded-xl animate-pulse" />
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-20 bg-slate-200 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <Bell className="w-7 h-7 text-blue-600" />
                        Notifications
                        {unreadCount > 0 && (
                            <span className="bg-blue-600 text-white text-sm px-2.5 py-0.5 rounded-full">
                                {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                            </span>
                        )}
                    </h1>
                    <p className="text-slate-500 mt-1">Historique des alertes et événements</p>
                </div>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                            <CheckCheck className="w-4 h-4" />
                            Tout marquer lu
                        </button>
                    )}
                    <button
                        onClick={fetchNotifications}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Actualiser
                    </button>
                </div>
            </div>

            {/* Notifications List */}
            {notifications.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
                    <Bell className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">Aucune notification</h3>
                    <p className="text-slate-500 text-sm">
                        Vous n'avez pas encore reçu de notifications.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="divide-y divide-slate-100">
                        {notifications.map((notif) => (
                            <div
                                key={notif.notification_id}
                                className={`p-4 flex items-start gap-4 transition-colors ${getBgColor(notif.type, notif.is_read)}`}
                            >
                                <div className="mt-0.5">
                                    {getIcon(notif.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-slate-800 ${notif.is_read ? 'font-normal' : 'font-medium'}`}>
                                        {notif.message}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {formatTimeAgo(notif.created_at)}
                                    </p>
                                </div>
                                {!notif.is_read && (
                                    <button
                                        onClick={() => markAsRead(notif.notification_id)}
                                        disabled={markingRead === notif.notification_id}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                                    >
                                        {markingRead === notif.notification_id ? '...' : 'Marquer lu'}
                                    </button>
                                )}
                                {notif.is_read && (
                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        Lu
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminNotifications;
