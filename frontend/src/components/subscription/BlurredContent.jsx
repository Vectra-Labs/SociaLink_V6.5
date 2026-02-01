import { Link } from 'react-router-dom';
import { Lock, Sparkles } from 'lucide-react';

/**
 * BlurredContent - Affiche du contenu flouté avec CTA abonnement
 * 
 * @param {React.ReactNode} children - Contenu à flouter
 * @param {string} message - Message à afficher
 * @param {string} ctaText - Texte du bouton CTA
 * @param {string} ctaLink - Lien du bouton CTA
 */
export default function BlurredContent({
    children,
    message = 'Contenu réservé aux abonnés',
    ctaText = "S'abonner",
    ctaLink = '/pricing',
    className = ''
}) {
    return (
        <div className={`relative overflow-hidden rounded-xl ${className}`}>
            {/* Contenu flouté */}
            <div className="blur-[6px] pointer-events-none select-none opacity-60">
                {children}
            </div>

            {/* Overlay avec CTA */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-white/90 via-white/70 to-transparent dark:from-slate-900/90 dark:via-slate-900/70 p-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 text-center max-w-sm">
                    {/* Icône */}
                    <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-6 h-6" />
                    </div>

                    {/* Message */}
                    <p className="text-slate-700 dark:text-slate-300 font-medium mb-4">
                        {message}
                    </p>

                    {/* CTA Button */}
                    <Link
                        to={ctaLink}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
                    >
                        <Sparkles className="w-4 h-4" />
                        {ctaText}
                    </Link>

                    {/* Lien secondaire */}
                    <p className="text-xs text-slate-400 mt-3">
                        Débloquez toutes les fonctionnalités
                    </p>
                </div>
            </div>
        </div>
    );
}
