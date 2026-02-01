import { useSubscription } from '../../context/SubscriptionContext';
import { AlertCircle } from 'lucide-react';

/**
 * LimitCounter - Affiche le compteur de quota
 * 
 * @param {string} limitType - Type de limite ('applications', 'missionsVisible')
 * @param {string} label - Label à afficher
 * 
 * @example
 * <LimitCounter limitType="applications" label="Candidatures" />
 */
export default function LimitCounter({
    limitType,
    label = 'Utilisations',
    showWarning = true
}) {
    const { getLimit, isSubscribed, loading } = useSubscription();

    if (loading) {
        return <div className="animate-pulse h-6 w-24 bg-slate-200 rounded"></div>;
    }

    // Abonnés n'ont pas de limites
    if (isSubscribed) {
        return (
            <span className="text-sm text-green-600 font-medium">
                ∞ {label} illimitées
            </span>
        );
    }

    const limit = getLimit(limitType);
    if (!limit) return null;

    const { used = 0, max = 0, remaining } = limit;
    const actualRemaining = remaining ?? (max - used);
    const percentage = max > 0 ? (used / max) * 100 : 0;
    const isLow = actualRemaining <= 1;
    const isExhausted = actualRemaining <= 0;

    return (
        <div className="flex items-center gap-2">
            {/* Barre de progression */}
            <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all ${isExhausted ? 'bg-red-500' :
                            isLow ? 'bg-amber-500' :
                                'bg-blue-500'
                        }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </div>

            {/* Compteur */}
            <span className={`text-sm font-medium ${isExhausted ? 'text-red-600' :
                    isLow ? 'text-amber-600' :
                        'text-slate-600 dark:text-slate-400'
                }`}>
                {used}/{max} {label}
            </span>

            {/* Warning icon */}
            {showWarning && isLow && (
                <AlertCircle className={`w-4 h-4 ${isExhausted ? 'text-red-500' : 'text-amber-500'}`} />
            )}
        </div>
    );
}
