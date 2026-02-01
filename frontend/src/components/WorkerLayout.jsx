import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, User, Award,
    Briefcase, FileText, LogOut, Calendar, FolderOpen,
    Menu, Bell, MessageSquare, ChevronDown, Settings,
    Crown, Shield, Star
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../context/SubscriptionContext';
import api from '../api/client';
import NotificationBell from './ui/NotificationBell';

const WorkerLayout = () => {
    const { logout, user } = useAuth();
    const { isSubscribed } = useSubscription();
    const location = useLocation();

    // State
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    // Notifications state handled by NotificationBell component
    const [profilePicUrl, setProfilePicUrl] = useState(null);

    // Fetch profile picture
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get('/worker/profile');
                const pic = data.data?.profile_pic_url || data.data?.avatar_url || null;
                setProfilePicUrl(pic);
            } catch (err) {
                console.error('Failed to fetch profile', err);
            }
        };
        fetchProfile();
    }, []);

    // Close menus on click outside
    useEffect(() => {
        const handleClickOutside = () => {
            setShowProfileMenu(false);
            setShowProfileMenu(false);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Nav Items - Profile always 2nd position
    const navItems = [
        { path: '/worker/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
        { path: '/worker/profile', label: 'Profil', icon: User },
        { path: '/worker/missions', label: 'Mes Candidatures', icon: Briefcase },
        { path: '/worker/calendar', label: 'Calendrier', icon: Calendar },
        { path: '/worker/messages', label: 'Messages', icon: MessageSquare },
        { path: '/worker/reviews', label: 'Mes avis', icon: Star },
        { path: '/worker/specialities', label: 'Compétences', icon: Award },
        { path: '/worker/documents', label: 'Documents & Diplômes', icon: FolderOpen },
        { path: '/worker/settings', label: 'Paramètres', icon: Settings },
    ];

    const isVerified = user?.status === 'VALIDATED';

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Overlay for mobile */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}

            {/* Full-Width Top Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30 h-16">
                <div className="flex items-center justify-between h-full px-0">
                    {/* Left: Logo | Burger */}
                    <div className="flex items-center h-full">
                        {/* Logo Section - Aligned with Sidebar */}
                        <div className={`
                            flex items-center h-full transition-all duration-300 border-r border-slate-200
                            ${isSidebarCollapsed ? 'w-20 justify-center' : 'w-64 px-4'}
                        `}>
                            <Link to="/" className="flex items-center gap-2">
                                <img src="/logo.png" alt="SociaLink" className="h-8 w-auto" />
                                <span className={`font-bold text-slate-800 whitespace-nowrap transition-opacity duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'
                                    }`}>
                                    SociaLink
                                </span>
                            </Link>
                        </div>

                        {/* Burger Menu - Desktop */}
                        <button
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors hidden lg:flex ml-4"
                            title={isSidebarCollapsed ? 'Agrandir le menu' : 'Réduire le menu'}
                        >
                            <Menu className="w-5 h-5 text-slate-600" />
                        </button>

                        {/* Burger Menu - Mobile */}
                        <button
                            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors lg:hidden ml-4"
                        >
                            <Menu className="w-5 h-5 text-slate-600" />
                        </button>
                    </div>

                    {/* Center: Missions Link - Goes to main missions page */}
                    <div className="hidden md:flex items-center justify-center flex-1">
                        <Link
                            to="/missions"
                            className={`text-sm font-semibold transition-colors ${location.pathname === '/missions'
                                ? 'text-blue-600'
                                : 'text-slate-600 hover:text-blue-600'
                                }`}
                        >
                            Missions
                        </Link>
                    </div>

                    {/* Right: Messages, Notifications, Profile */}
                    <div className="flex items-center gap-2 px-4">

                        {/* Messages */}
                        <Link
                            to="/worker/messages"
                            className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Messages"
                        >
                            <MessageSquare className="w-5 h-5 text-slate-600" />
                        </Link>

                        {/* Notifications */}
                        <div className="relative px-2">
                            <NotificationBell />
                        </div>

                        {/* Profile Menu */}
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowProfileMenu(!showProfileMenu);
                                    setShowProfileMenu(!showProfileMenu);
                                }}
                                className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                {profilePicUrl ? (
                                    <img
                                        src={profilePicUrl}
                                        alt="Profile"
                                        className="w-10 h-10 rounded-full object-cover border-2 border-slate-200"
                                    />
                                ) : (
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-base">
                                        {user?.first_name?.[0]}{user?.last_name?.[0]}
                                    </div>
                                )}
                                <div className="hidden sm:block text-left">
                                    <p className="text-sm font-medium text-slate-800">
                                        {user?.first_name}
                                    </p>
                                </div>
                                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
                            </button>

                            {/* Profile Dropdown */}
                            {showProfileMenu && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                                    {/* User Info */}
                                    <div className="px-4 py-3 border-b border-slate-100">
                                        <div className="flex items-center gap-3">
                                            {profilePicUrl ? (
                                                <img
                                                    src={profilePicUrl}
                                                    alt="Profile"
                                                    className="w-11 h-11 rounded-full object-cover ring-2 ring-white"
                                                />
                                            ) : (
                                                <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-base ring-2 ring-white">
                                                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-900 truncate">{user?.first_name} {user?.last_name}</p>
                                                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                            </div>
                                        </div>
                                        {/* Badges - Verified & Premium */}
                                        <div className="flex items-center gap-2 mt-3">
                                            {isVerified && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                                                    <Shield className="w-3 h-3" /> Vérifié
                                                </span>
                                            )}
                                            {isSubscribed && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                                                    <Crown className="w-3 h-3" /> Premium
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Menu Links */}
                                    <div className="py-1">
                                        <Link to="/worker/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                                            <User className="w-4 h-4 text-slate-400" /> Mon profil
                                        </Link>
                                        <Link to="/worker/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                                            <Settings className="w-4 h-4 text-slate-400" /> Paramètres
                                        </Link>
                                        {/* Show upgrade link only for non-premium users */}
                                        {!isSubscribed && (
                                            <Link to="/worker/subscription" className="flex items-center gap-3 px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50 transition-colors">
                                                <Crown className="w-4 h-4 text-amber-500" /> Passer à Premium
                                            </Link>
                                        )}
                                    </div>

                                    {/* Logout */}
                                    <div className="border-t border-slate-100 pt-1">
                                        <button
                                            onClick={logout}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" /> Déconnexion
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Layout with Sidebar and Content */}
            <div className="flex">
                {/* Sidebar - Below Header */}
                <aside className={`
                    ${isSidebarCollapsed ? 'w-20' : 'w-64'} 
                    ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    bg-white border-r border-slate-200 fixed lg:sticky top-16 h-[calc(100vh-4rem)] z-40 lg:z-10
                    shadow-sm transition-all duration-300 flex flex-col
                `}>
                    {/* Navigation Menu */}
                    <nav className="flex-1 p-3 overflow-y-auto custom-scrollbar">
                        <ul className="space-y-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <li key={item.path}>
                                        <Link
                                            to={item.path}
                                            onClick={() => setIsMobileSidebarOpen(false)}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all group
                                                ${isSidebarCollapsed ? 'justify-center' : ''}
                                                ${isActive
                                                    ? 'bg-blue-50 text-blue-600 font-medium'
                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                }`}
                                            title={isSidebarCollapsed ? item.label : ''}
                                        >
                                            <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                            {!isSidebarCollapsed && <span className="text-sm">{item.label}</span>}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Subscription Status - Only when expanded */}
                    {!isSidebarCollapsed && (
                        <div className="p-3 border-t border-slate-100">
                            <div className={`p-3 rounded-lg ${isSubscribed ? 'bg-blue-50 border border-blue-200' : 'bg-amber-50 border border-amber-200'}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className={`w-2 h-2 rounded-full ${isSubscribed ? 'bg-green-500' : 'bg-amber-500'}`} />
                                    <span className="text-xs font-semibold text-slate-700">
                                        {isSubscribed ? 'Abonnement actif' : 'Compte Basic'}
                                    </span>
                                </div>
                                {!isSubscribed && (
                                    <Link to="/worker/subscription" className="text-xs text-amber-700 hover:underline">
                                        Passer à Premium →
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300">
                    <div className="max-w-7xl mx-auto animation-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default WorkerLayout;
