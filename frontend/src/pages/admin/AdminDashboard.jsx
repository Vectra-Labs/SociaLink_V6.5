import { useState, useEffect } from 'react';
import {
    Users, FileCheck, Briefcase, ChevronRight, RefreshCw,
    Clock, CheckCircle, AlertCircle, Building2, User,
    ArrowRight, Calendar, Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { adminService } from '../../services/admin.service';
import api from '../../api/client';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Task queues
    const [pendingProfiles, setPendingProfiles] = useState([]);
    const [pendingDocuments, setPendingDocuments] = useState([]);
    const [pendingMissions, setPendingMissions] = useState([]);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setRefreshing(true);

            // Fetch all pending items in parallel
            const [profilesRes, docsRes] = await Promise.all([
                api.get('/super-admin/quality/pending').catch(() => ({ data: [] })),
                api.get('/admin/establishment-documents?status=PENDING').catch(() => ({ data: [] }))
            ]);

            setPendingProfiles(profilesRes.data?.items || []);
            setPendingDocuments(docsRes.data || []);
            // TODO: Add missions API when available
            setPendingMissions([]);

        } catch (error) {
            console.error('Error fetching tasks', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
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
            month: 'long',
            year: 'numeric'
        });
    };

    const adminName = user?.prenom || user?.first_name || 'Admin';

    // Task Card Component
    const TaskCard = ({ title, icon: Icon, count, items, link, color, emptyMessage }) => (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className={`p-4 border-b border-slate-100 bg-gradient-to-r ${color}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">{title}</h3>
                            <p className="text-white/80 text-sm">
                                {count} {count === 1 ? 'élément' : 'éléments'} en attente
                            </p>
                        </div>
                    </div>
                    {count > 0 && (
                        <span className="bg-white/20 backdrop-blur-sm text-white text-xl font-bold px-3 py-1 rounded-lg">
                            {count}
                        </span>
                    )}
                </div>
            </div>

            {/* Items List */}
            <div className="divide-y divide-slate-50">
                {items.length === 0 ? (
                    <div className="p-8 text-center">
                        <CheckCircle className="w-12 h-12 text-green-200 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">{emptyMessage}</p>
                        <p className="text-sm text-slate-400 mt-1">Aucune action requise</p>
                    </div>
                ) : (
                    <>
                        {items.slice(0, 4).map((item, index) => (
                            <div key={item.id || index} className="p-4 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                                            {item.type === 'worker' || item.role === 'WORKER' ? (
                                                <User className="w-5 h-5 text-blue-600" />
                                            ) : (
                                                <Building2 className="w-5 h-5 text-purple-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-800 text-sm">
                                                {item.prenom || item.name} {item.nom || ''}
                                            </p>
                                            <p className="text-xs text-slate-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(item.created_at).toLocaleDateString('fr-FR')}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${item.role === 'WORKER' || item.type === 'worker'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-purple-100 text-purple-700'
                                        }`}>
                                        {item.role === 'WORKER' || item.type === 'worker' ? 'Travailleur' : 'Établissement'}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {items.length > 4 && (
                            <div className="p-3 bg-slate-50 text-center">
                                <span className="text-sm text-slate-500">
                                    + {items.length - 4} autres éléments
                                </span>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Footer Action */}
            <Link
                to={link}
                className="flex items-center justify-center gap-2 p-4 border-t border-slate-100 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors group"
            >
                {count > 0 ? 'Traiter maintenant' : 'Voir la section'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
    );

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-24 bg-slate-200 rounded-2xl" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-80 bg-slate-200 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    const totalTasks = pendingProfiles.length + pendingDocuments.length + pendingMissions.length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">
                            {getGreeting()}, {adminName} 👋
                        </h1>
                        <p className="text-slate-400 mt-1 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span className="capitalize">{formatDate()}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchTasks}
                            disabled={refreshing}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                            title="Actualiser"
                        >
                            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                        {totalTasks > 0 ? (
                            <div className="bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {totalTasks} tâche{totalTasks > 1 ? 's' : ''} en attente
                            </div>
                        ) : (
                            <div className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Tout est à jour
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{pendingProfiles.length}</p>
                                <p className="text-sm text-slate-400">Profils à valider</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center">
                                <FileCheck className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{pendingDocuments.length}</p>
                                <p className="text-sm text-slate-400">Documents à vérifier</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                                <Briefcase className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{pendingMissions.length}</p>
                                <p className="text-sm text-slate-400">Missions à approuver</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Task Queues */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <TaskCard
                    title="Authentification Travailleurs"
                    icon={Users}
                    count={pendingProfiles.filter(p => p.role === 'WORKER').length}
                    items={pendingProfiles.filter(p => p.role === 'WORKER')}
                    link="/admin/verification/workers"
                    color="from-blue-600 to-blue-700"
                    emptyMessage="Tous les profils sont validés"
                />
                <TaskCard
                    title="Authentification Établissements"
                    icon={Building2}
                    count={pendingProfiles.filter(p => p.role === 'ESTABLISHMENT').length}
                    items={pendingProfiles.filter(p => p.role === 'ESTABLISHMENT')}
                    link="/admin/verification/establishments"
                    color="from-sky-500 to-cyan-600"
                    emptyMessage="Tous les établissements sont validés"
                />
                <TaskCard
                    title="Approbation Missions"
                    icon={Briefcase}
                    count={pendingMissions.length}
                    items={pendingMissions}
                    link="/admin/missions"
                    color="from-indigo-500 to-blue-600"
                    emptyMessage="Toutes les missions sont approuvées"
                />
            </div>

            {/* Today's Activity Summary */}
            {totalTasks === 0 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-green-800 text-lg">Excellent travail !</h3>
                            <p className="text-green-600">
                                Toutes les tâches ont été traitées. Revenez plus tard pour de nouvelles validations.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
