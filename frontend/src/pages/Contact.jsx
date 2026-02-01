import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Send } from 'lucide-react';

export default function Contact() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white sm:text-5xl">
                        Contactez-nous
                    </h1>
                    <p className="mt-4 text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                        Une question ? Un projet ? Notre équipe est à votre écoute pour vous accompagner.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8">
                    {/* Contact Info Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden p-8 slide-up">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
                            Nos Coordonnées
                        </h2>

                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                                        Adresse
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        123 Boulevard Hassan II<br />
                                        Casablanca, Maroc
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                                        Téléphone
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        +212 5 22 00 00 00
                                    </p>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Du lundi au vendredi, de 9h à 18h
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                                        Email
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        contact@socialink.ma
                                    </p>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        support@socialink.ma
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Social Links or Map placeholder */}
                        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-700">
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                                Suivez-nous
                            </h3>
                            <div className="flex gap-4">
                                {/* Mock Social Icons */}
                                {['facebook', 'twitter', 'linkedin', 'instagram'].map((social) => (
                                    <a
                                        key={social}
                                        href="#"
                                        className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 hover:bg-blue-500 hover:text-white transition-all transform hover:scale-110"
                                    >
                                        <span className="sr-only">{social}</span>
                                        <span className="capitalize text-xs">{social[0]}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 slide-up" style={{ animationDelay: '0.1s' }}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
                            Envoyez-nous un message
                        </h2>
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="first-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Prénom
                                    </label>
                                    <input
                                        type="text"
                                        id="first-name"
                                        className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Votre prénom"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="last-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Nom
                                    </label>
                                    <input
                                        type="text"
                                        id="last-name"
                                        className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Votre nom"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="vous@exemple.com"
                                />
                            </div>
                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Sujet
                                </label>
                                <select
                                    id="subject"
                                    className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option>Demande d'information</option>
                                    <option>Support technique</option>
                                    <option>Partenariat</option>
                                    <option>Autre</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    rows={4}
                                    className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Comment pouvons-nous vous aider ?"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium !text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                            >
                                <Send className="w-4 h-4" />
                                Envoyez le message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
