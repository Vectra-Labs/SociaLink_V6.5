import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    User, Search, Filter, Clock, CheckCircle, AlertCircle,
    Eye, FileText, ChevronRight, RefreshCw, XCircle
} from 'lucide-react';
import api from '../../api/client';

const WorkerVerification = () => {
    const [workers, setWorkers] = useState([]);
    const [stats, setStats] = useState({ pending: 0, in_review: 0, validated: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending'); // pending, in_review, validated, rejected, all
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchWorkers();
    }, [filter]);

    const fetchWorkers = async () => {
        setLoading(true);
        try {
            // Fetch workers with optional status filter
            console.log('[DEBUG Frontend] Fetching from:', `/super-admin/quality/pending?status=${filter === 'all' ? '' : filter}`);
            const { data } = await api.get(`/super-admin/quality/pending?status=${filter === 'all' ? '' : filter}`);
            console.log('[DEBUG Frontend] API Response:', data);

            // Handle new API response structure
            if (data.items) {
                const workersList = data.items.filter(w => w.role === 'WORKER');
                console.log('[DEBUG Frontend] Filtered workers:', workersList);
                setWorkers(workersList);
                setStats(data.stats || { pending: 0, in_review: 0, validated: 0, rejected: 0 });
            } else {
                // Fallback for old API format
                setWorkers((data || []).filter(w => w.role === 'WORKER'));
            }
        } catch (error) {
            console.error('[DEBUG Frontend] Error fetching workers', error);
            setWorkers([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter by search query
    const filteredWorkers = workers.filter(worker => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        const fullName = `${worker.prenom || ''} ${worker.nom || ''}`.toLowerCase();
        return fullName.includes(query) || worker.email?.toLowerCase().includes(query);
    });

    const getStatusBadge = (status) => {
        const config = {
            PENDING: { label: 'En attente', class: 'bg-amber-100 text-amber-700', icon: Clock },
            IN_REVIEW: { label: 'En cours', class: 'bg-blue-100 text-blue-700', icon: Eye },
            VALIDATED: { label: 'Validé', class: 'bg-green-100 text-green-700', icon: CheckCircle },
            VERIFIED: { label: 'Vérifié', class: 'bg-green-100 text-green-700', icon: CheckCircle },
            REJECTED: { label: 'Rejeté', class: 'bg-red-100 text-red-700', icon: XCircle },
        };
        const cfg = config[status] || config.PENDING;
        const Icon = cfg.icon;
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${cfg.class}`}>
                <Icon className="w-3.5 h-3.5" />
                {cfg.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-20 bg-slate-200 rounded-xl animate-pulse" />
                <div className="h-16 bg-slate-200 rounded-xl animate-pulse" />
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-slate-200 rounded-xl animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Vérification Travailleurs</h1>
                    <p className="text-slate-500">Authentifiez et validez les profils des travailleurs</p>
                </div>
                <button
                    onClick={fetchWorkers}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                    <RefreshCw className="w-4 h-4" />
                    Actualiser
                </button>
            </div>

            {/* Stats Cards - Using backend stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'En attente', value: stats.pending, color: 'amber' },
                    { label: 'En cours', value: stats.in_review, color: 'blue' },
                    { label: 'Validés', value: stats.validated, color: 'green' },
                    { label: 'Rejetés', value: stats.rejected, color: 'red' },
                ].map((stat) => (
                    <div key={stat.label} className={`bg-white rounded-xl border border-slate-200 p-4 shadow-sm`}>
                        <p className="text-sm text-slate-500">{stat.label}</p>
                        <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters & Search */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Status Tabs */}
                    <div className="flex flex-wrap gap-2">
                        {[
                            { value: 'pending', label: 'En attente' },
                            { value: 'in_review', label: 'En cours' },
                            { value: 'validated', label: 'Validés' },
                            { value: 'rejected', label: 'Rejetés' },
                            { value: 'all', label: 'Tous' },
                        ].map(tab => (
                            <button
                                key={tab.value}
                                onClick={() => setFilter(tab.value)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filter === tab.value
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative flex-1 max-w-md lg:ml-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un travailleur..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Workers List */}
            {filteredWorkers.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
                    <User className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">Aucun travailleur trouvé</h3>
                    <p className="text-slate-500 text-sm">
                        {filter === 'pending'
                            ? 'Tous les profils ont été traités. Bravo !'
                            : 'Aucun résultat pour ce filtre.'}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="divide-y divide-slate-100">
                        {filteredWorkers.map((worker) => {
                            const completeness = worker.profileCompleteness || 50;

                            return (
                                <Link
                                    key={worker.user_id}
                                    to={`/admin/verification/workers/${worker.user_id}`}
                                    className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors group"
                                >
                                    {/* Avatar */}
                                    <div className="relative">
                                        {worker.profile_picture ? (
                                            <img
                                                src={worker.profile_picture}
                                                alt={worker.prenom}
                                                className="w-14 h-14 rounded-full object-cover border-2 border-slate-200"
                                            />
                                        ) : (
                                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                {worker.prenom?.charAt(0) || 'T'}
                                            </div>
                                        )}
                                        {/* Status dot */}
                                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${worker.status === 'PENDING' ? 'bg-amber-500' :
                                            worker.status === 'VALIDATED' ? 'bg-green-500' :
                                                worker.status === 'REJECTED' ? 'bg-red-500' : 'bg-blue-500'
                                            }`} />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-slate-900 truncate">
                                                {worker.prenom || 'Prénom'} {worker.nom || 'Nom'}
                                            </h3>
                                            {getStatusBadge(worker.status)}
                                        </div>
                                        <p className="text-sm text-slate-500 truncate">{worker.email}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {new Date(worker.created_at).toLocaleDateString('fr-FR')}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FileText className="w-3.5 h-3.5" />
                                                {worker.documentsCount || 0} document(s)
                                            </span>
                                        </div>
                                    </div>

                                    {/* Completeness */}
                                    <div className="hidden sm:block text-center">
                                        <div className="w-16">
                                            <div className="relative w-12 h-12 mx-auto">
                                                <svg className="w-12 h-12 transform -rotate-90">
                                                    <circle
                                                        cx="24"
                                                        cy="24"
                                                        r="20"
                                                        fill="none"
                                                        stroke="#e2e8f0"
                                                        strokeWidth="4"
                                                    />
                                                    <circle
                                                        cx="24"
                                                        cy="24"
                                                        r="20"
                                                        fill="none"
                                                        stroke={completeness >= 80 ? '#22c55e' : completeness >= 50 ? '#f59e0b' : '#ef4444'}
                                                        strokeWidth="4"
                                                        strokeDasharray={`${completeness * 1.26} 126`}
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">
                                                    {completeness}%
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1">Profil</p>
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <div className="flex items-center gap-2">
                                        <span className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg group-hover:bg-blue-700 transition-colors flex items-center gap-2">
                                            <Eye className="w-4 h-4" />
                                            Examiner
                                        </span>
                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkerVerification;
