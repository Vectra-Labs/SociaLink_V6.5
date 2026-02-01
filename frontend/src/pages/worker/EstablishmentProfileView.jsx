import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import { Building2, MapPin, Briefcase, ChevronLeft, Shield, Calendar, Zap } from 'lucide-react';
import LocationMap from '../../components/ui/LocationMap';

export default function EstablishmentProfileView() {
    const { slug } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get(`/establishment/public/${slug}`);
                setProfile(data.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Impossible de charger le profil');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-xl border border-red-200 text-center">
                    <p className="text-red-600 font-medium">{error}</p>
                    <Link to="/worker/missions" className="mt-4 inline-block text-blue-600 hover:underline">
                        ← Retour aux missions
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Back Link */}
                <Link to="/worker/missions" className="inline-flex items-center gap-1 text-slate-500 hover:text-blue-600 mb-6">
                    <ChevronLeft className="w-4 h-4" /> Retour aux missions
                </Link>

                {/* Header Card */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                    <div className="px-6 pb-6 -mt-12">
                        <div className="flex items-end gap-4">
                            <div className="w-24 h-24 bg-white rounded-xl p-2 shadow-lg flex items-center justify-center border-4 border-white">
                                {profile.logo_url ? (
                                    <img src={profile.logo_url} alt="" className="w-full h-full object-contain rounded-lg" />
                                ) : (
                                    <Building2 className="w-10 h-10 text-slate-400" />
                                )}
                            </div>
                            <div className="flex-1 pb-2">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold text-slate-800">{profile.name}</h1>
                                    {profile.verification_status === 'VERIFIED' && (
                                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-md flex items-center gap-1">
                                            <Shield className="w-3 h-3" /> Vérifié
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 mt-1 text-slate-500 text-sm">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" /> {profile.city?.name || 'Non spécifié'}
                                    </span>
                                    {profile.service && (
                                        <span className="flex items-center gap-1">
                                            <Briefcase className="w-4 h-4" /> {profile.service}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Location Section */}
                <div className="mt-6 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <h2 className="font-semibold text-slate-800">Localisation</h2>
                    </div>
                    <div className="h-64 relative">
                        <LocationMap city={profile.city?.name} className="h-full w-full" />
                    </div>
                    <div className="p-4 bg-slate-50 text-sm text-slate-600 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            {profile.city?.name || 'Localisation non spécifiée'}
                        </span>
                        {profile.city?.name && (
                            <a
                                href={`https://maps.google.com/?q=${profile.city?.name}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 font-medium hover:underline text-xs uppercase tracking-wide flex items-center gap-1"
                            >
                                Ouvrir dans Maps <span className="inline-block">→</span>
                            </a>
                        )}
                    </div>
                </div>

                {/* Missions Section */}
                <div className="mt-6 bg-white rounded-xl border border-slate-200 p-6">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                        Missions en cours
                    </h2>

                    {profile.missions?.length > 0 ? (
                        <div className="space-y-3">
                            {profile.missions.map((mission) => (
                                <div key={mission.mission_id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        {mission.is_urgent && (
                                            <span className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                                <Zap className="w-4 h-4 text-red-600" />
                                            </span>
                                        )}
                                        <div>
                                            <p className="font-medium text-slate-800">{mission.title}</p>
                                            <p className="text-sm text-slate-500 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                Début : {new Date(mission.start_date).toLocaleDateString('fr-FR')}
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        to={`/worker/missions`}
                                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Voir
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-500">
                            <p>Aucune mission ouverte pour le moment</p>
                        </div>
                    )}
                </div>

                {/* Contact Info Notice */}
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
                    <p className="font-medium">📧 Informations de contact masquées</p>
                    <p className="mt-1 text-amber-700">
                        Les coordonnées de l'établissement seront visibles uniquement après validation de votre candidature pour une mission.
                    </p>
                </div>
            </div>
        </div>
    );
}
