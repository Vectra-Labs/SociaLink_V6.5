import { Link } from 'react-router-dom';
import { ArrowLeft, Map, Home, Briefcase, Users, Building2, Shield, FileText, Settings, MessageSquare } from 'lucide-react';

export default function Sitemap() {
    const sections = [
        {
            title: 'Pages Principales',
            icon: Home,
            color: 'blue',
            links: [
                { name: 'Accueil', path: '/' },
                { name: 'Missions disponibles', path: '/missions' },
                { name: 'Contact', path: '/contact' },
            ]
        },
        {
            title: 'Espace Travailleur',
            icon: Users,
            color: 'blue',
            links: [
                { name: 'Inscription Travailleur', path: '/register/worker' },
                { name: 'Tableau de bord', path: '/worker/dashboard', auth: true },
                { name: 'Mon profil', path: '/worker/profile', auth: true },
                { name: 'Mes candidatures', path: '/worker/applications', auth: true },
                { name: 'Mes missions', path: '/worker/missions', auth: true },
                { name: 'Calendrier', path: '/worker/calendar', auth: true },
                { name: 'Documents', path: '/worker/documents', auth: true },
                { name: 'Messages', path: '/worker/messages', auth: true },
            ]
        },
        {
            title: 'Espace Établissement',
            icon: Building2,
            color: 'blue',
            links: [
                { name: 'Inscription Établissement', path: '/register/establishment' },
                { name: 'Tableau de bord', path: '/establishment/dashboard', auth: true },
                { name: 'Créer une mission', path: '/establishment/missions/create', auth: true },
                { name: 'Mes missions', path: '/establishment/missions', auth: true },
                { name: 'Candidatures reçues', path: '/establishment/applications', auth: true },
                { name: 'Facturation', path: '/establishment/billing', auth: true },
                { name: 'Messages', path: '/establishment/messages', auth: true },
            ]
        },
        {
            title: 'Informations Légales',
            icon: Shield,
            color: 'blue',
            links: [
                { name: 'À propos de nous', path: '/about' },
                { name: 'Conditions Générales', path: '/terms' },
                { name: 'Politique de Confidentialité', path: '/privacy' },
                { name: 'Mentions Légales', path: '/legal' },
                { name: 'Politique de Cookies', path: '/cookies' },
            ]
        },
        {
            title: 'Authentification',
            icon: Settings,
            color: 'blue',
            links: [
                { name: 'Connexion', path: '/login' },
                { name: 'Mot de passe oublié', path: '/forgot-password' },
            ]
        }
    ];

    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex items-center gap-3 mb-4">
                        <Map className="w-8 h-8" />
                        <h1 className="text-3xl md:text-4xl font-bold">Plan du Site</h1>
                    </div>
                    <p className="text-blue-100">Retrouvez facilement toutes les pages de SociaLink</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="grid md:grid-cols-2 gap-8">
                    {sections.map((section, idx) => {
                        const IconComponent = section.icon;
                        return (
                            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[section.color]}`}>
                                        <IconComponent className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-lg font-bold text-slate-800">{section.title}</h2>
                                </div>
                                <ul className="space-y-2">
                                    {section.links.map((link, linkIdx) => (
                                        <li key={linkIdx}>
                                            <Link
                                                to={link.path}
                                                className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors py-1"
                                            >
                                                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                                                {link.name}
                                                {link.auth && (
                                                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                                        Connexion requise
                                                    </span>
                                                )}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>

                {/* Back Link */}
                <div className="mt-12 pt-8 border-t border-slate-200 text-center">
                    <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                        <ArrowLeft className="w-4 h-4" />
                        Retour à l'accueil
                    </Link>
                </div>
            </div>
        </div>
    );
}
