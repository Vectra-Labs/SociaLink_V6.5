import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/client';
import {
    FileText, Upload, Trash2, Eye, Clock, CheckCircle, XCircle,
    Award, IdCard, FileCheck, Shield, Plus, Loader2, X, AlertTriangle,
    Globe, Lock, Download, File
} from 'lucide-react';

// Mapping Types -> Onglets
const TABS = [
    { id: 'ALL', label: 'Tous' },
    { id: 'CV', label: 'CV' },
    { id: 'DIPLOMA', label: 'Diplômes' },
    { id: 'CERTIFICATE', label: 'Certifications' },
    { id: 'IDENTITY', label: 'Identité' },
    { id: 'OTHER', label: 'Autres' }
];

const DOCUMENT_TYPES = [
    { id: 'CV', label: 'CV', tab: 'CV', icon: FileText },
    { id: 'DIPLOMA', label: 'Diplôme', tab: 'DIPLOMA', icon: Award },
    { id: 'CERTIFICATE', label: 'Certificat / Formation', tab: 'CERTIFICATE', icon: Award },
    { id: 'CIN', label: 'Carte d\'identité (CIN)', tab: 'IDENTITY', icon: IdCard },
    { id: 'CASIER_JUDICIAIRE', label: 'Casier Judiciaire', tab: 'IDENTITY', icon: FileCheck },
    { id: 'CARTE_CNSS', label: 'Carte CNSS', tab: 'IDENTITY', icon: Shield },
    { id: 'ATTESTATION_TRAVAIL', label: 'Attestation de travail', tab: 'OTHER', icon: FileText },
    { id: 'OTHER', label: 'Autre document', tab: 'OTHER', icon: File }
];

const STATUS_BADGES = {
    PENDING: { label: 'En attente', color: 'text-amber-600 bg-amber-50' },
    VERIFIED: { label: 'Validé', color: 'text-emerald-600 bg-emerald-50' },
    REJECTED: { label: 'Rejeté', color: 'text-red-600 bg-red-50' }
};

