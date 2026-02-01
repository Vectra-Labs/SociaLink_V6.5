import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, Clock, Building2, Lock, ChevronRight, Users, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const PublicMissions = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);

    const isAdmin = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN');

    useEffect(() => {
        if (user?.role === 'WORKER') {
            navigate('/worker/missions');
            return;
        }
        fetchMissions();
    }, [user, navigate]); // Re-fetch/Redirect if user status changes

    const fetchMissions = async () => {
        try {
            const res = await fetch('/api/missions/all');
            const data = await res.json();
            if (data.status === 'success') {
                if (isAdmin) {
                    setMissions(data.data); // Show all for admins
                } else {
                    setMissions(data.data.slice(0, 3)); // Limit to 3 for visitors
                }
            }
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            {/* Header */}
            <div className="text-center mb-12">
                {isAdmin ? (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
                        <ShieldCheck className="w-5 h-5" />
                        Vue Administrateur
                    </div>
                ) : null}
                <h1 className="text-4xl font-bold text-slate-900 mb-4">
                    Missions Disponibles
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    {isAdmin
                        ? "Aperçu global de toutes les missions sur la plateforme."
                        : "Découvrez les opportunités de travail social au Maroc. Inscrivez-vous pour accéder à toutes les missions."}
                </p>
            </div>

            {/* Mission Preview Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
                {missions.map((mission) => (
                    <div
                        key={mission.mission_id}
                        className="bg-white rounded-2xl border border-slate-200 p-6 relative overflow-hidden transition-all hover:shadow-lg"
                    >
                        {/* Blur Overlay - Only for Non-Admins */}
                        {!isAdmin && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center">
                                <div className="text-center p-4">
                                    <Lock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                    <p className="text-sm text-slate-600 font-medium">
                                        Contenu réservé aux membres
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Card Content - Blurred for Visitors, Clear for Admins */}
                        <div className={`relative ${!isAdmin ? 'filter blur-[1px]' : ''}`}>
                            <h3 className="font-semibold text-lg text-slate-900 mb-2 line-clamp-2">
                                {mission.title}
                            </h3>
                            {mission.establishment && (
                                <div className="flex items-center gap-2 text-slate-600 text-sm mb-2">
                                    <Building2 className="w-4 h-4 shrink-0" />
                                    <span className="truncate">{mission.establishment.name}</span>
                                </div>
                            )}
                            {mission.city && (
                                <div className="flex items-center gap-2 text-slate-600 text-sm mb-2">
                                    <MapPin className="w-4 h-4 shrink-0" />
                                    <span>{mission.city.name}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-slate-600 text-sm">
                                <Clock className="w-4 h-4 shrink-0" />
                                <span>{new Date(mission.created_at).toLocaleDateString('fr-FR')}</span>
                            </div>

                            {/* Admin Actions (Optional) */}
                            {isAdmin && (
                                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                                    <Link
                                        to={`/admin/missions/${mission.mission_id}`}
                                        className="text-blue-600 text-sm font-medium hover:underline"
                                    >
                                        Gérer
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* CTA Section - Hide for Admins */}
            {!isAdmin && (
                <>
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 md:p-12 text-center text-white">
                        <Users className="w-16 h-16 mx-auto mb-6 opacity-80" />
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">
                            Rejoignez SociaLink
                        </h2>
                        <p className="text-blue-100 mb-8 max-w-xl mx-auto">
                            Créez votre compte gratuitement pour accéder aux missions,
                            postuler et rejoindre notre communauté de travailleurs sociaux.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/register/worker"
                                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors"
                            >
                                Je suis travailleur social
                                <ChevronRight className="w-5 h-5" />
                            </Link>
                            <Link
                                to="/register/establishment"
                                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-blue-500/30 text-white font-semibold rounded-xl hover:bg-blue-500/40 transition-colors border border-white/20"
                            >
                                Je suis un établissement
                                <ChevronRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>

                    <div className="text-center mt-8">
                        <p className="text-slate-600">
                            Déjà inscrit ?{' '}
                            <Link to="/login" className="text-blue-600 font-medium hover:underline">
                                Se connecter
                            </Link>
                        </p>
                    </div>
                </>
            )}
        </div>
    );
};

export default PublicMissions;
