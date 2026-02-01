import { useSubscription } from '../../context/SubscriptionContext';
import BlurredContent from './BlurredContent';

/**
 * FeatureGuard - Affiche/masque du contenu selon l'abonnement
 * 
 * @param {string} feature - Nom de la feature à vérifier
 * @param {React.ReactNode} children - Contenu à afficher si autorisé
 * @param {React.ReactNode} fallback - Contenu alternatif si non autorisé
 * @param {boolean} blur - Si true, floute le contenu au lieu de le cacher
 * @param {string} message - Message pour le contenu flouté
 * 
 * @example
 * <FeatureGuard feature="canViewUrgentMissions" blur>
 *   <UrgentMissionCard mission={urgentMission} />
 * </FeatureGuard>
 */
export default function FeatureGuard({
    feature,
    children,
    fallback = null,
    blur = false,
    message = 'Cette fonctionnalité nécessite un abonnement',
    ctaText = "S'abonner",
    ctaLink = '/pricing'
}) {
    const { canAccess, loading } = useSubscription();

    // Pendant le chargement, afficher un skeleton
    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
            </div>
        );
    }

    // Vérifier l'accès
    const hasAccess = canAccess(feature);

    if (hasAccess) {
        return <>{children}</>;
    }

    // Si pas d'accès et mode flou
    if (blur) {
        return (
            <BlurredContent
                message={message}
                ctaText={ctaText}
                ctaLink={ctaLink}
            >
                {children}
            </BlurredContent>
        );
    }

    // Sinon retourner le fallback
    return fallback;
}
