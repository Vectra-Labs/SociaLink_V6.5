import { useState, useEffect } from 'react';
import {
    FileText, CheckCircle, XCircle, Clock, Loader2,
    Eye, Building2, Filter, Search, AlertTriangle
} from 'lucide-react';
import api from '../../api/client';

const AdminEstablishmentDocs = () => {
    const [documents, setDocuments] = useState([]);
    const [stats, setStats] = useState({ pending: 0, verified: 0, rejected: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING');
    const [processing, setProcessing] = useState(null);
    const [rejectModal, setRejectModal] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    const documentTypes = {
        ICE: 'ICE - Identifiant Commun',
        RC: 'Registre de Commerce',
        CNSS: 'Attestation CNSS',
        PATENT: 'Patente',
        RIB: 'RIB',
        OTHER: 'Autre Document'
    };

    useEffect(() => {
        fetchData();
    }, [filter]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [docsRes, statsRes] = await Promise.all([
                api.get(`/admin/establishment-documents?status=${filter}`),
                api.get('/admin/establishment-documents/stats')
            ]);
            setDocuments(docsRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleValidate = async (docId) => {
        setProcessing(docId);
        try {
            await api.put(`/admin/establishment-documents/${docId}/validate`);
            fetchData();
        } catch (error) {
            console.error('Error validating:', error);
            alert('Erreur lors de la validation');
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            alert('Veuillez indiquer la raison du rejet');
            return;
        }

        setProcessing(rejectModal);
        try {
            await api.put(`/admin/establishment-documents/${rejectModal}/reject`, {
                reason: rejectReason
            });
            setRejectModal(null);
            setRejectReason('');
            fetchData();
        } catch (error) {
            console.error('Error rejecting:', error);
            alert('Erreur lors du rejet');
        } finally {
            setProcessing(null);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'VERIFIED':
                return (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                        <CheckCircle className="w-3.5 h-3.5" /> Validé
                    </span>
                );
            case 'REJECTED':
                return (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full">
                        <XCircle className="w-3.5 h-3.5" /> Rejeté
                    </span>
                );
            default:
                return (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
                        <Clock className="w-3.5 h-3.5" /> En attente
                    </span>
                );
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Documents Établissements</h1>
                <p className="text-slate-500">Vérifiez et validez les documents légaux des établissements.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div
                    onClick={() => setFilter('PENDING')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${filter === 'PENDING'
                            ? 'bg-amber-50 border-amber-200 ring-2 ring-amber-200'
                            : 'bg-white border-slate-200 hover:border-amber-200'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
                            <p className="text-xs text-slate-500">En attente</p>
                        </div>
                    </div>
                </div>

                <div
                    onClick={() => setFilter('VERIFIED')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${filter === 'VERIFIED'
                            ? 'bg-emerald-50 border-emerald-200 ring-2 ring-emerald-200'
                            : 'bg-white border-slate-200 hover:border-emerald-200'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{stats.verified}</p>
                            <p className="text-xs text-slate-500">Validés</p>
                        </div>
                    </div>
                </div>

                <div
                    onClick={() => setFilter('REJECTED')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${filter === 'REJECTED'
                            ? 'bg-red-50 border-red-200 ring-2 ring-red-200'
                            : 'bg-white border-slate-200 hover:border-red-200'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <XCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{stats.rejected}</p>
                            <p className="text-xs text-slate-500">Rejetés</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-xl border bg-white border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                            <p className="text-xs text-slate-500">Total</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Documents Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : documents.length === 0 ? (
                    <div className="p-12 text-center">
                        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">Aucun document {filter === 'PENDING' ? 'en attente' : filter === 'VERIFIED' ? 'validé' : 'rejeté'}</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Établissement</th>
                                <th className="px-6 py-4">Document</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {documents.map((doc) => (
                                <tr key={doc.document_id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                                                {doc.establishment?.logo_url ? (
                                                    <img src={doc.establishment.logo_url} alt="" className="w-8 h-8 rounded object-cover" />
                                                ) : (
                                                    <Building2 className="w-5 h-5 text-purple-600" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{doc.establishment?.name}</p>
                                                <p className="text-xs text-slate-500">ICE: {doc.establishment?.ice_number}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-slate-900">{documentTypes[doc.type]}</p>
                                        <p className="text-xs text-slate-500">{doc.file_name}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {new Date(doc.uploaded_at).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(doc.status)}
                                        {doc.rejection_reason && (
                                            <p className="text-xs text-red-500 mt-1 max-w-[150px] truncate" title={doc.rejection_reason}>
                                                {doc.rejection_reason}
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <a
                                                href={doc.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Voir le document"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </a>

                                            {doc.status === 'PENDING' && (
                                                <>
                                                    <button
                                                        onClick={() => handleValidate(doc.document_id)}
                                                        disabled={processing === doc.document_id}
                                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                                                        title="Valider"
                                                    >
                                                        {processing === doc.document_id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <CheckCircle className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => setRejectModal(doc.document_id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Rejeter"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Reject Modal */}
            {rejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-red-50">
                            <h3 className="font-bold text-lg text-red-800 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                Rejeter le document
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Raison du rejet *
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none resize-none"
                                    rows={3}
                                    placeholder="Expliquez pourquoi ce document est rejeté..."
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setRejectModal(null); setRejectReason(''); }}
                                    className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={processing}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                    Confirmer le rejet
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEstablishmentDocs;
