import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import {
    Bell, Info, CheckCircle, AlertTriangle, AlertCircle,
    Briefcase, MessageSquare, FileText, CheckCheck, Loader2
} from 'lucide-react';

export default function WorkerNotifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/notifications?limit=50');
            setNotifications(data.data || []);
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError('Impossible de charger les notifications');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n)
            );
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (err) {
            console.error('Error marking all as read:', err);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'APPLICATION_ACCEPTED':
            case 'SUCCESS':
                return <CheckCircle className="w-5 h-5 text-emerald-500" />;
            case 'APPLICATION_REJECTED':
            case 'ERROR':
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            case 'NEW_MESSAGE':
                return <MessageSquare className="w-5 h-5 text-blue-500" />;
            case 'NEW_MISSION':
            case 'MISSION':
                return <Briefcase className="w-5 h-5 text-indigo-500" />;
            case 'DOCUMENT':
                return <FileText className="w-5 h-5 text-amber-500" />;
            case 'WARNING':
                return <AlertTriangle className="w-5 h-5 text-amber-500" />;
            default:
                return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'À l\'instant';
        if (minutes < 60) return `Il y a ${minutes}min`;
        if (hours < 24) return `Il y a ${hours}h`;
        if (days < 7) return `Il y a ${days}j`;
        return date.toLocaleDateString('fr-FR');
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 pb-10">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <Bell className="w-7 h-7 text-blue-600" />
                        Notifications
                        {unreadCount > 0 && (
                            <span className="px-2.5 py-0.5 bg-red-100 text-red-600 text-sm font-bold rounded-full">
                                {unreadCount} non lues
                            </span>
                        )}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Restez informé de vos candidatures et messages
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <CheckCheck className="w-4 h-4" />
                        Tout marquer comme lu
                    </button>
                )}
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {/* Notifications List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {notifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">Aucune notification pour le moment</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {notifications.map((notif) => (
                            <div
                                key={notif.notification_id}
                                className={`p-5 flex items-start gap-4 hover:bg-slate-50 transition-colors ${!notif.is_read ? 'bg-blue-50/30' : ''
                                    }`}
                            >
                                <div className="mt-0.5">
                                    {getIcon(notif.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className={`${!notif.is_read ? 'font-medium text-slate-900' : 'text-slate-700'}`}>
                                                {notif.message}
                                            </p>
                                        </div>
                                        {!notif.is_read && (
                                            <span className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 mt-2"></span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="text-xs text-slate-400">
                                            {formatDate(notif.created_at)}
                                        </span>
                                        {notif.link && (
                                            <Link
                                                to={notif.link}
                                                className="text-xs text-blue-600 hover:underline"
                                            >
                                                Voir détails →
                                            </Link>
                                        )}
                                        {!notif.is_read && (
                                            <button
                                                onClick={() => markAsRead(notif.notification_id)}
                                                className="text-xs text-slate-400 hover:text-slate-600"
                                            >
                                                Marquer lu
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
