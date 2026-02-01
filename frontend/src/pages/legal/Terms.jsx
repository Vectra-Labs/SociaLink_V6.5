import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, AlertCircle } from 'lucide-react';

export default function Terms() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex items-center gap-3 mb-4">
                        <FileText className="w-8 h-8" />
                        <h1 className="text-3xl md:text-4xl font-bold">Conditions Générales d'Utilisation</h1>
                    </div>
                    <p className="text-blue-100">Dernière mise à jour : Janvier 2026</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="prose prose-slate max-w-none">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <p className="text-blue-800 text-sm m-0">
                            En utilisant SociaLink, vous acceptez les présentes conditions générales d'utilisation.
                        </p>
                    </div>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">1. Objet</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Les présentes conditions générales d'utilisation (CGU) ont pour objet de définir les conditions d'accès et d'utilisation de la plateforme SociaLink, accessible à l'adresse www.socialink.ma.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">2. Description des Services</h2>
                        <p className="text-slate-600 leading-relaxed">
                            SociaLink est une plateforme de mise en relation entre les travailleurs sociaux et les établissements du secteur social et médico-social au Maroc. Elle permet :
                        </p>
                        <ul className="list-disc list-inside text-slate-600 mt-4 space-y-2">
                            <li>Aux travailleurs sociaux de créer un profil professionnel et de postuler à des missions</li>
                            <li>Aux établissements de publier des offres de missions et de recruter des professionnels</li>
                            <li>La gestion des disponibilités, des documents et des communications</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">3. Inscription et Compte Utilisateur</h2>
                        <p className="text-slate-600 leading-relaxed">
                            L'accès à certaines fonctionnalités de la plateforme nécessite la création d'un compte. L'utilisateur s'engage à fournir des informations exactes et à jour lors de son inscription. Il est responsable de la confidentialité de ses identifiants de connexion.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">4. Obligations des Utilisateurs</h2>
                        <p className="text-slate-600 leading-relaxed">Les utilisateurs s'engagent à :</p>
                        <ul className="list-disc list-inside text-slate-600 mt-4 space-y-2">
                            <li>Respecter les lois et règlements en vigueur</li>
                            <li>Ne pas publier de contenu illicite, diffamatoire ou portant atteinte aux droits de tiers</li>
                            <li>Ne pas utiliser la plateforme à des fins frauduleuses</li>
                            <li>Respecter la confidentialité des informations échangées</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">5. Propriété Intellectuelle</h2>
                        <p className="text-slate-600 leading-relaxed">
                            L'ensemble des éléments de la plateforme (logo, design, textes, logiciels) sont protégés par les droits de propriété intellectuelle. Toute reproduction ou utilisation non autorisée est interdite.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">6. Responsabilité</h2>
                        <p className="text-slate-600 leading-relaxed">
                            SociaLink agit en tant qu'intermédiaire et ne peut être tenu responsable des relations contractuelles établies entre les utilisateurs. Les utilisateurs restent seuls responsables de leurs engagements mutuels.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">7. Modification des CGU</h2>
                        <p className="text-slate-600 leading-relaxed">
                            SociaLink se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification substantielle.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">8. Contact</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Pour toute question relative aux présentes CGU, vous pouvez nous contacter à l'adresse : <a href="mailto:legal@socialink.ma" className="text-blue-600 hover:underline">legal@socialink.ma</a>
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
