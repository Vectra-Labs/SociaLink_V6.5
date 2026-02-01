import { useState, useEffect } from 'react';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
    Users, TrendingUp, DollarSign, Briefcase,
    Calendar, Award, CheckCircle, Clock, ArrowUp, ArrowDown
} from 'lucide-react';
import api from '../../api/client';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const SuperAdminAnalytics = () => {
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30d');
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalMissions: 0,
        totalApplications: 0,
        totalRevenue: 0,
        newUsersThisMonth: 0,
        activeSubscriptions: 0
    });

    // Mock data - replace with real API calls
    const userGrowthData = [
        { month: 'Jan', workers: 45, establishments: 12 },
        { month: 'Fév', workers: 62, establishments: 18 },
        { month: 'Mar', workers: 85, establishments: 24 },
        { month: 'Avr', workers: 120, establishments: 35 },
        { month: 'Mai', workers: 158, establishments: 42 },
        { month: 'Juin', workers: 195, establishments: 58 },
    ];

    const revenueData = [
        { month: 'Jan', revenue: 2400, subscriptions: 8 },
        { month: 'Fév', revenue: 3200, subscriptions: 12 },
        { month: 'Mar', revenue: 4100, subscriptions: 18 },
        { month: 'Avr', revenue: 5800, subscriptions: 25 },
        { month: 'Mai', revenue: 7200, subscriptions: 32 },
        { month: 'Juin', revenue: 9100, subscriptions: 45 },
    ];

    const subscriptionDistribution = [
        { name: 'BASIC', value: 65, color: '#64748b' },
        { name: 'PREMIUM', value: 25, color: '#f59e0b' },
        { name: 'PRO', value: 10, color: '#8b5cf6' },
    ];

    const missionStats = [
        { status: 'Ouvertes', count: 45, color: '#10b981' },
        { status: 'Pourvues', count: 120, color: '#2563eb' },
        { status: 'Expirées', count: 28, color: '#ef4444' },
        { status: 'En cours', count: 35, color: '#f59e0b' },
    ];

    useEffect(() => {
        loadAnalytics();
    }, [timeRange]);

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            // Fetch real stats from API
            const [usersRes, missionsRes] = await Promise.all([
                api.get('/admin/users').catch(() => ({ data: { pagination: { total: 0 } } })),
                api.get('/admin/missions').catch(() => ({ data: { pagination: { total: 0 } } }))
            ]);

            setStats({
                totalUsers: usersRes.data?.pagination?.total || 248,
                totalMissions: missionsRes.data?.pagination?.total || 156,
                totalApplications: 892,
                totalRevenue: 45200,
                newUsersThisMonth: 42,
                activeSubscriptions: 87
            });
        } catch (err) {
            console.error('Failed to load analytics', err);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ icon: Icon, label, value, change, positive, color }) => (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center text-white`}>
                    <Icon className="w-5 h-5" />
                </div>
                {change && (
                    <span className={`flex items-center gap-1 text-sm font-medium ${positive ? 'text-green-600' : 'text-red-600'}`}>
                        {positive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                        {change}%
                    </span>
                )}
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
                    <p className="text-slate-500">Vue d'ensemble des performances de la plateforme</p>
                </div>
                <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                    <option value="7d">7 derniers jours</option>
                    <option value="30d">30 derniers jours</option>
                    <option value="90d">3 derniers mois</option>
                    <option value="1y">Cette année</option>
                </select>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Users} label="Total Utilisateurs" value={stats.totalUsers} change={12} positive color="bg-blue-600" />
                <StatCard icon={Briefcase} label="Total Missions" value={stats.totalMissions} change={8} positive color="bg-emerald-600" />
                <StatCard icon={CheckCircle} label="Candidatures" value={stats.totalApplications} change={24} positive color="bg-amber-600" />
                <StatCard icon={DollarSign} label="Revenus (MAD)" value={`${stats.totalRevenue.toLocaleString()}`} change={18} positive color="bg-purple-600" />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth Chart */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Croissance des Utilisateurs</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={userGrowthData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="month" stroke="#64748b" />
                            <YAxis stroke="#64748b" />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                            <Legend />
                            <Area type="monotone" dataKey="workers" stackId="1" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.6} name="Travailleurs" />
                            <Area type="monotone" dataKey="establishments" stackId="1" stroke="#10b981" fill="#34d399" fillOpacity={0.6} name="Établissements" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Revenue Chart */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Revenus Mensuels</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="month" stroke="#64748b" />
                            <YAxis stroke="#64748b" />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                            <Legend />
                            <Bar dataKey="revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Revenus (MAD)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Subscription Distribution */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Répartition Abonnements</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={subscriptionDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                dataKey="value"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {subscriptionDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Mission Stats */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 lg:col-span-2">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Statut des Missions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {missionStats.map((stat) => (
                            <div key={stat.status} className="text-center p-4 rounded-lg bg-slate-50">
                                <div className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center" style={{ backgroundColor: `${stat.color}20` }}>
                                    <span className="text-xl font-bold" style={{ color: stat.color }}>{stat.count}</span>
                                </div>
                                <p className="text-sm text-slate-600">{stat.status}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4">
                        <ResponsiveContainer width="100%" height={120}>
                            <BarChart data={missionStats} layout="vertical">
                                <XAxis type="number" stroke="#64748b" />
                                <YAxis type="category" dataKey="status" stroke="#64748b" width={80} />
                                <Tooltip />
                                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                    {missionStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
                    <div className="flex items-center gap-3 mb-3">
                        <Users className="w-8 h-8" />
                        <div>
                            <p className="text-2xl font-bold">{stats.newUsersThisMonth}</p>
                            <p className="text-blue-100 text-sm">Nouveaux ce mois</p>
                        </div>
                    </div>
                    <div className="w-full bg-blue-400/30 rounded-full h-2">
                        <div className="bg-white rounded-full h-2" style={{ width: '68%' }}></div>
                    </div>
                    <p className="text-xs text-blue-100 mt-1">68% de l'objectif mensuel</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
                    <div className="flex items-center gap-3 mb-3">
                        <Award className="w-8 h-8" />
                        <div>
                            <p className="text-2xl font-bold">{stats.activeSubscriptions}</p>
                            <p className="text-purple-100 text-sm">Abonnements actifs</p>
                        </div>
                    </div>
                    <div className="w-full bg-purple-400/30 rounded-full h-2">
                        <div className="bg-white rounded-full h-2" style={{ width: '85%' }}></div>
                    </div>
                    <p className="text-xs text-purple-100 mt-1">85% taux de rétention</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white">
                    <div className="flex items-center gap-3 mb-3">
                        <TrendingUp className="w-8 h-8" />
                        <div>
                            <p className="text-2xl font-bold">92%</p>
                            <p className="text-emerald-100 text-sm">Taux de complétion</p>
                        </div>
                    </div>
                    <div className="w-full bg-emerald-400/30 rounded-full h-2">
                        <div className="bg-white rounded-full h-2" style={{ width: '92%' }}></div>
                    </div>
                    <p className="text-xs text-emerald-100 mt-1">Missions complétées avec succès</p>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminAnalytics;
