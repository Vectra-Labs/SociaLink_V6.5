import { useState, useEffect, useRef } from 'react';

/**
 * HowItWorksAnimated - Advanced animated section with scroll-triggered effects
 * Features:
 * - Intersection Observer for scroll-triggered animations
 * - Staggered step reveals with smooth transitions
 * - Animated progress line connecting steps
 * - Icon pulse animations
 * - Counter animation for step numbers
 */
export default function HowItWorksAnimated() {
    const sectionRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [lineProgress, setLineProgress] = useState(0);

    const steps = [
        {
            icon: 'person_add',
            title: 'Inscrivez-vous',
            description: 'Créez votre profil en quelques minutes. Travailleur ou établissement, choisissez votre rôle.',
            color: 'from-blue-500 to-primary'
        },
        {
            icon: 'verified_user',
            title: 'Vérification',
            description: 'Notre équipe valide vos documents et qualifications selon la loi 45-18.',
            color: 'from-primary to-indigo-500'
        },
        {
            icon: 'handshake',
            title: 'Collaborez',
            description: 'Trouvez des missions ou recrutez les meilleurs profils pour vos besoins.',
            color: 'from-indigo-500 to-purple-500'
        }
    ];

    // Intersection Observer for scroll-triggered animation
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isVisible) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.2 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, [isVisible]);

    // Staggered animation sequence
    useEffect(() => {
        if (!isVisible) return;

        const stepTimers = [];
        steps.forEach((_, index) => {
            stepTimers.push(
                setTimeout(() => {
                    setActiveStep(index + 1);
                    // Animate line progress
                    setLineProgress(((index + 1) / steps.length) * 100);
                }, 300 + index * 400)
            );
        });

        return () => stepTimers.forEach(timer => clearTimeout(timer));
    }, [isVisible]);

    return (
        <section
            id="comment-ca-marche"
            ref={sectionRef}
            className="w-full py-24 px-4 md:px-10 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 overflow-hidden"
        >
            <div className="max-w-7xl mx-auto">
                {/* Header with fade-in animation */}
                <div className={`text-center mb-20 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 border border-primary/20">
                        <span className="material-symbols-outlined text-lg animate-pulse">lightbulb</span>
                        Simple & Efficace
                    </span>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-5 tracking-tight">
                        Comment ça marche ?
                    </h2>
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Un processus simplifié pour connecter travailleurs sociaux et établissements en toute confiance.
                    </p>
                </div>

                {/* Steps Grid with animated connections */}
                <div className="relative">
                    {/* Animated Progress Line - Desktop */}
                    <div className="hidden md:block absolute top-20 left-[16.67%] right-[16.67%] h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary via-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${lineProgress}%` }}
                        />
                        {/* Glowing effect */}
                        <div
                            className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent via-white/50 to-transparent blur-sm transition-all duration-1000 ease-out"
                            style={{ left: `calc(${lineProgress}% - 16px)` }}
                        />
                    </div>

                    {/* Steps */}
                    <div className="grid md:grid-cols-3 gap-12 md:gap-8">
                        {steps.map((step, index) => (
                            <StepCard
                                key={index}
                                step={step}
                                index={index}
                                isActive={activeStep > index}
                                isAnimating={activeStep === index + 1}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

// Individual Step Card with advanced animations
function StepCard({ step, index, isActive, isAnimating }) {
    return (
        <div
            className={`relative text-center transition-all duration-700 ease-out ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
            style={{ transitionDelay: `${index * 150}ms` }}
        >
            {/* Animated Icon Container */}
            <div className="relative mx-auto mb-8">
                {/* Outer ring animation */}
                <div className={`absolute inset-0 size-20 mx-auto rounded-2xl bg-gradient-to-br ${step.color} opacity-20 blur-xl transition-all duration-500 ${isAnimating ? 'scale-150 opacity-40' : 'scale-100'}`} />

                {/* Pulse rings */}
                {isActive && (
                    <>
                        <div className="absolute inset-0 size-20 mx-auto rounded-2xl border-2 border-primary/30 animate-ping" style={{ animationDuration: '2s' }} />
                        <div className="absolute inset-0 size-20 mx-auto rounded-2xl border border-primary/20 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
                    </>
                )}

                {/* Main icon box */}
                <div className={`relative size-20 mx-auto rounded-2xl bg-gradient-to-br ${step.color} text-white flex items-center justify-center shadow-xl transition-all duration-500 ${isAnimating ? 'scale-110 shadow-2xl shadow-primary/40' : 'scale-100'} ${isActive ? 'rotate-0' : '-rotate-12'}`}>
                    <span className={`material-symbols-outlined text-3xl transition-transform duration-500 ${isAnimating ? 'scale-110' : ''}`}>
                        {step.icon}
                    </span>
                </div>

                {/* Step number badge */}
                <div className={`absolute -top-2 -right-2 size-8 rounded-full bg-white dark:bg-slate-900 shadow-lg border-2 border-primary flex items-center justify-center transition-all duration-300 ${isActive ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                    <span className="text-sm font-bold text-primary">{index + 1}</span>
                </div>
            </div>

            {/* Content with stagger */}
            <div className={`transition-all duration-500 delay-100 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-4">
                    {step.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
                    {step.description}
                </p>
            </div>

            {/* Mobile connector line */}
            {index < 2 && (
                <div className="md:hidden w-0.5 h-12 bg-gradient-to-b from-primary to-transparent mx-auto mt-8" />
            )}
        </div>
    );
}
