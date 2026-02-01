import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CreditCard, Download, CheckCircle,
    Shield, Star, ArrowLeft
} from 'lucide-react';

const Billing = () => {
    const navigate = useNavigate();
    const [invoices] = useState([
        { id: 'INV-2024-001', date: '01/01/2026', amount: '499.00 MAD', status: 'Paid', plan: 'Premium Mensuel' },
        { id: 'INV-2023-012', date: '01/12/2025', amount: '499.00 MAD', status: 'Paid', plan: 'Premium Mensuel' },
    ]);

    return (
        <div className="max-w-6xl mx-auto pb-10">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/establishment/dashboard')}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Facturation & Abonnement</h1>
                    <p className="text-slate-500">Gérez votre abonnement et vos factures</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Current Plan */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Star className="w-48 h-48" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Actif</span>
                                <h2 className="text-2xl font-bold">Plan Premium Entreprise</h2>
                            </div>

                            <p className="text-slate-300 mb-8 max-w-lg">
                                Vous bénéficiez d'un accès illimité aux profils, de la mise en avant de vos missions et d'un support dédié 24/7.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <button className="px-6 py-3 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition-colors">
                                    Gérer l'abonnement
                                </button>
                                <button className="px-6 py-3 bg-slate-700/50 text-white font-medium rounded-xl hover:bg-slate-700 transition-colors border border-slate-600">
                                    Changer de moyen de paiement
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-slate-500" />
                            Moyen de paiement
                        </h3>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-8 bg-slate-200 rounded flex items-center justify-center text-xs font-bold text-slate-600">
                                    VISA
                                </div>
                                <div>
                                    <p className="font-medium text-slate-800">•••• •••• •••• 4242</p>
                                    <p className="text-xs text-slate-500">Expire le 12/28</p>
                                </div>
                            </div>
                            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                                Par défaut
                            </span>
                        </div>
                    </div>
                </div>

                {/* Invoices */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full">
                        <h3 className="font-semibold text-slate-800 mb-6">Historique des factures</h3>

                        <div className="space-y-4">
                            {invoices.map((inv) => (
                                <div key={inv.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                            <Download className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-800">{inv.plan}</p>
                                            <p className="text-xs text-slate-500">{inv.date} • {inv.id}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-slate-800">{inv.amount}</p>
                                        <span className="text-xs text-emerald-600 font-medium flex items-center justify-end gap-1">
                                            <CheckCircle className="w-3 h-3" /> Payé
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-6 py-2 text-sm text-slate-500 hover:text-slate-800 font-medium border-t border-slate-100 pt-4">
                            Voir tout l'historique
                        </button>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <div className="flex items-center gap-2 mb-2 text-slate-800 font-semibold">
                            <Shield className="w-5 h-5 text-emerald-600" />
                            Paiements sécurisés
                        </div>
                        <p className="text-sm text-slate-500">
                            Toutes vos transactions sont chiffrées et sécurisées. Nous ne stockons jamais vos coordonnées bancaires complètes.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Billing;
