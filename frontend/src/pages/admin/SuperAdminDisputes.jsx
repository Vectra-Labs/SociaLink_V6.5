import { useState, useEffect } from 'react';
import {
    AlertTriangle, CheckCircle, XCircle, MessageSquare, User, FileText, Gavel
} from 'lucide-react';
import api from '../../api/client';

const SuperAdminDisputes = () => {
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, OPEN, RESOLVED, DISMISSED
    const [selectedDispute, setSelectedDispute] = useState(null);
    const [resolutionNote, setResolutionNote] = useState("");
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchDisputes();
    }, [filter]);

    const fetchDisputes = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/admin/disputes?status=${filter}`);
            setDisputes(data);
        } catch (error) {
            console.error("Error loading disputes", error);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (status) => {
        if (!resolutionNote) {
            alert("Veuillez ajouter une note de résolution.");
            return;
        }
        if (!window.confirm(`Confirmer la résolution du litige en tant que ${status} ?`)) return;

        setProcessing(true);
        try {
            await api.put(`/admin/disputes/${selectedDispute.dispute_id}/resolve`, {
                status,
                resolution: resolutionNote
            });
            alert("Litige traité avec succès.");
            setSelectedDispute(null);
            setResolutionNote("");
            fetchDisputes();
        } catch (error) {
            alert("Erreur lors du traitement.");
        } finally {
            setProcessing(false);
        }
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            OPEN: "bg-red-100 text-red-700",
            IN_PROGRESS: "bg-orange-100 text-orange-700",
            RESOLVED: "bg-green-100 text-green-700",
            DISMISSED: "bg-slate-100 text-slate-700"
        };
        return (
            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${styles[status]}`}>
                {status}
            </span>
        );
    };

    if (loading && disputes.length === 0) return <div className="p-8 text-center text-slate-500">Chargement des litiges...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Gestion des Litiges</h1>
                    <p className="text-slate-500">Modération des conflits et signalements utilisateurs.</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-slate-200 pb-1">
                {['ALL', 'OPEN', 'RESOLVED', 'DISMISSED'].map(s => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${filter === s
                                ? 'bg-white border-x border-t border-slate-200 text-blue-600 -mb-px'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        {s === 'ALL' ? 'Tous' : s}
                    </button>
                ))}
            </div>

            {/* Disputes Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {disputes.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-200" />
                        <p>Aucun litige trouvé pour ce filtre.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Type</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Signalé Par</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Cible</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {disputes.map((d) => (
                                    <tr key={d.dispute_id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-slate-900 block">{d.type}</span>
                                            {d.mission?.title && <span className="text-xs text-slate-500">Mission: {d.mission.title}</span>}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="font-medium text-slate-700">{d.reporter?.prenom} {d.reporter?.nom}</div>
                                            <div className="text-xs text-slate-400">{d.reporter?.role}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="font-medium text-red-700">{d.target?.prenom} {d.target?.nom}</div>
                                            <div className="text-xs text-slate-400">{d.target?.role}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500">
                                            {new Date(d.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={d.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => setSelectedDispute(d)}
                                                className="px-3 py-1.5 border border-slate-200 rounded text-sm hover:bg-white bg-slate-50 text-slate-600 font-medium"
                                            >
                                                Traiter
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Resolution Modal */}
            {selectedDispute && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50 rounded-t-xl">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <Gavel className="w-5 h-5 text-red-600" />
                                    Traitement du Litige #{selectedDispute.dispute_id}
                                </h3>
                            </div>
                            <button onClick={() => setSelectedDispute(null)} className="p-2 hover:bg-slate-200 rounded-full">
                                <XCircle className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 overflow-y-auto">
                            <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Description du problème</h4>
                                <p className="text-slate-800 text-sm">{selectedDispute.description}</p>
                            </div>

                            <div className="flex gap-4 text-sm">
                                <div className="flex-1 p-3 border rounded-lg">
                                    <span className="block text-xs text-slate-400">Plaignant</span>
                                    <span className="font-bold">{selectedDispute.reporter?.prenom} {selectedDispute.reporter?.nom}</span>
                                </div>
                                <div className="flex-1 p-3 border rounded-lg border-red-100 bg-red-50">
                                    <span className="block text-xs text-red-400">Accusé</span>
                                    <span className="font-bold text-red-700">{selectedDispute.target?.prenom} {selectedDispute.target?.nom}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Résolution / Action prise</label>
                                <textarea
                                    className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    rows="3"
                                    placeholder="Expliquez la décision (Avertissement envoyé, Remboursement effectué, etc.)"
                                    value={resolutionNote}
                                    onChange={(e) => setResolutionNote(e.target.value)}
                                ></textarea>
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end gap-3">
                            <button
                                onClick={() => handleResolve('DISMISSED')}
                                disabled={processing}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors"
                            >
                                Sans suite (Dismiss)
                            </button>
                            <button
                                onClick={() => handleResolve('RESOLVED')}
                                disabled={processing}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-2"
                            >
                                <CheckCircle className="w-4 h-4" /> Marquer Résolu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminDisputes;
