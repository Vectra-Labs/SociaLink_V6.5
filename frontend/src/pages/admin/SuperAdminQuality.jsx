import { useState, useEffect } from 'react';
import {
    Shield, CheckCircle, XCircle, AlertTriangle, Eye, UserCheck, Building2, User
} from 'lucide-react';
import api from '../../api/client';

const SuperAdminQuality = () => {
    const [stats, setStats] = useState(null);
    const [pendingProfiles, setPendingProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, pendingRes] = await Promise.all([
                api.get('/admin/quality/stats'),
                api.get('/admin/quality/pending')
            ]);
            setStats(statsRes.data);
            setPendingProfiles(pendingRes.data);
        } catch (error) {
            console.error("Error fetching quality data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (type, id, status) => {
        if (status === 'REJECTED' && !rejectReason) {
            alert("Veuillez indiquer un motif de refus.");
            return;
        }
        if (!window.confirm(`Confirmer ${status === 'VERIFIED' ? 'la validation' : 'le rejet'} ?`)) return;

        setVerifying(true);
        try {
            await api.put(`/admin/quality/profiles/${type}/${id}/review`, {
                status,
                reason: status === 'REJECTED' ? rejectReason : undefined
            });
            // Refresh
            fetchData();
            setSelectedProfile(null);
            setRejectReason("");
            alert(`Profil ${status === 'VERIFIED' ? 'approuvé' : 'rejeté'} avec succès.`);
        } catch (error) {
            alert("Erreur lors de la mise à jour");
        } finally {
            setVerifying(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Chargement du contrôle qualité...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Contrôle Qualité & Vérification</h1>
                    <p className="text-slate-500">Supervisez la conformité et la qualité des profils utilisateurs.</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Score Global</p>
                        <h3 className="text-2xl font-bold text-slate-900">{stats?.globalScore || 0}/100</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                        <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">% Travailleurs Vérifiés</p>
                        <h3 className="text-2xl font-bold text-slate-900">{stats?.workerVerificationRate || 0}%</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">% Établissements Vérifiés</p>
                        <h3 className="text-2xl font-bold text-slate-900">{stats?.establishmentVerificationRate || 0}%</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">En Attente</p>
                        <h3 className="text-2xl font-bold text-slate-900">{stats?.pendingCount || 0}</h3>
                    </div>
                </div>
            </div>

            {/* Verification Queue */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-lg text-slate-900">File d'attente de vérification</h3>
                </div>
                {pendingProfiles.length === 0 ? (
                    <div className="p-12 text-center">
                        <CheckCircle className="w-12 h-12 text-green-200 mx-auto mb-4" />
                        <p className="text-slate-500">Aucun profil en attente de vérification.</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Utilisateur</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Type</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date Inscription</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {pendingProfiles.map((p) => (
                                <tr key={`${p.type}_${p.user_id}`} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{p.displayName}</div>
                                        <div className="text-xs text-slate-500">{p.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {p.type === 'WORKER' ? (
                                            <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-bold border border-blue-100">Travailleur</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded text-xs font-bold border border-purple-100">Établissement</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {new Date(p.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setSelectedProfile(p)}
                                            className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 font-medium"
                                        >
                                            Inspecter
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Inspection Modal */}
            {selectedProfile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Inspection du Profil</h3>
                                <p className="text-sm text-slate-500">Vérification manuelle des informations</p>
                            </div>
                            <button onClick={() => setSelectedProfile(null)} className="p-2 hover:bg-slate-200 rounded-full">
                                <XCircle className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            {/* Profile Identity */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-xl font-bold text-slate-500">
                                    {selectedProfile.displayName?.[0]}
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-slate-900">{selectedProfile.displayName}</h4>
                                    <p className="text-slate-500">{selectedProfile.email}</p>
                                    <div className="mt-1 flex gap-2">
                                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">EN ATTENTE</span>
                                    </div>
                                </div>
                            </div>

                            {/* Bio / Description */}
                            <div>
                                <h5 className="text-xs font-bold text-slate-500 uppercase mb-2">Bio / Description</h5>
                                <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-700 border border-slate-100">
                                    {selectedProfile.bio || selectedProfile.description || <span className="italic text-slate-400">Aucune description fournie.</span>}
                                </div>
                                {(selectedProfile.bio?.length < 50 && selectedProfile.description?.length < 50) && (
                                    <p className="text-xs text-orange-500 flex items-center gap-1 mt-1">
                                        <AlertTriangle className="w-3 h-3" /> Description courte (Qualité faible)
                                    </p>
                                )}
                            </div>

                            {/* Documents check (if any) */}
                            <div>
                                <h5 className="text-xs font-bold text-slate-500 uppercase mb-2">Documents & Preuves</h5>
                                <div className="grid grid-cols-1 gap-2">
                                    {/* Mock display if we don't have deeply nested docs here without extra fetch */}
                                    <div className="p-3 border border-slate-200 rounded-lg flex justify-between items-center bg-slate-50">
                                        <span className="text-sm font-medium text-slate-700">Identité</span>
                                        <span className="text-xs text-slate-400">Non vérifié</span>
                                    </div>
                                    <div className="p-3 border border-slate-200 rounded-lg flex justify-between items-center bg-slate-50">
                                        <span className="text-sm font-medium text-slate-700">CV / Business Info</span>
                                        <span className="text-xs text-slate-400">Non vérifié</span>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 mt-2 italic">Note: Utilisez la vue "Utilisateurs" pour voir les fichiers détaillés.</p>
                            </div>

                            {/* Decision Area */}
                            <div className="pt-6 border-t border-slate-100">
                                <h5 className="text-sm font-bold text-slate-900 mb-3">Décision de modération</h5>

                                <div className="space-y-3">
                                    <textarea
                                        placeholder="Motif du rejet (obligatoire si rejet)..."
                                        className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                        rows="2"
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                    ></textarea>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleReview(selectedProfile.type, selectedProfile.user_id, 'REJECTED')}
                                            disabled={verifying || !rejectReason}
                                            className="flex-1 py-3 bg-white border border-red-200 text-red-600 rounded-lg font-bold hover:bg-red-50 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <XCircle className="w-5 h-5" /> Rejeter
                                        </button>
                                        <button
                                            onClick={() => handleReview(selectedProfile.type, selectedProfile.user_id, 'VERIFIED')}
                                            disabled={verifying}
                                            className="flex-1 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-sm"
                                        >
                                            <CheckCircle className="w-5 h-5" /> Valider le Profil
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminQuality;
