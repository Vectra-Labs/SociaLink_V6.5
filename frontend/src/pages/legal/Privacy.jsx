import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Lock, UserCheck, Database, Globe } from 'lucide-react';

export default function Privacy() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="flex items-center gap-3 mb-4">
                        <Shield className="w-8 h-8" />
                        <h1 className="text-3xl md:text-4xl font-bold">Politique de Confidentialité</h1>
                    </div>
                    <p className="text-blue-100">Dernière mise à jour : Janvier 2026</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="prose prose-slate max-w-none">
                    <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                        La protection de vos données personnelles est une priorité pour SociaLink. Cette politique de confidentialité vous informe sur la manière dont nous collectons, utilisons et protégeons vos informations.
                    </p>

                    <section className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Database className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 m-0">1. Données Collectées</h2>
                        </div>
                        <p className="text-slate-600 leading-relaxed">Nous collectons les données suivantes :</p>
                        <ul className="list-disc list-inside text-slate-600 mt-4 space-y-2">
                            <li><strong>Données d'identification :</strong> nom, prénom, email, téléphone</li>
                            <li><strong>Données professionnelles :</strong> CV, diplômes, expériences, spécialités</li>
                            <li><strong>Données de connexion :</strong> adresse IP, logs de navigation</li>
                            <li><strong>Données de paiement :</strong> pour les abonnements (traitées par nos partenaires sécurisés)</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Eye className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 m-0">2. Utilisation des Données</h2>
                        </div>
                        <p className="text-slate-600 leading-relaxed">Vos données sont utilisées pour :</p>
                        <ul className="list-disc list-inside text-slate-600 mt-4 space-y-2">
                            <li>Gérer votre compte et vos accès à la plateforme</li>
                            <li>Faciliter la mise en relation entre travailleurs et établissements</li>
                            <li>Améliorer nos services et personnaliser votre expérience</li>
                            <li>Vous envoyer des notifications relatives à vos missions et candidatures</li>
                            <li>Respecter nos obligations légales et réglementaires</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Lock className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 m-0">3. Protection des Données</h2>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                            Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :
                        </p>
                        <ul className="list-disc list-inside text-slate-600 mt-4 space-y-2">
                            <li>Chiffrement SSL/TLS pour toutes les communications</li>
                            <li>Mots de passe hashés de manière sécurisée</li>
                            <li>Accès restreint aux données sensibles</li>
                            <li>Sauvegardes régulières et sécurisées</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <UserCheck className="w-5 h-5 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 m-0">4. Vos Droits</h2>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                            Conformément à la loi 09-08 relative à la protection des données à caractère personnel, vous disposez des droits suivants :
                        </p>
                        <ul className="list-disc list-inside text-slate-600 mt-4 space-y-2">
                            <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
                            <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
                            <li><strong>Droit de suppression :</strong> demander l'effacement de vos données</li>
                            <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                <Globe className="w-5 h-5 text-blue-500" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 m-0">5. Partage des Données</h2>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                            Vos données peuvent être partagées avec :
                        </p>
                        <ul className="list-disc list-inside text-slate-600 mt-4 space-y-2">
                            <li>Les établissements auxquels vous postulez (profil professionnel)</li>
                            <li>Nos prestataires techniques (hébergement, paiement)</li>
                            <li>Les autorités compétentes en cas d'obligation légale</li>
                        </ul>
                        <p className="text-slate-600 mt-4">
                            Nous ne vendons jamais vos données à des tiers.
                        </p>
                    </section>

                    <section className="mb-10 bg-blue-50 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Contact DPO</h2>
                        <p className="text-slate-600">
                            Pour exercer vos droits ou pour toute question relative à la protection de vos données, contactez notre Délégué à la Protection des Données :
                        </p>
                        <p className="mt-4">
                            <a href="mailto:dpo@socialink.ma" className="text-blue-600 hover:underline font-medium">dpo@socialink.ma</a>
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
