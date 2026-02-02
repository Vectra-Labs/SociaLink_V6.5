import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../hooks/useAuth';
import {
    MapPin, Briefcase, FileText, MessageCircle, Send, ArrowLeft,
    CheckCircle, Award, GraduationCap, Lock, Download, AlertCircle, Calendar
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

const WorkerProfileDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [worker, setWorker] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubscriber, setIsSubscriber] = useState(false);
    const [error, setError] = useState(null);

    // Invite Modal State
    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    const [myMissions, setMyMissions] = useState([]);
    const [selectedMissionId, setSelectedMissionId] = useState('');
    const [inviting, setInviting] = useState(false);

    useEffect(() => {
        fetchWorkerProfile();
    }, [id]);

    const fetchWorkerProfile = async () => {
        try {
            const { data } = await api.get(`/establishment/worker/${id}`);
            setWorker(data.data);
            setIsSubscriber(data.isSubscriber);
        } catch (err) {
            console.error(err);
            setError("Impossible de charger le profil.");
        } finally {
            setLoading(false);
        }
    };

    const loadMyMissions = async () => {
        try {
            const { data } = await api.get('/missions/my-missions');
            const open = (data.data || []).filter(m => m.status === 'OPEN');
            setMyMissions(open);
            setInviteModalOpen(true);
        } catch (err) {
            console.error('Failed to load missions', err);
            alert("Erreur lors du chargement de vos missions");
        }
    };

    const handleInvite = async () => {
        if (!selectedMissionId) return;
        setInviting(true);
        try {
            await api.post('/applications/invite', {
                worker_id: parseInt(id),
                mission_id: selectedMissionId
            });
            alert('Invitation envoyée avec succès !');
            setInviteModalOpen(false);
            setSelectedMissionId('');
        } catch (err) {
            console.error('Invite error', err);
            alert(err.response?.data?.message || 'Erreur lors de l\'envoi de l\'invitation');
        } finally {
            setInviting(false);
        }
    };

    const startConversation = async () => {
        try {
            await api.post('/messages', {
                receiverId: parseInt(id),
                content: `Bonjour ${worker.first_name}, je suis intéressé par votre profil.`
            });
            navigate('/establishment/messages');
        } catch (err) {
            console.error('Erreur démarrage conversation:', err);
            alert('Erreur lors du démarrage de la conversation');
        }
    };

    const handleRequestCV = async () => {
        try {
            await api.post('/establishment/request-cv', { workerId: worker.user_id });
            alert("Demande de CV envoyée au candidat !");
        } catch (err) {
            console.error("Erreur demande CV:", err);
            alert("Erreur lors de l'envoi de la demande.");
        }
    };

    const getInitials = (firstName, lastName) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (error || !worker) return (
        <div className="text-center py-20 px-4">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Profil introuvable</h2>
            <p className="text-slate-500 mb-6">{error || "Ce profil n'existe pas ou vous n'y avez pas accès."}</p>
            <Button variant="outline" onClick={() => navigate(-1)}>Retour</Button>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 pl-0 hover:bg-transparent text-slate-500 hover:text-blue-600">
                <ArrowLeft className="w-5 h-5 mr-2" /> Retour
            </Button>

            {/* Profile Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                </div>
                <div className="px-8 pb-8">
                    <div className="flex flex-col md:flex-row gap-6 items-start -mt-12 relative z-10">
                        {/* Avatar */}
                        <div className="w-32 h-32 rounded-2xl bg-white p-1.5 shadow-lg shrink-0">
                            <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-100">
                                {worker.profile_pic_url ? (
                                    <img src={worker.profile_pic_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-bold text-slate-400">
                                        {getInitials(worker.first_name, worker.last_name)}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 pt-2 md:pt-14">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                        {worker.first_name} {worker.last_name}
                                        {worker.user?.status === 'VALIDATED' && (
                                            <CheckCircle className="w-6 h-6 text-blue-600 fill-blue-50" />
                                        )}
                                    </h1>
                                    <p className="text-lg text-slate-600 font-medium mb-3">{worker.title || 'Professionnel'}</p>

                                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                                            <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                                            {worker.city?.name || 'Non spécifié'}
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                                            <Briefcase className="w-4 h-4 text-blue-500 shrink-0" />
                                            {worker.experience_years ? `${worker.experience_years} ans d'expérience` : 'Expérience non renseignée'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 w-full md:w-auto">
                                    <Button variant="secondary" onClick={startConversation} icon={MessageCircle} className="flex-1 md:flex-none">
                                        Message
                                    </Button>
                                    <Button onClick={loadMyMissions} icon={Send} className="flex-1 md:flex-none shadow-lg shadow-blue-900/20">
                                        Proposer une mission
                                    </Button>
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
                                Expériences
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-8 pt-2">
                            {worker.experiences?.length > 0 ? worker.experiences.map((exp) => (
                                <div key={exp.experience_id} className="relative pl-6 border-l-2 border-slate-100 last:border-l-0">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-blue-600"></div>
                                    <p className="font-bold text-slate-900 text-base">{exp.job_title}</p>
                                    <p className="text-blue-600 font-medium text-sm mb-1">{exp.establishment_name}</p>
                                    <p className="text-xs text-slate-400 mb-3 flex items-center gap-1">
                                        <Calendar className="w-3 h-3 shrink-0" />
                                        {new Date(exp.start_date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })} -
                                        {exp.is_current_role ? ' Aujourd\'hui' : (exp.end_date ? new Date(exp.end_date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '')}
                                    </p>
                                    <p className="text-sm text-slate-600">{exp.description}</p>
                                </div>
                            )) : (
                                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <p className="text-slate-500 italic text-sm">Aucune expérience renseignée.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Diplomas */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-blue-600 shrink-0" />
                                Formation & Diplômes
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2">
                            {worker.diplomas?.length > 0 ? (
                                <div className="grid gap-3">
                                    {worker.diplomas.map((dip) => (
                                        <div key={dip.diploma_id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-4 transition-colors hover:border-blue-200 hover:bg-blue-50/50">
                                            <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 shrink-0">
                                                <Award className="w-6 h-6 text-indigo-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-sm md:text-base">{dip.title}</h4>
                                                <p className="text-sm text-slate-600">{dip.institution} <span className="text-slate-300">•</span> {dip.year}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <p className="text-slate-500 italic text-sm">Aucun diplôme renseigné.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-6">
                    {/* Contact Info (Protected) */}
                    <Card className="relative overflow-hidden border-indigo-100 shadow-sm">
                        {!isSubscriber && (
                            <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-6">
                                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-3">
                                    <Lock className="w-6 h-6 text-indigo-600" />
                                </div>
                                <h4 className="font-bold text-slate-900 mb-1">Coordonnées masquées</h4>
                                <p className="text-xs text-slate-500 mb-4 max-w-[200px]">Passez au plan Pro pour accéder aux coordonnées complètes.</p>
                                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 w-full" onClick={() => navigate('/pricing')}>
                                    Voir les offres
                                </Button>
                            </div>
                        )}

                        <CardContent className="space-y-6 pt-6">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Informations</h3>

                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Spécialités</p>
                                <div className="flex flex-wrap gap-2">
                                    {worker.specialities?.map(ws => (
                                        <Badge key={ws.speciality_id} variant="blue" className="bg-blue-50 text-blue-700 border-blue-100">
                                            {ws.speciality?.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {worker.user?.email && (
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Email</p>
                                    <p className="text-sm font-medium text-slate-900 break-all">{worker.user.email}</p>
                                </div>
                            )}

                            {worker.phone && (
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Téléphone</p>
                                    <p className="text-sm font-medium text-slate-900">{worker.phone}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Documents & CV */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Documents</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-2">
                            {/* Verified Documents List */}
                            {worker.documents?.filter(d => d.type !== 'RESUME' && d.type !== 'CV').map(doc => (
                                <div key={doc.document_id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50">
                                    <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                                        {doc.type === 'DIPLOMA' ? (
                                            <Award className="w-4 h-4 text-blue-600" />
                                        ) : (
                                            <FileText className="w-4 h-4 text-slate-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-700 truncate">
                                            {doc.type === 'DIPLOMA' ? 'Diplôme' :
                                                doc.type === 'IDENTITY_CARD' || doc.type === 'CIN' ? 'Pièce d\'identité' :
                                                    doc.type}
                                        </p>
                                        <div className="flex items-center gap-1 text-[10px] text-blue-600 font-bold uppercase tracking-wide">
                                            <CheckCircle className="w-3 h-3 shrink-0" />
                                            Vérifié
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* CV Section */}
                            {worker.documents?.find(d => d.type === 'RESUME' || d.type === 'CV') ? (
                                (() => {
                                    const cv = worker.documents.find(d => d.type === 'RESUME' || d.type === 'CV');
                                    return (
                                        <a
                                            href={cv.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-3.5 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer group mt-2"
                                        >
                                            <div className="p-2 bg-white rounded-lg text-indigo-600 group-hover:scale-110 transition-transform shadow-sm shrink-0">
                                                <Download className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-indigo-900">Télécharger le CV</p>
                                                <p className="text-xs text-indigo-600">Format PDF</p>
                                            </div>
                                        </a>
                                    );
                                })()
                            ) : (
                                <button
                                    onClick={handleRequestCV}
                                    className="w-full flex items-center justify-between p-3 rounded-xl border border-dashed border-slate-300 text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all mt-2"
                                >
                                    <span className="text-sm font-medium">CV non disponible</span>
                                    <span className="text-xs font-bold underline">Demander</span>
                                </button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Invite Modal */}
            {inviteModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={() => setInviteModalOpen(false)}>
                    <Card className="w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
                        <CardHeader>
                            <CardTitle>Proposer une mission</CardTitle>
                            <p className="text-slate-500 text-sm">
                                Sélectionnez une offre pour {worker.first_name}
                            </p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 max-h-60 overflow-y-auto mb-5 custom-scrollbar pr-1">
                                {myMissions.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Briefcase className="w-6 h-6 text-slate-300" />
                                        </div>
                                        <p className="text-slate-500 text-sm mb-3">Aucune mission disponible</p>
                                        <Button size="sm" onClick={() => navigate('/establishment/missions/create')}>
                                            Créer une mission
                                        </Button>
                                    </div>
                                ) : (
                                    myMissions.map(mission => (
                                        <label
                                            key={mission.mission_id}
                                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedMissionId === mission.mission_id
                                                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                                : 'border-slate-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedMissionId === mission.mission_id ? 'border-blue-600' : 'border-slate-300'
                                                }`}>
                                                {selectedMissionId === mission.mission_id && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                                                <input
                                                    type="radio"
                                                    name="mission"
                                                    value={mission.mission_id}
                                                    checked={selectedMissionId === mission.mission_id}
                                                    onChange={() => setSelectedMissionId(mission.mission_id)}
                                                    className="sr-only"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-slate-900 text-sm truncate">{mission.title}</p>
                                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3 shrink-0" />
                                                    {new Date(mission.start_date).toLocaleDateString('fr-FR')}
                                                </p>
                                            </div>
                                        </label>
                                    ))
                                )}
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    className="flex-1"
                                    onClick={handleInvite}
                                    disabled={!selectedMissionId || inviting}
                                    isLoading={inviting}
                                    icon={Send}
                                >
                                    Envoyer
                                </Button>
                                <Button variant="secondary" onClick={() => setInviteModalOpen(false)}>
                                    Annuler
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default WorkerProfileDetail;
