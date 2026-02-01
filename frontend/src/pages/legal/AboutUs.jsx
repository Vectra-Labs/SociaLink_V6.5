import { Link } from 'react-router-dom';
import { ArrowLeft, Building2, Users, Target, Heart, Shield, Award, MapPin, Mail, Phone } from 'lucide-react';

export default function AboutUs() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-20">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">À Propos de SociaLink</h1>
                    <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                        La première plateforme dédiée au recrutement et à la gestion des missions dans le secteur social et médico-social au Maroc.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">
                {/* Mission */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Target className="w-6 h-6 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">Notre Mission</h2>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-lg">
                        SociaLink a pour mission de connecter les professionnels du travail social avec les établissements qui ont besoin de leurs compétences. Nous croyons que chaque travailleur social mérite de trouver des opportunités qui correspondent à ses valeurs et à son expertise, et que chaque établissement mérite d'accéder aux meilleurs talents du secteur.
                    </p>
                </section>

                {/* Values */}
                <section>
                    <h2 className="text-2xl font-bold text-slate-800 mb-8">Nos Valeurs</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                                <Heart className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-slate-800 mb-2">Bienveillance</h3>
                            <p className="text-slate-600 text-sm">
                                Nous plaçons l'humain au cœur de notre plateforme et valorisons le travail social dans toute sa diversité.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                                <Shield className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-slate-800 mb-2">Confiance</h3>
                            <p className="text-slate-600 text-sm">
                                Nous vérifions chaque profil et établissement pour garantir la qualité et la sécurité de nos utilisateurs.
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                                <Award className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-slate-800 mb-2">Excellence</h3>
                            <p className="text-slate-600 text-sm">
                                Nous nous engageons à fournir un service de qualité supérieure à tous nos utilisateurs.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Team */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">Notre Équipe</h2>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                        SociaLink a été fondée par une équipe passionnée par le secteur social et médico-social. Notre équipe combine une expertise en technologie et une profonde compréhension des besoins des travailleurs sociaux et des établissements.
                    </p>
                </section>

                {/* Contact */}
                <section className="bg-slate-50 rounded-2xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-blue-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">Nous Contacter</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            <span className="text-slate-600">123 Boulevard Hassan II, Casablanca</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-blue-600" />
                            <a href="mailto:contact@socialink.ma" className="text-blue-600 hover:underline">contact@socialink.ma</a>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-blue-600" />
                            <span className="text-slate-600">+212 5 22 00 00 00</span>
                        </div>
                    </div>
                </section>

                {/* Back Link */}
                <div className="text-center">
                    <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                        <ArrowLeft className="w-4 h-4" />
                        Retour à l'accueil
                    </Link>
                </div>
            </div>
        </div>
    );
}
