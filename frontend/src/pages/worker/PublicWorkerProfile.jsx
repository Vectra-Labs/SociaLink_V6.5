import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import {
    MapPin, Briefcase, Award, GraduationCap, X,
    CheckCircle, Calendar, ArrowLeft, Globe
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

// A public version of WorkerProfileDetail for unauthenticated/guest users
const PublicWorkerProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [worker, setWorker] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPublicProfile();
    }, [id]);

    const fetchPublicProfile = async () => {
        try {
            // Using the new generic public endpoint
            const { data } = await api.get(`/general/worker/${id}/public`);
            setWorker(data.data);
        } catch (err) {
            console.error("Fetch Public Profile error:", err);
            setError("Impossible de charger le profil public.");
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (firstName, lastName) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-slate-50">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (error || !worker) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Profil introuvable</h2>
                <p className="text-slate-500 mb-6">{error || "Ce profil n'est pas accessible."}</p>
                <Button onClick={() => navigate('/')}>Retour à l'accueil</Button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-sans">
            {/* Header / Nav substitute since it's a standalone page or could be in Layout */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-3 flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate(-1)} className="text-slate-500 hover:text-blue-600 pl-0">
                    <ArrowLeft className="w-5 h-5 mr-2" /> Retour
                </Button>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-lg">SociaLink</span>
                </div>
            </div>

            <div className="max-w-5xl mx-auto py-8 px-4">

                {/* Profile Header Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                    <div className="h-48 sm:h-64 bg-slate-900 relative overflow-hidden">
                        {worker.banner_url ? (
                            <img src={worker.banner_url} alt="Cover" className="w-full h-full object-cover opacity-90" />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            </div>
                        )}
                    </div>
                    <div className="px-8 pb-8">
                        <div className="flex flex-col md:flex-row gap-6 items-start -mt-20 relative z-10">
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
                                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                    {worker.first_name} {worker.last_name}
                                    {worker.user?.status === 'VALIDATED' && (
                                        <CheckCircle className="w-6 h-6 text-blue-600 fill-blue-50" />
                                    )}
                                </h1>
                                <p className="text-lg text-slate-600 font-medium mb-3">{worker.title || 'Professionnel SociaLink'}</p>

                                <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                    <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                                        <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                                        {worker.city?.name || 'Localisation non spécifiée'}
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                                        <Briefcase className="w-4 h-4 text-blue-500 shrink-0" />
                                        {worker.experience_years ? `${worker.experience_years} ans d'expérience` : 'Expérience non spécifiée'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Bio */}
                        {worker.bio && (
                            <Card>
                                <CardContent className="p-6">
                                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                                        À propos
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed whitespace-pre-line">{worker.bio}</p>
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
                                        <p className="font-bold text-slate-900 text-base">{exp.job_title || exp.position}</p>
                                        <p className="text-blue-600 font-medium text-sm mb-1">{exp.establishment_name}</p>
                                        <p className="text-xs text-slate-400 mb-3 flex items-center gap-1">
                                            <Calendar className="w-3 h-3 shrink-0" />
                                            {new Date(exp.start_date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })} -
                                            {exp.end_date ? new Date(exp.end_date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : ' Aujourd\'hui'}
                                        </p>
                                        <p className="text-sm text-slate-600">{exp.description}</p>
                                    </div>
                                )) : (
                                    <p className="text-slate-500 italic text-center py-4">Aucune expérience renseignée.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Diplomas */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5 text-emerald-600" />
                                    Formation & Diplômes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {worker.diplomas?.length > 0 ? (
                                    <div className="grid gap-3">
                                        {worker.diplomas.map((dip) => (
                                            <div key={dip.diploma_id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-4">
                                                <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100 shrink-0">
                                                    <Award className="w-6 h-6 text-emerald-500" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-sm md:text-base">{dip.title}</h4>
                                                    <p className="text-sm text-slate-600">{dip.institution} <span className="text-slate-300">•</span> {dip.year}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-500 italic text-center py-4">Aucun diplôme renseigné.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column (Sidebar) */}
                    <div className="space-y-6">
                        {/* Languages */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-indigo-600" />
                                    Langues
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {worker.languages?.length > 0 ? worker.languages.map((lang) => (
                                    <div key={lang.id} className="flex justify-between items-center p-2 rounded-lg bg-slate-50">
                                        <div className="flex items-center gap-2">
                                            {/* Flag logic can be advanced or simplified */}
                                            <span className="font-medium text-slate-700">{lang.name}</span>
                                        </div>
                                        <Badge variant="secondary" className="text-xs bg-white border border-slate-200">{lang.level}</Badge>
                                    </div>
                                )) : (
                                    <p className="text-slate-500 italic text-center py-2 text-sm">Non renseigné</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Specialities */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Compétences</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {worker.specialities?.map(ws => (
                                        <Badge key={ws.speciality_id} variant="blue" className="bg-blue-50 text-blue-700 border-blue-100">
                                            {ws.speciality?.name}
                                        </Badge>
                                    ))}
                                    {(!worker.specialities || worker.specialities.length === 0) && (
                                        <p className="text-slate-500 italic text-sm">Non renseigné</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicWorkerProfile;
