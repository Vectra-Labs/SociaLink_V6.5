import { prisma } from '../config/db.js';

/**
 * Service de gestion des abonnements
 * Centralise la logique métier pour les limitations et accès
 */

/**
 * Récupère le plan actif d'un utilisateur avec toutes ses limitations
 */
export async function getUserSubscription(userId) {
    const subscription = await prisma.subscription.findUnique({
        where: { user_id: userId },
        include: { plan: true }
    });

    if (!subscription) {
        return getDefaultPlan();
    }

    // Vérifier si l'abonnement est expiré
    if (subscription.status === 'EXPIRED' ||
        (subscription.end_date && new Date(subscription.end_date) < new Date())) {
        return getDefaultPlan();
    }

    // Vérifier si la période d'essai est terminée
    if (subscription.status === 'TRIAL' &&
        subscription.trial_end_date &&
        new Date(subscription.trial_end_date) < new Date()) {
        await prisma.subscription.update({
            where: { subscription_id: subscription.subscription_id },
            data: { status: 'EXPIRED' }
        });
        return getDefaultPlan();
    }

    return {
        ...subscription.plan,
        subscriptionId: subscription.subscription_id,
        status: subscription.status,
        endDate: subscription.end_date,
        trialEndDate: subscription.trial_end_date
    };
}

/**
 * Retourne le plan BASIC par défaut
 */
async function getDefaultPlan() {
    const basicPlan = await prisma.subscriptionPlanConfig.findFirst({
        where: { code: 'BASIC', is_active: true }
    });

    if (basicPlan) {
        return {
            ...basicPlan,
            subscriptionId: null,
            status: 'BASIC',
            isPaidPlan: false
        };
    }

    // Fallback hardcodé si aucun plan en base
    return {
        code: 'BASIC',
        name: 'Gratuit',
        max_active_applications: 3,
        can_view_urgent_missions: false,
        can_view_full_profiles: false,
        has_auto_matching: false,
        mission_view_delay_hours: 48,
        max_visible_missions: 5,
        max_active_missions: 2,
        can_post_urgent: false,
        can_search_workers: false,
        isPaidPlan: false
    };
}

/**
 * Vérifie si un utilisateur peut accéder à une fonctionnalité
 */
export async function canAccessFeature(userId, feature) {
    const plan = await getUserSubscription(userId);

    const featureMap = {
        'view_urgent_missions': plan.can_view_urgent_missions,
        'view_full_profiles': plan.can_view_full_profiles,
        'auto_matching': plan.has_auto_matching,
        'post_urgent_mission': plan.can_post_urgent,
        'search_workers': plan.can_search_workers,
        'unlimited_applications': plan.max_active_applications > 10,
        'unlimited_missions': plan.max_active_missions === null
    };

    const allowed = featureMap[feature] ?? false;

    return {
        allowed,
        reason: allowed ? null : `Cette fonctionnalité nécessite un abonnement supérieur.`,
        currentPlan: plan.code,
        requiredPlan: plan.code === 'BASIC' ? 'PREMIUM' : 'PRO'
    };
}

/**
 * Récupère l'usage quotidien d'un utilisateur
 */
export async function getDailyUsage(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let usage = await prisma.userUsage.findUnique({
        where: {
            user_id_date: { user_id: userId, date: today }
        }
    });

    if (!usage) {
        usage = await prisma.userUsage.create({
            data: { user_id: userId, date: today }
        });
    }

    return usage;
}

/**
 * Incrémente un compteur d'usage
 */
export async function incrementUsage(userId, usageType) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.userUsage.upsert({
        where: {
            user_id_date: { user_id: userId, date: today }
        },
        create: {
            user_id: userId,
            date: today,
            [usageType]: 1
        },
        update: {
            [usageType]: { increment: 1 }
        }
    });
}

/**
 * Vérifie si un utilisateur a atteint sa limite quotidienne
 */
export async function checkDailyLimit(userId, limitType) {
    const plan = await getUserSubscription(userId);
    const usage = await getDailyUsage(userId);

    const limitsMap = {
        'applications': {
            current: usage.applications_count,
            max: plan.max_active_applications
        },
        'missions_published': {
            current: usage.missions_published_count,
            max: plan.max_active_missions ?? 999
        },
        'missions_viewed': {
            current: usage.missions_viewed_count,
            max: plan.max_visible_missions ?? 999
        }
    };

    const limit = limitsMap[limitType];
    if (!limit) {
        return { allowed: true, current: 0, max: 999, remaining: 999 };
    }

    const remaining = Math.max(0, limit.max - limit.current);

    return {
        allowed: remaining > 0,
        current: limit.current,
        max: limit.max,
        remaining,
        planCode: plan.code
    };
}

/**
 * Assigne un plan BASIC par défaut à un utilisateur validé
 */
export async function assignDefaultSubscription(userId, role) {
    const planCode = 'BASIC';

    const plan = await prisma.subscriptionPlanConfig.findFirst({
        where: {
            code: planCode,
            is_active: true
        }
    });

    if (!plan) {
        console.warn(`No default plan found`);
        return null;
    }

    const existing = await prisma.subscription.findUnique({
        where: { user_id: userId }
    });

    if (existing) {
        return existing;
    }

    return prisma.subscription.create({
        data: {
            user_id: userId,
            plan_id: plan.plan_id,
            status: 'ACTIVE'
        }
    });
}

export default {
    getUserSubscription,
    canAccessFeature,
    getDailyUsage,
    incrementUsage,
    checkDailyLimit,
    assignDefaultSubscription
};
