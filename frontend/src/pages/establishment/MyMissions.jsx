import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import {
    Briefcase, Calendar, MapPin, DollarSign,
    ArrowLeft, Loader, CheckCircle, AlertCircle,
    Clock, MoreVertical, Archive, Edit
} from 'lucide-react';
import ReviewModal from '../../components/ReviewModal';

const MyMissions = () => {
    const navigate = useNavigate();
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewConfig, setReviewConfig] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchMissions();
    }, []);

    const fetchMissions = async () => {
        try {
            const { data } = await api.get('/missions/my-missions');
            setMissions(data.data || []);
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Impossible de charger vos missions.' });
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async (missionId) => {
        if (!confirm('Voulez-vous vraiment marquer cette mission comme terminée ?')) return;

        try {
            await api.patch(`/missions/${missionId}/status`, { status: "COMPLETED" });

            // Try to find an accepted worker for review
            try {
                const { data } = await api.get(`/applications/mission/${missionId}/accepted`);
                if (data.worker_id) {
                    setReviewConfig({ missionId, targetId: data.worker_id });
                } else {
                    setMessage({ type: 'success', text: 'Mission terminée. Aucun candidat à évaluer.' });
                    fetchMissions();
                }
            } catch (err) {
                // No accepted worker found specifically or endpoint error
                setMessage({ type: 'success', text: 'Mission terminée.' });
                fetchMissions();
            }

        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Erreur lors de la clôture de la mission.' });
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
                <button
                    onClick={() => navigate('/establishment/dashboard')}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Mes Missions</h1>
                    <p className="text-slate-500">Gérez vos offres et suivez leur avancement</p>
                </div>
            </div>

            {message.text && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {missions.length === 0 ? (
                    <div className="text-center py-16">
                        <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-slate-800">Aucune mission trouvée</h3>
                        <p className="text-slate-500 mb-6">Commencez par créer votre première mission.</p>
                        <button
                            onClick={() => navigate('/establishment/missions/create')}
                            className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            Créer une mission
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mission</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Statistiques</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Lieu & Budget</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Dates</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {missions.map((mission) => (
                                    <tr key={mission.mission_id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate('/establishment/applications', { state: { missionId: mission.mission_id } })}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                                                    <Briefcase className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-800 hover:text-blue-600 transition-colors">{mission.title}</h3>
                                                    <p className="text-xs text-slate-500 line-clamp-1">{mission.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2 text-sm text-slate-600" title="Nombre de vues">
                                                    <div className="p-1.5 bg-slate-100 rounded-md">
                                                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                                                    </div>
                                                    <span className="font-medium">{mission.views || 0} Vues</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-600" title="Nombre de candidatures">
                                                    <div className="p-1.5 bg-blue-50 rounded-md">
                                                        <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                                                    </div>
                                                    <span className="font-medium">{mission._count?.applications || 0} Candidatures</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <MapPin className="w-4 h-4 text-slate-400" />
                                                    {mission.city?.name || 'Non spécifié'}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                                                    <DollarSign className="w-4 h-4" />
                                                    {mission.budget} MAD
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                {new Date(mission.start_date).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${mission.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                                                mission.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                    mission.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-amber-100 text-amber-800'
                                                }`}>
                                                {mission.status === 'OPEN' ? 'Ouverte' :
                                                    mission.status === 'COMPLETED' ? 'Terminée' :
                                                        mission.status === 'IN_PROGRESS' ? 'En cours' : mission.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => navigate('/establishment/applications', { state: { missionId: mission.mission_id } })}
                                                    className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    Candidatures
                                                </button>
                                                {mission.status !== 'COMPLETED' && (
                                                    <>
                                                        <button
                                                            onClick={() => navigate(`/establishment/missions/${mission.mission_id}/edit`)}
                                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Modifier"
                                                        >
                                                            <Edit className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleComplete(mission.mission_id)}
                                                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                            title="Marquer comme terminée"
                                                        >
                                                            <CheckCircle className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {reviewConfig && (
                <ReviewModal
                    missionId={reviewConfig.missionId}
                    targetId={reviewConfig.targetId}
                    onClose={() => setReviewConfig(null)}
                    onSuccess={() => {
                        setMessage({ type: 'success', text: 'Avis envoyé avec succès !' });
                        fetchMissions();
                    }}
                />
            )}
        </div>
    );
};

export default MyMissions;
