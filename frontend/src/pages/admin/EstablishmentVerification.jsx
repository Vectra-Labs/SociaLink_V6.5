import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Building2, Search, Clock, CheckCircle, Eye, FileText, ChevronRight,
    RefreshCw, XCircle, MapPin
} from 'lucide-react';
import api from '../../api/client';

const EstablishmentVerification = () => {
    const [establishments, setEstablishments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchEstablishments();
    }, [filter]);

    const fetchEstablishments = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/super-admin/quality/pending');

            let filtered = data?.items || [];
            if (filter === 'pending') {
                filtered = filtered.filter(e => e.status === 'PENDING');
            } else if (filter === 'validated') {
                filtered = filtered.filter(e => e.status === 'VALIDATED');
            } else if (filter === 'rejected') {
                filtered = filtered.filter(e => e.status === 'REJECTED');
            }

            setEstablishments(filtered.filter(e => e.role === 'ESTABLISHMENT'));
        } catch (error) {
            console.error('Error fetching establishments', error);
            setEstablishments([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredEstablishments = establishments.filter(est => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return est.name?.toLowerCase().includes(query) ||
            est.email?.toLowerCase().includes(query);
    });

    const getStatusBadge = (status) => {
        const config = {
            PENDING: { label: 'En attente', class: 'bg-amber-100 text-amber-700', icon: Clock },
            IN_REVIEW: { label: 'En cours', class: 'bg-blue-100 text-blue-700', icon: Eye },
            VALIDATED: { label: 'Validé', class: 'bg-green-100 text-green-700', icon: CheckCircle },
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
                    <h1 className="text-2xl font-bold text-slate-900">Vérification Établissements</h1>
                    <p className="text-slate-500">Authentifiez les documents légaux des établissements</p>
                </div>
                <button
                    onClick={fetchEstablishments}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                    <RefreshCw className="w-4 h-4" />
                    Actualiser
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'En attente', value: establishments.filter(e => e.status === 'PENDING').length, color: 'amber' },
                    { label: 'En cours', value: establishments.filter(e => e.status === 'IN_REVIEW').length, color: 'blue' },
                    { label: 'Validés', value: establishments.filter(e => e.status === 'VALIDATED').length, color: 'green' },
                    { label: 'Rejetés', value: establishments.filter(e => e.status === 'REJECTED').length, color: 'red' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                        <p className="text-sm text-slate-500">{stat.label}</p>
                        <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters & Search */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
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

                    <div className="relative flex-1 max-w-md lg:ml-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un établissement..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Establishments List */}
            {filteredEstablishments.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
                    <Building2 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">Aucun établissement trouvé</h3>
                    <p className="text-slate-500 text-sm">
                        {filter === 'pending'
                            ? 'Tous les établissements ont été traités.'
                            : 'Aucun résultat pour ce filtre.'}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="divide-y divide-slate-100">
                        {filteredEstablishments.map((establishment) => (
                            <Link
                                key={establishment.user_id}
                                to={`/admin/verification/establishments/${establishment.user_id}`}
                                className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors group"
                            >
                                {/* Logo */}
                                <div className="relative">
                                    {establishment.logo_url ? (
                                        <img
                                            src={establishment.logo_url}
                                            alt={establishment.name}
                                            className="w-14 h-14 rounded-lg object-cover border-2 border-slate-200"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                                            {establishment.name?.charAt(0) || 'E'}
                                        </div>
                                    )}
                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${establishment.status === 'PENDING' ? 'bg-amber-500' :
                                        establishment.status === 'VALIDATED' ? 'bg-green-500' :
                                            establishment.status === 'REJECTED' ? 'bg-red-500' : 'bg-blue-500'
                                        }`} />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-slate-900 truncate">
                                            {establishment.name || 'Établissement'}
                                        </h3>
                                        {getStatusBadge(establishment.status)}
                                    </div>
                                    <p className="text-sm text-slate-500 truncate">{establishment.email}</p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(establishment.created_at).toLocaleDateString('fr-FR')}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5" />
                                            {establishment.city?.name || 'Non renseignée'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <FileText className="w-3.5 h-3.5" />
                                            {establishment.documentsCount || 0} document(s)
                                        </span>
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
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EstablishmentVerification;
