import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import NotificationBell from './ui/NotificationBell';
import MessageBell from './ui/MessageBell';

// Handle anchor link clicks with smooth scroll
const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    const isActive = (path) => location.pathname === path;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Prevent scrolling when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [mobileMenuOpen]);

    const handleLogout = async () => {
        setDropdownOpen(false);
        setMobileMenuOpen(false);
        await logout();
        navigate('/');
    };

    const handleMobileLinkClick = (action) => {
        setMobileMenuOpen(false);
        if (typeof action === 'function') {
            action();
        }
    };

    // Get user display info
    const getUserInitials = () => {
        if (!user) return '?';
        const first = user.first_name?.[0] || '';
        const last = user.last_name?.[0] || '';

        // Fallback to email if name is missing or if checking an entity name
        if (!first && !last && user.email) return user.email[0].toUpperCase();
        if (user.role === 'ESTABLISHMENT' && user.name) return user.name[0].toUpperCase();

        return (first + last).toUpperCase() || '?';
    };

    const getUserName = () => {
        if (!user) return '';
        if (user.role === 'ESTABLISHMENT' && user.name) return user.name;
        const name = `${user.first_name || ''} ${user.last_name || ''}`.trim();
        return name || user.email;
    };

    const getDashboardPath = () => {
        if (!user) return '/';
        switch (user.role) {
            case 'WORKER': return '/worker/dashboard';
            case 'ESTABLISHMENT': return '/establishment/dashboard';
            case 'ADMIN': return '/admin/dashboard';
            default: return '/dashboard';
        }
    };

    const getAvatarColors = () => {
        if (!user) return 'from-slate-400 to-slate-500';
        switch (user.role) {
            case 'WORKER': return 'from-blue-500 to-blue-600'; // Using hardcoded colors as primary might vary
            case 'ESTABLISHMENT': return 'from-emerald-400 to-teal-600';
            case 'ADMIN': return 'from-purple-500 to-indigo-600';
            default: return 'from-slate-400 to-slate-500';
        }
    };

    // Get user profile image URL
    const getUserAvatar = () => {
        if (!user) return null;
        // Worker: check profile_image or photo
        if (user.role === 'WORKER' && (user.profile_image || user.photo || user.avatar)) {
            return user.profile_image || user.photo || user.avatar;
        }
        // Establishment: check logo
        if (user.role === 'ESTABLISHMENT' && (user.logo || user.avatar)) {
            return user.logo || user.avatar;
        }
        return null;
    };

    const avatarUrl = getUserAvatar();

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
            <div className="px-4 md:px-10 py-3 flex items-center justify-between max-w-7xl mx-auto">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 z-50 relative group">
                    <img
                        src="/logo.png"
                        alt="SociaLink"
                        className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="text-xl font-display font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                        SociaLink
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center gap-8">
                    <button
                        onClick={() => {
                            if (location.pathname !== '/') {
                                navigate('/');
                                setTimeout(() => scrollToSection('comment-ca-marche'), 100);
                            } else {
                                scrollToSection('comment-ca-marche');
                            }
                        }}
                        className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors cursor-pointer bg-transparent border-none"
                    >
                        Comment ça marche
                    </button>
                    {/* Missions link - All users go to main missions page */}
                    {user && (
                        <Link
                            to="/missions"
                            className={`text-sm font-medium transition-colors ${isActive('/missions')
                                ? 'text-blue-600 font-semibold'
                                : 'text-slate-600 hover:text-primary'
                                }`}
                        >
                            Missions
                        </Link>
                    )}
                    <Link
                        to="/pricing"
                        className={`text-sm font-medium transition-colors ${isActive('/pricing')
                            ? 'text-blue-600 font-semibold'
                            : 'text-slate-600 hover:text-blue-600'
                            }`}
                    >
                        Tarifs
                    </Link>
                    <button
                        onClick={() => {
                            if (location.pathname !== '/') {
                                navigate('/');
                                setTimeout(() => scrollToSection('pour-qui'), 100);
                            } else {
                                scrollToSection('pour-qui');
                            }
                        }}
                        className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors cursor-pointer bg-transparent border-none"
                    >
                        Pour qui ?
                    </button>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-2">
                    {/* Language Switcher */}
                    <LanguageSwitcher className="hidden lg:block" />
                    {/* Notifications & Messages */}
                    {user && (
                        <>
                            <MessageBell />
                            <NotificationBell />
                        </>
                    )}
                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {/* Auth Section - Show Avatar or Login/Register buttons */}
                    {user ? (
                        <div className="relative hidden lg:block" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-2 p-1 pl-2 pr-4 rounded-full hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200 cursor-pointer bg-transparent"
                            >
                                <div className={`size-9 rounded-full ${!avatarUrl ? `bg-gradient-to-br ${getAvatarColors()}` : ''} flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white overflow-hidden`}>
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        getUserInitials()
                                    )}
                                </div>
                                <div className="flex flex-col items-start hidden xl:flex">
                                    <span className="text-xs font-bold text-slate-700 leading-none mb-0.5">{getUserName().split(' ')[0]}</span>
                                    <span className="text-[10px] text-slate-500 leading-none font-medium">Connecté</span>
                                </div>
                                <span className="material-symbols-outlined text-slate-400 text-lg">
                                    {dropdownOpen ? 'expand_less' : 'expand_more'}
                                </span>
                            </button>

                            {/* Dropdown Menu */}
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                    {/* User Info */}
                                    <div className="px-4 py-3 border-b border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className={`size-11 rounded-full ${!avatarUrl ? `bg-gradient-to-br ${getAvatarColors()}` : ''} flex items-center justify-center text-white font-bold text-base shadow-inner overflow-hidden ring-2 ring-white`}>
                                                {avatarUrl ? (
                                                    <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    getUserInitials()
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 text-left">
                                                <p className="text-sm font-semibold text-slate-900 truncate">
                                                    {getUserName()}
                                                </p>
                                                <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                            </div>
                                        </div>
                                        {/* Badges - Verified & Premium */}
                                        <div className="flex items-center gap-2 mt-3">
                                            {user.status === 'VALIDATED' && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                                                    <span className="material-symbols-outlined text-xs">verified</span> Vérifié
                                                </span>
                                            )}
                                            {user.subscription?.status === 'ACTIVE' && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                                                    <span className="material-symbols-outlined text-xs">workspace_premium</span> Premium
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Menu Links */}
                                    <div className="py-1">
                                        <Link
                                            to={user.role === 'WORKER' ? '/worker/profile' : '/establishment/profile'}
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg text-slate-400">person</span>
                                            Mon profil
                                        </Link>
                                        <Link
                                            to={user.role === 'WORKER' ? '/worker/settings' : '/establishment/settings'}
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-lg text-slate-400">settings</span>
                                            Paramètres
                                        </Link>
                                        {/* Show upgrade link only for WORKER/ESTABLISHMENT without active subscription */}
                                        {(user.role === 'WORKER' || user.role === 'ESTABLISHMENT') && user.subscription?.status !== 'ACTIVE' && (
                                            <Link
                                                to="/pricing"
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-lg text-amber-500">workspace_premium</span>
                                                Passer à Premium
                                            </Link>
                                        )}
                                    </div>

                                    {/* Logout */}
                                    <div className="border-t border-slate-100 pt-1">
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors bg-transparent border-none cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-lg">logout</span>
                                            Déconnexion
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="hidden lg:flex items-center gap-6">
                            {/* Auth Buttons */}
                            <Link
                                to="/login"
                                className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                            >
                                Connexion
                            </Link>
                            <Link
                                to="/register/worker"
                                className="flex items-center justify-center h-11 px-7 rounded-full bg-blue-600 !text-white text-sm font-bold shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all"
                            >
                                Demander l'accès
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden text-slate-700 hover:text-blue-600 bg-transparent border-none cursor-pointer z-50 relative p-2 transition-colors"
                    >
                        <span className="material-symbols-outlined text-3xl">
                            {mobileMenuOpen ? 'close' : 'menu'}
                        </span>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 bg-white z-40 lg:hidden flex flex-col pt-24 px-6 animate-fade-in">
                    <div className="flex flex-col gap-6 text-lg font-medium text-slate-900">
                        {user && (
                            <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
                                <div className={`size-12 rounded-full ${!avatarUrl ? `bg-gradient-to-br ${getAvatarColors()}` : ''} flex items-center justify-center text-white font-bold text-lg overflow-hidden`}>
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        getUserInitials()
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold">{getUserName()}</p>
                                    <p className="text-sm text-slate-500">{user.email}</p>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => handleMobileLinkClick(() => {
                                if (location.pathname !== '/') {
                                    navigate('/');
                                    setTimeout(() => scrollToSection('comment-ca-marche'), 100);
                                } else {
                                    scrollToSection('comment-ca-marche');
                                }
                            })}
                            className="text-left py-2 hover:text-blue-600 transition-colors"
                        >
                            Comment ça marche
                        </button>

                        {user && (
                            <Link
                                to="/missions"
                                onClick={() => setMobileMenuOpen(false)}
                                className="py-2 hover:text-blue-600 transition-colors"
                            >
                                Missions
                            </Link>
                        )}

                        <button
                            onClick={() => handleMobileLinkClick(() => {
                                if (location.pathname !== '/') {
                                    navigate('/');
                                    setTimeout(() => scrollToSection('pour-qui'), 100);
                                } else {
                                    scrollToSection('pour-qui');
                                }
                            })}
                            className="text-left py-2 hover:text-blue-600 transition-colors"
                        >
                            Pour qui ?
                        </button>

                        <Link
                            to="/pricing"
                            onClick={() => setMobileMenuOpen(false)}
                            className="py-2 hover:text-amber-600 transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-amber-500">workspace_premium</span>
                            Tarifs
                        </Link>

                        <div className="h-px bg-slate-100 my-2"></div>

                        {user ? (
                            <>
                                <Link
                                    to={getDashboardPath()}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 py-2 hover:text-blue-600 transition-colors"
                                >
                                    <span className="material-symbols-outlined">dashboard</span>
                                    Tableau de bord
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 py-2 text-red-600 hover:text-red-700 transition-colors text-left"
                                >
                                    <span className="material-symbols-outlined">logout</span>
                                    Se déconnecter
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col gap-3 mt-4">
                                <Link
                                    to="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-center h-12 rounded-xl border border-slate-200 text-slate-900 font-bold"
                                >
                                    Connexion
                                </Link>
                                <Link
                                    to="/register/worker"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center justify-center h-12 rounded-xl bg-blue-600 !text-white font-bold shadow-lg shadow-blue-600/20"
                                >
                                    S'inscrire
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
