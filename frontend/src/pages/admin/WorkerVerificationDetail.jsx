import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, User, Mail, Phone, MapPin, Calendar, FileText, Download,
    Eye, CheckCircle, XCircle, Clock, Copy, AlertTriangle,
    Award, Briefcase, GraduationCap, Shield, Loader2
} from 'lucide-react';
import api from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

const WorkerVerificationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [worker, setWorker] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Action states
    const [processing, setProcessing] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [adminNotes, setAdminNotes] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [targetDoc, setTargetDoc] = useState(null);

    useEffect(() => {
        fetchWorkerDetails();
    }, [id]);

    const fetchWorkerDetails = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/super-admin/quality/worker/${id}/details`);

            setWorker(data.worker);
            
            // Merge and normalize documents
            const diplomasRequest = (data.diplomas || []).map(d => ({
                ...d,
                type: 'DIPLOMA',
                name: d.name || 'Diplôme',
                file_url: d.file_path ? `http://localhost:5001/${d.file_path.replace(/\\/g, '/')}` : null
            }));

            const otherDocsRequest = (data.documents || []).map(d => ({
                ...d,
                name: d.type === 'CNIE_RECTO' ? 'CNIE (Recto)' : 
                      d.type === 'CNIE_VERSO' ? 'CNIE (Verso)' : 
                      d.type === 'CV' ? 'Curriculum Vitae' : 
                      d.type === 'CRIMINAL_RECORD' ? 'Casier Judiciaire' : d.type,
                file_url: d.file_path ? `http://localhost:5001/${d.file_path.replace(/\\/g, '/')}` : null
            }));

            setDocuments([...diplomasRequest, ...otherDocsRequest]);
            setExperiences(data.experiences || []);

        } catch (error) {
            console.error('Error fetching worker details', error);
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

    const handleValidate = async () => {
        setProcessing(true);
        try {
            await api.put(`/super-admin/quality/worker/${id}`, {
                status: 'VALIDATED',
                notes: adminNotes
            });
            navigate('/admin/verification/workers', { state: { message: 'Profil validé avec succès' } });
        } catch (error) {
            alert('Erreur lors de la validation');
        } finally {
            setProcessing(false);
        }
    };

    // Generic Document Action (Validate/Reject)
    const handleDocumentAction = async (doc, status, reason = null) => {
        setProcessing(true);
        try {
            const idToUpdate = doc.diploma_id || doc.document_id;
            const docType = doc.type || 'DOCUMENT'; // 'DIPLOMA' or other types from backend

            await api.put(`/super-admin/quality/document/${idToUpdate}/status`, {
                type: docType,
                status: status,
                reason: reason
            });

            // Update local state
            setDocuments(prev => prev.map(d => {
                const dId = d.diploma_id || d.document_id;
                // Check distinct types to avoid collision if IDs overlap between tables (unlikely but safe)
                // Actually diploma_id and document_id are distinct fields in our merged object
                if ((d.diploma_id && d.diploma_id === idToUpdate && d.type === 'DIPLOMA') || 
                    (d.document_id && d.document_id === idToUpdate && d.type !== 'DIPLOMA')) {
                    return { ...d, verification_status: status };
                }
                return d;
            }));

        } catch (error) {
            console.error(error);
            alert('Erreur lors de la mise à jour du document');
        } finally {
            setProcessing(false);
            setTargetDoc(null);
            setShowRejectModal(false);
            setRejectReason('');
        }
    };

    // Handler for Reject Modal Submit
    const handleRejectSubmit = () => {
        if (targetDoc) {
            // Rejecting a specific document
            handleDocumentAction(targetDoc, 'REJECTED', rejectReason);
        } else {
            // Rejecting the entire profile
            handleRejectProfile();
        }
    };

    const handleRejectProfile = async () => {
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
    };

    const getStatusBadge = (status) => {
        const config = {
            PENDING: { label: 'En attente', class: 'bg-amber-100 text-amber-700', icon: Clock },
            IN_REVIEW: { label: 'En cours', class: 'bg-blue-100 text-blue-700', icon: Eye },
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

    const getInitials = (firstName, lastName) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
    );

    if (!worker) return (
        <div className="text-center py-20 px-4">
            <User className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Profil introuvable</h2>
            <Button variant="outline" onClick={() => navigate('/admin/verification/workers')}>Retour à la liste</Button>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto py-8 px-4">
            <Button variant="ghost" onClick={() => navigate('/admin/verification/workers')} className="mb-6 pl-0 hover:bg-transparent text-slate-500 hover:text-blue-600">
                <ArrowLeft className="w-5 h-5 mr-2" /> Liste de vérification
            </Button>

            {/* Profile Header (Unified Design) */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                {/* Banner */}
                <div className="h-32 sm:h-40 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                </div>
                
                <div className="px-8 pb-6 relative">
                    <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 mb-4 gap-6">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg relative flex items-center justify-center">
                                {worker.profile_pic_url ? (
                                    <img src={worker.profile_pic_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-bold text-slate-400 bg-slate-100 w-full h-full flex items-center justify-center">
                                        {getInitials(worker.prenom, worker.nom)}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Info Block */}
                        <div className="flex-1 pt-12 md:pt-0 w-full">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <div className="flex flex-wrap items-center gap-3 mb-1">
                                        <h1 className="text-2xl font-bold text-slate-900">{worker.prenom} {worker.nom}</h1>
                                        {getStatusBadge(worker.status)}
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                                        <span className="font-medium text-blue-600">
                                            {worker.title || 'Profil non intitulé'}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                            {worker.city?.name || 'Non spécifié'}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                            Inscrit le {new Date(worker.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Admin Actions */}
                                <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                                    {worker.status === 'PENDING' && (
                                        <Button onClick={handleTakeCharge} isLoading={processing} icon={Eye}>
                                            Examiner
                                        </Button>
                                    )}
                                    {(worker.status === 'PENDING' || worker.status === 'IN_REVIEW') && (
                                        <>
                                            <Button 
                                                variant="danger" 
                                                onClick={() => {
                                                    setTargetDoc(null); // Clear target doc to reject profile
                                                    setRejectReason('');
                                                    setShowRejectModal(true);
                                                }} 
                                                disabled={processing} 
                                                icon={XCircle}
                                            >
                                                Rejeter
                                            </Button>
                                            <Button variant="success" onClick={handleValidate} isLoading={processing} icon={CheckCircle}>
                                                Valider
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Bio */}
                    {worker.bio && (
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                                    À propos
                                </h3>
                                <p className="text-slate-600 leading-relaxed text-sm lg:text-base">{worker.bio}</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Experiences */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-blue-600" />
                                Expériences Professionnelles
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8 pt-2">
                            {experiences.length > 0 ? experiences.map((exp, index) => (
                                <div key={exp.id || index} className="relative pl-6 border-l-2 border-slate-100 last:border-l-0">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-blue-600"></div>
                                    <p className="font-bold text-slate-900 text-base">{exp.job_title}</p>
                                    <p className="text-blue-600 font-medium text-sm mb-1">{exp.company_name}</p>
                                    <p className="text-xs text-slate-400 mb-3 flex items-center gap-1">
                                        <Calendar className="w-3 h-3 shrink-0" />
                                        {new Date(exp.start_date).getFullYear()} - {exp.is_current_role ? 'Présent' : new Date(exp.end_date).getFullYear()}
                                    </p>
                                    {exp.description && <p className="text-sm text-slate-600">{exp.description}</p>}
                                </div>
                            )) : (
                                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <p className="text-slate-500 italic text-sm">Aucune expérience renseignée.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Verification Documents & Diplomas */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-blue-600" />
                                Documents de Vérification
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2 space-y-4">
                            {documents.length > 0 ? (
                                documents.map((doc, index) => (
                                    <div key={doc.diploma_id || doc.document_id || index} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                                                    {doc.type === 'DIPLOMA' ? (
                                                        <Award className="w-5 h-5 text-blue-600" />
                                                    ) : (
                                                        <FileText className="w-5 h-5 text-slate-500" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-sm">{doc.name}</h4>
                                                    <p className="text-xs text-slate-500">{doc.institution || doc.type}</p>
                                                </div>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                doc.verification_status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                                                doc.verification_status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                'bg-amber-100 text-amber-700'
                                            }`}>
                                                {doc.verification_status === 'VERIFIED' ? 'Vérifié' :
                                                 doc.verification_status === 'REJECTED' ? 'Rejeté' : 'En attente'}
                                            </span>
                                        </div>

                                        {/* Verification Info */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4 bg-white p-3 rounded-lg border border-slate-100">
                                            {doc.document_number && (
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-slate-400">Numéro</span>
                                                    <span className="font-medium">{doc.document_number}</span>
                                                    <button onClick={() => copyToClipboard(doc.document_number)} className="text-blue-600 text-xs hover:underline text-left mt-1">Copier</button>
                                                </div>
                                            )}
                                            {(doc.issue_date) && (
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-slate-400">Date délivrance</span>
                                                    <span className="font-medium">{new Date(doc.issue_date).toLocaleDateString()}</span>
                                                </div>
                                            )}
                                            {(doc.expiry_date) && (
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-slate-400">Date d'expiration</span>
                                                    <span className={`font-medium ${new Date(doc.expiry_date) < new Date() ? 'text-red-600' : 'text-slate-900'}`}>
                                                        {new Date(doc.expiry_date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                            {(doc.specialty) && (
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-slate-400">Filière / Spécialité</span>
                                                    <span className="font-medium text-slate-900">{doc.specialty}</span>
                                                </div>
                                            )}
                                            {(doc.grade) && (
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-slate-400">Mention</span>
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 w-fit mt-1">
                                                        {doc.grade}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2 items-center">
                                            {/* Document Verification Actions */}
                                            {doc.verification_status !== 'VERIFIED' && (
                                                <button 
                                                    onClick={() => handleDocumentAction(doc, 'VERIFIED')}
                                                    disabled={processing}
                                                    title="Valider le document"
                                                    className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                            {doc.verification_status !== 'REJECTED' && (
                                                <button 
                                                    onClick={() => {
                                                        setTargetDoc(doc);
                                                        setRejectReason('');
                                                        setShowRejectModal(true);
                                                    }}
                                                    disabled={processing}
                                                    title="Rejeter le document"
                                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            )}

                                            <div className="w-px bg-slate-200 h-6 mx-1"></div>

                                            {doc.file_url && (
                                                <>
                                                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 transition-colors">
                                                        <Eye className="w-3.5 h-3.5" /> Voir
                                                    </a>
                                                    <a href={doc.file_url} download className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 transition-colors">
                                                        <Download className="w-3.5 h-3.5" /> Télécharger
                                                    </a>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <p className="text-slate-500 italic text-sm">Aucun document soumis pour vérification.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Admin Notes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Notes Admin</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                placeholder="Ajouter des notes internes sur ce profil (visible uniquement par les admins)..."
                                className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none min-h-[100px]"
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-6">
                    {/* Contact Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Coordonnées</CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-slate-500">Email</p>
                                    <p className="text-sm font-medium text-slate-900 break-all">{worker.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-slate-500">Téléphone</p>
                                    <p className="text-sm font-medium text-slate-900">{worker.phone || 'Non renseigné'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-slate-500">Adresse</p>
                                    <p className="text-sm font-medium text-slate-900">{worker.address || 'Non renseignée'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Specialities */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Spécialités</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {worker.specialities?.map((spec, i) => (
                                    <Badge key={i} variant="blue" className="bg-blue-50 text-blue-700 border-blue-100">
                                        {spec.name || spec}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Languages */}
                    {worker.languages && worker.languages.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Langues</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {worker.languages.map((lang, i) => (
                                        <div key={i} className="flex justify-between items-center text-sm">
                                            <span className="font-medium text-slate-700">{lang.name}</span>
                                            <span className="text-slate-500 text-xs bg-slate-100 px-2 py-1 rounded-full">{lang.level}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">
                            {targetDoc ? `Rejeter le document : ${targetDoc.name}` : 'Motif du rejet du profil'}
                        </h3>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder={targetDoc ? "Expliquez pourquoi ce document est rejeté..." : "Expliquez pourquoi ce profil est rejeté..."}
                            className="w-full p-3 border border-slate-200 rounded-lg text-sm mb-4 focus:ring-2 focus:ring-red-500 outline-none h-32 resize-none"
                            autoFocus
                        />
                        <div className="flex justify-end gap-3">
                            <Button variant="secondary" onClick={() => setShowRejectModal(false)}>Annuler</Button>
                            <Button variant="danger" onClick={handleRejectSubmit} isLoading={processing}>Confirmer le rejet</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkerVerificationDetail;
