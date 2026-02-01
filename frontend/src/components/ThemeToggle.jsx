import { useTheme } from '../context/ThemeContext';
import { useUIFeatures } from '../context/UIFeaturesContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ className = '' }) => {
    const { isDark, toggleTheme } = useTheme();
    const { darkModeEnabled } = useUIFeatures();

    // Don't render if dark mode feature is disabled by Super Admin
    if (!darkModeEnabled) {
        return null;
    }

    return (
        <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-all duration-300 ${isDark
                ? 'bg-slate-700 text-amber-400 hover:bg-slate-600'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                } ${className}`}
            aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
            title={isDark ? 'Mode clair' : 'Mode sombre'}
        >
            {isDark ? (
                <Sun className="w-5 h-5" />
            ) : (
                <Moon className="w-5 h-5" />
            )}
        </button>
    );
};

export default ThemeToggle;

