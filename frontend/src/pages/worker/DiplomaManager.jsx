import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import {
    Award, Plus, FileText, Trash, Upload,
    ArrowLeft, Loader, CheckCircle, AlertCircle,
    Sparkles, Image, FileImage
} from 'lucide-react';

export default function DiplomaManager() {
    const navigate = useNavigate();
    const [diplomas, setDiplomas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [ocrProcessing, setOcrProcessing] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Form
    const [formData, setFormData] = useState({
        name: '',
        institution: '',
        issue_date: '',
    });
    const [file, setFile] = useState(null);
    const [ocrData, setOcrData] = useState(null);

    useEffect(() => {
        fetchDiplomas();
    }, []);

    const fetchDiplomas = async () => {
        try {
            const { data } = await api.get('/worker/profile');
            setDiplomas(data.data.diplomas || []);
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Impossible de charger les diplômes.' });
        } finally {
            setLoading(false);
        }
    };

    // OCR Processing for images
    const processOCR = async (selectedFile) => {
        const imageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

        if (!imageTypes.includes(selectedFile.type)) {
            return null; // PDF - no OCR available yet
        }

        setOcrProcessing(true);
        setMessage({ type: 'info', text: '🔍 Analyse OCR en cours...' });

        try {
            const formPayload = new FormData();
            formPayload.append('file', selectedFile);
            formPayload.append('document_type', 'DIPLOMA');
            formPayload.append('name', 'temp_ocr_scan');

            // Upload temporarily to get OCR results
            const { data } = await api.post('/worker/documents', formPayload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (data.ocrData) {
                setOcrData(data.ocrData);

                // Auto-fill form with OCR data
                setFormData(prev => ({
                    name: data.ocrData.title || prev.name,
                    institution: data.ocrData.institution || prev.institution,
                    issue_date: data.ocrData.issueDate || prev.issue_date,
                }));

                setMessage({
                    type: 'success',
                    text: `✨ OCR: ${data.ocrData.confidence}% de confiance. Vérifiez et ajustez les champs.`
                });

                return data.ocrData;
            }
        } catch (error) {
            console.error('OCR Error:', error);
            setMessage({ type: 'warning', text: 'OCR non disponible. Remplissez manuellement.' });
        } finally {
            setOcrProcessing(false);
        }

        return null;
    };

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

        if (selectedFile && allowedTypes.includes(selectedFile.type)) {
            setFile(selectedFile);
            setMessage({ type: '', text: '' });
            setOcrData(null);

            // Trigger OCR for images
            if (selectedFile.type !== 'application/pdf') {
                await processOCR(selectedFile);
            }
        } else {
            setMessage({ type: 'error', text: 'Formats acceptés: PDF, JPG, PNG' });
            setFile(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage({ type: 'error', text: 'Veuillez joindre un fichier.' });
            return;
        }

        setUploading(true);
        setMessage({ type: '', text: '' });

        const formPayload = new FormData();
        formPayload.append('file', file);
        formPayload.append('name', formData.name);
        formPayload.append('institution', formData.institution);
        formPayload.append('issue_date', formData.issue_date);
        formPayload.append('description', 'Diploma upload');

        try {
            await api.post('/diplomas/add', formPayload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setMessage({ type: 'success', text: 'Diplôme ajouté avec succès !' });
            setFormData({ name: '', institution: '', issue_date: '' });
            setFile(null);
            setOcrData(null);
            fetchDiplomas();
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Erreur lors de l\'upload du diplôme.' });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        alert("Pour supprimer un diplôme déjà validé ou en cours, veuillez contacter le support.");
    };

    const isImage = file && file.type?.startsWith('image/');

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-10">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/worker/dashboard')}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Mes Diplômes</h1>
                    <p className="text-slate-500">Ajoutez vos certifications - OCR automatique pour les images</p>
                </div>
            </div>

            {message.text && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        message.type === 'info' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                            message.type === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
                        message.type === 'info' ? <Sparkles className="w-5 h-5 animate-pulse" /> :
                            <AlertCircle className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Add Diploma Form */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Plus className="w-5 h-5 text-blue-600" />
                                <h3 className="font-semibold text-slate-800">Ajouter un diplôme</h3>
                            </div>
                            {ocrData && (
                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full flex items-center gap-1">
                                    <Sparkles className="w-3 h-3" />
                                    OCR {ocrData.confidence}%
                                </span>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Intitulé du diplôme
                                    {ocrData?.title && <span className="text-blue-600 ml-1">(auto-rempli)</span>}
                                </label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ex: Master en Psychologie"
                                    className={`w-full p-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${ocrData?.title ? 'border-blue-300 bg-blue-50/30' : 'border-slate-200'
                                        }`}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Établissement / École
                                    {ocrData?.institution && <span className="text-blue-600 ml-1">(auto-rempli)</span>}
                                </label>
                                <input
                                    required
                                    value={formData.institution}
                                    onChange={e => setFormData({ ...formData, institution: e.target.value })}
                                    placeholder="Ex: Université Mohammed V"
                                    className={`w-full p-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${ocrData?.institution ? 'border-blue-300 bg-blue-50/30' : 'border-slate-200'
                                        }`}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Date d'obtention
                                    {ocrData?.issueDate && <span className="text-blue-600 ml-1">(auto-rempli)</span>}
                                </label>
                                <input
                                    type="text"
                                    value={formData.issue_date}
                                    onChange={e => setFormData({ ...formData, issue_date: e.target.value })}
                                    placeholder="Ex: 15/06/2022"
                                    className={`w-full p-2.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${ocrData?.issueDate ? 'border-blue-300 bg-blue-50/30' : 'border-slate-200'
                                        }`}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Justificatif (PDF ou Image)
                                </label>
                                <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${ocrProcessing ? 'border-blue-300 bg-blue-50 animate-pulse' :
                                        file ? 'border-emerald-300 bg-emerald-50' :
                                            'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                                    }`}>
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        {ocrProcessing ? (
                                            <>
                                                <Loader className="w-8 h-8 text-blue-500 mb-2 animate-spin" />
                                                <p className="text-sm text-blue-700 font-medium">Analyse OCR...</p>
                                            </>
                                        ) : file ? (
                                            <>
                                                {isImage ? <FileImage className="w-8 h-8 text-emerald-500 mb-2" /> : <FileText className="w-8 h-8 text-emerald-500 mb-2" />}
                                                <p className="text-sm text-emerald-700 font-medium truncate max-w-[200px]">{file.name}</p>
                                                {isImage && <p className="text-xs text-blue-600 mt-1">✨ OCR activé</p>}
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                                                <p className="text-sm text-slate-500">PDF, JPG, PNG (Max 5MB)</p>
                                                <p className="text-xs text-blue-500 mt-1">🔍 OCR auto pour images</p>
                                            </>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="application/pdf,image/jpeg,image/png,image/jpg,image/webp"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={uploading || ocrProcessing}
                                className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {uploading ? <Loader className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                                Ajouter le diplôme
                            </button>
                        </form>
                    </div>
                </div>

                {/* List of Diplomas */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[400px]">
                        <div className="flex items-center gap-2 mb-6">
                            <Award className="w-5 h-5 text-blue-600" />
                            <h3 className="font-semibold text-slate-800">Mes certifications ({diplomas.length})</h3>
                        </div>

                        <div className="space-y-3">
                            {diplomas.length > 0 ? diplomas.map((diploma, index) => (
                                <div key={index} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 group hover:border-blue-200 transition-colors">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0">
                                        <Award className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-slate-800 truncate">{diploma.name}</h4>
                                        <p className="text-sm text-slate-500 truncate">{diploma.institution}</p>
                                        {diploma.issue_date && (
                                            <p className="text-xs text-slate-400 mt-1">{diploma.issue_date}</p>
                                        )}
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${diploma.verification_status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' :
                                                    diploma.verification_status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                        'bg-amber-100 text-amber-700'
                                                }`}>
                                                {diploma.verification_status === 'VERIFIED' ? 'Vérifié' :
                                                    diploma.verification_status === 'REJECTED' ? 'Rejeté' : 'En attente'}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(diploma.diploma_id)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        title="Supprimer"
                                    >
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </div>
                            )) : (
                                <div className="text-center py-10 text-slate-400">
                                    <Award className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>Aucun diplôme ajouté.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
