import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Briefcase, Lock, Zap, Building2, CheckCircle, Calendar, Users, FileText, Shield, Wifi, MapPinned, GraduationCap } from 'lucide-react';

export default function MissionHorizontalCard({ mission, user }) {
    const navigate = useNavigate();
    const isRedacted = mission.is_redacted;

    const getBlurMessage = () => {
        if (!user) return "Connectez-vous pour voir les détails";
        if (mission.redaction_reason === "NOT_VALIDATED") return "Validez votre compte pour voir";
        if (mission.redaction_reason === "RECENT_MISSION_PREMIUM_ONLY") return "Exclusivité Premium (48h)";
        if (mission.redaction_reason === "URGENT_PREMIUM_ONLY") return "Urgence réservée Premium";
        return "Contenu réservé";
    };

    // Calculate days since posted
    const daysAgo = Math.floor((new Date() - new Date(mission.created_at)) / (1000 * 60 * 60 * 24));
    const isNew = daysAgo < 2;

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all relative overflow-hidden">

            {/* Redaction Overlay */}
            {isRedacted && (
                <div className="absolute inset-0 z-20 bg-white/50 backdrop-blur-[4px] flex items-center justify-center">
                    <div className="bg-white border border-slate-200 shadow-lg px-5 py-3 rounded-full flex items-center gap-3">
                        <Lock className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-semibold text-slate-600">{getBlurMessage()}</span>
                        {!user && <Link to="/login" className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700">Connexion</Link>}
                        {user && user.role === 'WORKER' && <Link to="/worker/subscription" className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600">Premium</Link>}
                    </div>
                </div>
            )}

            <div className="flex gap-4">
                {/* Left: Icon */}
                <div className="shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                        {mission.establishment?.logo_url ? (
                            <img src={mission.establishment.logo_url} alt="" className="w-full h-full object-cover rounded-xl" />
                        ) : (
                            <FileText className="w-5 h-5 text-slate-400" />
                        )}
                    </div>
                </div>

                {/* Center: Content */}
                <div className="flex-1 min-w-0">
                    {/* Top Row: Badges */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {/* Verified Badge */}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded-full border border-blue-100">
                            <CheckCircle className="w-3 h-3" />
                            Vérifié
                        </span>

                        {/* Sector Tag */}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                            <GraduationCap className="w-3 h-3" />
                            {mission.sector || "Action Sociale"}
                        </span>

                        {/* Positions count */}
                        <span className="text-xs text-slate-500">{mission.positions_count || 1} poste(s)</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-slate-800 mb-1 line-clamp-1 hover:text-blue-600 transition-colors cursor-pointer">
                        {mission.title}
                    </h3>

                    {/* Company */}
                    <p className="text-sm text-slate-500 mb-2">
                        {mission.establishment?.name || "Établissement confidentiel"}
                    </p>

                    {/* Meta Row */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mb-3">
                        <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {mission.city?.name || "Maroc"}
                        </span>
                        <span className="flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5" />
                            {mission.contract_type || "FREELANCE"}
                        </span>
                        <span className="flex items-center gap-1">
                            <Wifi className="w-3.5 h-3.5" />
                            {mission.work_mode === 'REMOTE' ? 'Télétravail' : mission.work_mode === 'HYBRID' ? 'Hybride' : 'Sur site'}
                        </span>
                        <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {mission.experience_level === 'JUNIOR' ? 'Junior' : mission.experience_level === 'SENIOR' ? 'Senior' : mission.experience_level === 'EXPERT' ? 'Expert' : 'Intermédiaire'}
                        </span>
                    </div>

                    {/* Description */}
                    <p className={`text-sm text-slate-600 mb-3 line-clamp-2 ${isRedacted ? 'blur-[3px] select-none' : ''}`}>
                        {mission.description || "Description de la mission..."}
                    </p>

                    {/* Sector Tag */}
                    {mission.sector && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-100">{mission.sector}</span>
                        </div>
                    )}

                    {/* Benefits Row */}
                    {mission.benefits && mission.benefits.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {mission.benefits.includes('CNSS') && (
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full border border-emerald-100 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> CNSS
                                </span>
                            )}
                            {mission.benefits.includes('MUTUELLE') && (
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full border border-emerald-100 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Mutuelle
                                </span>
                            )}
                            {mission.benefits.includes('TRANSPORT') && (
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded-full border border-amber-100 flex items-center gap-1">
                                    <Shield className="w-3 h-3" /> Transport
                                </span>
                            )}
                            {mission.benefits.includes('FORMATION') && (
                                <span className="px-2 py-0.5 bg-teal-50 text-teal-700 text-xs rounded-full border border-teal-100 flex items-center gap-1">
                                    <GraduationCap className="w-3 h-3" /> Formation
                                </span>
                            )}
                            {mission.benefits.includes('LOGEMENT') && (
                                <span className="px-2 py-0.5 bg-sky-50 text-sky-700 text-xs rounded-full border border-sky-100 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Logement
                                </span>
                            )}
                            {mission.benefits.includes('REPAS') && (
                                <span className="px-2 py-0.5 bg-orange-50 text-orange-700 text-xs rounded-full border border-orange-100 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Repas
                                </span>
                            )}
                        </div>
                    )}

                    {/* Footer: Date & Location */}
                    <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Date limite: {mission.end_date ? new Date(mission.end_date).toLocaleDateString('fr-FR') : 'Non précisée'}
                        </span>
                        <span className="flex items-center gap-1">
                            <MapPinned className="w-3.5 h-3.5" />
                            {mission.city?.name || "Maroc"}
                        </span>
                    </div>
                </div>

                {/* Right: Salary & Action */}
                <div className="shrink-0 w-32 flex flex-col items-end justify-between border-l border-slate-100 pl-4">
                    {/* Salary */}
                    <div className="text-right">
                        {(mission.salary_min || mission.salary_max || mission.budget) ? (
                            <>
                                <p className={`text-lg font-bold text-slate-800 ${isRedacted ? 'blur-[4px]' : ''}`}>
                                    {mission.salary_min ? `${mission.salary_min.toLocaleString('fr-FR')} -` : ''}
                                </p>
                                <p className={`text-xl font-extrabold text-slate-900 ${isRedacted ? 'blur-[4px]' : ''}`}>
                                    {(mission.salary_max || mission.budget)?.toLocaleString('fr-FR')} <span className="text-sm font-medium text-blue-600">DH</span>
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">par mois</p>
                            </>
                        ) : (
                            <p className={`text-lg font-bold text-slate-600 ${isRedacted ? 'blur-[4px]' : ''}`}>À négocier</p>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="text-right text-xs text-slate-500 my-2">
                        <p className="flex items-center justify-end gap-1">
                            <span className="font-semibold text-slate-700">{mission.application_count || Math.floor(Math.random() * 50) + 5}</span> vues
                        </p>
                        <p className="flex items-center justify-end gap-1">
                            <span className="font-semibold text-emerald-600">{mission.applications?.length || Math.floor(Math.random() * 10)}</span> candidatures
                        </p>
                    </div>

                    {/* Urgent Badge */}
                    {mission.is_urgent && (
                        <span className="px-2 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-md border border-red-100 flex items-center gap-1 mb-2">
                            <Zap className="w-3 h-3" /> Urgent
                        </span>
                    )}

                    {/* Action Button */}
                    <button
                        onClick={() => !isRedacted && navigate(`/missions/${mission.mission_id}`)}
                        disabled={isRedacted}
                        className={`w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${isRedacted
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                            }`}
                    >
                        {isRedacted ? 'Verrouillé' : "Voir l'offre"}
                    </button>
                </div>
            </div>
        </div>
    );
}
