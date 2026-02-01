import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import {
    User, Briefcase, CheckCircle, XCircle,
    Calendar, MapPin, ArrowLeft, Loader,
    AlertCircle, Filter, Search, MoreHorizontal
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';

const Candidates = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, PENDING, ACCEPTED, REJECTED
    const [processingId, setProcessingId] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const { data } = await api.get('/applications/received');
            let apps = data.data || [];

            if (location.state?.missionId) {
                apps = apps.filter(a => a.mission_id === location.state.missionId);
            }

            setApplications(apps);
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Impossible de charger les candidatures.' });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (appId, newStatus) => {
        if (!confirm(`Confirmer le changement de statut vers : ${newStatus === 'ACCEPTED' ? 'Accepté' : 'Refusé'} ?`)) return;

        setProcessingId(appId);
        try {
            await api.patch(`/applications/${appId}/status`, { status: newStatus });

            // Update local state
            setApplications(apps => apps.map(app =>
                app.application_id === appId ? { ...app, status: newStatus } : app
            ));

            setMessage({
                type: 'success',
                text: `Candidature ${newStatus === 'ACCEPTED' ? 'acceptée' : 'refusée'} avec succès.`
            });
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de la mise à jour du statut.' });
        } finally {
            setProcessingId(null);
        }
    };

    const filteredApplications = applications.filter(app => {
        if (filter === 'ALL') return true;
        return app.status === filter;
    });

    // Helper for status badge
    const getStatusBadge = (status) => {
        switch (status) {
            case 'ACCEPTED':
                return <Badge variant="success" className="bg-indigo-100 text-indigo-700 border-indigo-200">Acceptée</Badge>;
            case 'REJECTED':
                return <Badge variant="default" className="bg-slate-100 text-slate-500 border-slate-200">Refusée</Badge>;
            default: // PENDING
                return <Badge variant="blue" className="bg-blue-50 text-blue-600 border-blue-100 animate-pulse">En attente</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-10">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" className="pl-0 hover:bg-transparent" onClick={() => navigate('/establishment/dashboard')}>
                    <ArrowLeft className="w-6 h-6 text-slate-500 hover:text-blue-600 transition-colors" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Candidatures Reçues</h1>
                    <p className="text-slate-500">Gérez les postulants à vos missions</p>
                </div>
            </div>

            {message.text && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                    }`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                    {message.text}
                </div>
            )}

            {/* Filters */}
            <Card className="mb-6">
                <div className="p-2 flex overflow-x-auto gap-2">
                    <Button
                        variant={filter === 'ALL' ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setFilter('ALL')}
                        className={filter === 'ALL' ? 'bg-slate-800 hover:bg-slate-900 border-transparent' : 'text-slate-600'}
                    >
                        Toutes ({applications.length})
                    </Button>
                    <Button
                        variant={filter === 'PENDING' ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setFilter('PENDING')}
                    >
                        En attente ({applications.filter(a => a.status === 'PENDING').length})
                    </Button>
                    <Button
                        variant={filter === 'ACCEPTED' ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setFilter('ACCEPTED')}
                        className={filter === 'ACCEPTED' ? 'bg-indigo-600 hover:bg-indigo-700 border-transparent' : 'text-indigo-600 hover:bg-indigo-50'}
                    >
                        Acceptées ({applications.filter(a => a.status === 'ACCEPTED').length})
                    </Button>
                    <Button
                        variant={filter === 'REJECTED' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setFilter('REJECTED')}
                        className={filter === 'REJECTED' ? 'bg-slate-200 text-slate-700 border-transparent' : 'text-slate-500 hover:bg-slate-100'}
                    >
                        Refusées ({applications.filter(a => a.status === 'REJECTED').length})
                    </Button>
                </div>
            </Card>

            {/* List */}
            <div className="space-y-4">
                {filteredApplications.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800">Aucune candidature</h3>
                        <p className="text-slate-500">Aucune candidature ne correspond à vos critères.</p>
                        {filter !== 'ALL' && (
                            <Button variant="link" onClick={() => setFilter('ALL')} className="mt-2 text-blue-600">
                                Voir toutes les candidatures
                            </Button>
                        )}
                    </div>
                ) : (
                    filteredApplications.map(app => (
                        <Card
                            key={app.application_id}
                            className={`group transition-all duration-300 hover:border-blue-300 hover:shadow-md cursor-pointer ${app.status === 'REJECTED' ? 'opacity-75 bg-slate-50' : 'bg-white'
                                }`}
                            onClick={(e) => {
                                if (e.target.closest('button')) return;
                                navigate(`/establishment/worker/${app.worker.user_id}`);
                            }}
                        >
                            <CardContent className="p-6">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    {/* Left Side: Candidate & Mission Info */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-sm shrink-0">
                                            <div className="w-full h-full rounded-[14px] bg-white overflow-hidden flex items-center justify-center">
                                                {app.worker.profile_pic_url ? (
                                                    <img src={app.worker.profile_pic_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xl font-bold text-blue-600">
                                                        {app.worker.first_name?.[0]}{app.worker.last_name?.[0]}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-700 transition-colors">
                                                    {app.worker.first_name} {app.worker.last_name}
                                                </h3>
                                                {getStatusBadge(app.status)}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                                                <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                                    <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                                                    <span className="font-medium text-slate-700">{app.mission.title}</span>
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(app.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Side: Actions */}
                                    <div className="flex items-center gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                                        {app.status === 'PENDING' && (
                                            <>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => handleStatusUpdate(app.application_id, 'REJECTED')}
                                                    disabled={processingId === app.application_id}
                                                    className="border-slate-200 text-slate-600 hover:text-indigo-700 hover:border-indigo-200 hover:bg-indigo-50"
                                                    icon={XCircle}
                                                >
                                                    Refuser
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleStatusUpdate(app.application_id, 'ACCEPTED')}
                                                    disabled={processingId === app.application_id}
                                                    isLoading={processingId === app.application_id}
                                                    className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-900/10"
                                                    icon={!processingId && CheckCircle}
                                                >
                                                    Accepter
                                                </Button>
                                            </>
                                        )}
                                        {app.status === 'ACCEPTED' && (
                                            <div className="text-right flex items-center gap-4">
                                                <div className="flex flex-col items-end">
                                                    <p className="text-sm font-bold text-indigo-700">Recrutement validé</p>
                                                    <p className="text-xs text-indigo-400">En attente de démarrage</p>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => navigate(`/establishment/worker/${app.worker.user_id}`)}
                                                >
                                                    Voir profil
                                                </Button>
                                            </div>
                                        )}
                                        {app.status === 'REJECTED' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                disabled
                                                className="text-slate-400"
                                            >
                                                Candidature archivée
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default Candidates;
