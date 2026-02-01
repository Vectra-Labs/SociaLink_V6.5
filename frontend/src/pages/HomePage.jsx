import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import HowItWorksPro from '../components/HowItWorksPro';
import MissionCard from '../components/MissionCard';
import useAuth from '../hooks/useAuth';
import api from '../api/client';

// Animated Counter Component
function AnimatedCounter({ target, suffix = '', duration = 2000 }) {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);

    // Parse target (handle "1,200" -> 1200)
    const numericTarget = typeof target === 'string'
        ? parseInt(target.replace(/,/g, '').replace('+', ''), 10)
        : target;

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isVisible) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [isVisible]);

    useEffect(() => {
        if (!isVisible) return;

        let startTime;
        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(easeOutQuart * numericTarget));

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [isVisible, numericTarget, duration]);

    // Format with commas
    const formatted = count.toLocaleString('fr-FR');

    return (
        <span ref={ref}>{formatted}{suffix}</span>
    );
}

export default function HomePage() {
    const { user } = useAuth();

    // Hero Stats - loaded from API
    const [heroStats, setHeroStats] = useState({
        experts: 1200,
        partenaires: 350,
        satisfaction: 98
    });

    // Fetch hero stats from backend
    useEffect(() => {
        const fetchHeroStats = async () => {
            try {
                const { data } = await api.get('/public/hero-stats');
                setHeroStats(data);
            } catch (error) {
                // Silent fallback to defaults
            }
        };
        fetchHeroStats();
    }, []);

    // Stats for trust section
    const stats = [
        { value: `${heroStats.experts}+`, label: 'Travailleurs Vérifiés' },
        { value: `${heroStats.partenaires}+`, label: 'Établissements Partenaires' },
        { value: '5,000+', label: 'Missions Réussies' },
        { value: '12', label: 'Régions Couvertes' }
    ];

    // Completed missions for public display (anonymized)
    const completedMissions = [
        {
            id: 101,
            category: 'Coordination',
            categoryColor: 'blue',
            title: 'Mission de Coordination Sociale - TERMINÉE',
            location: '████████',
            type: '███ ██ ████',
            establishment: '████████████',
            urgent: false,
            postedAt: 'Terminée le 15/12',
            isCompleted: true
        },
        {
            id: 102,
            category: 'Accompagnement',
            categoryColor: 'green',
            title: 'Accompagnement Familial Spécialisé - TERMINÉE',
            location: '████████',
            type: '███',
            establishment: '████████████',
            urgent: false,
            postedAt: 'Terminée le 10/12',
            isCompleted: true
        },
        {
            id: 103,
            category: 'Éducation',
            categoryColor: 'purple',
            title: 'Éducateur Spécialisé en Foyer - TERMINÉE',
            location: '████████',
            type: '███ █ ████',
            establishment: '████████████',
            urgent: false,
            postedAt: 'Terminée le 05/12',
            isCompleted: true
        }
    ];

    return (
        <div className="flex flex-col w-full">
            {/* Hero Section - Visual Upgrade */}
            <section className="relative w-full min-h-[90vh] flex items-center overflow-hidden bg-slate-900">
                {/* Background Image with Transparency */}
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-15"
                    style={{ backgroundImage: "url('/hero-bg.png')" }}
                ></div>

                {/* Background Effects */}
                <div className="absolute inset-0 z-[1]">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 animate-pulse-soft"></div>
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4"></div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 md:px-10 py-20 z-10 w-full">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Text Content */}
                        <div className="text-white space-y-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-sm font-medium shadow-lg shadow-black/5 ring-1 ring-white/10 group cursor-default hover:bg-white/10 transition-colors">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                </span>
                                <span className="tracking-wide text-slate-200">Plateforme Sociale #1 au Maroc</span>
                            </div>

                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-extrabold leading-[1.1] tracking-tight">
                                Le réseau des{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400 animate-text-shimmer bg-[length:200%_auto]">
                                    travailleurs sociaux
                                </span>{' '}
                                engagés
                            </h1>

                            <p className="text-lg md:text-xl text-slate-300 max-w-lg leading-relaxed font-light">
                                Connectez-vous avec les structures d'excellence. Missions sécurisées, profils vérifiés, impact réel.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                {user ? (
                                    <Link
                                        to={user.role === 'WORKER' ? '/worker/dashboard' : '/establishment/dashboard'}
                                        className="flex items-center justify-center gap-3 h-14 px-8 rounded-full bg-blue-600 !text-white text-base font-bold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 hover:-translate-y-1 transition-all group"
                                    >
                                        <span className="material-symbols-outlined">dashboard</span>
                                        Mon Tableau de Bord
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            to="/register/worker"
                                            className="flex items-center justify-center gap-3 h-14 px-8 rounded-full bg-blue-600 !text-white text-base font-bold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 hover:-translate-y-1 transition-all group"
                                        >
                                            <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">person_add</span>
                                            Je suis Travailleur
                                        </Link>
                                        <Link
                                            to="/register/establishment"
                                            className="flex items-center justify-center gap-3 h-14 px-8 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-white text-base font-bold hover:bg-white/10 hover:border-white/20 transition-all group"
                                        >
                                            <span className="material-symbols-outlined text-slate-300 group-hover:text-white transition-colors">business</span>
                                            Je suis Établissement
                                        </Link>
                                    </>
                                )}
                            </div>

                            {/* Trust Metrics - Animated */}
                            <div className="flex flex-wrap gap-8 pt-8 border-t border-white/10">
                                <div>
                                    <p className="text-3xl font-display font-bold text-white">
                                        <AnimatedCounter target={heroStats.experts} suffix="+" />
                                    </p>
                                    <p className="text-sm text-slate-400 font-medium">Experts Vérifiés</p>
                                </div>
                                <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
                                <div>
                                    <p className="text-3xl font-display font-bold text-white">
                                        <AnimatedCounter target={heroStats.partenaires} suffix="+" />
                                    </p>
                                    <p className="text-sm text-slate-400 font-medium">Partenaires</p>
                                </div>
                                <div className="w-px h-12 bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
                                <div>
                                    <p className="text-3xl font-display font-bold text-white">
                                        <AnimatedCounter target={heroStats.satisfaction} suffix="%" />
                                    </p>
                                    <p className="text-sm text-slate-400 font-medium">Satisfaction</p>
                                </div>
                            </div>
                        </div>

                        {/* Visual Composition */}
                        <div className="hidden lg:block relative perspective-1000">
                            {/* Decorative Elements */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-transparent rounded-full blur-3xl transform rotate-6"></div>

                            <div className="relative transform transition-transform hover:scale-[1.02] duration-500">
                                {/* Floating Profile Card */}
                                <div className="absolute -top-12 -left-8 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-5 animate-float z-20 max-w-[200px] border border-white/40 ring-1 ring-black/5">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="size-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                                            <span className="material-symbols-outlined text-xl">verified</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">Profil Validé</p>
                                            <p className="text-xs text-slate-500">Dossier complet</p>
                                        </div>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full w-full bg-emerald-500 rounded-full"></div>
                                    </div>
                                </div>

                                {/* Floating Success Card */}
                                <div className="absolute -bottom-8 -right-4 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-5 animate-float-delayed z-20 border border-white/40 ring-1 ring-black/5">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
                                            <span className="material-symbols-outlined">work</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-base">Nouvelle Mission</p>
                                            <p className="text-xs text-slate-500 font-medium">+ 12 aujourd'hui</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Glass Card */}
                                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-[20px] rounded-[2.5rem] border border-white/20 p-8 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                    <div className="space-y-6 relative">
                                        {/* Mock List Items */}
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                                <div className={`size-12 rounded-full bg-gradient-to-br ${i === 1 ? 'from-pink-500 to-rose-500' : i === 2 ? 'from-cyan-500 to-blue-500' : 'from-amber-400 to-orange-500'} flex items-center justify-center text-white font-bold ring-2 ring-white/10`}>
                                                    {['S', 'K', 'M'][i - 1]}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="h-3 w-32 bg-white/20 rounded-full"></div>
                                                    <div className="h-2 w-20 bg-white/10 rounded-full mt-2.5"></div>
                                                </div>
                                                <div className="p-2 rounded-full bg-emerald-500/20 text-emerald-400">
                                                    <span className="material-symbols-outlined text-lg">check</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Badges */}
            <section className="w-full py-8 px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 text-slate-400">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-600">account_balance</span>
                            <span className="text-sm font-medium">Conforme Loi 45-18</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-600">verified_user</span>
                            <span className="text-sm font-medium">Profils Vérifiés</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-600">lock</span>
                            <span className="text-sm font-medium">Données Sécurisées</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-600">support_agent</span>
                            <span className="text-sm font-medium">Support Dédié</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works - Pro Version */}
            <HowItWorksPro />

            {/* For Who - Two Cards */}
            <section id="pour-qui" className="w-full py-20 px-4 md:px-10 bg-white dark:bg-slate-900">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                            Une plateforme pour tous
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400">
                            Que vous soyez travailleur social ou gestionnaire d'établissement
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Workers Card */}
                        <div className="group relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 p-8 md:p-10 text-white">
                            <div className="absolute inset-0 z-0">
                                <img
                                    src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1000&auto=format&fit=crop"
                                    alt="Social Worker"
                                    className="w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity duration-500 mix-blend-overlay"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent"></div>
                            </div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                            <div className="relative">
                                <div className="size-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
                                    <span className="material-symbols-outlined text-2xl">badge</span>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                                    Travailleurs Sociaux
                                </h3>
                                <p className="text-white/80 text-lg mb-6 leading-relaxed">
                                    Accédez à des missions vérifiées dans tout le Maroc. Développez votre carrière avec des établissements de confiance.
                                </p>
                                <ul className="space-y-3 mb-8">
                                    <li className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-emerald-300">check_circle</span>
                                        Missions adaptées à votre profil
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-emerald-300">check_circle</span>
                                        Établissements vérifiés
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-emerald-300">check_circle</span>
                                        CV vérifié téléchargeable
                                    </li>
                                </ul>
                                <Link
                                    to="/register/worker"
                                    className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-white text-blue-600 font-bold hover:shadow-lg transition-all"
                                >
                                    Je suis travailleur
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </Link>
                            </div>
                        </div>

                        {/* Establishments Card */}
                        <div className="group relative rounded-3xl overflow-hidden bg-slate-900 p-8 md:p-10 text-white">
                            <div className="absolute inset-0 z-0">
                                <img
                                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop"
                                    alt="Modern Office"
                                    className="w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity duration-500 mix-blend-overlay"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            </div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                            <div className="relative">
                                <div className="size-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-6">
                                    <span className="material-symbols-outlined text-2xl">business</span>
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                                    Établissements
                                </h3>
                                <p className="text-slate-400 text-lg mb-6 leading-relaxed">
                                    Recrutez des travailleurs sociaux qualifiés et vérifiés. Gérez vos missions en toute simplicité.
                                </p>
                                <ul className="space-y-3 mb-8 text-slate-300">
                                    <li className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-blue-400">check_circle</span>
                                        Candidats pré-validés
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-blue-400">check_circle</span>
                                        Gestion des missions simplifiée
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-blue-400">check_circle</span>
                                        Tableau de bord complet
                                    </li>
                                </ul>
                                <Link
                                    to="/register/establishment"
                                    className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-blue-600 !text-white font-bold hover:bg-blue-700 transition-all"
                                >
                                    Je suis établissement
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Completed Missions - Public View */}
            <section className="w-full py-20 px-4 md:px-10 bg-slate-50 dark:bg-slate-950">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-medium mb-3">
                                <span className="material-symbols-outlined text-lg">history</span>
                                Historique
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                                Missions Terminées
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400">
                                Aperçu des missions passées sur la plateforme (détails masqués)
                            </p>
                        </div>
                        {user ? (
                            <Link
                                to={user.role === 'WORKER' ? '/worker/missions' : '/establishment/dashboard'}
                                className="flex items-center gap-2 bg-blue-600 !text-white font-bold px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <span className="material-symbols-outlined">visibility</span>
                                Voir toutes les missions
                            </Link>
                        ) : (
                            <Link
                                to="/register/worker"
                                className="flex items-center gap-2 bg-blue-600 !text-white font-bold px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <span className="material-symbols-outlined">lock_open</span>
                                S'inscrire pour voir les nouvelles missions
                            </Link>
                        )}
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {completedMissions.map((mission) => (
                            <MissionCard
                                key={mission.id}
                                mission={mission}
                                isLocked={!user}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="w-full py-20 px-4 md:px-10 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}></div>
                </div>

                <div className="max-w-4xl mx-auto text-center relative">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                        {user ? 'Développez votre réseau' : 'Prêt à rejoindre le réseau ?'}
                    </h2>
                    <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                        {user
                            ? "Explorez les opportunités disponibles aujourd'hui."
                            : "Inscrivez-vous gratuitement et commencez à explorer les opportunités dès aujourd'hui."
                        }
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {user ? (
                            <Link
                                to={user.role === 'WORKER' ? '/worker/dashboard' : '/establishment/dashboard'}
                                className="flex items-center justify-center gap-2 h-14 px-8 rounded-xl bg-white text-blue-600 text-lg font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                            >
                                <span className="material-symbols-outlined">dashboard</span>
                                Accéder à mon espace
                            </Link>
                        ) : (
                            <Link
                                to="/register/worker"
                                className="flex items-center justify-center gap-2 h-14 px-8 rounded-xl bg-white text-blue-600 text-lg font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                            >
                                <span className="material-symbols-outlined">rocket_launch</span>
                                Commencer maintenant
                            </Link>
                        )}
                        <Link
                            to="/contact"
                            className="flex items-center justify-center gap-2 h-14 px-8 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 !text-white text-lg font-bold hover:bg-white/20 transition-all"
                        >
                            <span className="material-symbols-outlined">mail</span>
                            Nous contacter
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
