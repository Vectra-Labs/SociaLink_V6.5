import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Loader2, Crown, ArrowRight } from 'lucide-react';
import api from '../../api/client';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [verified, setVerified] = useState(false);
    const [planCode, setPlanCode] = useState('');

    useEffect(() => {
        const sessionId = searchParams.get('session_id');
        if (sessionId) {
            verifyPayment(sessionId);
        } else {
            setLoading(false);
        }
    }, [searchParams]);

    const verifyPayment = async (sessionId) => {
        try {
            const { data } = await api.get(`/payments/verify/${sessionId}`);
            setVerified(data.success);
            setPlanCode(data.planCode || 'PREMIUM');
        } catch (error) {
            console.error('Verification error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600">Vérification du paiement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-12 h-12 text-emerald-600" />
                </div>

                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                    Paiement Réussi ! 🎉
                </h1>

                <p className="text-slate-600 mb-6">
                    Votre abonnement {planCode} a été activé avec succès.
                    Profitez de toutes les fonctionnalités premium !
                </p>

                <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 text-white mb-6">
                    <div className="flex items-center justify-center gap-2">
                        <Crown className="w-6 h-6" />
                        <span className="font-semibold">Compte {planCode} activé</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <Link
                        to="/dashboard"
                        className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                    >
                        Accéder à mon dashboard
                        <ArrowRight className="w-5 h-5" />
                    </Link>

                    <p className="text-sm text-slate-500">
                        Un email de confirmation vous a été envoyé.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
