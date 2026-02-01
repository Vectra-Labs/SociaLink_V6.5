import { Link } from 'react-router-dom';

export default function MissionCard({ mission, isLocked = true }) {
    const categoryColors = {
        blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
        green: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
        purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
    };

    return (
        <div className="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-primary/30 transition-all overflow-hidden text-left">
            {/* Category and Urgent Badge - Visible */}
            <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${categoryColors[mission.categoryColor]}`}>
                    {mission.category}
                </span>
                {mission.urgent && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        Urgent
                    </span>
                )}
            </div>

            {/* Title - Visible */}
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                {mission.title}
            </h3>

            {/* Blurred Details Section */}
            <div className="relative">
                {/* Blur overlay - Only if Locked */}
                {isLocked && (
                    <div className="absolute inset-0 backdrop-blur-[6px] bg-white/60 dark:bg-slate-900/60 z-10 rounded-lg flex flex-col items-center justify-center text-center p-4">
                        <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
                            <span className="material-symbols-outlined text-slate-400">lock</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                            Détails masqués pour confidentialité
                        </p>
                        <Link
                            to="/register/worker"
                            className="text-xs font-bold text-primary hover:underline"
                        >
                            Inscrivez-vous pour voir →
                        </Link>
                    </div>
                )}

                {/* Hidden content (visible but blurred) */}
                <div className="space-y-2 mb-4 select-none pointer-events-none">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="material-symbols-outlined text-base">location_on</span>
                        <span className="bg-slate-200 dark:bg-slate-700 rounded px-2 text-transparent">
                            ████████, Maroc
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="material-symbols-outlined text-base">schedule</span>
                        <span className="bg-slate-200 dark:bg-slate-700 rounded px-2 text-transparent">
                            ███ ██ ████
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 select-none pointer-events-none">
                    <span className="bg-slate-200 dark:bg-slate-700 rounded px-2 text-sm font-semibold text-transparent">
                        ████████████
                    </span>
                    <span className="text-xs text-slate-400">{mission.postedAt}</span>
                </div>
            </div>
        </div>
    );
}
