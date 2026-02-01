import { useState, useEffect } from 'react';
import {
    Settings, Save, Users, Building2, Shield, RefreshCw,
    Clock, Eye, Zap, CreditCard, Percent, AlertCircle,
    ChevronDown, ChevronUp, Check
} from 'lucide-react';
import api from '../../api/client';

const SuperAdminPrivileges = () => {
    const [activeTab, setActiveTab] = useState('workers');
    const [privileges, setPrivileges] = useState({});
    const [defaults, setDefaults] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        limits: true,
        monetization: true,
        other: false
    });

    useEffect(() => {
        fetchPrivileges();
    }, []);

    const fetchPrivileges = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/privileges');
            setPrivileges(data.data || {});
            setDefaults(data.defaults || {});
        } catch (error) {
            console.error("Error loading privileges", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key, value) => {
        setPrivileges(prev => ({ ...prev, [key]: value }));
        setSaveSuccess(false);
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveSuccess(false);
        try {
            // Determine category based on active tab
            const category = activeTab.toUpperCase().replace('S', '');
            await api.put('/privileges', {
                updates: privileges,
                category
            });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            alert("Erreur lors de la sauvegarde.");
        } finally {
            setSaving(false);
        }
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const renderNumberInput = (key, label, description, min = 0, max = 100) => (
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
                <label className="font-medium text-slate-800">{label}</label>
                <input
                    type="number"
                    min={min}
                    max={max}
                    value={privileges[key] ?? defaults[key] ?? 0}
                    onChange={(e) => handleChange(key, parseInt(e.target.value))}
                    className="w-24 px-3 py-2 border border-slate-200 rounded-lg text-center font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>
            <p className="text-xs text-slate-500">{description}</p>
        </div>
    );

    const renderToggle = (key, label, description) => (
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <label className="font-medium text-slate-800">{label}</label>
                    <p className="text-xs text-slate-500 mt-1">{description}</p>
                </div>
                <button
                    onClick={() => handleChange(key, !(privileges[key] ?? defaults[key]))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${(privileges[key] ?? defaults[key])
                            ? 'bg-blue-600'
                            : 'bg-slate-300'
                        }`}
                >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${(privileges[key] ?? defaults[key]) ? 'left-7' : 'left-1'
                        }`} />
                </button>
            </div>
        </div>
    );

    const renderSelect = (key, label, description, options) => (
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
                <label className="font-medium text-slate-800">{label}</label>
                <select
                    value={privileges[key] ?? defaults[key] ?? options[0].value}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-lg bg-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                >
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
            <p className="text-xs text-slate-500">{description}</p>
        </div>
    );

    const renderSection = (title, icon, sectionKey, children) => (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-4">
            <button
                onClick={() => toggleSection(sectionKey)}
                className="w-full p-4 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
            >
                <div className="flex items-center gap-3">
                    {icon}
                    <h3 className="font-bold text-slate-800">{title}</h3>
                </div>
                {expandedSections[sectionKey]
                    ? <ChevronUp className="w-5 h-5 text-slate-400" />
                    : <ChevronDown className="w-5 h-5 text-slate-400" />
                }
            </button>
            {expandedSections[sectionKey] && (
                <div className="p-4 space-y-4">
                    {children}
                </div>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="p-8 text-center text-slate-500">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                Chargement des privilèges...
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Contrôle des Privilèges</h1>
                    <p className="text-slate-500">Gérez les limitations et accès par type d'utilisateur.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold shadow-sm transition-all ${saveSuccess
                            ? 'bg-green-600 text-white'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        } disabled:opacity-50`}
                >
                    {saving ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : saveSuccess ? (
                        <Check className="w-5 h-5" />
                    ) : (
                        <Save className="w-5 h-5" />
                    )}
                    {saveSuccess ? 'Sauvegardé!' : 'Sauvegarder'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 pb-4">
                {[
                    { id: 'workers', label: 'Travailleurs', icon: <Users className="w-4 h-4" /> },
                    { id: 'establishments', label: 'Établissements', icon: <Building2 className="w-4 h-4" /> },
                    { id: 'admins', label: 'Admins', icon: <Shield className="w-4 h-4" /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${activeTab === tab.id
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* WORKERS Tab */}
            {activeTab === 'workers' && (
                <div>
                    {renderSection(
                        'Limites Compte Gratuit',
                        <Eye className="w-5 h-5 text-blue-600" />,
                        'limits',
                        <>
                            {renderNumberInput(
                                'worker_free_missions_limit',
                                'Missions visibles',
                                'Nombre maximum de missions visibles pour un compte gratuit',
                                1, 50
                            )}
                            {renderNumberInput(
                                'worker_visibility_delay_hours',
                                'Délai de visibilité (heures)',
                                'Les missions récentes sont masquées pendant ce délai pour les non-premium',
                                0, 168
                            )}
                            {renderNumberInput(
                                'worker_free_applications_limit',
                                'Candidatures simultanées max',
                                'Nombre de candidatures actives en même temps pour compte gratuit',
                                1, 20
                            )}
                            {renderToggle(
                                'worker_urgent_access_premium_only',
                                'Missions urgentes réservées Premium',
                                'Si activé, seuls les utilisateurs Premium voient les missions urgentes'
                            )}
                        </>
                    )}

                    {renderSection(
                        'Monétisation',
                        <CreditCard className="w-5 h-5 text-green-600" />,
                        'monetization',
                        <>
                            {renderSelect(
                                'worker_monetization_mode',
                                'Mode de monétisation',
                                'Définit comment les travailleurs paient pour accéder aux fonctionnalités',
                                [
                                    { value: 'SUBSCRIPTION', label: 'Abonnement mensuel' },
                                    { value: 'CREDITS', label: 'Crédits / Tokens' },
                                    { value: 'COMMISSION', label: 'Commission sur mission' }
                                ]
                            )}
                            {(privileges.worker_monetization_mode === 'CREDITS' ||
                                defaults.worker_monetization_mode === 'CREDITS') &&
                                renderNumberInput(
                                    'worker_credits_per_application',
                                    'Crédits par candidature',
                                    'Nombre de crédits déduits à chaque postulation',
                                    1, 10
                                )
                            }
                            {(privileges.worker_monetization_mode === 'COMMISSION' ||
                                defaults.worker_monetization_mode === 'COMMISSION') &&
                                renderNumberInput(
                                    'worker_mission_commission_rate',
                                    'Taux de commission (%)',
                                    'Pourcentage prélevé sur le budget de la mission acceptée',
                                    1, 30
                                )
                            }
                        </>
                    )}

                    {renderSection(
                        'Affichage Homepage',
                        <Settings className="w-5 h-5 text-slate-600" />,
                        'other',
                        <>
                            {renderNumberInput(
                                'worker_completed_missions_homepage',
                                'Missions terminées affichées',
                                'Nombre de cartes "Missions Terminées" sur la homepage',
                                1, 10
                            )}
                        </>
                    )}
                </div>
            )}

            {/* ESTABLISHMENTS Tab */}
            {activeTab === 'establishments' && (
                <div>
                    {renderSection(
                        'Limites Compte Gratuit',
                        <Eye className="w-5 h-5 text-blue-600" />,
                        'limits',
                        <>
                            {renderNumberInput(
                                'estab_free_missions_limit',
                                'Missions actives max',
                                'Nombre maximum de missions actives pour un établissement gratuit',
                                1, 20
                            )}
                            {renderNumberInput(
                                'estab_free_applications_limit',
                                'Candidatures reçues max/mois',
                                'Limite de candidatures visibles par mois pour compte gratuit',
                                5, 100
                            )}
                            {renderToggle(
                                'estab_urgent_free_allowed',
                                'Publication urgente autorisée (gratuit)',
                                'Si activé, les comptes gratuits peuvent publier des missions urgentes'
                            )}
                        </>
                    )}

                    {renderSection(
                        'Monétisation',
                        <CreditCard className="w-5 h-5 text-green-600" />,
                        'monetization',
                        <>
                            {renderSelect(
                                'estab_monetization_mode',
                                'Mode de monétisation',
                                'Définit comment les établissements paient pour les fonctionnalités',
                                [
                                    { value: 'SUBSCRIPTION', label: 'Abonnement mensuel' },
                                    { value: 'CREDITS', label: 'Crédits par mission' },
                                    { value: 'COMMISSION', label: 'Commission sur recrutement' }
                                ]
                            )}
                            {(privileges.estab_monetization_mode === 'CREDITS' ||
                                defaults.estab_monetization_mode === 'CREDITS') && (
                                    <>
                                        {renderNumberInput(
                                            'estab_credits_per_mission',
                                            'Crédits par mission',
                                            'Crédits déduits à chaque publication de mission',
                                            1, 10
                                        )}
                                        {renderNumberInput(
                                            'estab_credits_urgent_mission',
                                            'Crédits mission urgente',
                                            'Crédits supplémentaires pour une mission urgente',
                                            1, 10
                                        )}
                                    </>
                                )}
                            {(privileges.estab_monetization_mode === 'COMMISSION' ||
                                defaults.estab_monetization_mode === 'COMMISSION') &&
                                renderNumberInput(
                                    'estab_recruitment_commission',
                                    'Commission recrutement (%)',
                                    'Pourcentage prélevé lorsqu\'un candidat est accepté',
                                    1, 30
                                )
                            }
                        </>
                    )}
                </div>
            )}

            {/* ADMINS Tab */}
            {activeTab === 'admins' && (
                <div>
                    {renderSection(
                        'Permissions Admin',
                        <Shield className="w-5 h-5 text-purple-600" />,
                        'limits',
                        <>
                            {renderNumberInput(
                                'admin_daily_validation_quota',
                                'Quota validations/jour',
                                '0 = illimité. Limite le nombre de validations par admin par jour.',
                                0, 100
                            )}
                            {renderToggle(
                                'admin_can_edit_finances',
                                'Accès édition finances',
                                'Permet aux Admins (non SuperAdmin) de modifier les paramètres financiers'
                            )}
                        </>
                    )}

                    {renderSection(
                        'Paramètres Globaux',
                        <Settings className="w-5 h-5 text-slate-600" />,
                        'other',
                        <>
                            {renderNumberInput(
                                'review_period_days',
                                'Période d\'avis (jours)',
                                'Durée pendant laquelle un avis peut être laissé après une mission',
                                1, 30
                            )}
                            {renderToggle(
                                'urgent_missions_enabled',
                                'Missions urgentes activées',
                                'Active/désactive globalement la fonctionnalité missions urgentes'
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Info Banner */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm text-blue-800 font-medium">Cache automatique</p>
                    <p className="text-xs text-blue-600">
                        Les modifications sont mises en cache pendant 5 minutes pour optimiser les performances.
                        Les changements seront effectifs pour tous les utilisateurs après ce délai.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminPrivileges;
