import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIFeatures } from '../context/UIFeaturesContext';
import { Globe, Check } from 'lucide-react';

const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ar', name: 'العربية', flag: '🇲🇦' },
];

const LanguageSwitcher = ({ className = '' }) => {
    const { i18n } = useTranslation();
    const { languageSwitchEnabled } = useUIFeatures();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const changeLanguage = (langCode) => {
        i18n.changeLanguage(langCode);
        setIsOpen(false);
    };

    // Don't render if language switch feature is disabled by Super Admin
    if (!languageSwitchEnabled) {
        return null;
    }

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
                aria-label="Changer de langue"
            >
                <Globe className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{currentLang.flag}</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${i18n.language === lang.code ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                                }`}
                        >
                            <span className="text-lg">{lang.flag}</span>
                            <span className={`flex-1 text-sm ${i18n.language === lang.code
                                ? 'font-semibold text-blue-600 dark:text-blue-400'
                                : 'text-slate-700 dark:text-slate-300'
                                }`}>
                                {lang.name}
                            </span>
                            {i18n.language === lang.code && (
                                <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;
