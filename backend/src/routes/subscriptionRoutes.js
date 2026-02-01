import express from 'express';
import { prisma } from '../config/db.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';
import subscriptionService from '../services/subscriptionService.js';
import { createNotification } from '../services/notificationService.js';

const router = express.Router();

/**
 * GET /api/subscriptions/plans
 * Liste des plans d'abonnement disponibles
 */
router.get('/plans', async (req, res, next) => {
    try {
        const plans = await prisma.subscriptionPlanConfig.findMany({
            where: { is_active: true },
            orderBy: { price_monthly: 'asc' }
        });

        const formattedPlans = plans.map(plan => ({
            ...plan,
            priceMonthlyFormatted: formatPrice(plan.price_monthly),
            priceYearlyFormatted: plan.price_yearly ? formatPrice(plan.price_yearly) : null
        }));

        res.json({ plans: formattedPlans });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/subscriptions/current
 * Abonnement actuel de l'utilisateur
 */
router.get('/current', authenticateToken, async (req, res, next) => {
    try {
        // Admin et Super Admin ont accès complet
        if (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN') {
            return res.json({
                plan: { code: 'ADMIN', name: 'Administrateur', priceMonthly: 0 },
                status: 'ACTIVE',
                features: {
                    canViewUrgentMissions: true,
                    canViewFullProfiles: true,
                    hasAutoMatching: true,
                    canPostUrgent: true,
                    canSearchWorkers: true
                },
                limits: {
                    applications: { used: 0, max: 999, remaining: 999 }
                },
                isPremium: true,
                isAdmin: true
            });
        }

        const subscription = await subscriptionService.getUserSubscription(req.user.user_id);
        const usage = await subscriptionService.getDailyUsage(req.user.user_id);

        const limits = {
            applications: {
                used: usage.applications_count,
                max: subscription.max_active_applications || 3,
                remaining: Math.max(0, (subscription.max_active_applications || 3) - usage.applications_count)
            },
            missionsViewed: {
                used: usage.missions_viewed_count,
                max: subscription.max_visible_missions ?? 999,
                remaining: subscription.max_visible_missions
                    ? Math.max(0, subscription.max_visible_missions - usage.missions_viewed_count)
                    : 999
            }
        };

        // Pour les établissements
        if (req.user.role === 'ESTABLISHMENT') {
            const activeMissions = await prisma.mission.count({
                where: {
                    establishment_id: req.user.user_id,
                    status: { in: ['OPEN', 'IN_PROGRESS'] }
                }
            });

            limits.activeMissions = {
                used: activeMissions,
                max: subscription.max_active_missions ?? 999,
                remaining: subscription.max_active_missions
                    ? Math.max(0, subscription.max_active_missions - activeMissions)
                    : 999
            };
        }

        res.json({
            plan: {
                code: subscription.code || 'BASIC',
                name: subscription.name || 'Gratuit',
                priceMonthly: subscription.price_monthly || 0,
                priceMonthlyFormatted: formatPrice(subscription.price_monthly || 0)
            },
            status: subscription.status || 'ACTIVE',
            endDate: subscription.endDate,
            trialEndDate: subscription.trialEndDate,
            features: {
                canViewUrgentMissions: subscription.can_view_urgent_missions || false,
                canViewFullProfiles: subscription.can_view_full_profiles || false,
                hasAutoMatching: subscription.has_auto_matching || false,
                canPostUrgent: subscription.can_post_urgent || false,
                canSearchWorkers: subscription.can_search_workers || false,
                missionViewDelayHours: subscription.mission_view_delay_hours || 48
            },
            limits,
            isPremium: subscription.code !== 'BASIC'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/subscriptions/upgrade
 * Demande d'upgrade vers un plan supérieur
 */
router.post('/upgrade', authenticateToken, async (req, res, next) => {
    try {
        const { planCode } = req.body;

        const plan = await prisma.subscriptionPlanConfig.findUnique({
            where: { code: planCode }
        });

        if (!plan) {
            return res.status(400).json({
                error: 'InvalidPlan',
                message: 'Plan d\'abonnement non valide'
            });
        }

        // Créer notification pour Super Admin
        const superAdmins = await prisma.user.findMany({
            where: { role: 'SUPER_ADMIN' }
        });

        for (const admin of superAdmins) {
            for (const admin of superAdmins) {
                await createNotification({
                    userId: admin.user_id,
                    type: 'URGENT',
                    message: `Demande d'upgrade: ${req.user.email} souhaite passer au plan ${plan.name}.`,
                    link: '/super-admin/subscriptions'
                });
            }
        }

        res.json({
            success: true,
            message: 'Votre demande a été transmise. Vous serez contacté sous 24h.',
            requestedPlan: plan.code
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/subscriptions/upgrade-requests
 * Liste des demandes d'upgrade (SuperAdmin)
 */
router.get('/upgrade-requests', authenticateToken, requireRole(['SUPER_ADMIN', 'ADMIN']), async (req, res, next) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: {
                message: { contains: 'Demande d\'upgrade' }
            },
            orderBy: { created_at: 'desc' }
        });

        const requests = [];
        for (const notif of notifications) {
            const match = notif.message.match(/Demande d'upgrade: (.+) souhaite passer au plan (.+)\./);
            if (match) {
                const userEmail = match[1];
                const requestedPlan = match[2];

                const user = await prisma.user.findUnique({
                    where: { email: userEmail },
                    include: {
                        workerProfile: true,
                        establishmentProfile: true,
                        subscription: { include: { plan: true } }
                    }
                });

                if (user) {
                    requests.push({
                        id: notif.notification_id,
                        user: user.workerProfile
                            ? `${user.workerProfile.first_name} ${user.workerProfile.last_name}`
                            : user.establishmentProfile?.name || user.email,
                        email: user.email,
                        role: user.role,
                        currentPlan: user.subscription?.plan?.code || 'BASIC',
                        requestedPlan,
                        requestDate: notif.created_at.toLocaleDateString('fr-FR'),
                        status: notif.is_read ? 'processed' : 'pending'
                    });
                }
            }
        }

        res.json({ requests });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/subscriptions/upgrade/:id/approve
 * Approuver une demande d'upgrade
 */
router.post('/upgrade/:id/approve', authenticateToken, requireRole(['SUPER_ADMIN']), async (req, res, next) => {
    try {
        const { id } = req.params;

        const notification = await prisma.notification.findUnique({
            where: { notification_id: parseInt(id) }
        });

        if (!notification) {
            return res.status(404).json({ error: 'NotFound', message: 'Demande non trouvée' });
        }

        const match = notification.message.match(/Demande d'upgrade: (.+) souhaite passer au plan (.+)\./);
        if (!match) {
            return res.status(400).json({ error: 'InvalidRequest', message: 'Format invalide' });
        }

        const userEmail = match[1];
        const requestedPlan = match[2];

        const user = await prisma.user.findUnique({
            where: { email: userEmail },
            include: { subscription: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'UserNotFound', message: 'Utilisateur non trouvé' });
        }

        const plan = await prisma.subscriptionPlanConfig.findFirst({
            where: { name: requestedPlan }
        });

        if (!plan) {
            return res.status(404).json({ error: 'PlanNotFound', message: 'Plan non trouvé' });
        }

        // Mise à jour abonnement
        if (user.subscription) {
            await prisma.subscription.update({
                where: { user_id: user.user_id },
                data: {
                    plan_id: plan.plan_id,
                    status: 'ACTIVE',
                    start_date: new Date(),
                    end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                }
            });
        } else {
            await prisma.subscription.create({
                data: {
                    user_id: user.user_id,
                    plan_id: plan.plan_id,
                    status: 'ACTIVE',
                    start_date: new Date(),
                    end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                }
            });
        }

        // Marquer notification comme lue
        await prisma.notification.update({
            where: { notification_id: parseInt(id) },
            data: { is_read: true }
        });

        // Notifier l'utilisateur
        // Notifier l'utilisateur
        await createNotification({
            userId: user.user_id,
            type: 'SUCCESS',
            message: `Votre demande de passage au plan ${plan.name} a été approuvée !`,
            link: '/dashboard/subscription'
        });

        res.json({ success: true, message: `Upgrade approuvé pour ${user.email}` });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/subscriptions/upgrade/:id/reject
 * Refuser une demande d'upgrade
 */
router.post('/upgrade/:id/reject', authenticateToken, requireRole(['SUPER_ADMIN']), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const notification = await prisma.notification.findUnique({
            where: { notification_id: parseInt(id) }
        });

        if (!notification) {
            return res.status(404).json({ error: 'NotFound', message: 'Demande non trouvée' });
        }

        const match = notification.message.match(/Demande d'upgrade: (.+) souhaite passer au plan (.+)\./);
        if (!match) {
            return res.status(400).json({ error: 'InvalidRequest' });
        }

        const userEmail = match[1];
        const user = await prisma.user.findUnique({ where: { email: userEmail } });

        if (!user) {
            return res.status(404).json({ error: 'UserNotFound' });
        }

        // Marquer comme lue
        await prisma.notification.update({
            where: { notification_id: parseInt(id) },
            data: { is_read: true }
        });

        // Notifier le refus
        // Notifier le refus
        await createNotification({
            userId: user.user_id,
            type: 'WARNING',
            message: reason || 'Votre demande d\'upgrade a été refusée. Contactez-nous pour plus d\'informations.',
            link: '/dashboard/subscription'
        });

        res.json({ success: true, message: `Demande refusée pour ${user.email}` });
    } catch (error) {
        next(error);
    }
});

/**
 * Helper pour formater les prix en DH
 */
function formatPrice(centimes) {
    if (centimes === 0) return 'Gratuit';
    const dh = centimes / 100;
    return `${dh.toLocaleString('fr-MA')} DH`;
}

export default router;
