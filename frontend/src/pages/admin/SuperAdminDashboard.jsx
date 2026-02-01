import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Users, Building2, ShieldCheck, CreditCard, Settings, TrendingUp,
    AlertCircle, Plus, FileText, DollarSign, Crown, ArrowUpRight,
    ArrowRight, BarChart3, Zap, Activity, Shield, UserCheck, Briefcase,
    Calendar, Award, RefreshCw, ChevronRight, Bell, MessageSquare, Eye
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/client';
import { superAdminService } from '../../services/superadmin.service';

const SuperAdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        revenue: 0,
        revenueGrowth: 12,
        activeWorkers: 0,
        workerGrowth: 8,
        establishments: 0,
        establishmentGrowth: 15,
        pendingAccounts: 0,
        activeSubscriptions: 0,
        totalMissions: 0
    });
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recentActivity, setRecentActivity] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [criticalAlerts, setCriticalAlerts] = useState([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, adminsRes, financeRes] = await Promise.all([
                superAdminService.getDashboardStats().catch(() => null),
                superAdminService.getAdmins().catch(() => []),
                superAdminService.getFinancialStats().catch(() => null)
            ]);

            if (statsRes) {
                setStats(prev => ({
                    ...prev,
                    revenue: statsRes.revenue?.total || 0,
                    activeWorkers: statsRes.users?.workers || 0,
                    establishments: statsRes.users?.establishments || 0,
                    pendingAccounts: statsRes.users?.pending || 0,
                    activeSubscriptions: statsRes.revenue?.activeSubscriptions || 0,
                    totalMissions: statsRes.missions?.total || 0
                }));

                if (statsRes.recentActivity) {
                    setRecentActivity(statsRes.recentActivity.map(log => ({
                        id: log.log_id,
                        type: log.target_type === 'USER' ? 'user' : log.target_type === 'PLAN' ? 'subscription' : 'system',
                        message: `${log.action}`,
                        time: new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    })));
                }
            }

            if (financeRes) {
                setStats(prev => ({
                    ...prev,
                    revenue: financeRes.totalRevenue || prev.revenue,
                    activeSubscriptions: financeRes.activeSubscriptions || prev.activeSubscriptions
                }));
                if (financeRes.chartData) {
                    setChartData(financeRes.chartData);
                }
            }

            if (adminsRes) {
                setAdmins(adminsRes);
            }

            // Mock chart data if not available
            if (!chartData.length) {
                setChartData([
                    { name: 'Jan', value: 45 },
                    { name: 'Fév', value: 62 },
                    { name: 'Mar', value: 58 },
                    { name: 'Avr', value: 71 },
                    { name: 'Mai', value: 85 },
                    { name: 'Juin', value: 92 }
                ]);
            }

        } catch (error) {
            console.error("Error loading dashboard", error);
        } finally {
            setLoading(false);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bonjour';
        if (hour < 18) return 'Bon après-midi';
        return 'Bonsoir';
    };

    const formatDate = () => {
        return new Date().toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    };

    // Revenue Chart Component
    const RevenueChart = () => {
        const maxVal = Math.max(...chartData.map(d => d.value), 1);
        return (
            <div className="flex items-end justify-between gap-3 h-40 px-4">
                {chartData.map((item, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                        <span className="text-xs font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            {item.value}K DH
                        </span>
                        <div
                            className="w-full bg-gradient-to-t from-purple-600 to-indigo-500 rounded-t-lg transition-all duration-300 group-hover:from-purple-700 group-hover:to-indigo-600 shadow-lg shadow-purple-500/20"
                            style={{ height: `${(item.value / maxVal) * 100}%`, minHeight: '20px' }}
                        />
                        <span className="text-xs text-slate-500 font-medium">{item.name}</span>
                    </div>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                {/* Header Skeleton */}
                <div className="flex justify-between items-center">
                    <div>
                        <div className="h-8 w-72 bg-slate-200 rounded-lg mb-2" />
                        <div className="h-4 w-48 bg-slate-100 rounded" />
                    </div>
                    <div className="flex gap-2">
                        <div className="h-10 w-32 bg-slate-200 rounded-lg" />
                        <div className="h-10 w-36 bg-purple-200 rounded-lg" />
                    </div>
                </div>
                {/* KPI Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 h-36" />
                    ))}
                </div>
                {/* Content Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-2xl h-72 border border-slate-200" />
                    <div className="bg-white rounded-2xl h-72 border border-slate-200" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {getGreeting()}, Super Admin 👑
                    </h1>
                    <p className="text-slate-500 mt-1 capitalize">{formatDate()}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={loadDashboardData}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Actualiser"
                    >
                        <RefreshCw className="w-5 h-5 text-slate-500" />
                    </button>
                    <Link
                        to="/super-admin/settings"
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        <Settings className="w-4 h-4" />
                        Paramètres
                    </Link>
                    <Link
                        to="/super-admin/admins"
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/20"
                    >
                        <Plus className="w-4 h-4" />
                        Nouvel Admin
                    </Link>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Revenue */}
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white relative overflow-hidden hover:shadow-lg hover:shadow-emerald-500/20 transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> +{stats.revenueGrowth}%
                            </span>
                        </div>
                        <p className="text-white/80 text-sm">Revenus Totaux</p>
                        <p className="text-3xl font-bold mt-1">{stats.revenue.toLocaleString()} DH</p>
                        <p className="text-white/60 text-xs mt-2">Ce mois</p>
                    </div>
                </div>

                {/* Active Workers */}
                <Link to="/super-admin/users?role=WORKER" className="group">
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all h-full">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> +{stats.workerGrowth}%
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm">Intervenants Actifs</p>
                        <div className="flex items-end justify-between mt-1">
                            <p className="text-3xl font-bold text-slate-900">{stats.activeWorkers}</p>
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 group-hover:text-blue-500 transition-all" />
                        </div>
                    </div>
                </Link>

                {/* Establishments */}
                <Link to="/super-admin/users?role=ESTABLISHMENT" className="group">
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-200 transition-all h-full">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-purple-600" />
                            </div>
                            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> +{stats.establishmentGrowth}%
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm">Établissements</p>
                        <div className="flex items-end justify-between mt-1">
                            <p className="text-3xl font-bold text-slate-900">{stats.establishments}</p>
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 group-hover:text-purple-500 transition-all" />
                        </div>
                    </div>
                </Link>

                {/* Pending Accounts */}
                <Link to="/super-admin/quality" className="group">
                    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-200 transition-all relative overflow-hidden h-full">
                        {stats.pendingAccounts > 0 && (
                            <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-bl-lg flex items-center gap-1">
                                <Zap className="w-3 h-3" /> Action
                            </div>
                        )}
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                <UserCheck className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>
                        <p className="text-slate-500 text-sm">Comptes en Attente</p>
                        <div className="flex items-end justify-between mt-1">
                            <p className="text-3xl font-bold text-slate-900">{stats.pendingAccounts}</p>
                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 group-hover:text-amber-500 transition-all" />
                        </div>
                    </div>
                </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Crown className="w-5 h-5 text-purple-600" />
                    Actions Super Admin
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                    <Link to="/super-admin/users" className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all group">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-blue-600/20">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs font-medium text-slate-700 text-center">Utilisateurs</span>
                    </Link>
                    <Link to="/super-admin/admins" className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all group">
                        <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-purple-600/20">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs font-medium text-slate-700 text-center">Admins</span>
                    </Link>
                    <Link to="/super-admin/subscriptions" className="flex flex-col items-center gap-2 p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all group">
                        <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-emerald-600/20">
                            <Crown className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs font-medium text-slate-700 text-center">Abonnements</span>
                    </Link>
                    <Link to="/super-admin/finance" className="flex flex-col items-center gap-2 p-4 bg-amber-50 hover:bg-amber-100 rounded-xl transition-all group">
                        <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/20">
                            <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs font-medium text-slate-700 text-center">Finance</span>
                    </Link>
                    <Link to="/super-admin/quality" className="flex flex-col items-center gap-2 p-4 bg-cyan-50 hover:bg-cyan-100 rounded-xl transition-all group">
                        <div className="w-12 h-12 bg-cyan-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-cyan-600/20">
                            <Award className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs font-medium text-slate-700 text-center">Qualité</span>
                    </Link>
                    <Link to="/super-admin/marketing" className="flex flex-col items-center gap-2 p-4 bg-pink-50 hover:bg-pink-100 rounded-xl transition-all group">
                        <div className="w-12 h-12 bg-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-pink-600/20">
                            <Bell className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs font-medium text-slate-700 text-center">Marketing</span>
                    </Link>
                    <Link to="/super-admin/settings" className="flex flex-col items-center gap-2 p-4 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all group">
                        <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-slate-700/20">
                            <Settings className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs font-medium text-slate-700 text-center">Paramètres</span>
                    </Link>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-slate-900">Évolution des Revenus</h3>
                            <p className="text-sm text-slate-500">Derniers 6 mois</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> +{stats.revenueGrowth}%
                            </span>
                        </div>
                    </div>
                    <RevenueChart />
                </div>

                {/* Quick Stats */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
                    <h3 className="font-bold mb-6 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Vue d'Ensemble
                    </h3>
                    <div className="space-y-5">
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                    <Crown className="w-5 h-5 text-emerald-400" />
                                </div>
                                <span className="text-slate-300">Abonnements actifs</span>
                            </div>
                            <span className="font-bold text-lg">{stats.activeSubscriptions}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                    <Briefcase className="w-5 h-5 text-blue-400" />
                                </div>
                                <span className="text-slate-300">Missions totales</span>
                            </div>
                            <span className="font-bold text-lg">{stats.totalMissions}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                    <ShieldCheck className="w-5 h-5 text-purple-400" />
                                </div>
                                <span className="text-slate-300">Administrateurs</span>
                            </div>
                            <span className="font-bold text-lg">{admins.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Admin Team */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between p-5 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <ShieldCheck className="w-4 h-4 text-purple-600" />
                            </div>
                            <h3 className="font-bold text-slate-900">Équipe Admin</h3>
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                                {admins.length}
                            </span>
                        </div>
                        <Link to="/super-admin/admins" className="text-sm text-purple-600 hover:underline flex items-center gap-1">
                            Gérer <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="p-4 space-y-3">
                        {admins.slice(0, 4).map((admin) => (
                            <div key={admin.user_id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden ${admin.role === 'SUPER_ADMIN'
                                            ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                                            : 'bg-gradient-to-br from-blue-400 to-cyan-500'
                                        }`}>
                                        {admin.adminProfile?.profile_pic_url ? (
                                            <img src={admin.adminProfile.profile_pic_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <>{admin.adminProfile?.first_name?.[0] || admin.email?.[0]?.toUpperCase()}</>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-800 text-sm">
                                            {admin.adminProfile?.first_name && admin.adminProfile?.last_name
                                                ? `${admin.adminProfile.first_name} ${admin.adminProfile.last_name}`
                                                : admin.email}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {admin.adminProfile?.department || (admin.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${admin.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {admin.role === 'SUPER_ADMIN' ? 'Super' : 'Admin'}
                                    </span>
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full" title="En ligne" />
                                </div>
                            </div>
                        ))}
                        {admins.length === 0 && (
                            <div className="text-center py-6 text-slate-400">
                                <ShieldCheck className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                <p>Aucun administrateur</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Subscription Plans Preview */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between p-5 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                                <Crown className="w-4 h-4 text-amber-600" />
                            </div>
                            <h3 className="font-bold text-slate-900">Offres d'Abonnement</h3>
                        </div>
                        <Link to="/super-admin/subscriptions" className="text-sm text-purple-600 hover:underline flex items-center gap-1">
                            Configurer <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white hover:shadow-lg hover:shadow-blue-500/20 transition-all">
                            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Travailleur</span>
                            <h4 className="font-bold text-lg mt-3">Pro Connect</h4>
                            <p className="text-blue-200 text-sm">Accès complet</p>
                            <p className="mt-4">
                                <span className="text-3xl font-bold">99</span>
                                <span className="text-blue-200"> DH /mois</span>
                            </p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl text-white hover:shadow-lg hover:shadow-slate-800/20 transition-all">
                            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Établissement</span>
                            <h4 className="font-bold text-lg mt-3">Corporate</h4>
                            <p className="text-slate-400 text-sm">Recrutement illimité</p>
                            <p className="mt-4">
                                <span className="text-3xl font-bold">499</span>
                                <span className="text-slate-400"> DH /mois</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* System Status */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">État du Système</h3>
                            <p className="text-sm text-slate-600">
                                Tous les services fonctionnent correctement
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-2 text-slate-600">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full" /> API
                            </span>
                            <span className="flex items-center gap-2 text-slate-600">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full" /> Base de données
                            </span>
                            <span className="flex items-center gap-2 text-slate-600">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full" /> Paiements
                            </span>
                        </div>
                        <div className="px-3 py-1.5 bg-emerald-100 rounded-full flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-sm font-medium text-emerald-700">Opérationnel</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
