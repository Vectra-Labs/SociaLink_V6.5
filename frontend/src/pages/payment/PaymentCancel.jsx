import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCcw } from 'lucide-react';

const PaymentCancel = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-12 h-12 text-red-500" />
                </div>

                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                    Paiement Annulé
                </h1>

                <p className="text-slate-600 mb-6">
                    Votre paiement a été annulé. Aucun montant n'a été prélevé.
                    Vous pouvez réessayer à tout moment.
                </p>

                <div className="space-y-3">
                    <Link
                        to="/pricing"
                        className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                    >
                        <RefreshCcw className="w-5 h-5" />
                        Réessayer
                    </Link>

                    <Link
                        to="/dashboard"
                        className="flex items-center justify-center gap-2 w-full py-3 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Retour au dashboard
                    </Link>
                </div>

                <p className="text-sm text-slate-500 mt-6">
                    Besoin d'aide ? <a href="/contact" className="text-emerald-600 hover:underline">Contactez-nous</a>
                </p>
            </div>
        </div>
    );
};

export default PaymentCancel;
