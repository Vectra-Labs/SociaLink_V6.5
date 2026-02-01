import { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../hooks/useAuth';

export default function MessageBell() {
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = async () => {
        try {
            const { data } = await api.get('/messages/unread-count');
            setUnreadCount(data.count || 0);
        } catch (error) {
            // Silent fail - don't spam console
        }
    };

    // Initial fetch + polling
    useEffect(() => {
        if (user) {
            fetchUnreadCount();
            const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
            return () => clearInterval(interval);
        }
    }, [user]);

    // Get role-based message path
    const getMessagePath = () => {
        if (!user) return '/';
        switch (user.role) {
            case 'WORKER': return '/worker/messages';
            case 'ESTABLISHMENT': return '/establishment/messages';
            case 'ADMIN': return '/admin/messages';
            default: return '/messages';
        }
    };

    return (
        <Link
            to={getMessagePath()}
            className="relative p-2.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-all flex items-center justify-center"
            title="Messages"
        >
            <MessageSquare className="w-5 h-5" />
            {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm border-2 border-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
        </Link>
    );
}

