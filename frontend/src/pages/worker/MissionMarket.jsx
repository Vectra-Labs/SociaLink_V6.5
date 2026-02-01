import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../context/SubscriptionContext';
import { FeatureGuard, LimitCounter, BlurredContent } from '../../components/subscription';
import {
    Briefcase, MapPin, Calendar, Clock, Search, Filter,
    ChevronRight, ChevronLeft, Sparkles, X, Building2,
    Lock, CheckCircle2, ArrowUpRight, Zap, Eye, Ban,
    CheckCircle, Loader, AlertCircle, FileText, Play, Flag
} from 'lucide-react';

const ITEMS_PER_PAGE = 9;

// Tab configuration
const TABS = [
    { id: 'DISCOVER', label: 'Découvrir', icon: Search, color: 'blue' },
    { id: 'PENDING', label: 'En attente', icon: Clock, color: 'slate' },
    { id: 'ACCEPTED', label: 'Acceptées', icon: CheckCircle, color: 'indigo' },
    { id: 'IN_PROGRESS', label: 'En cours', icon: Play, color: 'blue' },
    { id: 'COMPLETED', label: 'Terminées', icon: Flag, color: 'slate' },
    { id: 'REJECTED', label: 'Refusées', icon: Ban, color: 'red' },
];

export default function UnifiedMissions() {
    const { user } = useAuth();
    const { isSubscribed, getLimit, canAccess } = useSubscription();

    // Tab state
    const [activeTab, setActiveTab] = useState('DISCOVER');

    // Data
    const [missions, setMissions] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(null);
    const [processingId, setProcessingId] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [showUrgentOnly, setShowUrgentOnly] = useState(false);
    const [selectedCity, setSelectedCity] = useState('');
    const [sortBy, setSortBy] = useState('recent');
    const [currentPage, setCurrentPage] = useState(1);

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [missionsRes, appsRes] = await Promise.all([
                    api.get('/missions/all').catch(() => ({ data: { data: [] } })),
                    api.get('/applications/my-applications').catch(() => ({ data: { data: [] } }))
                ]);
                setMissions(missionsRes.data.data || []);
                setApplications(appsRes.data.data || []);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Auto-dismiss messages
    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => setMessage({ type: '', text: '' }), 4000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    // Reset pagination on filter/tab change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchQuery, selectedCity, showUrgentOnly, sortBy]);

    // Get unique cities
    const cities = useMemo(() => {
        const citySet = new Set(missions.map(m => m.city?.name).filter(Boolean));
        return Array.from(citySet).sort();
    }, [missions]);

    // Tab counts
    const tabCounts = useMemo(() => ({
        DISCOVER: missions.length,
        PENDING: applications.filter(a => a.status === 'PENDING').length,
        ACCEPTED: applications.filter(a => a.status === 'ACCEPTED' && a.mission?.status !== 'IN_PROGRESS' && a.mission?.status !== 'COMPLETED').length,
        IN_PROGRESS: applications.filter(a => a.status === 'ACCEPTED' && a.mission?.status === 'IN_PROGRESS').length,
        COMPLETED: applications.filter(a => a.mission?.status === 'COMPLETED' && a.status === 'ACCEPTED').length,
        REJECTED: applications.filter(a => a.status === 'REJECTED' || a.status === 'DECLINED').length,
    }), [missions, applications]);

    // Filter and sort discover missions
    const filteredMissions = useMemo(() => {
        let result = [...missions];

        // Exclude missions already applied to
        const appliedMissionIds = new Set(applications.map(a => a.mission?.mission_id));
        result = result.filter(m => !appliedMissionIds.has(m.mission_id));

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(m =>
                m.title?.toLowerCase().includes(query) ||
                m.description?.toLowerCase().includes(query) ||
                m.establishment?.name?.toLowerCase().includes(query)
            );
        }

        if (selectedCity) {
            result = result.filter(m => m.city?.name === selectedCity);
        }

        if (showUrgentOnly) {
            result = result.filter(m => m.is_urgent);
        }

        result.sort((a, b) => {
            switch (sortBy) {
                case 'recent': return new Date(b.created_at) - new Date(a.created_at);
                case 'budget-high': return (b.budget || 0) - (a.budget || 0);
                case 'budget-low': return (a.budget || 0) - (b.budget || 0);
                default: return 0;
            }
        });

        return result;
    }, [missions, applications, searchQuery, selectedCity, showUrgentOnly, sortBy]);

    // Filter applications by status
    const filteredApplications = useMemo(() => {
        let result = [...applications];

        // Apply search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(a =>
                a.mission?.title?.toLowerCase().includes(query) ||
                a.mission?.establishment?.name?.toLowerCase().includes(query)
            );
        }

        // Apply tab filter
        result = result.filter(app => {
            const status = app.status;
            const missionStatus = app.mission?.status;

            switch (activeTab) {
                case 'PENDING': return status === 'PENDING' || status === 'PROPOSED';
                case 'ACCEPTED': return status === 'ACCEPTED' && missionStatus !== 'IN_PROGRESS' && missionStatus !== 'COMPLETED';
                case 'IN_PROGRESS': return status === 'ACCEPTED' && missionStatus === 'IN_PROGRESS';
                case 'COMPLETED': return missionStatus === 'COMPLETED' && status === 'ACCEPTED';
                case 'REJECTED': return status === 'REJECTED' || status === 'DECLINED';
                default: return true;
            }
        });

        return result;
    }, [applications, activeTab, searchQuery]);

    // Current data based on active tab
    const currentData = activeTab === 'DISCOVER' ? filteredMissions : filteredApplications;
    const totalCount = currentData.length;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
    const paginatedData = currentData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    // Handlers
    const handleApply = async (missionId) => {
        const limit = getLimit('applications');
        if (limit && limit.remaining <= 0) {
            setMessage({ type: 'error', text: 'Limite de candidatures atteinte. Passez Premium pour postuler sans limite.' });
            return;
        }

        if (!confirm('Confirmer la candidature ?')) return;
        setApplying(missionId);
        try {
            await api.post('/applications/apply', { mission_id: missionId });
            // Refresh applications
            const { data } = await api.get('/applications/my-applications');
            setApplications(data.data || []);
            setMessage({ type: 'success', text: 'Candidature envoyée avec succès !' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Erreur lors de la candidature' });
        } finally {
            setApplying(null);
        }
    };

    const handleWithdraw = async (appId) => {
        if (!confirm('Voulez-vous vraiment retirer cette candidature ?')) return;
        setProcessingId(appId);
        try {
            await api.delete(`/applications/${appId}`);
            setApplications(apps => apps.filter(a => a.application_id !== appId));
            setMessage({ type: 'success', text: 'Candidature retirée avec succès.' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors du retrait.' });
        } finally {
            setProcessingId(null);
        }
    };

    const handleRespond = async (appId, status) => {
        if (!confirm(`Voulez-vous vraiment ${status === 'ACCEPTED' ? 'accepter' : 'décliner'} cette offre ?`)) return;
        setProcessingId(appId);
        try {
            await api.patch(`/applications/${appId}/respond`, { status });
            setApplications(apps => apps.map(a =>
                a.application_id === appId ? { ...a, status: status === 'DECLINED' ? 'REJECTED' : status } : a
            ));
            setMessage({ type: 'success', text: status === 'ACCEPTED' ? 'Offre acceptée !' : 'Offre déclinée.' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de la mise à jour.' });
        } finally {
            setProcessingId(null);
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCity('');
        setShowUrgentOnly(false);
        setSortBy('recent');
    };

    // Helpers
    const formatDate = (dateStr) => {
        if (!dateStr) return 'Non spécifié';
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? 'Non spécifié' : date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Mes Missions</h1>
                    <p className="text-slate-500">Découvrez des opportunités et gérez vos candidatures</p>
                </div>
                {!isSubscribed && (
                    <LimitCounter limitType="applications" label="candidatures" />
                )}
            </div>

            {/* Message */}
            {message.text && (
                <div className={`p-4 rounded-xl flex items-center justify-between gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                    <div className="flex items-center gap-3">
                        {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        {message.text}
                    </div>
                    <button onClick={() => setMessage({ type: '', text: '' })} className="hover:opacity-70">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-slate-200 p-1.5">
                <div className="flex gap-1 overflow-x-auto">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        const count = tabCounts[tab.id];
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{tab.label}</span>
                                {count > 0 && (
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Search & Filters - Only show for Discover tab */}
            {activeTab === 'DISCOVER' && (
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher une mission..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Toutes les villes</option>
                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <label className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                        <input
                            type="checkbox"
                            checked={showUrgentOnly}
                            onChange={(e) => setShowUrgentOnly(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded"
                        />
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-medium text-slate-700 whitespace-nowrap">Urgentes</span>
                    </label>
                </div>
            )}

            {/* Simple search for other tabs */}
            {activeTab !== 'DISCOVER' && (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher dans mes missions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            )}

            {/* Content */}
            {activeTab === 'DISCOVER' ? (
                /* Discover Grid */
                paginatedData.length === 0 ? (
                    <EmptyState
                        icon={Search}
                        title="Aucune mission trouvée"
                        description="Essayez d'élargir vos critères de recherche."
                        action={clearFilters}
                        actionLabel="Réinitialiser les filtres"
                    />
                ) : (
                    <div className="space-y-4">
                        {paginatedData.map(mission => {
                            const isUrgent = mission.is_urgent;
                            const restricted = isUrgent && !canAccess('canViewUrgentMissions');

                            if (restricted) {
                                return (
                                    <BlurredContent
                                        key={mission.mission_id}
                                        message="Mission Urgente (Premium)"
                                        ctaText="Voir l'offre"
                                        ctaLink="/pricing"
                                    >
                                        <MissionCard mission={mission} isUrgent={true} />
                                    </BlurredContent>
                                );
                            }

                            return (
                                <MissionCard
                                    key={mission.mission_id}
                                    mission={mission}
                                    onApply={handleApply}
                                    applying={applying}
                                    isUrgent={isUrgent}
                                />
                            );
                        })}
                    </div>
                )
            ) : (
                /* Applications List */
                paginatedData.length === 0 ? (
                    <EmptyState
                        icon={Briefcase}
                        title={`Aucune mission ${TABS.find(t => t.id === activeTab)?.label.toLowerCase()}`}
                        description="Vos missions apparaîtront ici."
                    />
                ) : (
                    <div className="space-y-4">
                        {paginatedData.map(app => (
                            <ApplicationCard
                                key={app.application_id}
                                application={app}
                                activeTab={activeTab}
                                onWithdraw={handleWithdraw}
                                onRespond={handleRespond}
                                processingId={processingId}
                                formatDate={formatDate}
                            />
                        ))}
                    </div>
                )
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </button>
                    <span className="flex items-center px-4 font-medium text-slate-600">
                        Page {currentPage} / {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
                    >
                        <ChevronRight className="w-5 h-5 text-slate-600" />
                    </button>
                </div>
            )}
        </div>
    );
}

// Empty State Component
function EmptyState({ icon: Icon, title, description, action, actionLabel }) {
    return (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-500 mb-6">{description}</p>
            {action && (
                <button onClick={action} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium">
                    {actionLabel}
                </button>
            )}
        </div>
    );
}

// Mission Card for Discover tab - Horizontal Layout matching /missions
function MissionCard({ mission, onApply, applying, isUrgent }) {
    const isRedacted = mission.is_redacted;
    const salaryMin = mission.salary_min || (mission.budget ? Math.round(mission.budget * 0.8) : null);
    const salaryMax = mission.salary_max || mission.budget;
    const skills = mission.skills || ['Accompagnement', 'Écoute active', 'Travail social'];
    const benefits = mission.benefits || ['CNSS', 'Mutuelle'];

    return (
        <article className={`bg-white rounded-2xl border overflow-hidden transition-all relative ${isUrgent ? 'border-amber-200 hover:border-amber-300 hover:shadow-lg' : 'border-slate-200 hover:border-blue-300 hover:shadow-lg'
            }`}>
            {/* Urgent Badge */}
            {isUrgent && (
                <div className="absolute -top-0 left-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-b-lg shadow-lg flex items-center gap-1 z-10">
                    <Zap className="w-3 h-3 fill-white" />
                    URGENT
                </div>
            )}

            <div className="p-5 flex">
                {/* MAIN CONTENT */}
                <div className="flex-1 pr-5 border-r border-slate-100">
                    {/* Top Badges Row */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                        {mission.is_verified && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                                <CheckCircle className="w-3.5 h-3.5" /> Vérifié
                            </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                            <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                            {mission.sector || 'Action Sociale'}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                            {mission.positions_count || 1} poste{(mission.positions_count || 1) > 1 ? 's' : ''}
                        </span>
                    </div>

                    {/* Title & Logo */}
                    <div className="flex items-start gap-4 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                            {mission.establishment?.logo_url ? (
                                <img src={mission.establishment.logo_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <Building2 className="w-6 h-6 text-slate-300" />
                            )}
                        </div>
                        <div>
                            <Link
                                to={isRedacted ? '#' : `/worker/missions/${mission.mission_id}`}
                                className={`text-lg font-bold text-slate-800 mb-1 leading-tight block hover:text-blue-600 transition-colors ${isRedacted ? 'blur-[2px] pointer-events-none' : ''}`}
                            >
                                {mission.title || 'Titre de la mission'}
                            </Link>
                            <p className="text-sm text-slate-500 font-medium">
                                {mission.establishment?.name || 'Établissement'}
                            </p>
                        </div>
                    </div>

                    {/* Meta Info Row */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 mb-4">
                        <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            {mission.city?.name || 'Maroc'}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Briefcase className="w-4 h-4 text-slate-400" />
                            {mission.contract_type || 'CDI'}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-slate-400" />
                            {mission.work_mode || 'Sur site'}
                        </span>
                    </div>

                    {/* Description */}
                    <p className={`text-sm text-slate-600 mb-4 line-clamp-2 ${isRedacted ? 'blur-[3px] select-none' : ''}`}>
                        {isRedacted ? 'Description réservée aux membres premium...' : (mission.description || 'Description de la mission.')}
                    </p>

                    {/* Skills Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                        {skills.slice(0, 3).map((skill, idx) => (
                            <span key={idx} className="px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                                {skill}
                            </span>
                        ))}
                    </div>

                    {/* Benefits */}
                    <div className="flex flex-wrap gap-2">
                        {benefits.slice(0, 3).map((benefit, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full">
                                <CheckCircle className="w-3 h-3" /> {benefit}
                            </span>
                        ))}
                    </div>

                    {/* Footer Row */}
                    <div className="flex items-center justify-between text-xs text-slate-400 pt-3 mt-3 border-t border-slate-100">
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {mission.end_date ? `Avant le ${new Date(mission.end_date).toLocaleDateString('fr-FR')}` : `Début: ${new Date(mission.start_date).toLocaleDateString('fr-FR')}`}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {new Date(mission.created_at).toLocaleDateString('fr-FR')}
                        </span>
                    </div>
                </div>

                {/* RIGHT COLUMN - Salary & Actions */}
                <div className="w-36 pl-5 flex flex-col justify-between">
                    {/* Salary */}
                    <div className="text-right">
                        {!isRedacted && salaryMin && (
                            <p className="text-sm font-bold text-slate-500">
                                {salaryMin.toLocaleString('fr-FR')} -
                            </p>
                        )}
                        <p className={`text-xl font-extrabold text-slate-800 ${isRedacted ? 'blur-[3px]' : ''}`}>
                            {salaryMax ? `${salaryMax.toLocaleString('fr-FR')}` : 'À négocier'}
                            <span className="text-sm font-semibold text-blue-600 ml-1">DH</span>
                        </p>
                        <p className="text-xs text-slate-400">par mois</p>
                    </div>

                    {/* Stats */}
                    <div className="my-4 space-y-1.5 text-right">
                        <p className="text-xs text-slate-500">
                            <Eye className="w-3.5 h-3.5 inline mr-1" />
                            <span className="font-semibold">{mission.views_count || Math.floor(Math.random() * 100) + 30}</span> vues
                        </p>
                        <p className="text-xs text-emerald-600">
                            <Briefcase className="w-3.5 h-3.5 inline mr-1" />
                            <span className="font-semibold">{mission.applications_count || Math.floor(Math.random() * 20) + 3}</span> candidats
                        </p>
                    </div>

                    {/* Action Buttons */}
                    {isRedacted ? (
                        <div className="w-full py-2.5 px-3 bg-slate-100 text-slate-400 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5">
                            <Lock className="w-3.5 h-3.5" /> Verrouillé
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Link
                                to={`/worker/missions/${mission.mission_id}`}
                                className="w-full py-2 px-3 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
                            >
                                <Eye className="w-4 h-4" /> Voir détails
                            </Link>
                            <button
                                onClick={() => onApply && onApply(mission.mission_id)}
                                disabled={applying === mission.mission_id}
                                className="w-full py-2.5 px-3 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
                            >
                                {applying === mission.mission_id ? (
                                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Envoi...</>
                                ) : (
                                    <>Postuler <ArrowUpRight className="w-4 h-4" /></>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}

// Application Card for other tabs
function ApplicationCard({ application, activeTab, onWithdraw, onRespond, processingId, formatDate }) {
    const app = application;
    const isProcessing = processingId === app.application_id;

    const getStatusBadge = () => {
        const status = app.status;
        if (status === 'PENDING') return { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', label: 'En attente', icon: Clock };
        if (status === 'PROPOSED') return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Proposition', icon: FileText };
        if (status === 'ACCEPTED') return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', label: 'Acceptée', icon: CheckCircle };
        if (status === 'REJECTED' || status === 'DECLINED') return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Refusée', icon: Ban };
        return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', label: status, icon: Briefcase };
    };

    const badge = getStatusBadge();
    const BadgeIcon = badge.icon;

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg text-slate-900 mb-1">{app.mission?.title || 'Mission'}</h3>
                        <p className="text-slate-500">{app.mission?.establishment?.name || 'Établissement'}</p>
                    </div>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${badge.bg} ${badge.text} border ${badge.border}`}>
                    <BadgeIcon className="w-3.5 h-3.5" />
                    {badge.label}
                </span>
            </div>

            <p className="text-slate-600 mb-4 line-clamp-2">
                {app.mission?.description || 'Aucune description'}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {app.mission?.city?.name || 'Non spécifié'}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {formatDate(app.mission?.start_date)}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {formatDate(app.created_at)}
                </div>
                <div className="font-semibold text-slate-900">
                    {app.mission?.budget?.toLocaleString() || '—'} DH
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded text-xs font-semibold uppercase">
                    {app.mission?.contract_type || 'FREELANCE'}
                </span>

                <div className="flex gap-3">
                    {app.status === 'PROPOSED' && (
                        <>
                            <button
                                onClick={() => onRespond(app.application_id, 'ACCEPTED')}
                                disabled={isProcessing}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50"
                            >
                                {isProcessing ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                Accepter
                            </button>
                            <button
                                onClick={() => onRespond(app.application_id, 'DECLINED')}
                                disabled={isProcessing}
                                className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium disabled:opacity-50"
                            >
                                <X className="w-4 h-4" />
                                Décliner
                            </button>
                        </>
                    )}
                    {app.status === 'PENDING' && (
                        <button
                            onClick={() => onWithdraw(app.application_id)}
                            disabled={isProcessing}
                            className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium disabled:opacity-50"
                        >
                            {isProcessing ? <Loader className="w-4 h-4 animate-spin" /> : 'Retirer'}
                        </button>
                    )}
                    {(app.status === 'ACCEPTED' || activeTab === 'COMPLETED' || activeTab === 'REJECTED') && (
                        <button className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium">
                            Voir détails
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
