import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Users, Briefcase, Settings, LogOut, Shield,
    MessageSquare, Menu, ChevronDown, User, ShieldCheck, Building2,
    ChevronRight, Gavel
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import NotificationBell from './ui/NotificationBell';

const AdminLayout = () => {
    const { logout, user } = useAuth();
    const location = useLocation();

    // State
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [expandedMenu, setExpandedMenu] = useState(null);

    // Auto-expand submenu if current path is in it
    useEffect(() => {
        if (location.pathname.includes('/admin/verification')) {
            setExpandedMenu('verification');
        }
    }, [location.pathname]);

    // Close menus on click outside
    useEffect(() => {
        const handleClickOutside = () => {
            setShowProfileMenu(false);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Menu items with submenu support
    const menuItems = [
        { path: '/admin/dashboard', label: 'Vue d\'ensemble', icon: LayoutDashboard },
        {
            id: 'verification',
            label: 'Authentification',
            icon: ShieldCheck,
            submenu: [
                { path: '/admin/verification/workers', label: 'Travailleurs', icon: User },
                { path: '/admin/verification/establishments', label: 'Établissements', icon: Building2 },
            ]
        },
        { path: '/admin/missions', label: 'Validation Missions', icon: Briefcase },
        { path: '/admin/disputes', label: 'Litiges', icon: Gavel },
        { path: '/admin/messages', label: 'Messagerie', icon: MessageSquare },
        { path: '/admin/settings', label: 'Paramètres', icon: Settings },
    ];

    const adminName = user?.prenom || user?.first_name || 'Admin';
    const adminEmail = user?.email || '';

    const toggleSubmenu = (menuId) => {
        setExpandedMenu(expandedMenu === menuId ? null : menuId);
    };

    const isPathActive = (path) => location.pathname === path;
    const isSubmenuActive = (submenu) => submenu?.some(item => location.pathname.startsWith(item.path));

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
                        {/* Logo Section */}
                        <div className={`
                            flex items-center h-full transition-all duration-300 border-r border-slate-200
                            ${isSidebarCollapsed ? 'w-20 justify-center' : 'w-64 px-4'}
                        `}>
                            <Link to="/" className="flex items-center gap-2">
                                <img src="/logo.png" alt="SociaLink" className="h-8 w-auto" />
                                <div className={`transition-opacity duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                                    <span className="font-bold text-slate-800 whitespace-nowrap">SociaLink</span>
                                    <p className="text-xs text-blue-600 font-medium">Administration</p>
                                </div>
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

                    {/* Right: Messages, Notifications, Profile */}
                    <div className="flex items-center gap-2 px-4">
                        <Link
                            to="/admin/messages"
                            className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Messagerie"
                        >
                            <MessageSquare className="w-5 h-5 text-slate-600" />
                        </Link>

                        <div className="relative px-2">
                            <NotificationBell />
                        </div>

                        {/* Profile Menu */}
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowProfileMenu(!showProfileMenu);
                                }}
                                className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-base">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div className="hidden sm:block text-left">
                                    <p className="text-sm font-medium text-slate-800">{adminName}</p>
                                </div>
                                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
                            </button>

                            {/* Profile Dropdown */}
                            {showProfileMenu && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                                    <div className="px-4 py-3 border-b border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center text-white ring-2 ring-white">
                                                <Shield className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-900 truncate">{adminName}</p>
                                                <p className="text-xs text-slate-500 truncate">{adminEmail}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-3">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                                <Shield className="w-3 h-3" /> Administrateur
                                            </span>
                                        </div>
                                    </div>

                                    <div className="py-1">
                                        <Link to="/admin/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                                            <User className="w-4 h-4 text-slate-400" /> Mon profil
                                        </Link>
                                        <Link to="/admin/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                                            <Settings className="w-4 h-4 text-slate-400" /> Paramètres
                                        </Link>
                                    </div>

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
                {/* Sidebar */}
                <aside className={`
                    ${isSidebarCollapsed ? 'w-20' : 'w-64'} 
                    ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    bg-white border-r border-slate-200 fixed lg:sticky top-16 h-[calc(100vh-4rem)] z-40 lg:z-10
                    shadow-sm transition-all duration-300 flex flex-col
                `}>
                    {/* Navigation Menu */}
                    <nav className="flex-1 p-3 overflow-y-auto custom-scrollbar">
                        <ul className="space-y-1">
                            {menuItems.map((item) => {
                                const Icon = item.icon;

                                // Item with submenu
                                if (item.submenu) {
                                    const isExpanded = expandedMenu === item.id;
                                    const isActive = isSubmenuActive(item.submenu);

                                    return (
                                        <li key={item.id}>
                                            <button
                                                onClick={() => !isSidebarCollapsed && toggleSubmenu(item.id)}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all group
                                                    ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}
                                                    ${isActive
                                                        ? 'bg-blue-50 text-blue-600 font-medium'
                                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                    }`}
                                                title={isSidebarCollapsed ? item.label : ''}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                                    {!isSidebarCollapsed && <span className="text-sm">{item.label}</span>}
                                                </div>
                                                {!isSidebarCollapsed && (
                                                    <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                                )}
                                            </button>

                                            {/* Submenu */}
                                            {!isSidebarCollapsed && isExpanded && (
                                                <ul className="mt-1 ml-4 pl-4 border-l-2 border-slate-100 space-y-1">
                                                    {item.submenu.map((subItem) => {
                                                        const SubIcon = subItem.icon;
                                                        const isSubActive = isPathActive(subItem.path) || location.pathname.startsWith(subItem.path);

                                                        return (
                                                            <li key={subItem.path}>
                                                                <Link
                                                                    to={subItem.path}
                                                                    onClick={() => setIsMobileSidebarOpen(false)}
                                                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all
                                                                        ${isSubActive
                                                                            ? 'bg-blue-50 text-blue-600 font-medium'
                                                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                                                                        }`}
                                                                >
                                                                    <SubIcon className={`w-4 h-4 ${isSubActive ? 'text-blue-600' : 'text-slate-400'}`} />
                                                                    {subItem.label}
                                                                </Link>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            )}
                                        </li>
                                    );
                                }

                                // Regular item without submenu
                                const isActive = isPathActive(item.path);
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

                    {/* Admin Badge */}
                    {!isSidebarCollapsed && (
                        <div className="p-3 border-t border-slate-100">
                            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    <span className="text-xs font-semibold text-slate-700">
                                        Espace Administration
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500">
                                    Vérification des comptes
                                </p>
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

export default AdminLayout;
