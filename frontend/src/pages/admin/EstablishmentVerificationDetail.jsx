import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, Building2, Mail, Phone, MapPin, Calendar, FileText, Download,
    Eye, CheckCircle, XCircle, Clock, Copy, Globe, AlertTriangle, Shield, Loader2,
    Briefcase
} from 'lucide-react';
import api from '../../api/client';

const EstablishmentVerificationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [establishment, setEstablishment] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [adminNotes, setAdminNotes] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        setLoading(true);
        try {
            // Fetch unified establishment details (Profile + Docs)
            const { data } = await api.get(`/admin/quality/establishment/${id}/details`);

            setEstablishment(data.establishment);
            setDocuments(data.documents || []);

        } catch (error) {
            console.error('Error fetching establishment details', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTakeCharge = async () => {
        setProcessing(true);
        try {
            await api.put(`/admin/quality/profiles/ESTABLISHMENT/${id}/review`, { status: 'IN_REVIEW' });
            setEstablishment(prev => ({ ...prev, status: 'IN_REVIEW', verification_status: 'IN_REVIEW' }));
        } catch (error) {
            alert('Erreur lors de la prise en charge');
        } finally {
            setProcessing(false);
        }
    };

    const handleValidate = async () => {
        setProcessing(true);
        try {
            await api.put(`/admin/quality/profiles/ESTABLISHMENT/${id}/review`, {
                status: 'VALIDATED',
                notes: adminNotes
            });
            navigate('/admin/verification/establishments', { state: { message: 'Établissement validé avec succès' } });
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
            await api.put(`/admin/quality/profiles/ESTABLISHMENT/${id}/review`, {
                status: 'REJECTED',
                rejectReason: rejectReason,
                notes: adminNotes
            });
            navigate('/admin/verification/establishments', { state: { message: 'Établissement rejeté' } });
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

    if (!establishment) {
        return (
            <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700">Établissement non trouvé</h3>
                <Link to="/admin/verification/establishments" className="text-blue-600 hover:underline mt-2 inline-block">
                    Retour à la liste
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Title & Back */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/admin/verification/establishments')}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Fiche Établissement
                    </h1>
            </div>

            {/* Combined Profile Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                {/* Banner */}
                <div className="h-32 sm:h-40 bg-gradient-to-r from-slate-700 to-slate-900 relative">
                    {establishment.banner_url ? (
                        <img 
                            src={establishment.banner_url} 
                            alt="Banner" 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    )}
                </div>

                <div className="px-8 pb-6 relative">
                    <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 mb-4 gap-6">
                        {/* Logo */}
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-2xl border-4 border-white bg-white overflow-hidden shadow-lg relative flex items-center justify-center">
                                {establishment.logo_url ? (
                                    <img 
                                        src={establishment.logo_url} 
                                        alt={establishment.name} 
                                        className="w-full h-full object-contain p-1"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-400 bg-slate-100">
                                        {establishment.name?.charAt(0) || 'E'}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info Block */}
                        <div className="flex-1 pt-12 md:pt-0 w-full">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <div className="flex flex-wrap items-center gap-3 mb-1">
                                        <h1 className="text-2xl font-bold text-slate-900">{establishment.name}</h1>
                                        {getStatusBadge(establishment.verification_status || establishment.status)}
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                                        <span className="font-medium text-blue-600">
                                            {establishment.structure?.label || 'Structure inconnue'}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                            {establishment.city?.name || 'Ville non renseignée'}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                            Inscrit le {new Date(establishment.createdAt).toLocaleDateString('fr-FR')}
                                        </div>
                                        {establishment.website && (
                                            <a href={establishment.website} target="_blank" rel="noopener" className="flex items-center gap-1 hover:text-blue-600 hover:underline">
                                                <Globe className="w-3.5 h-3.5 text-slate-400" />
                                                Site web
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Actions - Moved from bottom */}
                                {establishment.verification_status !== 'VALIDATED' && establishment.verification_status !== 'REJECTED' && (
                                    <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                                        {establishment.verification_status === 'PENDING' && (
                                            <button
                                                onClick={handleTakeCharge}
                                                disabled={processing}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                                            >
                                                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                                                Prendre en charge
                                            </button>
                                        )}

                                        {(establishment.verification_status === 'IN_REVIEW' || establishment.verification_status === 'PENDING') && (
                                            <>
                                                <button
                                                    onClick={() => setShowRejectModal(true)}
                                                    disabled={processing}
                                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors text-sm"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    Rejeter
                                                </button>
                                                
                                                <button
                                                    onClick={() => handleValidate()}
                                                    disabled={processing || documents.length === 0}
                                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:bg-slate-300 text-sm"
                                                    title={documents.length === 0 ? "Documents requis pour valider" : ""}
                                                >
                                                    {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                                    Valider
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column - Details */}
                <div className="lg:col-span-1 space-y-6">
                    
                    {/* Contact Info (Unified) */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                        <h3 className="font-bold text-slate-800 mb-4">Coordonnées</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-slate-500">Email</p>
                                    <p className="text-sm font-medium text-slate-900 break-all">{establishment.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-slate-500">Téléphone</p>
                                    <p className="text-sm font-medium text-slate-900">{establishment.phone || 'Non renseigné'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-slate-500">Adresse</p>
                                    <p className="text-sm font-medium text-slate-900">{establishment.city?.name || 'Ville non renseignée'}</p>
                                </div>
                            </div>
                            {establishment.website && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                        <Globe className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-slate-500">Site Web</p>
                                        <a href={establishment.website} target="_blank" rel="noopener" className="text-sm font-medium text-blue-600 hover:underline truncate block">
                                            {establishment.website}
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Legal Info */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                        <h3 className="font-bold text-slate-800 mb-4">Informations Légales</h3>
                        <div className="space-y-3">
                            <div>
                                <span className="text-xs text-slate-500 uppercase font-semibold">Numéro ICE</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-700">{establishment.ice_number}</span>
                                    <button onClick={() => copyToClipboard(establishment.ice_number)} className="p-1 hover:bg-slate-100 rounded">
                                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                                    </button>
                                </div>
                            </div>
                            {establishment.rc_number && (
                                <div>
                                    <span className="text-xs text-slate-500 uppercase font-semibold">Numéro RC</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-700">{establishment.rc_number}</span>
                                        <button onClick={() => copyToClipboard(establishment.rc_number)} className="p-1 hover:bg-slate-100 rounded">
                                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                                        </button>
                                    </div>
                                </div>
                            )}
                            {establishment.founding_year && (
                                <div>
                                    <span className="text-xs text-slate-500 uppercase font-semibold">Année de création</span>
                                    <p className="mt-1 text-slate-700">{establishment.founding_year}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contact Person */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                        <h3 className="font-bold text-slate-800 mb-4">Contact Principal</h3>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                                {establishment.contact_first_name?.charAt(0) || 'C'}
                            </div>
                            <div>
                                <p className="font-medium text-slate-900">
                                    {establishment.contact_first_name} {establishment.contact_last_name}
                                </p>
                                <p className="text-sm text-slate-500">{establishment.contact_function || 'Fonction non précisée'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Documents & Review */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Documents */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-slate-400" />
                            <h3 className="font-semibold text-slate-800">Documents Légaux</h3>
                            <span className="ml-auto text-sm text-slate-400">{documents.length} document(s)</span>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {documents.length === 0 ? (
                                <div className="p-6 text-center">
                                    <FileText className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                                    <p className="text-slate-500">Aucun document soumis</p>
                                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg inline-block">
                                        <div className="flex items-center gap-2 text-red-700 text-sm">
                                            <AlertTriangle className="w-4 h-4" />
                                            Impossible de valider sans documents légaux (ICE/RC)
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                documents.map((doc, index) => (
                                    <div key={doc.document_id || index} className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                                    <FileText className="w-5 h-5 text-slate-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-slate-800">{doc.type || 'Document'}</h4>
                                                    <p className="text-sm text-slate-500">
                                                        Ajouté le {new Date(doc.uploaded_at).toLocaleDateString('fr-FR')}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${doc.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                                                doc.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                {doc.status === 'VERIFIED' ? 'Vérifié' :
                                                    doc.status === 'REJECTED' ? 'Rejeté' : 'En attente'}
                                            </span>
                                        </div>

                                        {/* Manual Verification Info Card */}
                                        <div className="bg-slate-50 rounded-lg p-4 mb-3 border border-slate-200">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Shield className="w-4 h-4 text-blue-600" />
                                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Données Officielles (Profil)</span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 text-sm">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-slate-500 mb-0.5">Raison Sociale</span>
                                                    <span className="font-medium text-slate-800">{establishment.name}</span>
                                                </div>

                                                <div className="flex flex-col">
                                                    <span className="text-xs text-slate-500 mb-0.5">Numéro ICE</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-slate-800">{establishment.ice_number}</span>
                                                        <button onClick={() => copyToClipboard(establishment.ice_number)} className="p-1 hover:bg-slate-200 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Copy className="w-3 h-3 text-slate-400" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {establishment.rc_number && (
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-slate-500 mb-0.5">Numéro RC</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-slate-800">{establishment.rc_number}</span>
                                                            <button onClick={() => copyToClipboard(establishment.rc_number)} className="p-1 hover:bg-slate-200 rounded">
                                                                <Copy className="w-3 h-3 text-slate-400" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex flex-col">
                                                    <span className="text-xs text-slate-500 mb-0.5">Adresse</span>
                                                    <span className="font-medium text-slate-800">{establishment.city?.name || 'Ville inconnue'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Document Actions */}
                                        <div className="flex gap-2 ml-13">
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
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <h3 className="font-bold text-slate-800 mb-4">Notes Admin (internes)</h3>
                        <textarea
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            placeholder="Ajouter des notes internes sur cet établissement..."
                            className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            rows="3"
                        />
                    </div>
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        <div className="p-6 border-b border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900">Rejeter l'établissement</h3>
                            <p className="text-sm text-slate-500">Indiquez le motif de rejet</p>
                        </div>
                        <div className="p-6">
                            <div className="space-y-3 mb-4">
                                {[
                                    'Documents manquants ou incomplets',
                                    'ICE/RC non valide',
                                    'Informations incohérentes',
                                    'Activité non autorisée',
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

export default EstablishmentVerificationDetail;
