import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Briefcase, Users, Sparkles, Star, Plus,
    FileText, Eye, MessageSquare, Shield,
    ChevronRight, Clock, CheckCircle, AlertCircle,
    Crown, ArrowRight, XCircle, Search
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { useSubscription } from '../../context/SubscriptionContext';
import { establishmentService } from '../../services/establishment.service';
import { THEME, getStatusBadgeStyle } from '../../utils/theme';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

const EstablishmentDashboard = () => {
    const { user } = useAuth();
    const { isSubscribed, planCode } = useSubscription();
    const [stats, setStats] = useState({
        activeMissions: 0,
        pendingApplications: 0,
        urgentApplications: 0,
        suggestions: 0
    });
    const [recentApplications, setRecentApplications] = useState([]);
    const [suggestedProfiles, setSuggestedProfiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const { lastNotification } = useSocket();

    useEffect(() => {
        loadDashboardData();
    }, []);

    // Refresh dashboard data when a relevant notification is received
    useEffect(() => {
        if (lastNotification) {
            // We can optimize this to only refresh on specific types (e.g., 'NEW_APPLICATION', 'APPLICATION_UPDATE')
            // For now, refreshing on any notification ensures data consistency
            loadDashboardData();
        }
    }, [lastNotification]);

    const loadDashboardData = async () => {
        try {
            setError(null);
            const statsData = await establishmentService.getStats();
            setStats(statsData);

            if (statsData.recentApplications) {
                setRecentApplications(statsData.recentApplications);
            }
            if (statsData.suggestedProfiles) {
                setSuggestedProfiles(statsData.suggestedProfiles);
            }
        } catch (err) {
            console.error("Failed to load dashboard stats", err);
            setError("Erreur lors du chargement des données. Veuillez réessayer.");
        } finally {
            setIsLoading(false);
        }
    };

    const establishmentName = user?.establishmentProfile?.name || 'Mon Établissement';
    const isPremium = isSubscribed || planCode === 'PRO';

    // Loading State
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500">Chargement du tableau de bord...</p>
                </div>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md text-center">
                    <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Erreur de chargement</h3>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={loadDashboardData}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto">
            {/* Welcome Banner */}
            <div className={`${THEME.gradients.header} rounded-2xl p-8 text-white shadow-lg relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                <div className="relative z-10 flex items-center justify-between flex-wrap gap-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-3 flex items-center gap-3">
                            Bonjour, {establishmentName} <span className="animate-wave text-2xl">👋</span>
                        </h1>
                        <div className="flex items-center gap-4 flex-wrap">
                            {isPremium ? (
                                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-sm">
                                    <Crown className="w-4 h-4 text-yellow-300" fill="currentColor" />
                                    <span className="text-blue-50 font-medium text-sm">Compte Premium actif</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
                                    <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                    <span className="text-blue-100 font-medium text-sm">Compte Basic</span>
                                </div>
                            )}
                            {user?.status === 'VALIDATED' && (
                                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
                                    <CheckCircle className="w-4 h-4 text-white" />
                                    <span className="text-sm font-medium">Établissement vérifié</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <Link to="/establishment/missions/create">
                        <Button variant="secondary" className="border-none shadow-md font-bold px-6 h-12 text-blue-700 bg-white hover:bg-blue-50">
                            <Plus className="w-5 h-5 mr-2" />
                            Nouvelle Mission
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className={`hover:border-${THEME.colors.primary.blue}-300 hover:shadow-lg transition-all cursor-pointer group border-slate-200`} onClick={() => window.location.href = '/establishment/missions'}>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 bg-${THEME.colors.primary.blue}-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                <Briefcase className={`w-6 h-6 text-${THEME.colors.primary.blue}-600`} />
                            </div>
                            {stats.activeMissions > 0 && (
                                <Badge variant="blue" className={`bg-${THEME.colors.primary.blue}-100 text-${THEME.colors.primary.blue}-700 border-${THEME.colors.primary.blue}-200`}>
                                    Actif
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Missions Actives</p>
                        <p className="text-3xl font-bold text-slate-900 tracking-tight">{stats.activeMissions}</p>
                    </CardContent>
                </Card>

                <Card className={`hover:border-${THEME.colors.primary.indigo}-300 hover:shadow-lg transition-all cursor-pointer group border-slate-200`} onClick={() => window.location.href = '/establishment/applications'}>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 bg-${THEME.colors.primary.indigo}-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                <Users className={`w-6 h-6 text-${THEME.colors.primary.indigo}-600`} />
                            </div>
                            {stats.urgentApplications > 0 && (
                                <Badge variant="destructive" className="animate-pulse">
                                    {stats.urgentApplications} urgentes
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Candidatures en attente</p>
                        <p className="text-3xl font-bold text-slate-900 tracking-tight">{stats.pendingApplications}</p>
                    </CardContent>
                </Card>

                <Card className="hover:border-sky-300 hover:shadow-lg transition-all cursor-pointer group border-slate-200" onClick={() => window.location.href = '/establishment/search_worker'}>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Search className="w-6 h-6 text-sky-600" />
                            </div>
                        </div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Profils suggérés</p>
                        <p className="text-3xl font-bold text-slate-900 tracking-tight">{stats.suggestions}</p>
                        <p className="text-xs text-sky-600 font-medium mt-1 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Dans votre région
                        </p>
                    </CardContent>
                </Card>

                <div className={`rounded-2xl p-6 relative overflow-hidden transition-all hover:shadow-lg ${isPremium
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-800 text-white shadow-md'
                    : 'bg-white border border-slate-200'
                    }`}>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <Crown className={`w-6 h-6 ${isPremium ? 'text-yellow-300' : 'text-slate-400'}`} fill={isPremium ? "currentColor" : "none"} />
                            <span className={`text-sm font-bold uppercase tracking-wider ${isPremium ? 'text-blue-100' : 'text-slate-500'}`}>
                                Crédits Contacts
                            </span>
                        </div>
                        <p className={`text-3xl font-bold mb-1 ${isPremium ? 'text-white' : 'text-slate-900'}`}>
                            {isPremium ? 'Illimité ∞' : '3 / mois'}
                        </p>
                        <p className={`text-sm font-medium ${isPremium ? 'text-blue-200' : 'text-slate-500'}`}>
                            {isPremium ? 'Avantage Premium activé' : 'Passez à Pro pour débloquer'}
                        </p>
                    </div>
                    {isPremium && (
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - 2/3 */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Recent Applications */}
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
                            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Candidatures Récentes
                            </h3>
                            <Link to="/establishment/applications">
                                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                    Tout voir <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            </Link>
                        </CardHeader>

                        <CardContent className="p-0">
                            {recentApplications.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                                                <th className="px-6 py-4">Candidat</th>
                                                <th className="px-6 py-4">Poste visé</th>
                                                <th className="px-6 py-4">Score</th>
                                                <th className="px-6 py-4">Statut</th>
                                                <th className="px-6 py-4">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {recentApplications.map((app) => {
                                                const badgeStyle = getStatusBadgeStyle(app.status);
                                                return (
                                                    <tr key={app.id} className="hover:bg-slate-50/80 transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                                                    {app.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors truncate">{app.name}</p>
                                                                    <p className="text-xs text-slate-500 font-medium truncate">{app.experience}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-medium text-slate-600 whitespace-nowrap max-w-[200px] truncate" title={app.position}>{app.position}</td>
                                                        <td className="px-6 py-4">
                                                            <Badge variant={app.matchScore >= 80 ? 'blue' : 'secondary'} className={`whitespace-nowrap ${app.matchScore >= 80 ? 'bg-blue-100 text-blue-700 border-blue-200' : ''}`}>
                                                                {app.matchScore}% Match
                                                            </Badge>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap ${badgeStyle.bg} ${badgeStyle.text} border ${badgeStyle.border || 'border-transparent'}`}>
                                                                {app.status === 'ACCEPTED' ? (
                                                                    <><CheckCircle className="w-3.5 h-3.5" /> Acceptée</>
                                                                ) : app.status === 'REJECTED' ? (
                                                                    <><XCircle className="w-3.5 h-3.5" /> Refusée</>
                                                                ) : (
                                                                    <><div className="w-1.5 h-1.5 rounded-full bg-current"></div> En attente</>
                                                                )}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Link to="/establishment/applications">
                                                                <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50 font-medium">
                                                                    Voir
                                                                </Button>
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-16 text-slate-500">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FileText className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <p className="font-bold text-slate-700">Aucune candidature récente</p>
                                    <p className="text-sm mt-1">Les nouvelles candidatures apparaîtront ici</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link to="/establishment/missions/create">
                            <Card className="hover:border-blue-400 hover:shadow-md transition-all group cursor-pointer border-slate-200">
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                        <Plus className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">Publier une mission</p>
                                        <p className="text-sm text-slate-500">Créer une nouvelle offre d'emploi</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link to="/establishment/messages">
                            <Card className="hover:border-indigo-400 hover:shadow-md transition-all group cursor-pointer border-slate-200">
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                                        <MessageSquare className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">Messagerie</p>
                                        <p className="text-sm text-slate-500">Discuter avec les candidats</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </div>

                {/* Right Column - 1/3 */}
                <div className="space-y-6">
                    {/* Suggested Profiles */}
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-indigo-500" />
                                Profils Suggérés
                            </h3>
                            <Link to="/establishment/search_worker">
                                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 text-xs">
                                    Voir tout
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="p-4 pt-4">
                            {suggestedProfiles.length > 0 ? (
                                <div className="space-y-3">
                                    {suggestedProfiles.slice(0, 3).map((profile) => (
                                        <div key={profile.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-white hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer border border-transparent hover:border-slate-100" onClick={() => window.location.href = `/establishment/worker/${profile.id}`}>
                                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white">
                                                {profile.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-800 truncate text-sm">{profile.name}</p>
                                                <p className="text-xs text-slate-500 truncate font-medium">{profile.title || 'Professionnel'}</p>
                                            </div>
                                            {profile.is_verified && (
                                                <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" stroke="white" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-500">
                                    <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                                    <p className="text-sm font-medium">Publiez des missions pour recevoir des suggestions</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Security Reminder */}
                    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <Shield className="w-5 h-5 text-blue-400" />
                                <h3 className="font-bold text-lg">Rappel Sécurité</h3>
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed mb-4">
                                Les coordonnées des candidats sont débloquées uniquement après <span className="text-white font-bold text-blue-200">acceptation officielle</span> du devis ou de la candidature.
                            </p>
                            <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                                <span className="text-sm font-medium text-slate-200">
                                    {isPremium ? 'Contacts illimités (Premium)' : '3 contacts / mois (Basic)'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Upgrade CTA for non-premium */}
                    {!isPremium && (
                        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-3">
                                    <Crown className="w-5 h-5 text-yellow-300" fill="currentColor" />
                                    <h3 className="font-bold text-lg">Passez à Pro</h3>
                                </div>
                                <p className="text-sm text-blue-100 mb-5 font-medium leading-relaxed">
                                    Débloquez les missions illimitées, la visibilité prioritaire et l'accès complet aux candidats.
                                </p>
                                <Link to="/establishment/billing">
                                    <Button className="w-full bg-white text-blue-700 hover:bg-blue-50 font-bold border-none shadow-md">
                                        Découvrir l'offre Pro
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EstablishmentDashboard;
