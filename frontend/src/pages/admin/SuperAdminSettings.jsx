import { useState, useEffect } from 'react';
import {
    Settings, Save, Database, Sliders, Shield, AlertTriangle, RefreshCw, TrendingUp,
    Phone, Video, Crown, Zap, Moon, Globe, Palette
} from 'lucide-react';
import api from '../../api/client';

const SuperAdminSettings = () => {
    const [config, setConfig] = useState({
        commission_rate: "10",
        urgent_mission_fee: "30",
        matching_weight_skills: "40",
        matching_weight_distance: "30",
        matching_weight_rating: "30",
        support_email: "contact@socialink.ma",
        maintenance_mode: "false",
        max_active_applications_limit: "3",
        // Hero Stats
        hero_stat_experts: "1200",
        hero_stat_partenaires: "350",
        hero_stat_satisfaction: "98",
        // Premium Features
        feature_audio_calls: "false",
        feature_video_calls: "false",
        // UI Features
        ui_dark_mode_enabled: "true",
        ui_language_switch_enabled: "true"
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await api.get('/admin/settings');
            // Merge with defaults to ensure all keys exist
            setConfig(prev => ({ ...prev, ...data }));
        } catch (error) {
            console.error("Error loading settings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setConfig(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? String(checked) : value
        }));
    };

    const handleSliderChange = (name, value) => {
        // Adjust others to sum to 100? No, let's keep it simple weights for now.
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (config.maintenance_mode === 'true' && !window.confirm("Attention: Le mode maintenance va bloquer l'accès aux utilisateurs. Continuer ?")) {
            return;
        }
        setSaving(true);
        try {
            await api.put('/admin/settings', config);
            alert("Configuration sauvegardée avec succès !");
        } catch (error) {
            alert("Erreur lors de la sauvegarde.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Chargement de la configuration...</div>;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Configuration Système</h1>
                    <p className="text-slate-500">Gérez les variables globales de la plateforme.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-sm disabled:opacity-50 transition-all"
                >
                    {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Sauvegarder
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* FINANCE */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <div className="p-2 bg-green-100 text-green-600 rounded">
                            <Settings className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-900">Finance & Commissions</h3>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Commission standard (%)</label>
                        <input
                            name="commission_rate"
                            type="number"
                            value={config.commission_rate}
                            onChange={handleChange}
                            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <p className="text-xs text-slate-400 mt-1">Prélevée sur le budget des missions payées.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Frais Mission Urgente (+%)</label>
                        <input
                            name="urgent_mission_fee"
                            type="number"
                            value={config.urgent_mission_fee}
                            onChange={handleChange}
                            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                {/* ALGO MATCHING */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded">
                            <Sliders className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-900">Algorithme de Matching</h3>
                    </div>

                    {['skills', 'distance', 'rating'].map(criteria => (
                        <div key={criteria}>
                            <div className="flex justify-between mb-1">
                                <label className="text-sm font-medium text-slate-700 capitalize">Poids: {criteria}</label>
                                <span className="text-xs font-bold bg-slate-100 px-2 rounded text-slate-600">
                                    {config[`matching_weight_${criteria}`]}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0" max="100"
                                value={config[`matching_weight_${criteria}`]}
                                onChange={(e) => handleSliderChange(`matching_weight_${criteria}`, e.target.value)}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>
                    ))}
                    <p className="text-xs text-slate-400 italic">Ces poids influencent l'ordre d'affichage des travailleurs suggérés.</p>
                </div>

                {/* GENERAL */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <div className="p-2 bg-slate-100 text-slate-600 rounded">
                            <Database className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-900">Variables Globales</h3>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Support</label>
                        <input
                            name="support_email"
                            type="email"
                            value={config.support_email}
                            onChange={handleChange}
                            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <p className="text-xs text-slate-400 mt-1">Adresse affichée dans le pied de page et utilisée pour les notifications système.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Limite candidatures (Gratuit)</label>
                        <input
                            name="max_active_applications_limit"
                            type="number"
                            value={config.max_active_applications_limit}
                            onChange={handleChange}
                            className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <p className="text-xs text-slate-400 mt-1">Définit combien de missions un utilisateur standard peut postuler simultanément. (Modifiable sans redéployer le site).</p>
                    </div>
                </div>

                {/* MAINTENANCE & AVAILABILITY */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <div className="p-2 bg-amber-100 text-amber-600 rounded">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-900">Maintenance & Disponibilité</h3>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 transition-colors hover:bg-slate-50">
                        <div>
                            <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                Mode Maintenance
                                {config.maintenance_mode === 'true' && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-wider">Actif</span>}
                            </h4>
                            <p className="text-xs text-slate-500">Si activé, le site sera inaccessible au public.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="maintenance_mode"
                                checked={config.maintenance_mode === 'true'}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                        </label>
                    </div>
                </div>

                {/* PREMIUM FEATURES */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded">
                            <Crown className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Fonctionnalités Premium</h3>
                            <p className="text-xs text-slate-500">Activez/désactivez les fonctionnalités réservées aux abonnés</p>
                        </div>
                    </div>

                    {/* Audio Calls Toggle */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                    Appels Audio
                                    {config.feature_audio_calls === 'true' && <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full uppercase tracking-wider">Actif</span>}
                                </h4>
                                <p className="text-xs text-slate-500">Permet aux abonnés premium de passer des appels vocaux via la messagerie.</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="feature_audio_calls"
                                checked={config.feature_audio_calls === 'true'}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    {/* Video Calls Toggle */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                <Video className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                    Appels Vidéo
                                    {config.feature_video_calls === 'true' && <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full uppercase tracking-wider">Actif</span>}
                                </h4>
                                <p className="text-xs text-slate-500">Permet aux abonnés premium de passer des appels vidéo via la messagerie.</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="feature_video_calls"
                                checked={config.feature_video_calls === 'true'}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex items-start gap-2">
                            <Zap className="w-4 h-4 text-amber-600 mt-0.5" />
                            <div>
                                <p className="text-xs font-medium text-amber-800">Note importante</p>
                                <p className="text-xs text-amber-700">L'implémentation WebRTC des appels sera ajoutée dans une future mise à jour. Ces toggles préparent l'infrastructure.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* UI FEATURES */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-cyan-500 text-white rounded">
                            <Palette className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Fonctionnalités Interface</h3>
                            <p className="text-xs text-slate-500">Contrôlez les options UI visibles pour tous les utilisateurs</p>
                        </div>
                    </div>

                    {/* Dark Mode Toggle */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-800 text-amber-400 rounded-lg">
                                <Moon className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                    Mode Sombre
                                    {config.ui_dark_mode_enabled === 'true' && <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full uppercase tracking-wider">Actif</span>}
                                </h4>
                                <p className="text-xs text-slate-500">Affiche le bouton de basculement jour/nuit dans la navbar.</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="ui_dark_mode_enabled"
                                checked={config.ui_dark_mode_enabled === 'true'}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>

                    {/* Language Switcher Toggle */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-cyan-100 text-cyan-600 rounded-lg">
                                <Globe className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                    Sélecteur de Langue
                                    {config.ui_language_switch_enabled === 'true' && <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full uppercase tracking-wider">Actif</span>}
                                </h4>
                                <p className="text-xs text-slate-500">Affiche le bouton de changement de langue (FR/EN/AR) dans la navbar.</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="ui_language_switch_enabled"
                                checked={config.ui_language_switch_enabled === 'true'}
                                onChange={handleChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                        </label>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-2">
                            <Zap className="w-4 h-4 text-blue-600 mt-0.5" />
                            <div>
                                <p className="text-xs font-medium text-blue-800">Effet immédiat</p>
                                <p className="text-xs text-blue-700">Les changements seront visibles après rafraîchissement de la page par les utilisateurs.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* HERO STATS */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 md:col-span-2">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Statistiques Hero (Page d'accueil)</h3>
                            <p className="text-xs text-slate-500">Ces chiffres sont affichés sur la page d'accueil publique.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Experts Vérifiés</label>
                            <div className="relative">
                                <input
                                    name="hero_stat_experts"
                                    type="number"
                                    value={config.hero_stat_experts}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-8"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">+</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">Affiché: {Number(config.hero_stat_experts).toLocaleString('fr-FR')}+</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Partenaires</label>
                            <div className="relative">
                                <input
                                    name="hero_stat_partenaires"
                                    type="number"
                                    value={config.hero_stat_partenaires}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-8"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">+</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">Affiché: {Number(config.hero_stat_partenaires).toLocaleString('fr-FR')}+</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Satisfaction (%)</label>
                            <div className="relative">
                                <input
                                    name="hero_stat_satisfaction"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={config.hero_stat_satisfaction}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-8"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">%</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">Affiché: {config.hero_stat_satisfaction}%</p>
                        </div>
                    </div>
                </div>

                {/* DEMO ZONE */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 md:col-span-2">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <div className="p-2 bg-pink-100 text-pink-600 rounded">
                            <Sliders className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Zone de Démo & Tests</h3>
                            <p className="text-xs text-slate-500">Outils pour faciliter la démonstration de la plateforme.</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div>
                            <h4 className="font-bold text-slate-900">Générer Données de Démo</h4>
                            <p className="text-xs text-slate-500">Crée 5 travailleurs, 3 établissements et 10 missions instantanément.</p>
                        </div>
                        <button
                            onClick={async () => {
                                if(!window.confirm("Êtes-vous sûr ? Cela va créer des utilisateurs de démo.")) return;
                                try {
                                    setSaving(true);
                                    const { data } = await api.post('/admin/seed-demo-data');
                                    alert(data.message);
                                } catch (err) {
                                    alert("Erreur: " + (err.response?.data?.message || err.message));
                                } finally {
                                    setSaving(false);
                                }
                            }}
                            className="px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors shadow-sm"
                        >
                            Lancer le Seeder
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SuperAdminSettings;