export default function WorkerDocuments() {
    const { user } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL');
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    // Upload state
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedType, setSelectedType] = useState('');
    const [docMetadata, setDocMetadata] = useState({
        name: '',
        institution: '',
        issue_date: '',
        expiry_date: '',
        document_number: '',
        specialty: '',
        grade: ''
    });
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/worker/documents');
            // Mock CV for UI demo if not present, assuming backend might map CV to OTHER
            setDocuments(data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Filter documents based on active tab
    const filteredDocuments = documents.filter(doc => {
        if (activeTab === 'ALL') return true;

        // Find doc type definition
        const typeDef = DOCUMENT_TYPES.find(t => t.id === doc.type);
        if (!typeDef) {
            // Fallback for types not in our list (e.g. old data)
            return activeTab === 'OTHER';
        }

        return typeDef.tab === activeTab;
    });

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.size > MAX_FILE_SIZE) {
                alert("Le fichier est trop volumineux. La taille maximum est de 15 MB.");
                return;
            }
            setSelectedFile(file);
            setDocMetadata(prev => ({ ...prev, name: file.name }));
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > MAX_FILE_SIZE) {
                alert("Le fichier est trop volumineux. La taille maximum est de 15 MB.");
                return;
            }
            setSelectedFile(file);
            setDocMetadata(prev => ({ ...prev, name: file.name }));
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !selectedType || !docMetadata.name) {
            alert("Veuillez remplir tous les champs obligatoires.");
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            
            // Append fields FIRST (Best practice for Multer)
            formData.append('type', selectedType);
            formData.append('name', docMetadata.name);
            
            if (docMetadata.institution) formData.append('institution', docMetadata.institution);
            if (docMetadata.issue_date) formData.append('issue_date', docMetadata.issue_date);
            if (docMetadata.expiry_date) formData.append('expiry_date', docMetadata.expiry_date);
            if (docMetadata.document_number) formData.append('document_number', docMetadata.document_number);
            
            // New fields
            if (docMetadata.specialty) formData.append('specialty', docMetadata.specialty);
            if (docMetadata.grade) formData.append('grade', docMetadata.grade);

            // Append file LAST
            formData.append('file', selectedFile);

            await api.post('/worker/documents', formData);

            // Reset interaction
            setSelectedFile(null);
            setSelectedType('');
            setDocMetadata({
                name: '',
                institution: '',
                issue_date: '',
                expiry_date: '',
                document_number: '',
                specialty: '',
                grade: ''
            });
            fetchDocuments();

        } catch (err) {
            console.error(err);
            console.log("Upload Error Details:", err.response?.data);
            const message = err.response?.data?.message || "Erreur lors de l'upload.";
            alert(message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;
        try {
            await api.delete(`/worker/documents/${id}`);
            fetchDocuments();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Mes Documents</h1>
                <p className="text-slate-500">Gérez vos documents professionnels</p>
            </div>

            {/* Upload Area */}
            <div
                className={`bg-white border-2 border-dashed rounded-xl p-8 transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <div className="flex flex-col items-center justify-center text-center w-full">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                        <Upload className="w-6 h-6" />
                    </div>

                    {!selectedFile ? (
                        <>
                            <h3 className="text-lg font-semibold text-slate-900 mb-1">Téléverser un document</h3>
                            <p className="text-slate-500 text-sm mb-6">Glissez-déposez vos fichiers ici ou cliquez pour parcourir</p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                                >
                                    Parcourir
                                </button>
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 focus:border-blue-500 outline-none bg-white"
                                >
                                    <option value="">Sélectionner une catégorie</option>
                                    {DOCUMENT_TYPES.map(type => (
                                        <option key={type.id} value={type.id}>{type.label}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    ) : (
                        <div className="w-full max-w-xl bg-slate-50 rounded-xl p-6 text-left">
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                                        <FileText className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 truncate max-w-[200px]">{selectedFile.name}</p>
                                        <p className="text-xs text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedFile(null)}
                                    className="p-1 hover:bg-slate-200 rounded text-slate-500"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid gap-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie <span className="text-red-500">*</span></label>
                                        <select
                                            value={selectedType}
                                            onChange={(e) => setSelectedType(e.target.value)}
                                            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Choisir...</option>
                                            {DOCUMENT_TYPES.map(type => (
                                                <option key={type.id} value={type.id}>{type.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Nom du document <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={docMetadata.name}
                                            onChange={(e) => setDocMetadata({...docMetadata, name: e.target.value})}
                                            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Ex: Mon Diplôme"
                                        />
                                    </div>
                                </div>

                                {/* Dynamic Fields */}
                                {selectedType === 'CIN' && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Numéro de CIN <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            value={docMetadata.document_number}
                                            onChange={(e) => setDocMetadata({...docMetadata, document_number: e.target.value})}
                                            className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Ex: AB123456"
                                        />
                                    </div>
                                )}

                                {(selectedType === 'DIPLOMA' || selectedType === 'CERTIFICATE') && (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Établissement / École</label>
                                                <input
                                                    type="text"
                                                    value={docMetadata.institution}
                                                    onChange={(e) => setDocMetadata({...docMetadata, institution: e.target.value})}
                                                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Ex: Université Hassan II"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Date d'obtention</label>
                                                <input
                                                    type="date"
                                                    value={docMetadata.issue_date}
                                                    onChange={(e) => setDocMetadata({...docMetadata, issue_date: e.target.value})}
                                                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Filière / Spécialité</label>
                                                <input
                                                    type="text"
                                                    value={docMetadata.specialty}
                                                    onChange={(e) => setDocMetadata({...docMetadata, specialty: e.target.value})}
                                                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Ex: Développement Informatique"
                                                />
                                            </div>
                                            {selectedType === 'DIPLOMA' && (
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Mention</label>
                                                    <select
                                                        value={docMetadata.grade}
                                                        onChange={(e) => setDocMetadata({...docMetadata, grade: e.target.value})}
                                                        className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="">Choisir...</option>
                                                        <option value="Passable">Passable</option>
                                                        <option value="Assez Bien">Assez Bien</option>
                                                        <option value="Bien">Bien</option>
                                                        <option value="Très Bien">Très Bien</option>
                                                        <option value="Excellent">Excellent</option>
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                {selectedType === 'ATTESTATION_TRAVAIL' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Nom de l'entreprise</label>
                                            <input
                                                type="text"
                                                value={docMetadata.institution}
                                                onChange={(e) => setDocMetadata({...docMetadata, institution: e.target.value})}
                                                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Ex: Société X"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Date de début</label>
                                                <input
                                                    type="date"
                                                    value={docMetadata.issue_date}
                                                    onChange={(e) => setDocMetadata({...docMetadata, issue_date: e.target.value})}
                                                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Date de fin</label>
                                                <input
                                                    type="date"
                                                    value={docMetadata.expiry_date}
                                                    onChange={(e) => setDocMetadata({...docMetadata, expiry_date: e.target.value})}
                                                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="flex justify-end gap-3 mt-2">
                                    <button
                                        onClick={() => setSelectedFile(null)}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={handleUpload}
                                        disabled={!selectedType || !docMetadata.name || uploading}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {uploading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Envoi en cours...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4" />
                                                Envoyer le document
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <p className="text-xs text-slate-400 mt-4">Formats acceptés : PDF, JPG, PNG (max 15 MB)</p>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileSelect}
                        accept=".pdf,.jpg,.jpeg,.png"
                    />
                </div>

            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-slate-200 p-1 overflow-x-auto">
                <div className="flex items-center gap-1 min-w-max">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Documents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocuments.length > 0 ? (
                    filteredDocuments.map(doc => {
                        const typeDef = DOCUMENT_TYPES.find(t => t.id === doc.type) || DOCUMENT_TYPES[7];
                        const Icon = typeDef.icon;
                        const status = STATUS_BADGES[doc.status] || STATUS_BADGES.PENDING;

                        return (
                            <div key={doc.document_id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <a
                                            href={doc.file_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600"
                                            title="Voir"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </a>
                                        <button
                                            onClick={() => handleDelete(doc.document_id)}
                                            className="p-1.5 hover:bg-red-50 rounded-lg text-slate-500 hover:text-red-600"
                                            title="Supprimer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h3 className="font-semibold text-slate-900 truncate mb-1" title={doc.name}>{doc.name}</h3>
                                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                                        {typeDef.label}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-xs pt-4 border-t border-slate-100">
                                    <span className="text-slate-400">
                                        {new Date(doc.created_at).toLocaleDateString('fr-FR')}
                                    </span>
                                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${status.color}`}>
                                        {doc.status === 'VERIFIED' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                        <span className="font-medium">{doc.status === 'VERIFIED' ? 'Public' : status.label}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full py-12 text-center text-slate-500">
                        <File className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                        <p>Aucun document dans cette catégorie.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
