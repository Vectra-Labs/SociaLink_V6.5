import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/client';
import { Link } from 'react-router-dom';
import {
    Crown, Check, X, Zap, Star, Shield, TrendingUp,
    Clock, Eye, Briefcase, MessageSquare, Award,
    CreditCard, ArrowRight, Loader2, CheckCircle, AlertCircle
} from 'lucide-react';

export default function WorkerSubscription() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [processingPlan, setProcessingPlan] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statsRes] = await Promise.all([
                api.get('/worker/stats')
            ]);
            setStats(statsRes.data.data);
            // Extract subscription info from stats
            setSubscription({
                tier: statsRes.data.data.subscriptionTier || 'BASIC',
                isActive: statsRes.data.data.isSubscribed,
                endDate: statsRes.data.data.subscriptionEndDate
            });
        } catch (error) {
            console.error('Failed to load subscription data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async (planCode) => {
        setProcessingPlan(planCode);
        try {
            const response = await api.post('/payments/create-checkout', {
                plan_code: planCode
            });
            if (response.data.url) {
                window.location.href = response.data.url;
            }
        } catch (error) {
            console.error('Subscription error:', error);
            alert('Erreur lors de la création du paiement');
        } finally {
            setProcessingPlan(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const isPremium = subscription?.tier === 'PREMIUM' || subscription?.tier === 'PRO';
    const isBasic = !isPremium;

    const plans = [
        {
            code: 'BASIC',
            name: 'Gratuit',
            price: 0,
            period: '/mois',
            description: 'Idéal pour commencer',
            isCurrent: isBasic,
            features: [
                { text: '3 candidatures actives max', included: true },
                { text: '4 missions visibles', included: true },
                { text: 'Profil basique', included: true },
                { text: 'Missions urgentes', included: false },
                { text: 'Candidatures illimitées', included: false },
                { text: 'Mise en avant du profil', included: false },
                { text: 'Badge Premium', included: false },
            ],
            color: 'slate',
            popular: false
        },
        {
            code: 'PREMIUM',
            name: 'Premium',
            price: 149,
            period: '/mois',
            description: 'Pour les professionnels',
            isCurrent: isPremium,
            features: [
                { text: 'Candidatures illimitées', included: true },
                { text: 'Toutes les missions visibles', included: true },
                { text: 'Accès missions urgentes', included: true },
                { text: 'Profil mis en avant', included: true },
                { text: 'Badge Premium vérifié', included: true },
                { text: 'Support prioritaire', included: true },
                { text: 'Statistiques avancées', included: true },
            ],
            color: 'blue',
            popular: true
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 pb-10">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-16 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
                        <Crown className="w-5 h-5 text-amber-400" />
                        <span className="text-sm font-medium">Plans & Abonnements</span>
                    </div>
                    <h1 className="text-4xl font-bold mb-4">
                        Boostez votre carrière avec Premium
                    </h1>
                    <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                        Accédez à plus de missions, candidatez sans limites et soyez mis en avant auprès des recruteurs.
                    </p>
                </div>
            </div>

            {/* Current Status Banner */}
            {isPremium && (
                <div className="max-w-4xl mx-auto px-6 -mt-6">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                    <Crown className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-lg">Vous êtes Premium ! 🎉</p>
                                    <p className="text-amber-100 text-sm">
                                        Votre abonnement est actif
                                        {subscription?.endDate && ` jusqu'au ${new Date(subscription.endDate).toLocaleDateString('fr-FR')}`}
                                    </p>
                                </div>
                            </div>
                            <Link
                                to="/worker/settings"
                                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                            >
                                Gérer l'abonnement
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats comparison (for non-premium) */}
            {isBasic && stats && (
                <div className="max-w-4xl mx-auto px-6 -mt-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            Votre utilisation actuelle
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-slate-50 rounded-xl">
                                <p className="text-2xl font-bold text-slate-900">{stats.activeApplications || 0}</p>
                                <p className="text-xs text-slate-500">/ {stats.maxActiveApplications || 3} candidatures</p>
                            </div>
                            <div className="text-center p-4 bg-slate-50 rounded-xl">
                                <p className="text-2xl font-bold text-slate-900">{stats.maxVisibleMissions || 4}</p>
                                <p className="text-xs text-slate-500">missions visibles</p>
                            </div>
                            <div className="text-center p-4 bg-slate-50 rounded-xl">
                                <p className="text-2xl font-bold text-slate-900">{stats.profileViews || 0}</p>
                                <p className="text-xs text-slate-500">vues du profil</p>
                            </div>
                            <div className="text-center p-4 bg-slate-50 rounded-xl">
                                <p className="text-2xl font-bold text-amber-600">{stats.applicationsRemaining || 0}</p>
                                <p className="text-xs text-slate-500">candidatures restantes</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Plans Grid */}
            <div className="max-w-4xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {plans.map((plan) => (
                        <div
                            key={plan.code}
                            className={`relative bg-white rounded-2xl border-2 p-8 transition-all hover:shadow-xl ${plan.popular
                                    ? 'border-blue-500 shadow-lg shadow-blue-100'
                                    : 'border-slate-200'
                                } ${plan.isCurrent ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}
                        >
                            {/* Popular Badge */}
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <span className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-full shadow-lg">
                                        ⭐ POPULAIRE
                                    </span>
                                </div>
                            )}

                            {/* Current Badge */}
                            {plan.isCurrent && (
                                <div className="absolute -top-4 right-4">
                                    <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" />
                                        ACTUEL
                                    </span>
                                </div>
                            )}

                            {/* Plan Header */}
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                                <p className="text-slate-500 text-sm mb-4">{plan.description}</p>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                                    <span className="text-slate-500">DH{plan.period}</span>
                                </div>
                            </div>

                            {/* Features */}
                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-3">
                                        {feature.included ? (
                                            <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                        ) : (
                                            <X className="w-5 h-5 text-slate-300 flex-shrink-0" />
                                        )}
                                        <span className={feature.included ? 'text-slate-700' : 'text-slate-400'}>
                                            {feature.text}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            {/* CTA Button */}
                            {plan.code === 'BASIC' ? (
                                <button
                                    disabled
                                    className="w-full py-3 bg-slate-100 text-slate-500 font-medium rounded-xl cursor-not-allowed"
                                >
                                    {plan.isCurrent ? 'Plan actuel' : 'Gratuit'}
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleSubscribe(plan.code)}
                                    disabled={plan.isCurrent || processingPlan === plan.code}
                                    className={`w-full py-3 font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${plan.isCurrent
                                            ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200'
                                        }`}
                                >
                                    {processingPlan === plan.code ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Traitement...
                                        </>
                                    ) : plan.isCurrent ? (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            Abonnement actif
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="w-5 h-5" />
                                            S'abonner maintenant
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Benefits Section */}
            <div className="max-w-4xl mx-auto px-6 py-10">
                <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">
                    Pourquoi passer Premium ?
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            icon: Briefcase,
                            title: 'Plus de missions',
                            description: 'Accédez à toutes les missions, y compris les urgentes et récentes.'
                        },
                        {
                            icon: Eye,
                            title: 'Visibilité accrue',
                            description: 'Votre profil apparaît en priorité auprès des recruteurs.'
                        },
                        {
                            icon: Shield,
                            title: 'Badge vérifié',
                            description: 'Affichez votre badge Premium pour inspirer confiance.'
                        }
                    ].map((benefit, idx) => (
                        <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 text-center hover:shadow-lg transition-all">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <benefit.icon className="w-7 h-7 text-blue-600" />
                            </div>
                            <h3 className="font-bold text-slate-900 mb-2">{benefit.title}</h3>
                            <p className="text-slate-500 text-sm">{benefit.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* FAQ Section */}
            <div className="max-w-4xl mx-auto px-6 py-10">
                <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">
                    Questions fréquentes
                </h2>
                <div className="space-y-4">
                    {[
                        {
                            q: 'Puis-je annuler à tout moment ?',
                            a: 'Oui, vous pouvez annuler votre abonnement à tout moment depuis vos paramètres. Vous conserverez l\'accès Premium jusqu\'à la fin de la période payée.'
                        },
                        {
                            q: 'Comment fonctionne le paiement ?',
                            a: 'Le paiement est sécurisé via Stripe. Vous pouvez payer par carte bancaire. Le renouvellement est automatique chaque mois.'
                        },
                        {
                            q: 'Que se passe-t-il si je repasse au gratuit ?',
                            a: 'Vos candidatures actives restent, mais vous ne pourrez plus en créer de nouvelles au-delà de la limite gratuite (3).'
                        }
                    ].map((faq, idx) => (
                        <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5">
                            <h4 className="font-bold text-slate-900 mb-2">{faq.q}</h4>
                            <p className="text-slate-600 text-sm">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
