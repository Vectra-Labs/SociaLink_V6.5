import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Check, Crown, Zap, Shield, Star, Loader2,
    Briefcase, Users, Eye, MessageSquare, Clock
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../context/SubscriptionContext';
import api from '../api/client';

const PricingPage = () => {
    const { user } = useAuth();
    const { planCode: currentPlan } = useSubscription();
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState(null);

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            const { data } = await api.get('/subscriptions/plans');
            setPlans(data.plans || []);
        } catch (error) {
            console.error('Failed to load plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckout = async (planCode) => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (planCode === 'BASIC') {
            return; // Free plan, no checkout needed
        }

        setCheckoutLoading(planCode);

        try {
            const { data } = await api.post('/payments/create-checkout', { planCode });

            if (data.url) {
                // Redirect to Stripe Checkout
                window.location.href = data.url;
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert(error.response?.data?.message || 'Erreur lors de la création du paiement');
        } finally {
            setCheckoutLoading(null);
        }
    };

    const getPlanIcon = (code) => {
        switch (code) {
            case 'PREMIUM': return Zap;
            default: return Shield;
        }
    };

    const getPlanColor = (code) => {
        switch (code) {
            case 'PREMIUM': return { bg: 'bg-gradient-to-br from-purple-500 to-indigo-500', text: 'text-purple-600', light: 'bg-purple-50' };
            default: return { bg: 'bg-gradient-to-br from-slate-500 to-slate-600', text: 'text-slate-600', light: 'bg-slate-50' };
        }
    };

    const workerFeatures = {
        BASIC: [
            'Accès aux missions (délai 48h)',
            '3 candidatures actives max',
            'Profil basique',
            'Support email'
        ],
        PREMIUM: [
            'Accès immédiat à toutes les missions',
            'Candidatures illimitées',
            'Badge vérifié visible',
            'Missions urgentes visibles',
            'Profil en avant (IA matching)',
            'Statistiques avancées',
            'Support prioritaire 24/7'
        ]
    };

    const establishmentFeatures = {
        BASIC: [
            '1 mission active',
            'Aperçu limité des candidats',
            '3 contacts / mois',
            'Support email'
        ],
        PREMIUM: [
            'Missions illimitées',
            'Profils complets des candidats',
            'Contacts illimités',
            'Filtres de recherche avancés',
            'Badge "Recruteur vérifié"',
            'Support prioritaire 24/7'
        ]
    };

    const getFeatures = (code) => {
        const featureSet = user?.role === 'ESTABLISHMENT' ? establishmentFeatures : workerFeatures;
        return featureSet[code] || [];
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">
                        Choisissez votre formule
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        {user?.role === 'ESTABLISHMENT'
                            ? 'Recrutez les meilleurs talents du secteur médico-social'
                            : 'Accédez aux meilleures opportunités de missions'}
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {plans.filter(p => p.code !== 'PRO' && (p.target_role === user?.role || p.target_role === 'WORKER' || !user)).map(plan => {
                        const Icon = getPlanIcon(plan.code);
                        const colors = getPlanColor(plan.code);
                        const isCurrentPlan = currentPlan === plan.code;
                        const isPopular = plan.code === 'PREMIUM';

                        return (
                            <div
                                key={plan.plan_id}
                                className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all hover:shadow-xl ${isCurrentPlan ? 'border-emerald-500' : isPopular ? 'border-purple-300' : 'border-slate-100'
                                    }`}
                            >
                                {/* Popular Badge */}
                                {isPopular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <span className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                                            Populaire
                                        </span>
                                    </div>
                                )}

                                {/* Current Plan Badge */}
                                {isCurrentPlan && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <span className="bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                                            Votre plan actuel
                                        </span>
                                    </div>
                                )}

                                <div className="p-8">
                                    {/* Plan Header */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center text-white`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                                            <p className="text-sm text-slate-500">
                                                {plan.code === 'BASIC' ? 'Gratuit' : 'Mensuel'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="mb-6">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-bold text-slate-900">
                                                {plan.price_monthly === 0 ? 'Gratuit' : `${plan.price_monthly / 100}`}
                                            </span>
                                            {plan.price_monthly > 0 && (
                                                <span className="text-slate-500">DH/mois</span>
                                            )}
                                        </div>
                                        {plan.price_yearly && (
                                            <p className="text-sm text-emerald-600 mt-1">
                                                ou {plan.price_yearly / 100} DH/an (économisez 2 mois)
                                            </p>
                                        )}
                                    </div>

                                    {/* Features */}
                                    <ul className="space-y-3 mb-8">
                                        {getFeatures(plan.code).map((feature, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <Check className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`} />
                                                <span className="text-slate-600">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA Button */}
                                    <button
                                        onClick={() => handleCheckout(plan.code)}
                                        disabled={isCurrentPlan || checkoutLoading === plan.code}
                                        className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${isCurrentPlan
                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                            : plan.code === 'BASIC'
                                                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                : `${colors.bg} text-white hover:opacity-90 shadow-lg`
                                            }`}
                                    >
                                        {checkoutLoading === plan.code ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Chargement...
                                            </>
                                        ) : isCurrentPlan ? (
                                            'Plan actuel'
                                        ) : plan.code === 'BASIC' ? (
                                            'Commencer gratuitement'
                                        ) : (
                                            <>
                                                <Crown className="w-5 h-5" />
                                                Passer à {plan.name}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Trust Badges */}
                <div className="mt-16 text-center">
                    <p className="text-slate-500 mb-6">Paiement sécurisé par</p>
                    <div className="flex items-center justify-center gap-8 text-slate-400">
                        <div className="flex items-center gap-2">
                            <Shield className="w-6 h-6" />
                            <span className="font-medium">Stripe</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-6 h-6" />
                            <span>SSL 256-bit</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Star className="w-6 h-6" />
                            <span>Satisfait ou remboursé 14j</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;
