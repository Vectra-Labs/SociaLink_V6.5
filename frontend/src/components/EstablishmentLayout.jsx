import { Link, Outlet, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Briefcase, FileText, UserSearch,
    Settings, LogOut, Plus, Building2, MessageSquare, User, Bell, Menu, FolderCheck
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

const EstablishmentLayout = () => {
    const { logout, user } = useAuth();
    const location = useLocation();
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Nav Items - Profile always 2nd position
    const navItems = [
        { path: '/establishment/dashboard', label: 'Vue d\'ensemble', icon: LayoutDashboard },
        { path: '/establishment/profile', label: 'Mon Profil', icon: User },
        { path: '/establishment/documents', label: 'Documents Légaux', icon: FolderCheck },
        { path: '/establishment/missions', label: 'Mes Missions', icon: Briefcase },
        { path: '/establishment/missions/create', label: 'Publier Mission', icon: Plus },
        { path: '/establishment/candidates', label: 'Candidatures', icon: FileText },
        { path: '/establishment/search_worker', label: 'Rechercher Talents', icon: UserSearch },
        { path: '/establishment/messages', label: 'Messages', icon: MessageSquare },
        { path: '/establishment/settings', label: 'Paramètres', icon: Settings },
    ];

    const establishmentName = user?.establishmentProfile?.name || user?.name || 'Établissement';

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Mobile Overlay */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileSidebarOpen(false)}
                />
            )}

            {/* Top Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30 h-16">
                <div className="flex items-center justify-between h-full px-4">
                    {/* Left: Logo & Burger */}
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-2">
                            <img src="/logo.png" alt="SociaLink" className="h-8 w-auto" />
                            <div className="hidden sm:block">
                                <span className="font-bold text-slate-800">SociaLink</span>
                                <p className="text-xs text-blue-600 font-medium">Espace Recruteur</p>
                            </div>
                        </Link>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors lg:hidden"
                        >
                            <Menu className="w-5 h-5 text-slate-600" />
                        </button>
                    </div>

                    {/* Center: Missions Link - Goes to main missions discovery page */}
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
                    <div className="flex items-center gap-2">

                        {/* Messages */}
                        <Link
                            to="/establishment/messages"
                            className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Messages"
                        >
                            <MessageSquare className="w-5 h-5 text-slate-600" />
                        </Link>

                        {/* Notifications */}
                        <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <Bell className="w-5 h-5 text-slate-600" />
                        </button>

                        {/* Profile Dropdown */}
                        <div className="relative pl-2 border-l border-slate-200">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                                    {user?.logo ? (
                                        <img src={user.logo} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <Building2 className="w-4 h-4" />
                                    )}
                                </div>
                                <span className="text-sm font-medium text-slate-700 hidden md:inline max-w-[120px] truncate">
                                    {establishmentName}
                                </span>
                            </button>

                            {/* Dropdown Menu */}
                            {dropdownOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setDropdownOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                        {/* Header */}
                                        <div className="px-4 py-3 border-b border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white overflow-hidden">
                                                    {user?.logo ? (
                                                        <img src={user.logo} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Building2 className="w-5 h-5" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-slate-800 truncate">{establishmentName}</p>
                                                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                                </div>
                                            </div>
                                            {user?.status === 'VALIDATED' && (
                                                <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                                    <span className="material-symbols-outlined text-xs">verified</span> Vérifié
                                                </span>
                                            )}
                                        </div>

                                        {/* Menu Links */}
                                        <div className="py-1">
                                            <Link
                                                to="/establishment/profile"
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                            >
                                                <User className="w-4 h-4 text-slate-400" /> Mon profil
                                            </Link>
                                            <Link
                                                to="/establishment/settings"
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                            >
                                                <Settings className="w-4 h-4 text-slate-400" /> Paramètres
                                            </Link>
                                            {/* Show upgrade link only if no active subscription */}
                                            {user?.subscription?.status !== 'ACTIVE' && (
                                                <Link
                                                    to="/pricing"
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-lg text-indigo-500">workspace_premium</span>
                                                    Passer à Premium
                                                </Link>
                                            )}
                                        </div>

                                        {/* Logout */}
                                        <div className="border-t border-slate-100 pt-1">
                                            <button
                                                onClick={() => { setDropdownOpen(false); logout(); }}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors"
                                            >
                                                <LogOut className="w-4 h-4" /> Déconnexion
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Layout with Sidebar and Content */}
            <div className="flex">
                {/* Sidebar */}
                <aside className={`
                        w-64 bg-white border-r border-slate-200 fixed lg:sticky top-16 h-[calc(100vh-4rem)] z-40 lg:z-10
                        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                        shadow-sm transition-transform duration-300 flex flex-col
                    `}>
                    {/* Navigation Menu */}
                    <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                        <ul className="space-y-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <li key={item.path}>
                                        <Link
                                            to={item.path}
                                            onClick={() => setIsMobileSidebarOpen(false)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all group ${isActive
                                                ? 'bg-blue-50 text-blue-600 font-medium'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                }`}
                                        >
                                            <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                            {item.label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    {/* Logout Button */}
                    <div className="p-4 border-t border-slate-100 bg-white">
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 text-sm transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            Déconnexion
                        </button>
                    </div>
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

export default EstablishmentLayout;
