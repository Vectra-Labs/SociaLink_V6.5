import { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Calendar, Clock, Euro, Briefcase, Eye, Ban, CheckCircle, Loader, AlertCircle, X, Check } from 'lucide-react';
import api from '../../api/client';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

export default function MyApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('PROPOSITIONS');
    const [searchTerm, setSearchTerm] = useState('');
    const [processingId, setProcessingId] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchApplications();
    }, []);

    // Auto-dismiss messages
    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => setMessage({ type: '', text: '' }), 4000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const fetchApplications = async () => {
        try {
            const { data } = await api.get('/applications/my-applications');
            setApplications(data.data || []);
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Erreur lors du chargement des candidatures' });
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async (appId, status) => {
        if (!confirm(`Voulez-vous vraiment ${status === 'ACCEPTED' ? 'accepter' : 'décliner'} cette proposition ?`)) return;

        setProcessingId(appId);
        try {
            await api.patch(`/applications/${appId}/respond`, { status });

            // Update local state
            setApplications(apps => apps.map(app =>
                app.application_id === appId ? { ...app, status: status === 'DECLINED' ? 'REJECTED' : status } : app
            ));

            setMessage({
                type: 'success',
                text: status === 'ACCEPTED' ? 'Proposition acceptée avec succès !' : 'Proposition déclinée.'
            });
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de la mise à jour du statut.' });
        } finally {
            setProcessingId(null);
        }
    };

    const handleWithdraw = async (appId) => {
        if (!confirm('Voulez-vous vraiment retirer cette candidature ?')) return;

        setProcessingId(appId);
        try {
            await api.delete(`/applications/${appId}`);

            // Remove from local state
            setApplications(apps => apps.filter(app => app.application_id !== appId));

            setMessage({
                type: 'success',
                text: 'Candidature retirée avec succès.'
            });
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors du retrait de la candidature.' });
        } finally {
            setProcessingId(null);
        }
    };

    // Derived state for filtered applications
    const filteredApps = applications.filter(app => {
        // Tab filtering
        let matchTab = false;
        const status = app.status;
        const missionStatus = app.mission.status;

        if (activeTab === 'PROPOSITIONS') {
            matchTab = status === 'PROPOSED';
        } else if (activeTab === 'CANDIDATURES') {
            matchTab = status === 'PENDING';
        } else if (activeTab === 'EN_COURS') {
            matchTab = status === 'ACCEPTED' && missionStatus !== 'COMPLETED' && missionStatus !== 'CANCELLED';
        } else if (activeTab === 'TERMINEES') {
            matchTab = missionStatus === 'COMPLETED' && status === 'ACCEPTED';
        } else if (activeTab === 'ANNULEES') {
            matchTab = status === 'REJECTED' || missionStatus === 'CANCELLED';
        }

        // Search filtering
        const searchLower = searchTerm.toLowerCase();
        const matchSearch = app.mission.title.toLowerCase().includes(searchLower) ||
            app.mission.establishment?.name.toLowerCase().includes(searchLower);

        return matchTab && matchSearch;
    });

    // Counts for tabs
    const counts = {
        PROPOSITIONS: applications.filter(a => a.status === 'PROPOSED').length,
        CANDIDATURES: applications.filter(a => a.status === 'PENDING').length,
        EN_COURS: applications.filter(a => a.status === 'ACCEPTED' && a.mission.status !== 'COMPLETED' && a.mission.status !== 'CANCELLED').length,
        TERMINEES: applications.filter(a => a.mission.status === 'COMPLETED' && a.status === 'ACCEPTED').length,
        ANNULEES: applications.filter(a => a.status === 'REJECTED' || a.mission.status === 'CANCELLED').length
    };

    // Helper to calculate duration
    const getDuration = (start, end) => {
        if (!start || !end) return 'Non spécifié';
        const s = new Date(start);
        const e = new Date(end);
        if (isNaN(s.getTime()) || isNaN(e.getTime())) return 'Non spécifié';
        const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
        if (months < 1) {
            const days = Math.floor((e - s) / (1000 * 60 * 60 * 24));
            return `${days} jours`;
        }
        return `${months} mois`;
    };

    // Helper to format date safely
    const formatDate = (dateStr) => {
        if (!dateStr) return 'Non spécifié';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return 'Non spécifié';
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Mes Missions</h1>
                <p className="text-slate-500">Gérez vos propositions et missions</p>
            </div>

            {/* Status Message */}
            {message.text && (
                <div className={`p-4 rounded-xl flex items-center justify-between gap-3 ${message.type === 'success' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                    }`}>
                    <div className="flex items-center gap-3">
                        {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                        {message.text}
                    </div>
                    <button onClick={() => setMessage({ type: '', text: '' })} className="hover:opacity-70">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Search & Filter */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher une mission..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {/* Optional Filter Button - Placeholder for now if needed */}
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
                    {[
                        { id: 'PROPOSITIONS', label: 'Invitations' },
                        { id: 'CANDIDATURES', label: 'Candidatures' },
                        { id: 'EN_COURS', label: 'En cours' },
                        { id: 'TERMINEES', label: 'Terminées' },
                        { id: 'ANNULEES', label: 'Annulées' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-3 font-medium text-sm relative transition-all rounded-t-lg flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id
                                ? 'text-blue-600 bg-blue-50/50 border-b-2 border-blue-600'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            {tab.label}
                            {counts[tab.id] > 0 && (
                                <Badge variant={activeTab === tab.id ? 'blue' : 'secondary'} className="px-1.5 py-0.5 h-auto text-[10px]">
                                    {counts[tab.id]}
                                </Badge>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Applications List */}
            <div className="space-y-4">
                {filteredApps.length > 0 ? filteredApps.map(app => (
                    <Card key={app.application_id} className="hover:border-blue-200 transition-colors group">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 ring-1 ring-blue-100 shrink-0">
                                        <Briefcase className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-700 transition-colors">{app.mission.title}</h3>
                                        <p className="text-slate-500 font-medium text-sm">{app.mission.establishment?.name || 'Entreprise Confidentielle'}</p>
                                    </div>
                                </div>

                                {app.status === 'PROPOSED' ? (
                                    <Badge variant="blue" className="bg-blue-100 text-blue-700 border-blue-200 animate-pulse">
                                        <Clock className="w-3.5 h-3.5 mr-1" /> Invitation
                                    </Badge>
                                ) : app.status === 'PENDING' ? (
                                    <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                                        <Clock className="w-3.5 h-3.5 mr-1" /> En attente
                                    </Badge>
                                ) : activeTab === 'EN_COURS' ? (
                                    <Badge variant="blue" className="bg-indigo-100 text-indigo-700 border-indigo-200">
                                        <Briefcase className="w-3.5 h-3.5 mr-1" /> En cours
                                    </Badge>
                                ) : activeTab === 'TERMINEES' ? (
                                    <Badge variant="success" className="bg-blue-50 text-blue-700 border-blue-100">
                                        <CheckCircle className="w-3.5 h-3.5 mr-1" /> Terminée
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-slate-500 border-slate-200">
                                        <Ban className="w-3.5 h-3.5 mr-1" /> {app.status === 'REJECTED' ? 'Refusée' : 'Annulée'}
                                    </Badge>
                                )}
                            </div>

                            <p className="text-slate-600 mb-6 line-clamp-2 text-sm leading-relaxed">
                                {app.mission.description || "Aucune description disponible pour cette mission."}
                            </p>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <MapPin className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm font-medium">{app.mission.city?.name || 'Non spécifié'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Calendar className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm font-medium">{formatDate(app.mission.start_date)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Clock className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm font-medium">{getDuration(app.mission.start_date, app.mission.end_date)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Euro className="w-4 h-4 text-blue-500" />
                                    <span className="font-bold text-slate-900">{app.mission.budget?.toLocaleString() || '-'} DH</span>
                                    <span className="text-xs text-slate-500">/mission</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase tracking-wider">
                                    {app.mission.contract_type || 'FREELANCE'}
                                </span>

                                <div className="flex gap-3">
                                    {activeTab === 'PROPOSITIONS' && app.status === 'PROPOSED' ? (
                                        <>
                                            <Button
                                                onClick={() => handleRespond(app.application_id, 'ACCEPTED')}
                                                disabled={processingId === app.application_id}
                                                isLoading={processingId === app.application_id}
                                                icon={Check}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                Accepter
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => handleRespond(app.application_id, 'DECLINED')}
                                                disabled={processingId === app.application_id}
                                                className="text-slate-600 hover:bg-slate-50"
                                                icon={X}
                                            >
                                                Décliner
                                            </Button>
                                        </>
                                    ) : activeTab === 'CANDIDATURES' && app.status === 'PENDING' ? (
                                        <Button
                                            variant="secondary"
                                            onClick={() => handleWithdraw(app.application_id)}
                                            disabled={processingId === app.application_id}
                                            isLoading={processingId === app.application_id}
                                            className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border-indigo-100"
                                        >
                                            Retirer ma candidature
                                        </Button>
                                    ) : (
                                        <Button variant="secondary" className="hover:bg-slate-200">
                                            Voir détails
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )) : (
                    <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Briefcase className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Aucune mission trouvée</h3>
                        <p className="text-slate-500 text-sm">Aucune mission ne correspond à ce filtre ou critère.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
