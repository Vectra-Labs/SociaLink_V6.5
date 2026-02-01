import { useSubscription } from '../../context/SubscriptionContext';
import { Link } from 'react-router-dom';
import { Clock, XCircle, Mail, ArrowRight, AlertTriangle, FileText, Award, User } from 'lucide-react';

/**
 * StatusGuard - Affiche un message selon le statut du compte
 * 
 * @param {React.ReactNode} children - Contenu à afficher
 * @param {boolean} blockPending - Si true, bloque l'accès quand PENDING (pour actions critiques seulement)
 * 
 * Par défaut, le StatusGuard permet l'accès au dashboard même en PENDING
 * pour que l'utilisateur puisse compléter son profil.
 * Utilisez blockPending={true} uniquement pour les actions nécessitant validation
 * (ex: postuler aux missions, voir certaines informations sensibles)
 */
export default function StatusGuard({ children, blockPending = false }) {
    const { userStatus, isValidated, isPending, isRejected, loading } = useSubscription();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    // Compte validé - afficher le contenu
    if (isValidated) {
        return <>{children}</>;
    }

    // Compte en attente - NOUVEAU COMPORTEMENT
    if (isPending) {
        // Si blockPending est false, on affiche le contenu avec une bannière d'avertissement
        if (!blockPending) {
            return (
                <>
                    {/* Bannière d'avertissement en haut - BLEU */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3">
                        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-sm">
                                        Compte en attente de validation
                                    </p>
                                    <p className="text-blue-100 text-xs">
                                        Complétez votre profil pour accélérer la validation (diplômes, compétences, photo)
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link
                                    to="/worker/profile"
                                    className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium text-white transition-colors"
                                >
                                    <User className="w-4 h-4" />
                                    Profil
                                </Link>
                                <Link
                                    to="/worker/documents"
                                    className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium text-white transition-colors"
                                >
                                    <FileText className="w-4 h-4" />
                                    Documents
                                </Link>
                                <Link
                                    to="/worker/specialities"
                                    className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium text-white transition-colors"
                                >
                                    <Award className="w-4 h-4" />
                                    Compétences
                                </Link>
                            </div>
                        </div>
                    </div>
                    {/* Contenu normal */}
                    {children}
                </>
            );
        }

        // Si blockPending est true, on bloque avec le message complet
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 max-w-md text-center">
                    {/* Icon */}
                    <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center mx-auto mb-6">
                        <Clock className="w-10 h-10" />
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
                        Action non disponible
                    </h2>

                    {/* Message */}
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        Cette fonctionnalité nécessite que votre compte soit validé par notre équipe.
                        Complétez votre profil pour accélérer la validation.
                    </p>

                    {/* Checklist */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6 text-left">
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                            Pour accélérer votre validation :
                        </p>
                        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                            <li className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Complétez votre profil
                            </li>
                            <li className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Ajoutez vos diplômes
                            </li>
                            <li className="flex items-center gap-2">
                                <Award className="w-4 h-4" />
                                Sélectionnez vos compétences
                            </li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <Link
                            to="/worker/profile"
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            Compléter mon profil
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            to="/worker/dashboard"
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                            Retour au tableau de bord
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Compte rejeté
    if (isRejected) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 dark:from-slate-900 dark:to-red-900/20 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 max-w-md text-center">
                    {/* Icon */}
                    <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center mx-auto mb-6">
                        <XCircle className="w-10 h-10" />
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
                        Inscription non validée
                    </h2>

                    {/* Message */}
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        Malheureusement, votre inscription n'a pas pu être validée.
                        Cela peut être dû à des documents manquants ou incorrects.
                    </p>

                    {/* Reasons box */}
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 text-left">
                        <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">
                            Raisons possibles :
                        </p>
                        <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
                            <li>• Documents illisibles ou expirés</li>
                            <li>• Informations incomplètes</li>
                            <li>• Diplômes non reconnus</li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <a
                            href="mailto:support@socialink.ma?subject=Demande de révision de mon inscription"
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            <Mail className="w-4 h-4" />
                            Contacter le support
                        </a>
                        <Link
                            to="/"
                            className="flex items-center justify-center gap-2 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                        >
                            Retourner à l'accueil
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Fallback
    return <>{children}</>;
}
