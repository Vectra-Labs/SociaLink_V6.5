import { Link } from 'react-router-dom';
import { ArrowLeft, Cookie, Settings, BarChart3, Shield, ToggleLeft } from 'lucide-react';

export default function Cookies() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex items-center gap-3 mb-4">
                        <Cookie className="w-8 h-8" />
                        <h1 className="text-3xl md:text-4xl font-bold">Politique de Cookies</h1>
                    </div>
                    <p className="text-blue-100">Dernière mise à jour : Janvier 2026</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="prose prose-slate max-w-none">
                    <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                        Cette page vous explique comment SociaLink utilise les cookies et technologies similaires pour améliorer votre expérience sur notre plateforme.
                    </p>

                    {/* Qu'est-ce qu'un cookie */}
                    <section className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Cookie className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 m-0">Qu'est-ce qu'un Cookie ?</h2>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                            Un cookie est un petit fichier texte stocké sur votre appareil (ordinateur, tablette, smartphone) lorsque vous visitez un site web. Les cookies permettent au site de mémoriser vos préférences et d'améliorer votre expérience de navigation.
                        </p>
                    </section>

                    {/* Types de cookies */}
                    <section className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Settings className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 m-0">Types de Cookies Utilisés</h2>
                        </div>

                        <div className="grid gap-4 mt-4">
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                                <h3 className="font-semibold text-slate-800 mb-2">🔒 Cookies Essentiels</h3>
                                <p className="text-slate-600 text-sm">
                                    Nécessaires au fonctionnement du site. Ils permettent la navigation, l'authentification et la sécurité. Sans ces cookies, le site ne peut pas fonctionner correctement.
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                                <h3 className="font-semibold text-slate-800 mb-2">⚙️ Cookies Fonctionnels</h3>
                                <p className="text-slate-600 text-sm">
                                    Permettent de mémoriser vos préférences (langue, région) pour personnaliser votre expérience.
                                </p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-slate-200">
                                <h3 className="font-semibold text-slate-800 mb-2">📊 Cookies Analytiques</h3>
                                <p className="text-slate-600 text-sm">
                                    Nous aident à comprendre comment les visiteurs utilisent le site afin d'améliorer nos services. Les données sont anonymisées.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Durée de conservation */}
                    <section className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 m-0">Durée de Conservation</h2>
                        </div>
                        <ul className="list-disc list-inside text-slate-600 space-y-2">
                            <li><strong>Cookies de session :</strong> supprimés à la fermeture du navigateur</li>
                            <li><strong>Cookies persistants :</strong> conservés jusqu'à 13 mois maximum</li>
                            <li><strong>Cookies d'authentification :</strong> 7 jours (selon vos préférences)</li>
                        </ul>
                    </section>

                    {/* Gestion des cookies */}
                    <section className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <ToggleLeft className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 m-0">Gérer vos Cookies</h2>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                            Vous pouvez à tout moment gérer vos préférences de cookies :
                        </p>
                        <ul className="list-disc list-inside text-slate-600 mt-4 space-y-2">
                            <li>Via les paramètres de votre navigateur</li>
                            <li>En supprimant les cookies existants</li>
                            <li>En configurant votre navigateur pour bloquer certains cookies</li>
                        </ul>
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-4">
                            <p className="text-blue-800 text-sm">
                                ⚠️ La désactivation de certains cookies peut affecter le fonctionnement du site et limiter l'accès à certaines fonctionnalités.
                            </p>
                        </div>
                    </section>

                    {/* Contact */}
                    <section className="bg-blue-50 p-6 rounded-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="w-5 h-5 text-blue-600" />
                            <h2 className="text-xl font-bold text-slate-800 m-0">Questions</h2>
                        </div>
                        <p className="text-slate-600">
                            Pour toute question concernant notre utilisation des cookies, contactez-nous à : <a href="mailto:privacy@socialink.ma" className="text-blue-600 hover:underline">privacy@socialink.ma</a>
                        </p>
                    </section>
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
