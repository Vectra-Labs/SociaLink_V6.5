import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/client';
import {
    ArrowRight, MapPin, Briefcase, Calendar, Clock, Users, Building2,
    CheckCircle, Zap, Lock, Bookmark, ChevronRight,
    Shield, Heart, GraduationCap, Car, Home, UtensilsCrossed,
    Star, ExternalLink, AlertTriangle, ArrowLeft, Share2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent } from '../components/ui/Card';
import LocationMap from '../components/ui/LocationMap';

const MissionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [mission, setMission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [hasApplied, setHasApplied] = useState(false);

    useEffect(() => {
        fetchMission();
    }, [id]);

    const fetchMission = async () => {
        try {
            const { data } = await api.get(`/missions/${id}`);
            setMission(data.data);
            if (user?.role === 'WORKER' && data.data.applications) {
                const userApp = data.data.applications.find(app => app.worker_profile_id === user.user_id);
                if (userApp) setHasApplied(true);
            }
        } catch (error) {
            console.error('MissionDetail - API Error:', error);
            setMessage({ type: 'error', text: 'Mission introuvable.' });
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (user.role !== 'WORKER') {
            setMessage({ type: 'error', text: 'Seuls les travailleurs peuvent postuler.' });
            return;
        }

        setApplying(true);
        try {
            await api.post(`/applications/apply/${id}`);
            setMessage({ type: 'success', text: 'Candidature envoyée avec succès !' });
            setHasApplied(true);
        } catch (error) {
            const errMsg = error.response?.data?.message || 'Erreur lors de la candidature.';
            setMessage({ type: 'error', text: errMsg });
        } finally {
            setApplying(false);
        }
    };

    const getBenefitIcon = (benefit) => {
        const icons = {
            'CNSS': Shield,
            'MUTUELLE': Heart,
            'TRANSPORT': Car,
            'FORMATION': GraduationCap,
            'LOGEMENT': Home,
            'REPAS': UtensilsCrossed,
        };
        return icons[benefit] || CheckCircle;
    };

    const getBenefitLabel = (benefit) => {
        const labels = {
            'CNSS': 'CNSS',
            'MUTUELLE': 'Mutuelle santé',
            'TRANSPORT': 'Transport',
            'FORMATION': 'Formation',
            'LOGEMENT': 'Logement',
            'REPAS': 'Repas',
        };
        return labels[benefit] || benefit;
    };

    const getTimeAgo = (date) => {
        const now = new Date();
        const created = new Date(date);
        const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return "Aujourd'hui";
        if (diffDays === 1) return "Hier";
        if (diffDays < 7) return `Il y a ${diffDays} jours`;
        if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
        return `Il y a ${Math.floor(diffDays / 30)} mois`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-slate-500 text-sm">Chargement de l'opportunité...</p>
                </div>
            </div>
        );
    }

    if (!mission) {
        return (
            <div className="max-w-xl mx-auto py-20 px-4 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
                    <Briefcase className="w-10 h-10 text-slate-300" />
                </div>
                <h1 className="text-xl font-bold text-slate-800 mb-2">Mission introuvable</h1>
                <p className="text-slate-500 mb-6">Cette offre n'existe plus ou a été retirée.</p>
                <Button onClick={() => navigate('/missions')}>
                    Voir toutes les missions
                </Button>
            </div>
        );
    }

    const isRedacted = mission.is_redacted;
    const workModeLabel = mission.work_mode === 'REMOTE' ? 'Télétravail' : mission.work_mode === 'HYBRID' ? 'Hybride' : 'Sur site';
    const expLabel = mission.experience_level === 'JUNIOR' ? 'Junior (0-2 ans)' : mission.experience_level === 'SENIOR' ? 'Senior (5-10 ans)' : mission.experience_level === 'EXPERT' ? 'Expert (10+ ans)' : 'Intermédiaire (2-5 ans)';

    // Calculate duration
    const startDate = mission.start_date ? new Date(mission.start_date) : null;
    const endDate = mission.end_date ? new Date(mission.end_date) : null;
    let duration = '-';
    if (startDate && endDate) {
        const months = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24 * 30));
        duration = months > 0 ? `${months} Mois` : 'Court terme';
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Top Navigation Bar */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors font-medium text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour aux résultats
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">Ref: {mission.mission_id}</span>
                        <Button variant="ghost" size="sm" icon={Share2}>Partager</Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Messages */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${message.type === 'success'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-indigo-100 text-indigo-800'
                        }`}>
                        {message.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content - Left */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Header Card */}
                        <Card className="overflow-hidden">
                            {/* Color Banner */}
                            <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            </div>

                            <CardContent className="pt-0 relative px-6 sm:px-8 pb-8">
                                {/* Floating Logo */}
                                <div className="absolute -top-12 left-6 sm:left-8">
                                    <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-lg">
                                        <div className="w-full h-full rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                                            {mission.establishment?.logo_url ? (
                                                <img src={mission.establishment.logo_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <Building2 className="w-10 h-10 text-slate-300" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Header Content */}
                                <div className="pt-16 sm:pl-[7.5rem] sm:pt-4">
                                    <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
                                        <div>
                                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight mb-2">
                                                {mission.title}
                                            </h1>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                                                <span className="flex items-center gap-1.5">
                                                    <Building2 className="w-4 h-4 text-blue-500" />
                                                    <span className="font-medium">{mission.establishment?.name || 'Confidentiel'}</span>
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <MapPin className="w-4 h-4 text-slate-400" />
                                                    {mission.city?.name || 'Localisation'}
                                                </span>
                                                <span className="text-slate-300">|</span>
                                                <span className="text-slate-500">
                                                    Publié {getTimeAgo(mission.created_at).toLowerCase()}
                                                </span>
                                            </div>
                                        </div>
                                        {/* Urgent Badge */}
                                        {mission.is_urgent && (
                                            <Badge variant="danger" className="animate-pulse shadow-sm">
                                                <Zap className="w-3 h-3 mr-1" />
                                                URGENT
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Stats Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-slate-400 uppercase">Contrat</p>
                                        <div className="flex items-center gap-2 font-medium text-slate-700">
                                            <Briefcase className="w-4 h-4 text-blue-600" />
                                            {mission.contract_type || 'CDI'}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-slate-400 uppercase">Durée</p>
                                        <div className="flex items-center gap-2 font-medium text-slate-700">
                                            <Clock className="w-4 h-4 text-blue-600" />
                                            {duration}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-slate-400 uppercase">Mode</p>
                                        <div className="flex items-center gap-2 font-medium text-slate-700">
                                            <MapPin className="w-4 h-4 text-blue-600" />
                                            {workModeLabel}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-slate-400 uppercase">Niveau</p>
                                        <div className="flex items-center gap-2 font-medium text-slate-700">
                                            <Users className="w-4 h-4 text-blue-600" />
                                            {mission.experience_level === 'JUNIOR' ? 'Junior' : mission.experience_level === 'SENIOR' ? 'Senior' : 'Intermédiaire'}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Description Section */}
                        <Card>
                            <CardContent className="p-8">
                                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                                    Description du poste
                                </h2>
                                <div className={`prose prose-slate max-w-none prose-p:leading-relaxed prose-a:text-blue-600 ${isRedacted ? 'blur-sm select-none opacity-50' : ''}`}>
                                    <p className="whitespace-pre-line text-slate-600">
                                        {mission.description || 'Aucune description disponible.'}
                                    </p>
                                </div>

                                {isRedacted && (
                                    <div className="mt-8 p-6 bg-indigo-50 border border-indigo-100 rounded-xl text-center">
                                        <Lock className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
                                        <h3 className="text-lg font-bold text-indigo-900 mb-1">Contenu réservé</h3>
                                        <p className="text-indigo-700 mb-4 max-w-md mx-auto">
                                            Les détails complets de cette mission sont réservés aux comptes validés ou premium.
                                        </p>
                                        <Button variant="danger" onClick={() => navigate('/pricing')}>
                                            Débloquer l'offre
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Benefits Section */}
                        {mission.benefits && mission.benefits.length > 0 && (
                            <Card>
                                <CardContent className="p-8">
                                    <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                                        Avantages & Bénéfices
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {mission.benefits.map(benefit => {
                                            const Icon = getBenefitIcon(benefit);
                                            return (
                                                <div key={benefit} className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50">
                                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-600">
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <span className="font-medium text-slate-700">{getBenefitLabel(benefit)}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar - Right */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Action Card */}
                        <Card className="sticky top-24 border-blue-100 shadow-lg shadow-blue-900/5">
                            <CardContent className="p-6">
                                {/* Salary Info */}
                                <div className="mb-6 text-center pb-6 border-b border-slate-100">
                                    <p className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wider">Salaire Proposé</p>
                                    {(mission.salary_min || mission.salary_max || mission.budget) && !isRedacted ? (
                                        <p className="text-3xl font-extrabold text-blue-900">
                                            {(mission.salary_max || mission.salary_min || mission.budget)?.toLocaleString('fr-FR')}
                                            <span className="text-lg text-blue-600 font-bold ml-1">Dh</span>
                                        </p>
                                    ) : (
                                        <p className="text-2xl font-bold text-slate-800">À négocier</p>
                                    )}
                                </div>

                                {/* CTA Buttons */}
                                <div className="space-y-3">
                                    {hasApplied ? (
                                        <div className="w-full py-4 bg-blue-50 border border-blue-200 rounded-xl flex flex-col items-center justify-center text-center animate-in zoom-in-95">
                                            <CheckCircle className="w-8 h-8 text-blue-600 mb-2" />
                                            <p className="font-bold text-blue-800">Candidature envoyée</p>
                                            <p className="text-xs text-blue-600 mt-1">L'employeur nous a confirmé la réception</p>
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={handleApply}
                                            disabled={applying || isRedacted}
                                            isLoading={applying}
                                            className="w-full h-12 text-base shadow-blue-900/20 shadow-lg"
                                            icon={!applying && ArrowRight}
                                        >
                                            Postuler maintenant
                                        </Button>
                                    )}

                                    <Button variant="secondary" className="w-full" icon={Bookmark}>
                                        Sauvegarder l'offre
                                    </Button>
                                </div>

                                {/* Trust Badges */}
                                <div className="mt-6 space-y-3">
                                    <div className="flex items-start gap-3 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
                                        <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                                        <span>
                                            <strong className="text-slate-700 block mb-0.5">Offre Vérifiée</strong>
                                            Cette mission a été validée par l'équipe SociaLink.
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Location Mini-Map */}
                        <Card className="overflow-hidden border-0 shadow-lg shadow-blue-900/5 ring-1 ring-slate-100">
                            <CardContent className="p-0 h-64 relative">
                                <LocationMap city={mission.city?.name} className="h-full w-full" />

                                {/* Overlay for visual style */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/80 to-transparent h-16 pointer-events-none z-[400] flex items-end p-4">
                                    <p className="font-bold text-slate-800 flex items-center gap-2 bg-white/90 px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm border border-white/50">
                                        <MapPin className="w-4 h-4 text-blue-600" />
                                        {mission.city?.name || 'Localisation'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MissionDetail;
