import { useState, useEffect } from 'react';
import {
    Briefcase, Search, CheckCircle, XCircle, Eye, Clock,
    MapPin, Calendar, Euro, Building2, AlertTriangle
} from 'lucide-react';
import api from '../../api/client';

const AdminMissions = () => {
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, all: 0 });
    const [selectedMission, setSelectedMission] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchMissions();
    }, [filter, searchQuery]); // Add searchQuery to dependency

    const fetchMissions = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/super-admin/missions?status=${filter}&search=${searchQuery}`);
            setMissions(data.items || []);
            if (data.stats) setStats(data.stats);
        } catch (error) {
            console.error('Error loading missions', error);
            // setMissions([]); // Keep existing if error or just empty
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (missionId) => {
        setProcessing(true);
        try {
            await api.put(`/super-admin/missions/${missionId}/review`, { status: 'APPROVED' });
            alert('Mission approuvée et publiée avec succès');
            setSelectedMission(null);
            fetchMissions();
        } catch (error) {
            console.error(error);
            alert('Erreur lors de l\'approbation');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async (missionId) => {
        if (!rejectReason.trim()) {
            alert('Veuillez indiquer un motif de rejet');
            return;
        }
        setProcessing(true);
        try {
            await api.put(`/super-admin/missions/${missionId}/review`, {
                status: 'REJECTED',
                reason: rejectReason
            });
            alert('Mission rejetée');
            setSelectedMission(null);
            setRejectReason('');
            fetchMissions();
        } catch (error) {
            console.error(error);
            alert('Erreur lors du rejet');
        } finally {
            setProcessing(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            PENDING: 'bg-amber-100 text-amber-700',
            APPROVED: 'bg-green-100 text-green-700',
            REJECTED: 'bg-red-100 text-red-700',
            PUBLISHED: 'bg-blue-100 text-blue-700'
        };
        const labels = {
            PENDING: 'En attente',
            APPROVED: 'Approuvée',
            REJECTED: 'Rejetée',
            PUBLISHED: 'Publiée'
        };
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100'}`}>
                {labels[status] || status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-500">Chargement des missions...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Validation des Missions</h1>
                    <p className="text-slate-500">Vérifiez et approuvez les missions publiées par les établissements</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                        <span className="text-sm text-slate-500">En attente: </span>
                        <span className="font-bold text-blue-600">
                            {stats.pending}
                        </span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Status Tabs */}
                    <div className="flex gap-2">
                        {[
                            { value: 'pending', label: 'En attente' },
                            { value: 'approved', label: 'Approuvées' },
                            { value: 'rejected', label: 'Rejetées' },
                            { value: 'all', label: 'Toutes' }
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
                    <div className="relative flex-1 max-w-sm ml-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher une mission..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Missions List */}
            {missions.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
                    <Briefcase className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">Aucune mission à valider</h3>
                    <p className="text-slate-500 text-sm">
                        Les missions soumises par les établissements apparaîtront ici pour validation.
                    </p>

                </div>
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Mission</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Établissement</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Lieu</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Dates</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Statut</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {missions.map((mission) => (
                                <tr key={mission.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-slate-900">{mission.title}</p>
                                        <p className="text-xs text-slate-500">{mission.category}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm text-slate-700">{mission.establishment_name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-sm text-slate-500">
                                            <MapPin className="w-4 h-4" />
                                            {mission.location}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-sm text-slate-500">
                                            <Calendar className="w-4 h-4" />
                                            {mission.start_date} - {mission.end_date}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(mission.status)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setSelectedMission(mission)}
                                            className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 inline-flex items-center gap-2"
                                        >
                                            <Eye className="w-4 h-4" /> Examiner
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Mission Detail Modal */}
            {selectedMission && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{selectedMission.title}</h3>
                                <p className="text-sm text-slate-500">Soumise par {selectedMission.establishment_name}</p>
                            </div>
                            <button
                                onClick={() => setSelectedMission(null)}
                                className="p-2 hover:bg-slate-100 rounded-full"
                            >
                                <XCircle className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6">
                            {/* Badges Row */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {selectedMission.is_urgent && (
                                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" /> URGENT
                                    </span>
                                )}
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                    {selectedMission.contract_type}
                                </span>
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                                    {selectedMission.work_mode}
                                </span>
                                <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full">
                                    {selectedMission.experience_level}
                                </span>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="p-3 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-500 mb-1">📅 Début</p>
                                    <p className="font-medium text-slate-700 text-sm">
                                        {new Date(selectedMission.start_date_raw).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-500 mb-1">🏁 Fin</p>
                                    <p className="font-medium text-slate-700 text-sm">
                                        {new Date(selectedMission.end_date_raw).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-500 mb-1">💰 Salaire / Budget</p>
                                    <p className="font-medium text-slate-700 text-sm">
                                        {selectedMission.salary} {selectedMission.salary !== 'Non spécifié' && 'MAD'}
                                    </p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-500 mb-1">📍 Lieu</p>
                                    <p className="font-medium text-slate-700 text-sm">{selectedMission.location}</p>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-slate-400" /> Description de la mission
                                </h4>
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                                        {selectedMission.description}
                                    </p>
                                </div>
                            </div>

                            {/* Skills & Benefits */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-semibold text-slate-800 mb-2 text-sm">Compétences requises</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedMission.skills?.length > 0 ? (
                                            selectedMission.skills.map((skill, idx) => (
                                                <span key={idx} className="px-2 py-1 border border-slate-200 text-slate-600 text-xs rounded-md bg-white">
                                                    {skill}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">Aucune compétence spécifiée</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-800 mb-2 text-sm">Avantages</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedMission.benefits?.length > 0 ? (
                                            selectedMission.benefits.map((benefit, idx) => (
                                                <span key={idx} className="px-2 py-1 border border-green-200 text-green-700 text-xs rounded-md bg-green-50">
                                                    {benefit}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">Aucun avantage spécifié</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {selectedMission.status === 'PENDING' && (
                                <div className="pt-4 border-t border-slate-100">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Motif de rejet (obligatoire pour rejeter)
                                    </label>
                                    <textarea
                                        className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none transition-shadow"
                                        placeholder="Expliquez pourquoi la mission est rejetée..."
                                        rows="3"
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                    />
                                </div>
                            )}
                        </div>

                        {selectedMission.status === 'PENDING' && (
                            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-xl">
                                <button
                                    onClick={() => handleReject(selectedMission.id)}
                                    disabled={processing}
                                    className="px-4 py-2 bg-white border border-red-200 text-red-700 rounded-lg font-medium hover:bg-red-50 transition-colors"
                                >
                                    Rejeter
                                </button>
                                <button
                                    onClick={() => handleApprove(selectedMission.id)}
                                    disabled={processing}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" /> Approuver et Publier
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMissions;
