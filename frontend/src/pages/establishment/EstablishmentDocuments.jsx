import { useState, useEffect } from 'react';
import {
    FileText, Upload, Trash2, CheckCircle, XCircle, Clock,
    Loader2, AlertCircle, Eye, Download, Building2
} from 'lucide-react';
import api from '../../api/client';

const EstablishmentDocuments = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedType, setSelectedType] = useState('');

    const documentTypes = [
        { id: 'ICE', label: 'ICE - Identifiant Commun de l\'Entreprise', required: true },
        { id: 'RC', label: 'RC - Registre de Commerce', required: true },
        { id: 'CNSS', label: 'Attestation CNSS', required: false },
        { id: 'PATENT', label: 'Patente', required: false },
        { id: 'RIB', label: 'RIB - Relevé d\'Identité Bancaire', required: false },
        { id: 'OTHER', label: 'Autre Document', required: false }
    ];

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const { data } = await api.get('/establishment/documents');
            setDocuments(data);
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file || !selectedType) {
            alert('Veuillez sélectionner un type de document');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', selectedType);

        try {
            await api.post('/establishment/documents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchDocuments();
            setSelectedType('');
        } catch (error) {
            console.error('Error uploading document:', error);
            alert('Erreur lors de l\'upload');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (docId) => {
        if (!confirm('Supprimer ce document ?')) return;

        try {
            await api.delete(`/establishment/documents/${docId}`);
            fetchDocuments();
        } catch (error) {
            console.error('Error deleting document:', error);
            alert(error.response?.data?.message || 'Erreur lors de la suppression');
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

    const getTypeLabel = (type) => {
        return documentTypes.find(t => t.id === type)?.label || type;
    };

    // Check which required docs are missing
    const uploadedTypes = documents.map(d => d.type);
    const missingRequired = documentTypes.filter(t => t.required && !uploadedTypes.includes(t.id));

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Documents Légaux</h1>
                <p className="text-slate-500">
                    Téléversez vos documents pour vérification. Les documents validés permettent d'obtenir le badge "Établissement Vérifié".
                </p>
            </div>

            {/* Missing Documents Alert */}
            {missingRequired.length > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                            <p className="font-medium text-amber-800">Documents requis manquants</p>
                            <ul className="mt-2 space-y-1">
                                {missingRequired.map(doc => (
                                    <li key={doc.id} className="text-sm text-amber-700">• {doc.label}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-blue-600" />
                    Ajouter un document
                </h3>

                <div className="flex flex-col md:flex-row gap-4">
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                        <option value="">Sélectionner le type de document...</option>
                        {documentTypes.map(type => (
                            <option key={type.id} value={type.id}>
                                {type.label} {type.required && '*'}
                            </option>
                        ))}
                    </select>

                    <label className={`px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 cursor-pointer transition-colors ${selectedType
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}>
                        {uploading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Upload className="w-4 h-4" />
                        )}
                        Téléverser
                        <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png,.webp"
                            onChange={handleUpload}
                            disabled={!selectedType || uploading}
                        />
                    </label>
                </div>

                <p className="text-xs text-slate-500 mt-3">
                    Formats acceptés : PDF, JPEG, PNG (max 10 Mo) • * Documents obligatoires
                </p>
            </div>

            {/* Documents List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Mes documents ({documents.length})
                    </h3>
                </div>

                {documents.length === 0 ? (
                    <div className="p-12 text-center">
                        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">Aucun document téléversé</p>
                        <p className="text-sm text-slate-400 mt-1">Commencez par ajouter votre ICE et RC</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {documents.map((doc) => (
                            <div key={doc.document_id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">{getTypeLabel(doc.type)}</p>
                                        <p className="text-sm text-slate-500">{doc.file_name}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            Ajouté le {new Date(doc.uploaded_at).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    {getStatusBadge(doc.status)}

                                    {doc.rejection_reason && (
                                        <span className="text-xs text-red-600 max-w-[200px] truncate" title={doc.rejection_reason}>
                                            {doc.rejection_reason}
                                        </span>
                                    )}

                                    <div className="flex items-center gap-2">
                                        <a
                                            href={doc.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Voir"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </a>

                                        {doc.status === 'PENDING' && (
                                            <button
                                                onClick={() => handleDelete(doc.document_id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                        <p className="font-medium text-blue-800">Processus de vérification</p>
                        <p className="text-sm text-blue-700 mt-1">
                            Nos administrateurs examinent vos documents sous 24-48h. Une fois validés,
                            vous obtiendrez le badge "Établissement Vérifié" qui renforce la confiance des travailleurs.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EstablishmentDocuments;
