import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, User, Mail, Phone, MapPin, Calendar, FileText, Download,
    Eye, CheckCircle, XCircle, Clock, Copy, ExternalLink, AlertTriangle,
    Award, Briefcase, GraduationCap, Building2, Shield, Loader2
} from 'lucide-react';
import api from '../../api/client';

const WorkerVerificationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [worker, setWorker] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [adminNotes, setAdminNotes] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);

    useEffect(() => {
        fetchWorkerDetails();
    }, [id]);

    const fetchWorkerDetails = async () => {
        setLoading(true);
        try {
            // Fetch unified worker details (Profile + Docs + Exp)
            const { data } = await api.get(`/super-admin/quality/worker/${id}/details`);

            setWorker(data.worker);
            setDocuments(data.diplomas || []);
            setExperiences(data.experiences || []);

        } catch (error) {
            console.error('Error fetching worker details', error);
            // If main fetch fails, we can't do much
        } finally {
            setLoading(false);
        }
    };

    const handleTakeCharge = async () => {
        setProcessing(true);
        try {
            await api.put(`/super-admin/quality/worker/${id}`, { status: 'IN_REVIEW' });
            setWorker(prev => ({ ...prev, status: 'IN_REVIEW' }));
        } catch (error) {
            alert('Erreur lors de la prise en charge');
        } finally {
            setProcessing(false);
        }
    };

    const handleValidate = async (withDiploma = true) => {
        setProcessing(true);
        try {
            await api.put(`/super-admin/quality/worker/${id}`, {
                status: 'VALIDATED',
                notes: adminNotes,
                hasDiploma: withDiploma
            });
            navigate('/admin/verification/workers', { state: { message: 'Profil validé avec succès' } });
        } catch (error) {
            alert('Erreur lors de la validation');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            alert('Veuillez indiquer un motif de rejet');
            return;
        }
        setProcessing(true);
        try {
            await api.put(`/super-admin/quality/worker/${id}`, {
                status: 'REJECTED',
                rejectReason: rejectReason,
                notes: adminNotes
            });
            navigate('/admin/verification/workers', { state: { message: 'Profil rejeté' } });
        } catch (error) {
            alert('Erreur lors du rejet');
        } finally {
            setProcessing(false);
            setShowRejectModal(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Could add a toast notification here
    };

    const getStatusBadge = (status) => {
        const config = {
            PENDING: { label: 'En attente', class: 'bg-amber-100 text-amber-700', icon: Clock },
            IN_REVIEW: { label: 'En cours de vérification', class: 'bg-blue-100 text-blue-700', icon: Eye },
            VALIDATED: { label: 'Validé', class: 'bg-green-100 text-green-700', icon: CheckCircle },
            REJECTED: { label: 'Rejeté', class: 'bg-red-100 text-red-700', icon: XCircle },
        };
        const cfg = config[status] || config.PENDING;
        const Icon = cfg.icon;
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full ${cfg.class}`}>
                <Icon className="w-4 h-4" />
                {cfg.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!worker) {
        return (
            <div className="text-center py-12">
                <User className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700">Travailleur non trouvé</h3>
                <Link to="/admin/verification/workers" className="text-blue-600 hover:underline mt-2 inline-block">
                    Retour à la liste
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/admin/verification/workers')}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-slate-900">
                        Fiche Travailleur
                    </h1>
                    <p className="text-slate-500">Vérification d'identité et de documents</p>
                </div>
                {getStatusBadge(worker.status)}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column - Profile Info */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Profile Card */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
                            <div className="flex items-center gap-4">
                                {worker.profile_picture ? (
                                    <img
                                        src={worker.profile_picture}
                                        alt={worker.prenom}
                                        className="w-20 h-20 rounded-full object-cover border-4 border-white/30"
                                    />
                                ) : (
                                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
                                        {worker.prenom?.charAt(0) || 'T'}
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-xl font-bold">
                                        {worker.prenom || 'Prénom'} {worker.nom || 'Nom'}
                                    </h2>
                                    <p className="text-blue-100">{worker.title || 'Titre non défini'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <span className="text-slate-700">{worker.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="w-4 h-4 text-slate-400" />
                                <span className="text-slate-700">{worker.phone || 'Non renseigné'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                <span className="text-slate-700">{worker.city?.name || 'Ville non renseignée'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <span className="text-slate-700">
                                    Inscrit le {new Date(worker.created_at).toLocaleDateString('fr-FR')}
                                </span>
                            </div>
                            {worker.experience_years && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Briefcase className="w-4 h-4 text-slate-400" />
                                    <span className="text-slate-700">{worker.experience_years} ans d'expérience</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bio */}
                    {worker.bio && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                            <h3 className="font-semibold text-slate-800 mb-2">Présentation</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">{worker.bio}</p>
                        </div>
                    )}

                    {/* Specialities */}
                    {worker.specialities && worker.specialities.length > 0 && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                            <h3 className="font-semibold text-slate-800 mb-3">Spécialités</h3>
                            <div className="flex flex-wrap gap-2">
                                {worker.specialities.map((spec, i) => (
                                    <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                                        {spec.name || spec}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Documents & Experiences */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Experiences */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-slate-400" />
                            <h3 className="font-semibold text-slate-800">Expériences Professionnelles</h3>
                            <span className="ml-auto text-sm text-slate-400">{experiences.length} expérience(s)</span>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {experiences.length === 0 ? (
                                <div className="p-6 text-center text-slate-500">
                                    <Briefcase className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                                    Aucune expérience déclarée
                                </div>
                            ) : (
                                experiences.map((exp, index) => (
                                    <div key={exp.id || index} className="p-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium text-slate-800">{exp.job_title}</h4>
                                                <p className="text-sm text-slate-500">{exp.company_name}</p>
                                            </div>
                                            <span className="text-xs text-slate-400">
                                                {new Date(exp.start_date).getFullYear()} - {exp.is_current_role ? 'Présent' : new Date(exp.end_date).getFullYear()}
                                            </span>
                                        </div>
                                        {exp.description && (
                                            <p className="text-sm text-slate-600 mt-2">{exp.description}</p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Documents / Diplomas with OCR */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-slate-400" />
                            <h3 className="font-semibold text-slate-800">Documents & Diplômes</h3>
                            <span className="ml-auto text-sm text-slate-400">{documents.length} document(s)</span>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {documents.length === 0 ? (
                                <div className="p-6 text-center">
                                    <FileText className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                                    <p className="text-slate-500">Aucun document soumis</p>
                                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg inline-block">
                                        <div className="flex items-center gap-2 text-amber-700 text-sm">
                                            <AlertTriangle className="w-4 h-4" />
                                            Validation possible avec mention "Sans diplôme" si 3+ ans d'expérience
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                documents.map((doc, index) => (
                                    <div key={doc.diploma_id || index} className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <GraduationCap className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-slate-800">{doc.name || 'Document'}</h4>
                                                    <p className="text-sm text-slate-500">{doc.institution || 'Institution non précisée'}</p>
                                                </div>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${doc.verification_status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                                                doc.verification_status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                {doc.verification_status === 'VERIFIED' ? 'Vérifié' :
                                                    doc.verification_status === 'REJECTED' ? 'Rejeté' : 'En attente'}
                                            </span>
                                        </div>

                                        {/* Manual Verification Info Card (Replaces OCR) */}
                                        <div className="bg-slate-50 rounded-lg p-4 mb-3 border border-slate-200">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Shield className="w-4 h-4 text-blue-600" />
                                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Informations Déclarées (à vérifier)</span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-sm">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-slate-500 mb-0.5">Titre / Intitulé</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-slate-800">{doc.name || 'Non précisé'}</span>
                                                        <button onClick={() => copyToClipboard(doc.name)} className="p-1 hover:bg-slate-200 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Copy className="w-3 h-3 text-slate-400" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col">
                                                    <span className="text-xs text-slate-500 mb-0.5">Établissement / Source</span>
                                                    <span className="font-medium text-slate-800">{doc.institution || 'Non précisé'}</span>
                                                </div>

                                                {(doc.issue_date || doc.expiry_date) && (
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-slate-500 mb-0.5">Dates</span>
                                                        <span className="font-medium text-slate-800">
                                                            {doc.issue_date && `Délivré le: ${new Date(doc.issue_date).toLocaleDateString('fr-FR')}`}
                                                            {doc.issue_date && doc.expiry_date && ' / '}
                                                            {doc.expiry_date && `Expire le: ${new Date(doc.expiry_date).toLocaleDateString('fr-FR')}`}
                                                        </span>
                                                    </div>
                                                )}

                                                {doc.document_number && (
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-slate-500 mb-0.5">Numéro de document</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-slate-800">{doc.document_number}</span>
                                                            <button onClick={() => copyToClipboard(doc.document_number)} className="p-1 hover:bg-slate-200 rounded">
                                                                <Copy className="w-3 h-3 text-slate-400" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Document Actions */}
                                        <div className="flex gap-2">
                                            {doc.file_url && (
                                                <>
                                                    <a
                                                        href={doc.file_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-700 transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4" /> Voir
                                                    </a>
                                                    <a
                                                        href={doc.file_url}
                                                        download
                                                        className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-700 transition-colors"
                                                    >
                                                        <Download className="w-4 h-4" /> Télécharger
                                                    </a>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Admin Notes */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                        <h3 className="font-semibold text-slate-800 mb-3">Notes Admin (internes)</h3>
                        <textarea
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            placeholder="Ajouter des notes internes sur ce profil..."
                            className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            rows="3"
                        />
                    </div>

                    {/* Action Buttons */}
                    {worker.status !== 'VALIDATED' && worker.status !== 'REJECTED' && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                            <div className="flex flex-wrap gap-3">
                                {worker.status === 'PENDING' && (
                                    <button
                                        onClick={handleTakeCharge}
                                        disabled={processing}
                                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Eye className="w-5 h-5" />}
                                        Prendre en charge
                                    </button>
                                )}

                                {worker.status === 'IN_REVIEW' && (
                                    <>
                                        <button
                                            onClick={() => handleValidate(true)}
                                            disabled={processing}
                                            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                                        >
                                            {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                                            Valider (avec diplôme)
                                        </button>

                                        {documents.length === 0 && (worker.experience_years || 0) >= 3 && (
                                            <button
                                                onClick={() => handleValidate(false)}
                                                disabled={processing}
                                                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                            >
                                                <Award className="w-5 h-5" />
                                                Valider (expérience)
                                            </button>
                                        )}

                                        <button
                                            onClick={() => setShowRejectModal(true)}
                                            disabled={processing}
                                            className="flex items-center gap-2 px-6 py-3 bg-white border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
                                        >
                                            <XCircle className="w-5 h-5" />
                                            Rejeter
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900">Rejeter le profil</h3>
                            <p className="text-sm text-slate-500">Indiquez le motif de rejet</p>
                        </div>
                        <div className="p-6">
                            <div className="space-y-3 mb-4">
                                {[
                                    'Document illisible ou de mauvaise qualité',
                                    'Informations incohérentes',
                                    'Document expiré',
                                    'Profil incomplet',
                                    'Autre (préciser)'
                                ].map((reason) => (
                                    <button
                                        key={reason}
                                        onClick={() => setRejectReason(reason)}
                                        className={`w-full text-left px-4 py-2 rounded-lg border transition-colors ${rejectReason === reason
                                            ? 'border-red-500 bg-red-50 text-red-700'
                                            : 'border-slate-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        {reason}
                                    </button>
                                ))}
                            </div>
                            {rejectReason === 'Autre (préciser)' && (
                                <textarea
                                    value={rejectReason.startsWith('Autre:') ? rejectReason.slice(7) : ''}
                                    onChange={(e) => setRejectReason(`Autre: ${e.target.value}`)}
                                    placeholder="Précisez le motif..."
                                    className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                    rows="3"
                                />
                            )}
                        </div>
                        <div className="p-6 border-t border-slate-100 flex gap-3 justify-end">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectReason || processing}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {processing ? 'Rejet en cours...' : 'Confirmer le rejet'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkerVerificationDetail;
