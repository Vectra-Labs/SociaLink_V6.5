import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { useSubscription } from '../../context/SubscriptionContext';
import { workerService } from '../../services/worker.service';
import { THEME, getStatusBadgeStyle } from '../../utils/theme';
import api from '../../api/client';
import {
    Briefcase, FileText, Calendar, TrendingUp, AlertCircle,
    CheckCircle, MessageSquare, Clock, ArrowRight, Star, Bell, MapPin, Sparkles,
    ChevronLeft, ChevronRight, BarChart3, ListTodo, AlertTriangle
} from 'lucide-react';
import WorkerDashboardSkeleton from './WorkerDashboardSkeleton';

export default function WorkerDashboard() {
    const { user } = useAuth();
    const { isSubscribed } = useSubscription();

    const [stats, setStats] = useState({
        activeApplications: 0,
        acceptedMissions: 0,
        pendingReviews: 0,
        unreadMessages: 0
    });
    const [recentApplications, setRecentApplications] = useState([]);
    const [recommendedMissions, setRecommendedMissions] = useState([]);
    const [profileCompletion, setProfileCompletion] = useState({ percentage: 0, missing: [] });
    const [notifications, setNotifications] = useState({ unread: 0 });
    const [availability, setAvailability] = useState([]);
    const [upcomingMissions, setUpcomingMissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Mini Calendar State
    const [calendarMonth, setCalendarMonth] = useState(new Date());

    const { socket, isConnected, lastNotification } = useSocket();

    useEffect(() => {
        loadDashboardData();
    }, []);

    // Listen for real-time notifications
    useEffect(() => {
        if (lastNotification) {
            setNotifications(prev => ({ unread: (prev.unread || 0) + 1 }));
            // Optional: trigger a toast or sound here
        }
    }, [lastNotification]);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications/unread-count');
            setNotifications({ unread: data.count || 0 });
        } catch (err) {
            // Silent fail for notifications
        }
    };

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [statsData, appsData, missionsData, profileData, availabilityData] = await Promise.all([
                workerService.getStats(),
                workerService.getRecentApplications(5),
                workerService.getRecommendedMissions(3),
                workerService.getProfile(),
                workerService.getAvailability().catch(() => [])
            ]);

            setStats(prev => ({ ...prev, ...statsData }));
            setRecentApplications(appsData);
            setRecommendedMissions(missionsData);
            setAvailability(availabilityData || []);

            // Extract upcoming missions from accepted applications
            const accepted = appsData.filter(app => app.status === 'ACCEPTED');
            setUpcomingMissions(accepted.slice(0, 3));

            // Calculate profile completion
            const completion = workerService.getProfileCompletion(profileData, user);
            setProfileCompletion(completion);

            // Initial notification fetch
            fetchNotifications();

        } catch (err) {
            console.error("Dashboard load error", err);
            setError("Impossible de charger les statistiques.");
        } finally {
            setLoading(false);
        }
    };

    // Dynamic greeting based on time
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bonjour';
        if (hour < 18) return 'Bon après-midi';
        return 'Bonsoir';
    };

    // Mini Calendar Helpers
    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();
        return { daysInMonth, startingDay, year, month };
    };

    const isDateAvailable = (day) => {
        if (!availability.length) return false;
        const dateStr = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return availability.some(a => a.date?.startsWith(dateStr) && a.is_available);
    };

    const isToday = (day) => {
        const today = new Date();
        return today.getDate() === day &&
            today.getMonth() === calendarMonth.getMonth() &&
            today.getFullYear() === calendarMonth.getFullYear();
    };

    const renderMiniCalendar = () => {
        const { daysInMonth, startingDay } = getDaysInMonth(calendarMonth);
        const days = [];
        const dayNames = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

        // Empty cells for days before month starts
        for (let i = 0; i < startingDay; i++) {
            days.push(<div key={`empty-${i}`} className="w-7 h-7"></div>);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const available = isDateAvailable(day);
            const today = isToday(day);
            days.push(
                <div
                    key={day}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all
                        ${today ? 'bg-blue-600 text-white ring-2 ring-blue-200' : ''}
                        ${available && !today ? 'bg-emerald-100 text-emerald-700' : ''}
                        ${!available && !today ? 'text-slate-400' : ''}
                    `}
                >
                    {day}
                </div>
            );
        }

        return (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-sm">{calendarMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
                    </h3>
                    <div className="flex gap-1">
                        <button
                            onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1))}
                            className="p-1 hover:bg-slate-100 rounded transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4 text-slate-500" />
                        </button>
                        <button
                            onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1))}
                            className="p-1 hover:bg-slate-100 rounded transition-colors"
                        >
                            <ChevronRight className="w-4 h-4 text-slate-500" />
                        </button>
                    </div>
                </div>

                {/* Day names */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                    {dayNames.map((name, i) => (
                        <div key={i} className="w-7 h-6 flex items-center justify-center text-[10px] font-semibold text-slate-400 uppercase">
                            {name}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                    {days}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span className="w-2.5 h-2.5 bg-emerald-100 rounded-full border border-emerald-200"></span>
                        Disponible
                    </div>
                    <Link to="/worker/calendar" className="text-xs text-blue-600 hover:underline ml-auto">
                        Gérer →
                    </Link>
                </div>
            </div>
        );
    };

    // Activity Chart (Simple bar chart for missions by status)
    const renderActivityChart = () => {
        const chartData = [
            { label: 'En attente', value: stats.activeApplications || 0, color: 'bg-amber-400' },
            { label: 'Acceptées', value: stats.acceptedMissions || 0, color: 'bg-emerald-400' },
            { label: 'Messages', value: stats.unreadMessages || 0, color: 'bg-blue-400' },
        ];
        const maxValue = Math.max(...chartData.map(d => d.value), 1);

        return (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">Aperçu activité</span>
                </h3>
                <div className="space-y-3">
                    {chartData.map((item, idx) => (
                        <div key={idx}>
                            <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-slate-600">{item.label}</span>
                                <span className="font-bold text-slate-900">{item.value}</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Quick Reminders Section
    const renderReminders = () => {
        const reminders = [];

        // Profile incomplete reminder
        if (profileCompletion.percentage < 100) {
            reminders.push({
                id: 'profile',
                icon: AlertTriangle,
                color: 'text-amber-500',
                bg: 'bg-amber-50',
                text: `Profil ${profileCompletion.percentage}% complet`,
                link: '/worker/profile',
                priority: 1
            });
        }

        // Pending reviews reminder
        if (stats.pendingReviews > 0) {
            reminders.push({
                id: 'reviews',
                icon: Star,
                color: 'text-blue-500',
                bg: 'bg-blue-50',
                text: `${stats.pendingReviews} avis à donner`,
                link: '/worker/reviews',
                priority: 2
            });
        }

        // Unread messages reminder
        if (stats.unreadMessages > 0) {
            reminders.push({
                id: 'messages',
                icon: MessageSquare,
                color: 'text-indigo-500',
                bg: 'bg-indigo-50',
                text: `${stats.unreadMessages} message${stats.unreadMessages > 1 ? 's' : ''} non lu${stats.unreadMessages > 1 ? 's' : ''}`,
                link: '/worker/messages',
                priority: 3
            });
        }

        // No availability set reminder
        if (!availability.length) {
            reminders.push({
                id: 'availability',
                icon: Calendar,
                color: 'text-sky-500',
                bg: 'bg-sky-50',
                text: 'Définir vos disponibilités',
                link: '/worker/calendar',
                priority: 4
            });
        }

        if (reminders.length === 0) {
            return null;
        }

        return (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-3">
                    <ListTodo className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">À faire</span>
                    <span className="ml-auto px-2 py-0.5 text-xs font-bold bg-slate-100 text-slate-600 rounded-full">
                        {reminders.length}
                    </span>
                </h3>
                <div className="space-y-2">
                    {reminders.slice(0, 4).map((reminder) => (
                        <Link
                            key={reminder.id}
                            to={reminder.link}
                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                        >
                            <div className={`w-8 h-8 rounded-lg ${reminder.bg} flex items-center justify-center ${reminder.color}`}>
                                <reminder.icon className="w-4 h-4" />
                            </div>
                            <span className="text-sm text-slate-700 group-hover:text-blue-600 transition-colors">
                                {reminder.text}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 ml-auto transition-colors" />
                        </Link>
                    ))}
                </div>
            </div>
        );
    };

    if (loading) {
        return <WorkerDashboardSkeleton />;
    }

    const statCards = [
        {
            label: "Candidatures actives",
            value: stats.activeApplications || 0,
            icon: Briefcase,
            color: `text-${THEME.colors.primary.blue}-600`,
            bg: `bg-${THEME.colors.primary.blue}-50`,
            link: "/worker/missions"
        },
        {
            label: "Missions acceptées",
            value: stats.acceptedMissions || 0,
            icon: CheckCircle,
            color: `text-${THEME.colors.primary.indigo}-600`,
            bg: `bg-${THEME.colors.primary.indigo}-50`,
            link: "/worker/missions"
        },
        {
            label: "Messages non lus",
            value: stats.unreadMessages || 0,
            icon: MessageSquare,
            color: "text-sky-600",
            bg: "bg-sky-50",
            link: "/worker/messages"
        },
        {
            label: "Avis en attente",
            value: stats.pendingReviews || 0,
            icon: Star,
            color: "text-slate-600",
            bg: "bg-slate-100",
            link: "/worker/reviews"
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 pb-10">
            {/* Header with Notification Badge */}
            <div
                className={`mb-8 p-6 rounded-3xl text-white shadow-xl shadow-blue-900/10 relative overflow-hidden transition-all duration-500 bg-cover bg-center`}
                style={{
                    backgroundImage: user?.banner_url ? `url(${user.banner_url})` : undefined,
                }}
            >
                <div className={`absolute inset-0 ${user?.banner_url ? 'bg-black/40' : THEME.gradients.header} z-0`}></div>

                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">
                            {getGreeting()}, {user?.first_name || 'Travailleur'} 👋
                        </h1>
                        <p className="text-blue-100 text-lg">
                            Voici ce qui se passe sur votre compte aujourd'hui.
                        </p>
                    </div>

                    {/* Notification Bell with Badge */}
                    <Link to="/worker/notifications" className="relative p-3 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl transition-all hover:scale-105">
                        <Bell className="w-6 h-6 text-white" />
                        {notifications.unread > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                                {notifications.unread > 9 ? '9+' : notifications.unread}
                            </span>
                        )}
                    </Link>
                </div>

                {!user?.banner_url && (
                    <>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none z-0"></div>
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none z-0"></div>
                    </>
                )}
            </div>

            {/* Profile Completion Progress Bar */}
            {profileCompletion.percentage < 100 && (
                <div className="mb-6 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            <h3 className="font-bold text-slate-900">Complétez votre profil</h3>
                        </div>
                        <span className="text-sm font-bold text-blue-600">{profileCompletion.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 mb-3">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${profileCompletion.percentage}%` }}
                        ></div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {profileCompletion.missing.slice(0, 3).map((item, idx) => (
                            <Link
                                key={idx}
                                to="/worker/profile"
                                className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 text-xs font-medium rounded-full transition-colors flex items-center gap-1"
                            >
                                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                                {item.label}
                            </Link>
                        ))}
                        {profileCompletion.missing.length > 3 && (
                            <span className="px-3 py-1.5 text-slate-400 text-xs">+{profileCompletion.missing.length - 3} autres</span>
                        )}
                    </div>
                </div>
            )}

            {/* Error Banner */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, idx) => (
                    <Link
                        key={idx}
                        to={stat.link}
                        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
                    >
                        <div>
                            <p className="text-slate-500 text-sm font-medium mb-1">{stat.label}</p>
                            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Recommended Missions Section */}
            {recommendedMissions.length > 0 && (
                <div className="mb-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-500" />
                            Missions pour vous
                        </h3>
                        <Link to="/missions" className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline">
                            Voir tout
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                        {recommendedMissions.map((mission) => (
                            <Link
                                key={mission.id}
                                to={`/missions/${mission.id}`}
                                className="p-5 hover:bg-slate-50 transition-colors group"
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    {mission.logo ? (
                                        <img src={mission.logo} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold">
                                            {mission.establishment?.[0] || 'E'}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                            {mission.title}
                                        </h4>
                                        <p className="text-sm text-slate-500 truncate">{mission.establishment}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {mission.location}
                                    </span>
                                    {mission.speciality && (
                                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                                            {mission.speciality}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity / Applications */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                                <FileText className={`w-5 h-5 text-${THEME.colors.primary.blue}-600`} />
                                Candidatures Récentes
                            </h3>
                            <Link to="/worker/applications" className={`text-sm text-${THEME.colors.primary.blue}-600 hover:text-${THEME.colors.primary.blue}-700 font-medium hover:underline`}>
                                Voir tout
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-xs font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">Mission</th>
                                        <th className="px-6 py-4">Établissement</th>
                                        <th className="px-6 py-4 text-right">Statut</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {recentApplications.map((app) => {
                                        const badgeStyle = getStatusBadgeStyle(app?.status);
                                        return (
                                            <tr key={app?.application_id || Math.random()} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 font-medium text-slate-900">
                                                    {app?.mission?.title || 'Mission Inconnue'}
                                                    <div className="text-xs text-slate-500 mt-0.5">
                                                        {app?.created_at && new Date(app.created_at).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">
                                                    {app?.mission?.establishment?.name || 'Confidentiel'}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${badgeStyle.bg} ${badgeStyle.text}`}>
                                                        {app?.status === 'ACCEPTED' ? 'Acceptée' :
                                                            app?.status === 'REJECTED' ? 'Refusée' : 'En attente'}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    {recentApplications.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-8 text-center text-slate-500 italic">
                                                Aucune activité récente.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Calendar, Activity Chart, Reminders, Quick Actions */}
                <div className="space-y-4">
                    {/* Mini Calendar */}
                    {renderMiniCalendar()}

                    {/* Activity Chart */}
                    {renderActivityChart()}

                    {/* Reminders */}
                    {renderReminders()}

                    {/* Profile Completion or Promo */}
                    {!isSubscribed && (
                        <div className={`bg-gradient-to-br from-${THEME.colors.primary.indigo}-600 to-${THEME.colors.primary.blue}-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden`}>
                            <div className="relative z-10">
                                <h3 className="font-bold text-lg mb-2">Passez au Premium 👑</h3>
                                <p className="text-indigo-100 text-sm mb-4">
                                    Accédez aux missions exclusives et augmentez votre visibilité.
                                </p>
                                <Link
                                    to="/worker/subscription"
                                    className="inline-flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:shadow-md transition-all"
                                >
                                    Voir les offres
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
                        </div>
                    )}

                    {/* Quick Links */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4">Actions Rapides</h3>
                        <div className="space-y-2">
                            <Link to="/missions" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                                <div className={`w-10 h-10 rounded-lg bg-${THEME.colors.primary.blue}-50 flex items-center justify-center text-${THEME.colors.primary.blue}-600 group-hover:scale-110 transition-transform`}>
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                <span className="text-slate-700 font-medium text-sm">Trouver une mission</span>
                            </Link>
                            <Link to="/worker/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                                <div className={`w-10 h-10 rounded-lg bg-${THEME.colors.primary.indigo}-50 flex items-center justify-center text-${THEME.colors.primary.indigo}-600 group-hover:scale-110 transition-transform`}>
                                    <FileText className="w-5 h-5" />
                                </div>
                                <span className="text-slate-700 font-medium text-sm">Mettre à jour mon CV</span>
                            </Link>
                            <Link to="/worker/calendar" className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                                <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 group-hover:scale-110 transition-transform">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <span className="text-slate-700 font-medium text-sm">Gérer mes disponibilités</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
