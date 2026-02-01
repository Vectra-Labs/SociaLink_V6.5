import Stripe from 'stripe';
import { prisma } from '../config/db.js';
import { createNotification } from './notificationService.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create a Stripe Checkout Session for subscription upgrade
 */
export const createCheckoutSession = async (userId, planCode) => {
    // Get user and plan details
    const user = await prisma.user.findUnique({
        where: { user_id: userId },
        include: {
            workerProfile: true,
            establishmentProfile: true
        }
    });

    if (!user) {
        throw new Error('Utilisateur non trouvé');
    }

    const plan = await prisma.subscriptionPlanConfig.findFirst({
        where: { code: planCode, is_active: true }
    });

    if (!plan) {
        throw new Error('Plan non trouvé');
    }

    // Determine price in centimes (MAD)
    const amount = plan.price_monthly;
    const planName = plan.name;

    // Get customer name for Stripe
    const customerName = user.workerProfile
        ? `${user.workerProfile.first_name} ${user.workerProfile.last_name}`.trim()
        : user.establishmentProfile?.name || user.email;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment', // one-time payment for simplicity
        customer_email: user.email,
        line_items: [
            {
                price_data: {
                    currency: 'mad',
                    product_data: {
                        name: `SociaLink ${planName}`,
                        description: `Abonnement ${planName} - 1 mois`,
                        images: ['https://socialink.ma/logo.png'] // Optional
                    },
                    unit_amount: amount // Already in centimes
                },
                quantity: 1
            }
        ],
        metadata: {
            user_id: userId.toString(),
            plan_code: planCode,
            plan_id: plan.plan_id.toString()
        },
        success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
        locale: 'fr'
    });

    return {
        sessionId: session.id,
        url: session.url
    };
};

/**
 * Handle Stripe Webhook for payment completion
 */
export const handleWebhook = async (payload, signature) => {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    if (endpointSecret) {
        try {
            event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
        } catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            throw new Error('Invalid signature');
        }
    } else {
        // For testing without webhook secret
        event = JSON.parse(payload);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            await handleSuccessfulPayment(session);
            break;
        case 'payment_intent.succeeded':
            console.log('PaymentIntent succeeded');
            break;
        case 'customer.subscription.updated':
            await handleSubscriptionUpdated(event.data.object);
            break;
        case 'customer.subscription.deleted':
            await handleSubscriptionDeleted(event.data.object);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return { received: true };
};

/**
 * Process successful payment and activate subscription
 */
const handleSuccessfulPayment = async (session) => {
    const { user_id, plan_code, plan_id } = session.metadata;

    console.log(`Processing payment for user ${user_id}, plan ${plan_code}`);

    const userId = parseInt(user_id);
    const planId = parseInt(plan_id);

    // Check if subscription exists
    const existingSubscription = await prisma.subscription.findUnique({
        where: { user_id: userId }
    });

    const subscriptionData = {
        plan_id: planId,
        status: 'ACTIVE',
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        stripe_payment_id: session.payment_intent,
        stripe_session_id: session.id
    };

    let currentSubscriptionId;

    if (existingSubscription) {
        const updatedSubscription = await prisma.subscription.update({
            where: { user_id: userId },
            data: subscriptionData
        });
        currentSubscriptionId = updatedSubscription.subscription_id;
    } else {
        const newSubscription = await prisma.subscription.create({
            data: {
                user_id: userId,
                ...subscriptionData
            }
        });
        currentSubscriptionId = newSubscription.subscription_id;
    }

    // Create Payment Record (for history/stats)
    await prisma.payment.create({
        data: {
            user_id: userId,
            subscription_id: currentSubscriptionId,
            amount: Number(session.amount_total), // in cents
            currency: session.currency || 'mad',
            status: 'COMPLETED',
            type: 'SUBSCRIPTION',
            provider: 'stripe',
            transaction_id: session.payment_intent || session.id
        }
    });

    // Create success notification
    await createNotification({
        userId: userId,
        type: 'SUCCESS',
        message: `Votre paiement a été accepté ! Votre abonnement ${plan_code} est maintenant actif.`,
        link: '/dashboard/subscription'
    });

    console.log(`Subscription activated for user ${userId}`);
    console.log(`Subscription activated for user ${userId}`);
};

/**
 * Handle Subscription Updated (Renewals, Cancellations, Plan Changes)
 */
const handleSubscriptionUpdated = async (subscription) => {
    try {
        const user = await prisma.user.findFirst({
            where: { email: subscription.customer_email || undefined } // Adjust if you map Stripe Customer ID
        });

        // If we store stripe_customer_id in User, better to search by that.
        // Assuming we rely on email or existing subscription link

        // Find subscription by stripe_id if possible
        const existingSub = await prisma.subscription.findFirst({
            where: { stripe_session_id: subscription.id } // This might be wrong, subscription.id is sub_...
        });

        // Better strategy: Find user by email if we don't store stripe_customer_id
        // But we actually store stripe_session_id in subscription. 
        // Real implementations should store stripe_subscription_id.
        // For now, let's try to find by user ID if metadata exists

        const userId = parseInt(subscription.metadata?.user_id);

        if (userId) {
            const status = subscription.status === 'active' ? 'ACTIVE' : 'EXPIRED';
            const endDate = new Date(subscription.current_period_end * 1000);

            await prisma.subscription.update({
                where: { user_id: userId },
                data: {
                    status: status,
                    end_date: endDate
                }
            });
            console.log(`Subscription updated for user ${userId}`);
        }
    } catch (err) {
        console.error('Error handling subscription update:', err);
    }
};

/**
 * Handle Subscription Deleted (Cancellations)
 */
const handleSubscriptionDeleted = async (subscription) => {
    try {
        const userId = parseInt(subscription.metadata?.user_id);

        if (userId) {
            await prisma.subscription.update({
                where: { user_id: userId },
                data: {
                    status: 'CANCELED',
                    end_date: new Date() // End immediately
                }
            });

            await createNotification({
                userId: userId,
                type: 'WARNING',
                message: 'Votre abonnement a été annulé.',
                link: '/pricing'
            });

            console.log(`Subscription canceled for user ${userId}`);
        }
    } catch (err) {
        console.error('Error handling subscription delete:', err);
    }
};

/**
 * Verify a checkout session status
 */
export const verifySession = async (sessionId) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        return {
            status: session.payment_status,
            customerEmail: session.customer_email,
            amountTotal: session.amount_total,
            currency: session.currency,
            metadata: session.metadata
        };
    } catch (error) {
        console.error('Error verifying session:', error);
        throw new Error('Session non trouvée');
    }
};

/**
 * Manually activate subscription (for testing or manual override)
 */
export const activateSubscription = async (userId, planCode) => {
    const plan = await prisma.subscriptionPlanConfig.findFirst({
        where: { code: planCode }
    });

    if (!plan) {
        throw new Error('Plan non trouvé');
    }

    const existingSubscription = await prisma.subscription.findUnique({
        where: { user_id: userId }
    });

    const data = {
        plan_id: plan.plan_id,
        status: 'ACTIVE',
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };

    if (existingSubscription) {
        return prisma.subscription.update({
            where: { user_id: userId },
            data
        });
    } else {
        return prisma.subscription.create({
            data: { user_id: userId, ...data }
        });
    }
};

export default {
    createCheckoutSession,
    handleWebhook,
    verifySession,
    activateSubscription
};
