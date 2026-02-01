import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/client';

const SubscriptionContext = createContext(null);

/**
 * Provider pour la gestion des abonnements
 * Modèle simplifié: GRATUIT vs ABONNÉ
 */
export function SubscriptionProvider({ children }) {
    const { user } = useAuth();
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);

    // Charger les données d'abonnement
    const fetchSubscription = useCallback(async () => {
        if (!user) {
            setSubscription(null);
            setLoading(false);
            return;
        }

        try {
            const response = await api.get('/subscriptions/current');
            setSubscription(response.data);
        } catch (err) {
            // Plan GRATUIT par défaut si pas d'abonnement ou erreur
            setSubscription({
                plan: { code: 'GRATUIT', name: 'Gratuit' },
                isSubscribed: false,
                features: {
                    canViewUrgentMissions: false,
                    canViewFullProfiles: false,
                    hasAutoMatching: false,
                    canPostUrgent: false,
                    canSearchWorkers: false
                },
                limits: {
                    applications: { used: 0, max: 3, remaining: 3 },
                    missionsVisible: { max: 5 }
                },
                missionDelayHours: 48
            });
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchSubscription();
    }, [fetchSubscription]);

    /**
     * Vérifie si l'utilisateur a accès à une fonctionnalité
     * @param {string} feature - Nom de la feature
     * @returns {boolean}
     */
    /**
     * Vérifie si l'utilisateur a accès à une fonctionnalité
     * @param {string} feature - Nom de la feature
     * @returns {boolean}
     */
    const canAccess = useCallback((feature) => {
        // Admins ont tous les accès
        if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') return true;

        // User non validé n'a accès à rien de premium
        if (user?.status !== 'VALIDATED') return false;

        // Abonnés (Premium/Pro) ont tout
        if (subscription?.isPremium || subscription?.isSubscribed) return true;

        // Sinon vérifier la feature spécifique
        return subscription?.features?.[feature] ?? false;
    }, [subscription, user]);

    /**
     * Récupère les limites pour un type
     * @param {string} limitType - 'applications', 'missionsVisible', etc.
     */
    const getLimit = useCallback((limitType) => {
        if (!subscription?.limits) return null;
        return subscription.limits[limitType] || null;
    }, [subscription]);

    /**
     * Vérifie si l'utilisateur est abonné
     */
    const isSubscribed = subscription?.isPremium || subscription?.isSubscribed || false;

    /**
     * Vérifie le statut du compte utilisateur
     */
    const userStatus = user?.status ?? 'PENDING';
    const isValidated = userStatus === 'VALIDATED';
    const isPending = userStatus === 'PENDING';
    const isRejected = userStatus === 'REJECTED';

    const value = {
        subscription,
        loading,
        isSubscribed,
        userStatus,
        isValidated,
        isPending,
        isRejected,
        canAccess,
        getLimit,
        refetch: fetchSubscription,
        // Alias pour compatibilité
        planCode: subscription?.plan?.code ?? 'GRATUIT',
        planName: subscription?.plan?.name ?? 'Gratuit'
    };

    return (
        <SubscriptionContext.Provider value={value}>
            {children}
        </SubscriptionContext.Provider>
    );
}

/**
 * Hook pour accéder au contexte d'abonnement
 */
export function useSubscription() {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
}
