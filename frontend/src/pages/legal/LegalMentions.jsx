import { Link } from 'react-router-dom';
import { ArrowLeft, Scale, Building2, Server, User } from 'lucide-react';

export default function LegalMentions() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex items-center gap-3 mb-4">
                        <Scale className="w-8 h-8" />
                        <h1 className="text-3xl md:text-4xl font-bold">Mentions Légales</h1>
                    </div>
                    <p className="text-blue-100">Informations légales obligatoires</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="space-y-10">
                    {/* Éditeur */}
                    <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">Éditeur du Site</h2>
                        </div>
                        <div className="text-slate-600 space-y-2">
                            <p><strong>Raison sociale :</strong> SociaLink SARL</p>
                            <p><strong>Siège social :</strong> 123 Boulevard Hassan II, Casablanca, Maroc</p>
                            <p><strong>Capital social :</strong> 100 000 MAD</p>
                            <p><strong>RC :</strong> 123456 - Casablanca</p>
                            <p><strong>ICE :</strong> 001234567890123</p>
                            <p><strong>Email :</strong> <a href="mailto:contact@socialink.ma" className="text-blue-600 hover:underline">contact@socialink.ma</a></p>
                            <p><strong>Téléphone :</strong> +212 5 22 00 00 00</p>
                        </div>
                    </section>

                    {/* Directeur de publication */}
                    <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">Directeur de la Publication</h2>
                        </div>
                        <div className="text-slate-600">
                            <p><strong>Nom :</strong> M. Ahmed El Amrani</p>
                            <p><strong>Qualité :</strong> Gérant</p>
                        </div>
                    </section>

                    {/* Hébergeur */}
                    <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Server className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">Hébergeur</h2>
                        </div>
                        <div className="text-slate-600 space-y-2">
                            <p><strong>Raison sociale :</strong> Vercel Inc.</p>
                            <p><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
                            <p><strong>Site web :</strong> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">vercel.com</a></p>
                        </div>
                    </section>

                    {/* Propriété intellectuelle */}
                    <section className="bg-slate-50 p-6 rounded-2xl">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Propriété Intellectuelle</h2>
                        <p className="text-slate-600 leading-relaxed">
                            L'ensemble du contenu du site SociaLink (textes, images, logos, icônes, sons, logiciels, base de données) est protégé par le droit d'auteur et le droit des marques. Toute reproduction, représentation, modification, publication, transmission ou dénaturation, totale ou partielle du site ou de son contenu, par quelque procédé que ce soit, et sur quelque support que ce soit, est interdite sans l'autorisation écrite préalable de SociaLink.
                        </p>
                    </section>

                    {/* Loi applicable */}
                    <section className="bg-slate-50 p-6 rounded-2xl">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Loi Applicable</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Les présentes mentions légales sont régies par le droit marocain. En cas de litige, et à défaut d'accord amiable, les tribunaux de Casablanca seront seuls compétents.
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
