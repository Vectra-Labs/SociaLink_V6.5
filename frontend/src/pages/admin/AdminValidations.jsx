import { useState, useEffect } from 'react';
import {
    CheckCircle, XCircle, Search, Eye, Filter, ShieldCheck, FileText
} from 'lucide-react';
import api from '../../api/client';

const AdminValidations = () => {
    const [pendingProfiles, setPendingProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [processing, setProcessing] = useState(false);
    const [stats, setStats] = useState({ globalScore: 0, pendingCount: 0 });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, profilesRes] = await Promise.all([
                api.get('/super-admin/quality/stats'),
                api.get('/super-admin/quality/pending')
            ]);
            setStats(statsRes.data);
            setPendingProfiles(profilesRes.data);
        } catch (error) {
            console.error("Error loading validations", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (status) => {
        if (status === 'REJECTED' && !rejectReason) {
            alert("Veuillez indiquer une raison pour le rejet.");
            return;
        }

        setProcessing(true);
        try {
            // Determine type based on role or explicit type field if available
            // My API getPendingVerifications returns { type: 'worker' | 'establishment', ... }
            const type = selectedProfile.type;

            await api.put(`/super-admin/quality/profiles/${type}/${selectedProfile.user_id}/review`, {
                status,
                rejection_reason: rejectReason
            });

            alert(`Profil ${status === 'VERIFIED' ? 'validé' : 'rejeté'} avec succès.`);
            setSelectedProfile(null);
            setRejectReason("");
            fetchData(); // Refresh list
        } catch (error) {
            alert("Erreur lors du traitement.");
        } finally {
            setProcessing(false);
        }
    };

    if (loading && pendingProfiles.length === 0) return <div className="p-8 text-center text-slate-500">Chargement des validations...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Validations Profils</h1>
                    <p className="text-slate-500">Vérification manuelle des travailleurs et établissements.</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium shadow-sm">
                        En attente: <span className="text-blue-600 font-bold">{pendingProfiles.length}</span>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Utilisateur</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Type</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date Inscription</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Score Auto</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {pendingProfiles.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-200" />
                                    Aucun profil en attente de validation.
                                </td>
                            </tr>
                        ) : (
                            pendingProfiles.map((p) => (
                                <tr key={p.user_id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold text-xs uppercase">
                                                {p.role.substring(0, 2)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{p.prenom} {p.nom}</p>
                                                <p className="text-xs text-slate-500">{p.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.role === 'WORKER' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                            }`}>
                                            {p.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {new Date(p.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        {/* Mock score logic if not available in API yet */}
                                        <div className="flex items-center gap-1">
                                            <ShieldCheck className="w-4 h-4 text-green-500" />
                                            <span className="text-sm font-medium text-slate-700">Bon</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setSelectedProfile(p)}
                                            className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-white hover:border-blue-300 hover:text-blue-600 transition-all flex items-center gap-2 ml-auto"
                                        >
                                            <Eye className="w-4 h-4" /> Inspecter
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Inspection Modal */}
            {selectedProfile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Inspection du Profil</h3>
                                <p className="text-sm text-slate-500">Vérifiez les informations avant validation.</p>
                            </div>
                            <button onClick={() => setSelectedProfile(null)} className="p-2 hover:bg-slate-100 rounded-full">
                                <XCircle className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6">
                            {/* Identity */}
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-xl font-bold text-slate-300 border-2 border-slate-200">
                                    {selectedProfile.role.substring(0, 2)}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-lg text-slate-900">{selectedProfile.prenom} {selectedProfile.nom}</h4>
                                    <p className="text-sm text-slate-500">{selectedProfile.email}</p>
                                    <p className="text-sm text-slate-500 mt-1">{selectedProfile.role} • Inscrit le {new Date(selectedProfile.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Bio / Description */}
                            <div>
                                <h5 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-slate-400" /> Bio / Description
                                </h5>
                                <div className="p-4 border rounded-lg text-sm text-slate-700 bg-white shadow-sm">
                                    {selectedProfile.bio ? selectedProfile.bio : <span className="text-slate-400 italic">Aucune description fournie.</span>}
                                </div>
                                {(!selectedProfile.bio || selectedProfile.bio.length < 20) && (
                                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" /> Attention: Description courte ou manquante.
                                    </p>
                                )}
                            </div>

                            {/* Documents Mockup */}
                            <div>
                                <h5 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-slate-400" /> Documents & Conformité
                                </h5>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 border rounded border-green-200 bg-green-50 text-green-800 text-sm flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" /> Email Vérifié
                                    </div>
                                    <div className="p-3 border rounded border-slate-200 bg-slate-50 text-slate-500 text-sm flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full border-2 border-slate-300"></div> Identité (Non requis)
                                    </div>
                                </div>
                            </div>

                            {/* Rejection Reason */}
                            <div className="pt-4 border-t border-slate-100">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Motif (si rejet)</label>
                                <textarea
                                    className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                    placeholder="Expliquez pourquoi le profil est rejeté..."
                                    rows="2"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                ></textarea>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-xl">
                            <button
                                onClick={() => handleReview('REJECTED')}
                                disabled={processing}
                                className="px-4 py-2 bg-white border border-red-200 text-red-700 rounded-lg font-bold hover:bg-red-50 shadow-sm transition-colors"
                            >
                                Rejeter
                            </button>
                            <button
                                onClick={() => handleReview('VERIFIED')}
                                disabled={processing}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 shadow-sm transition-colors flex items-center gap-2"
                            >
                                <CheckCircle className="w-4 h-4" /> Valider le Profil
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminValidations;
