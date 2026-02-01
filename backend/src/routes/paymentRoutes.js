import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import stripeService from '../services/stripeService.js';

const router = express.Router();

/**
 * POST /api/payments/create-checkout
 * Create a Stripe Checkout session for subscription
 */
router.post('/create-checkout', authenticateToken, async (req, res) => {
    try {
        const { planCode } = req.body;
        const userId = req.user.user_id;

        if (!planCode) {
            return res.status(400).json({
                error: 'MissingPlan',
                message: 'Veuillez sélectionner un plan'
            });
        }

        const session = await stripeService.createCheckoutSession(userId, planCode);

        res.json({
            success: true,
            sessionId: session.sessionId,
            url: session.url
        });
    } catch (error) {
        console.error('CREATE CHECKOUT ERROR:', error);
        res.status(500).json({
            error: 'CheckoutError',
            message: error.message || 'Erreur lors de la création du paiement'
        });
    }
});

/**
 * POST /api/payments/webhook
 * Stripe Webhook endpoint
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const signature = req.headers['stripe-signature'];
        await stripeService.handleWebhook(req.body, signature);
        res.json({ received: true });
    } catch (error) {
        console.error('WEBHOOK ERROR:', error);
        res.status(400).json({ error: error.message });
    }
});

/**
 * GET /api/payments/verify/:sessionId
 * Verify a checkout session status
 */
router.get('/verify/:sessionId', authenticateToken, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await stripeService.verifySession(sessionId);

        // If payment successful, activate subscription
        if (session.status === 'paid' && session.metadata?.plan_code) {
            await stripeService.activateSubscription(
                parseInt(session.metadata.user_id),
                session.metadata.plan_code
            );
        }

        res.json({
            success: session.status === 'paid',
            status: session.status,
            planCode: session.metadata?.plan_code
        });
    } catch (error) {
        console.error('VERIFY SESSION ERROR:', error);
        res.status(500).json({
            error: 'VerifyError',
            message: error.message
        });
    }
});

/**
 * GET /api/payments/config
 * Get Stripe publishable key for frontend
 */
router.get('/config', (req, res) => {
    res.json({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
});

export default router;
