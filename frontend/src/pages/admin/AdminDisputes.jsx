import { useState, useEffect } from 'react';
import {
    Users, Search, Filter, AlertTriangle, CheckCircle, XCircle,
    MessageSquare, ChevronRight, Gavel, FileText
} from 'lucide-react';
import api from '../../api/client';

const AdminDisputes = () => {
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedDispute, setSelectedDispute] = useState(null);
    const [resolutionNote, setResolutionNote] = useState('');
    const [stats, setStats] = useState({ open: 0, in_progress: 0, resolved: 0, total: 0 });

    const fetchDisputes = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/admin/disputes?status=${statusFilter}`);
            setDisputes(res.data.items);
            setStats(res.data.stats);
        } catch (error) {
            console.error("Failed to fetch disputes", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDisputes();
    }, [statusFilter]);

    const handleResolve = async (status) => {
        if (!descriptionRequired && !resolutionNote.trim()) return;

        try {
            await api.put(`/admin/disputes/${selectedDispute.id}/resolve`, {
                status,
                resolution: resolutionNote
            });
            setSelectedDispute(null);
            setResolutionNote('');
            fetchDisputes();
        } catch (error) {
            console.error("Failed to resolve dispute", error);
        }
    };

    const descriptionRequired = true; // Always require a note

    const getStatusColor = (status) => {
        switch (status) {
            case 'OPEN': return 'bg-red-100 text-red-600';
            case 'IN_PROGRESS': return 'bg-orange-100 text-orange-600';
            case 'RESOLVED': return 'bg-green-100 text-green-600';
            case 'DISMISSED': return 'bg-slate-100 text-slate-600';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    const getTypeLabel = (type) => {
        const types = {
            SCAM: 'Escroquerie Potentielle',
            HARASSMENT: 'Harcèlement',
            NO_SHOW: 'Absence injustifiée',
            PAYMENT_ISSUE: 'Problème de paiement',
            OTHER: 'Autre'
        };
        return types[type] || type;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Gestion des Litiges</h1>
                <p className="text-slate-500">Gérez les conflits entre travailleurs et établissements</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg text-red-600">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">En cours</p>
                            <p className="text-2xl font-bold text-slate-800">{stats.open}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                            <Gavel className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Traitement</p>
                            <p className="text-2xl font-bold text-slate-800">{stats.in_progress}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg text-green-600">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Résolus</p>
                            <p className="text-2xl font-bold text-slate-800">{stats.resolved}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Total</p>
                            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters & Actions */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-sm font-medium text-slate-700">Statut:</span>
                    <select
                        className="border-slate-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Tous les litiges</option>
                        <option value="open">Nouveaux (Open)</option>
                        <option value="in_progress">En traitement</option>
                        <option value="resolved">Résolus</option>
                        <option value="dismissed">Classés sans suite</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700">Type & Mission</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Parties Impliquées</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Date</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Statut</th>
                                <th className="px-6 py-4 font-sans text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-500">Chargement...</td>
                                </tr>
                            ) : disputes.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-500">Aucun litige trouvé.</td>
                                </tr>
                            ) : (
                                disputes.map((dispute) => (
                                    <tr key={dispute.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <span className="font-semibold text-slate-800 block mb-1">
                                                    {getTypeLabel(dispute.type)}
                                                </span>
                                                {dispute.mission ? (
                                                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                                        Mission #{dispute.mission.id}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">Hors mission</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="font-bold text-red-600">Plaignant:</span>
                                                    <span className="truncate max-w-[150px]">{dispute.reporter.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="font-bold text-slate-600">Accusé:</span>
                                                    <span className="truncate max-w-[150px]">{dispute.target.name}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {new Date(dispute.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(dispute.status)}`}>
                                                {dispute.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedDispute(dispute)}
                                                className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline"
                                            >
                                                Examiner
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Details */}
            {selectedDispute && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="text-lg font-bold text-slate-800">
                                Détail du Litige #{selectedDispute.id}
                            </h3>
                            <button
                                onClick={() => setSelectedDispute(null)}
                                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                            >
                                <XCircle className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6">
                            {/* Type Badge */}
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedDispute.status)}`}>
                                    {selectedDispute.status}
                                </span>
                                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
                                    {getTypeLabel(selectedDispute.type)}
                                </span>
                                {selectedDispute.mission && (
                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                                        Mission: {selectedDispute.mission.title}
                                    </span>
                                )}
                            </div>

                            {/* Parties Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                                    <h4 className="text-xs font-bold text-red-600 uppercase mb-2">Plaignant (Reporter)</h4>
                                    <p className="font-medium text-slate-800">{selectedDispute.reporter.name}</p>
                                    <p className="text-xs text-slate-500">{selectedDispute.reporter.email}</p>
                                    <p className="text-xs text-slate-500 mt-1 capitalize">{selectedDispute.reporter.role.toLowerCase()}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <h4 className="text-xs font-bold text-slate-600 uppercase mb-2">Accusé (Target)</h4>
                                    <p className="font-medium text-slate-800">{selectedDispute.target.name}</p>
                                    <p className="text-xs text-slate-500">{selectedDispute.target.email}</p>
                                    <p className="text-xs text-slate-500 mt-1 capitalize">{selectedDispute.target.role.toLowerCase()}</p>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h4 className="text-sm font-semibold text-slate-700 mb-2">Description du problème</h4>
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 min-h-[100px]">
                                    <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                                        {selectedDispute.description}
                                    </p>
                                </div>
                            </div>

                            {/* Resolution (Read Only or Form) */}
                            {selectedDispute.status === 'RESOLVED' || selectedDispute.status === 'DISMISSED' ? (
                                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                                    <h4 className="text-sm font-bold text-green-800 mb-2">Résolution / Conclusion</h4>
                                    <p className="text-sm text-green-700">{selectedDispute.resolution || "Aucune note de résolution."}</p>
                                </div>
                            ) : (
                                <div className="pt-4 border-t border-slate-100">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Note de résolution (Obligatoire)
                                    </label>
                                    <textarea
                                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        rows="3"
                                        placeholder="Expliquez la décision prise et les actions effectuées..."
                                        value={resolutionNote}
                                        onChange={(e) => setResolutionNote(e.target.value)}
                                    />
                                    <div className="flex gap-3 mt-4 justify-end">
                                        <button
                                            onClick={() => handleResolve('DISMISSED')}
                                            className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                                        >
                                            Classer sans suite
                                        </button>
                                        <button
                                            onClick={() => handleResolve('RESOLVED')}
                                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={!resolutionNote.trim()}
                                        >
                                            Marquer comme Résolu
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDisputes;
