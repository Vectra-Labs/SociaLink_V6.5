import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const UIFeaturesContext = createContext(null);

export const useUIFeatures = () => {
    const context = useContext(UIFeaturesContext);
    if (!context) {
        // Return defaults if used outside provider (shouldn't happen)
        return { darkModeEnabled: true, languageSwitchEnabled: true, loading: false };
    }
    return context;
};

export const UIFeaturesProvider = ({ children }) => {
    const [features, setFeatures] = useState({
        darkModeEnabled: true,
        languageSwitchEnabled: true
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUIFeatures = async () => {
            try {
                const { data } = await api.get('/public/ui-features');
                setFeatures({
                    darkModeEnabled: data.dark_mode_enabled,
                    languageSwitchEnabled: data.language_switch_enabled
                });
            } catch (error) {
                console.warn('Could not fetch UI features, using defaults:', error);
                // Keep defaults (enabled) on error
            } finally {
                setLoading(false);
            }
        };

        fetchUIFeatures();
    }, []);

    return (
        <UIFeaturesContext.Provider value={{ ...features, loading }}>
            {children}
        </UIFeaturesContext.Provider>
    );
};

export default UIFeaturesContext;
