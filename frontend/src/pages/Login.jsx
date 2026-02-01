import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Building2, ArrowRight, Loader2 } from 'lucide-react';
import api from '../api/client';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    // Carousel state
    const [currentSlide, setCurrentSlide] = useState(0);

    // Hero stats from API
    const [heroStats, setHeroStats] = useState({
        experts: 850,
        partenaires: 440,
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

    const slides = [
        {
            icon: "handshake",
            title: "Le réseau de confiance",
            subtitle: "du social",
            description: "Connectez-vous avec les meilleurs établissements et trouvez des missions adaptées à votre expertise.",
            highlight: `${heroStats.experts}+`,
            highlightLabel: "Professionnels actifs",
            image: "/slide-network.png"
        },
        {
            icon: "target",
            title: "Des missions adaptées",
            subtitle: "à votre profil",
            description: "Algorithme intelligent de matching pour des opportunités correspondant à vos compétences.",
            highlight: `${heroStats.satisfaction}%`,
            highlightLabel: "Taux de satisfaction",
            image: "/slide-missions.png"
        },
        {
            icon: "shield_check",
            title: "Sécurisé & Conforme",
            subtitle: "Loi 45-18",
            description: "Plateforme 100% conforme à la réglementation marocaine avec vérification complète.",
            highlight: "100%",
            highlightLabel: "Profils vérifiés",
            image: "/slide-security.png"
        }
    ];

    // Auto-rotate carousel
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Email ou mot de passe incorrect');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
            {/* Left Side - Form (Compact) */}
            <div className="w-full lg:w-2/5 flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-12">
                {/* Logo Only - No Navbar */}
                <Link to="/" className="flex items-center gap-2 mb-12 group">
                    <img
                        src="/logo.png"
                        alt="SociaLink"
                        className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="text-xl font-bold text-slate-800">SociaLink</span>
                </Link>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
                    {/* Title */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-slate-900 mb-1">Connexion</h1>
                        <p className="text-slate-500 text-sm">
                            Accédez à votre espace professionnel.
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Email
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="vous@exemple.com"
                                    required
                                    className="w-full px-4 py-3 pl-11 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                                />
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-sm font-medium text-slate-700">
                                    Mot de passe
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Oublié ?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full px-4 py-3 pl-11 pr-11 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
                                />
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Connexion...
                                </>
                            ) : (
                                'Se connecter'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center gap-4">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-xs text-slate-400">Nouveau sur SociaLink ?</span>
                        <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    {/* Register Links - Compact & Centered */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            to="/register/worker"
                            className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all group text-sm"
                        >
                            <User className="w-4 h-4 text-blue-600" />
                            <span className="text-slate-700 font-medium">Travailleur</span>
                            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                        </Link>

                        <Link
                            to="/register/establishment"
                            className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all group text-sm"
                        >
                            <Building2 className="w-4 h-4 text-blue-600" />
                            <span className="text-slate-700 font-medium">Établissement</span>
                            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Side - Premium Illustration */}
            <div className="hidden lg:flex w-3/5 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 items-center justify-center relative overflow-hidden">
                {/* Animated Background Effects */}
                <div className="absolute inset-0">
                    {/* Slide Background Images */}
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-30' : 'opacity-0'
                                }`}
                        >
                            <img
                                src={slide.image}
                                alt=""
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ))}

                    {/* Dark Overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/80 via-blue-700/85 to-indigo-900/90" />

                    {/* Floating Orbs */}
                    <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

                    {/* Grid Pattern Overlay */}
                    <div
                        className="absolute inset-0 opacity-5"
                        style={{
                            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                            backgroundSize: '50px 50px'
                        }}
                    />
                </div>

                {/* Floating Glass Cards - Decorative */}
                <div className="absolute top-16 right-16 w-48 h-28 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-4 animate-float">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
                        </div>
                        <span className="text-white/90 text-sm font-medium">Profil vérifié</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full" />
                    </div>
                </div>

                <div className="absolute bottom-24 left-16 w-44 h-24 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-4 animate-float" style={{ animationDelay: '0.5s' }}>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-amber-400 text-lg">star</span>
                        <span className="material-symbols-outlined text-amber-400 text-lg">star</span>
                        <span className="material-symbols-outlined text-amber-400 text-lg">star</span>
                        <span className="material-symbols-outlined text-amber-400 text-lg">star</span>
                        <span className="material-symbols-outlined text-amber-400 text-lg">star</span>
                    </div>
                    <p className="text-white/70 text-xs">+2,500 avis positifs</p>
                </div>

                {/* Main Content Container */}
                <div className="relative z-10 w-full max-w-lg px-8">
                    {/* Slide Content */}
                    <div className="relative min-h-[420px]">
                        {slides.map((slide, index) => (
                            <div
                                key={index}
                                className={`absolute inset-0 flex flex-col items-center transition-all duration-700 ease-out ${index === currentSlide
                                    ? 'opacity-100 translate-x-0 scale-100'
                                    : index < currentSlide
                                        ? 'opacity-0 -translate-x-8 scale-95 pointer-events-none'
                                        : 'opacity-0 translate-x-8 scale-95 pointer-events-none'
                                    }`}
                            >
                                {/* Title */}
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight text-center mt-8">
                                    {slide.title}
                                </h2>
                                <p className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-200 mb-6">
                                    {slide.subtitle}
                                </p>

                                {/* Description */}
                                <p className="text-blue-100/80 text-base md:text-lg leading-relaxed text-center max-w-md mb-8">
                                    {slide.description}
                                </p>

                                {/* Highlight Stat Card */}
                                <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 px-8 py-5 flex items-center gap-6">
                                    <div className="text-4xl md:text-5xl font-bold text-white">
                                        {slide.highlight}
                                    </div>
                                    <div className="h-10 w-px bg-white/20" />
                                    <div className="text-white/80 text-sm font-medium">
                                        {slide.highlightLabel}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Progress Bar Indicator */}
                    <div className="flex items-center justify-center gap-3 mt-8">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className="group relative h-1.5 rounded-full overflow-hidden transition-all duration-300"
                                style={{ width: index === currentSlide ? '48px' : '12px' }}
                            >
                                <div className="absolute inset-0 bg-white/30" />
                                {index === currentSlide && (
                                    <div
                                        className="absolute inset-0 bg-white rounded-full"
                                        style={{
                                            animation: 'progress 5s linear forwards'
                                        }}
                                    />
                                )}
                                {index !== currentSlide && (
                                    <div className="absolute inset-0 bg-white/30 group-hover:bg-white/50 transition-colors" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Trust Badges */}
                    <div className="flex justify-center items-center gap-6 mt-8 text-white/50 text-xs">
                        <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm">lock</span>
                            <span>Sécurisé</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-white/30" />
                        <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm">verified</span>
                            <span>Certifié</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-white/30" />
                        <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm">support_agent</span>
                            <span>Support 24/7</span>
                        </div>
                    </div>
                </div>

                {/* CSS for animations */}
                <style>{`
                    @keyframes float {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-10px); }
                    }
                    @keyframes progress {
                        from { width: 0%; }
                        to { width: 100%; }
                    }
                    .animate-float {
                        animation: float 3s ease-in-out infinite;
                    }
                `}</style>
            </div>
        </div>
    );
};

export default Login;
