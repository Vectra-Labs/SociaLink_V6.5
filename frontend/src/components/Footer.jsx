import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-slate-50 dark:bg-slate-900 pt-16 pb-8 border-t border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 group-hover:opacity-30 transition-opacity rounded-full"></div>
                                <img src="/logo.png" alt="SociaLink" className="relative h-9 w-auto transform group-hover:scale-105 transition-transform duration-300" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
                                SociaLink
                            </span>
                        </Link>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-xs">
                            La plateforme de référence pour les professionnels du secteur social et médico-social au Maroc. Connectez-vous à l'excellence.
                        </p>
                        <div className="flex gap-3">
                            {[
                                { Icon: Linkedin, href: "#", label: "LinkedIn" },
                                { Icon: Twitter, href: "#", label: "Twitter" },
                                { Icon: Facebook, href: "#", label: "Facebook" },
                                { Icon: Instagram, href: "#", label: "Instagram" }
                            ].map(({ Icon, href, label }) => (
                                <a
                                    key={label}
                                    href={href}
                                    aria-label={label}
                                    className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-600/20"
                                >
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Access */}
                    <div>
                        <h3 className="text-slate-900 dark:text-white font-bold mb-6 text-sm uppercase tracking-wider">Accès Rapide</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link to="/register/worker" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-500 transition-colors"></span>
                                    Je suis Travailleur Social
                                </Link>
                            </li>
                            <li>
                                <Link to="/register/establishment" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-500 transition-colors"></span>
                                    Je suis Établissement
                                </Link>
                            </li>
                            <li>
                                <Link to="/missions" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-500 transition-colors"></span>
                                    Offres de missions
                                </Link>
                            </li>
                            <li>
                                <Link to="/pricing" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-500 transition-colors"></span>
                                    Nos Tarifs
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-slate-900 dark:text-white font-bold mb-6 text-sm uppercase tracking-wider">Informations</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link to="/about" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    À propos de nous
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    Conditions Générales
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacy" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    Politique de Confidentialité
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    Contact & Support
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-slate-900 dark:text-white font-bold mb-6 text-sm uppercase tracking-wider">Contactez-nous</h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3 text-slate-600 dark:text-slate-400 group">
                                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <span>123 Boulevard Hassan II,<br />Casablanca, Maroc</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-600 dark:text-slate-400 group">
                                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <span className="font-medium">+212 5 22 00 00 00</span>
                            </li>
                            <li className="flex items-center gap-3 text-slate-600 dark:text-slate-400 group">
                                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <a href="mailto:contact@socialink.ma" className="hover:text-blue-600 transition-colors">contact@socialink.ma</a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-sm font-medium">
                        &copy; {new Date().getFullYear()} SociaLink. Fait avec <span className="text-red-500 animate-pulse">❤</span> au Maroc.
                    </p>
                    <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
                        <Link to="/legal" className="hover:text-blue-600 transition-colors">Mentions Légales</Link>
                        <Link to="/sitemap" className="hover:text-blue-600 transition-colors">Plan du site</Link>
                        <span className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Systèmes opérationnels
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
