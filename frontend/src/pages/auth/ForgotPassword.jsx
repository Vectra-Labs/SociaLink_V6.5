import React, { useState } from 'react';
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // In a real app, this would be an API call
    const API_URL = 'http://localhost:5001/api';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Une erreur est survenue');
            }

            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-xl border-t-4 border-t-blue-600 overflow-hidden">
                <div className="p-6 text-center space-y-2 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900">Mot de passe oublié ?</h2>
                    <p className="text-gray-500 text-sm">
                        Entrez votre email pour recevoir un lien de réinitialisation.
                    </p>
                </div>

                <div className="p-6">
                    {success ? (
                        <div className="text-center space-y-6 py-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-gray-900">Email envoyé !</h3>
                                <p className="text-sm text-gray-600">
                                    Si un compte existe avec cet email, vous recevrez un lien de réinitialisation dans quelques instants.
                                </p>
                            </div>
                            <Link to="/login" className="block w-full text-center py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors font-medium">
                                Retour à la connexion
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email professionnel</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="exemple@domaine.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11 rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Envoi...
                                    </>
                                ) : (
                                    "Envoyer le lien"
                                )}
                            </button>

                            <div className="text-center pt-2">
                                <Link to="/login" className="text-sm text-gray-600 hover:text-blue-600 flex items-center justify-center gap-2 transition-colors">
                                    <ArrowLeft className="w-4 h-4" />
                                    Retour à la connexion
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
