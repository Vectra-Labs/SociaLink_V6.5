import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, ArrowRight, Loader, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import axios from "axios";

// API Config
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const VerifyEmail = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Get email from nav state or query param
    const emailFromState = location.state?.email;

    const [email, setEmail] = useState(emailFromState || "");
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [resendCooldown, setResendCooldown] = useState(0);

    // Handle input change for 6-digit code
    const handleChange = (index, value) => {
        if (value.length > 1) return; // Prevent pasting multiple chars (simple version)

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            document.getElementById(`code-input-${index + 1}`).focus();
        }
    };

    // Handle backspace
    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            document.getElementById(`code-input-${index - 1}`).focus();
        }
    };

    // Verify Function
    const handleVerify = async (e) => {
        e.preventDefault();
        setError("");

        const verificationCode = code.join("");
        if (verificationCode.length !== 6) {
            setError("Veuillez saisir le code à 6 chiffres.");
            return;
        }

        setIsLoading(true);

        try {
            const res = await axios.post(`${API_URL}/auth/verify-email`, {
                email,
                code: verificationCode
            });

            setSuccess("Email vérifié avec succès ! Redirection...");

            // Wait for 1.5s then redirect
            setTimeout(() => {
                // If token provided, save it (auto login)
                // Note: The backend should ideally set the cookie, but if it returns token in body:
                // Wait, useContext update? For now, let's redirect to login to be safe unless we update global auth context.
                // Actually, best flow: Redirect to Login page with a success message, let user log in. 
                // Updating Context directly here is complex without access to it.
                // Wait, backend login returns token. 
                // Let's redirect to /login
                navigate("/login", { state: { message: "Compte vérifié ! Vous pouvez vous connecter." } });
            }, 1500);

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Échec de la vérification.");
        } finally {
            setIsLoading(false);
        }
    };

    // Resend OTP
    const handleResend = async () => {
        if (resendCooldown > 0) return;

        try {
            await axios.post(`${API_URL}/auth/resend-otp`, { email });
            setSuccess("Un nouveau code a été envoyé.");
            setResendCooldown(60); // 60 seconds cooldown
            setError("");
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors du renvoi.");
        }
    };

    // Cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    if (!email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center p-8">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-900">Email manquant</h2>
                    <p className="text-slate-600 mb-6">Aucune adresse email spécifiée pour la vérification.</p>
                    <Link to="/login" className="text-blue-600 hover:underline">Retour à la connexion</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Vérifiez votre email</h1>
                    <p className="text-slate-500 mt-2 text-sm">
                        Nous avons envoyé un code à <br />
                        <span className="font-semibold text-slate-800">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                    {/* OTP Inputs */}
                    <div className="flex justify-center gap-2">
                        {code.map((digit, idx) => (
                            <input
                                key={idx}
                                id={`code-input-${idx}`}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleChange(idx, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(idx, e)}
                                className="w-10 h-12 md:w-12 md:h-14 text-center text-xl font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                            />
                        ))}
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            {success}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                Vérification...
                            </>
                        ) : (
                            <>
                                Vérifier mon compte
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                {/* Resend Link */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-slate-500 mb-2">Vous n'avez pas reçu le code ?</p>
                    <button
                        onClick={handleResend}
                        disabled={resendCooldown > 0}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2 mx-auto disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                        {resendCooldown > 0 ? (
                            <span>Renvoyer dans {resendCooldown}s</span>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4" />
                                Renvoyer le code
                            </>
                        )}
                    </button>
                </div>

                <div className="mt-6 text-center border-t border-slate-100 pt-4">
                    <Link to="/login" className="text-xs text-slate-400 hover:text-slate-600">
                        Retour à la connexion
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
