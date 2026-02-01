import { useState, useEffect } from 'react';
import {
    TrendingUp, Users, Building2, AlertCircle,
    FileText, Plus, ChevronDown, CheckCircle, Activity, LayoutDashboard
} from 'lucide-react';
import api from '../../api/client';
import { useNavigate } from 'react-router-dom';

const SuperAdminOverview = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [data, setData] = useState({
        users: { workers: 0, establishments: 0, pending: 0 },
        missions: { total: 0, active: 0, completed: 0 },
        revenue: { total: 0, workers: 0, establishments: 0 },
        recentActivity: []
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/super-admin/stats');
                setData(response.data);
            } catch (error) {
                console.error("Failed to fetch stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // Export Report as CSV
    const handleExportReport = () => {
        setExporting(true);
        try {
            const now = new Date().toLocaleDateString('fr-FR');
            const rows = [
                ['Rapport SociaLink - Vue d\'ensemble', ''],
                ['Date d\'export', now],
                ['', ''],
                ['UTILISATEURS', ''],
                ['Travailleurs', data.users.workers],
                ['Établissements', data.users.establishments],
                ['Comptes en attente', data.users.pending],
                ['', ''],
                ['MISSIONS', ''],
                ['Total missions', data.missions.total],
                ['Missions actives', data.missions.active],
                ['Missions terminées', data.missions.completed],
                ['', ''],
                ['REVENUS', ''],
                ['Revenus totaux (centimes)', data.revenue.total],
                ['Revenus travailleurs', data.revenue.workers],
                ['Revenus établissements', data.revenue.establishments],
            ];

            const csvContent = rows.map(row => row.join(',')).join('\n');
            const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `rapport_socialink_${now.replace(/\//g, '-')}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Convert Revenue from Cents to DH
    const revenueDH = data.revenue.total / 100;
    const workerRevenueDH = data.revenue.workers / 100;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <LayoutDashboard className="w-6 h-6 text-blue-600" />
                        Vue d'ensemble
                    </h1>
                    <p className="text-slate-500 mt-1">Statistiques clés en temps réel.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportReport}
                        disabled={exporting}
                        className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 shadow-sm transition-all disabled:opacity-50"
                    >
                        <FileText className="w-4 h-4" />
                        {exporting ? 'Export...' : 'Exporter Rapport'}
                    </button>
                    <button
                        onClick={() => navigate('/super-admin/admins')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-200 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Nouvel Admin
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                {/* REVENUS */}
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Revenus (MRR)</p>
                        <div className="p-2 bg-green-50 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 mt-2">
                        {revenueDH.toLocaleString('fr-MA')} <span className="text-lg font-normal text-slate-500">DH</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-2">
                        <span className="text-green-600 font-medium flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1" /> +0%
                        </span>
                        depuis le mois dernier
                    </p>
                </div>

                {/* TRAVAILLEURS */}
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Travailleurs</p>
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{data.users.workers}</p>
                    <p className="text-xs text-slate-500 mt-2">
                        Dont <span className="text-blue-600 font-medium">{workerRevenueDH > 0 ? 'Quelques' : '0'} abonnés</span>
                    </p>
                </div>

                {/* ÉTABLISSEMENTS */}
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Établissements</p>
                        <div className="p-2 bg-indigo-50 rounded-lg">
                            <Building2 className="w-5 h-5 text-indigo-600" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{data.users.establishments}</p>
                    <div className="flex gap-2 mt-2">
                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">{data.missions.active} missions actives</span>
                    </div>
                </div>

                {/* MISSIONS & ALERTS */}
                <div className="bg-white rounded-xl p-6 border border-red-100 bg-red-50/30 shadow-sm relative overflow-hidden group cursor-pointer hover:border-red-200 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-red-600 font-medium uppercase tracking-wide">Actions Requises</p>
                        <AlertCircle className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{data.users.pending}</p>
                    <p className="text-xs text-red-600/80 font-medium mt-2">Comptes en attente de validation</p>
                </div>
            </div>

            {/* Charts & Config Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart Placeholder */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-slate-900">Activité de la Plateforme</h3>
                            <p className="text-sm text-slate-500">Missions vs Nouvelles Inscriptions (30j)</p>
                        </div>
                        <select className="text-sm border-slate-200 rounded-lg text-slate-600 px-2 py-1 outline-none bg-slate-50">
                            <option>30 derniers jours</option>
                            <option>Cette année</option>
                        </select>
                    </div>
                    <div className="h-64 flex flex-col items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                        <Activity className="w-10 h-10 text-slate-300 mb-2" />
                        <p className="text-slate-400 text-sm font-medium">Les graphiques seront disponibles prochainement</p>
                        <p className="text-slate-400 text-xs">Données collectées : {data.missions.total} missions totales</p>
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="bg-white rounded-xl border border-slate-200 p-0 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-900">Activité Récente</h3>
                        <span className="text-xs bg-white border border-slate-200 px-2 py-1 rounded-full text-slate-500 font-mono">Live</span>
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-[300px] p-4 space-y-4">
                        {data.recentActivity && data.recentActivity.length > 0 ? (
                            data.recentActivity.map((log) => (
                                <div key={log.log_id} className="flex gap-3">
                                    <div className="mt-1">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 ring-4 ring-blue-50"></div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-800">
                                            <span className="font-semibold text-slate-900">{log.admin?.email?.split('@')[0]}</span> a effectué <span className="font-mono text-xs bg-slate-100 px-1 rounded text-slate-600">{log.action}</span>
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {new Date(log.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-400 text-sm">
                                Aucune activité récente
                            </div>
                        )}
                    </div>

                    <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-center">
                        <button onClick={() => navigate('/super-admin/admins')} className="text-xs text-blue-600 font-medium hover:underline">
                            Voir tout le journal d'audit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminOverview;
