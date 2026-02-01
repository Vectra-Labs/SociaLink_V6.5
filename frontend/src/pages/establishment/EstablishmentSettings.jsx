import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/client';
import {
    Settings, Bell, Lock, Eye, Globe,
    Save, Loader2, CheckCircle,
    AlertTriangle, ChevronRight, Shield, KeyRound,
    GripVertical, ArrowUp, ArrowDown
} from 'lucide-react';

export default function EstablishmentSettings() {
    const { user } = useAuth();
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Password change state
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Settings state
    const [settings, setSettings] = useState({
        emailNotifications: true,
        smsNotifications: false,
        newApplicationAlerts: true,
        missionUpdates: true,
        newsletterSubscription: false,
        profileVisibility: 'public',
        showPhone: true,
        showEmail: true,
        language: 'fr',
        darkMode: false
    });

    // Sidebar menu order state - draggable items only
    const [menuOrder, setMenuOrder] = useState([
        { id: 'missions', label: 'Mes Missions', fixed: false },
        { id: 'create', label: 'Publier Mission', fixed: false },
        { id: 'candidates', label: 'Candidatures', fixed: false },
        { id: 'search', label: 'Rechercher Talents', fixed: false },
        { id: 'messages', label: 'Messages', fixed: false },
    ]);
    const [draggedItem, setDraggedItem] = useState(null);

    // Auto-dismiss messages
    useEffect(() => {
        if (message.text) {
            const timer = setTimeout(() => setMessage({ type: '', text: '' }), 4000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleToggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setMessage({ type: 'success', text: 'Paramètres enregistrés avec succès !' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde.' });
        } finally {
            setSaving(false);
        }
    };

    // Drag and drop handlers
    const handleDragStart = (e, index) => {
        setDraggedItem(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (draggedItem === null || draggedItem === index) return;

        const newOrder = [...menuOrder];
        const draggedItemContent = newOrder[draggedItem];
        newOrder.splice(draggedItem, 1);
        newOrder.splice(index, 0, draggedItemContent);
        setMenuOrder(newOrder);
        setDraggedItem(index);
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
    };

    const moveItem = (index, direction) => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= menuOrder.length) return;

        const newOrder = [...menuOrder];
        [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
        setMenuOrder(newOrder);
    };

    // Password change handler
    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 6 caractères.' });
            return;
        }

        setPasswordLoading(true);
        try {
            await api.post('/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setMessage({ type: 'success', text: 'Mot de passe modifié avec succès !' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setShowPasswordForm(false);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Erreur lors du changement de mot de passe.' });
        } finally {
            setPasswordLoading(false);
        }
    };

    const SettingSection = ({ title, icon: Icon, children }) => (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Icon className="w-5 h-5 text-blue-600" />
                    {title}
                </h2>
            </div>
            <div className="p-6 space-y-4">
                {children}
            </div>
        </div>
    );

    const ToggleSetting = ({ label, description, value, onChange }) => (
        <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
            <div>
                <p className="font-medium text-slate-800">{label}</p>
                {description && <p className="text-sm text-slate-500">{description}</p>}
            </div>
            <button
                onClick={onChange}
                className={`relative w-12 h-6 rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-slate-200'}`}
            >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'left-7' : 'left-1'}`} />
            </button>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Paramètres</h1>
                    <p className="text-slate-500">Gérez les préférences de votre établissement</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                    {saving ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Enregistrement...</>
                    ) : (
                        <><Save className="w-4 h-4" /> Enregistrer</>
                    )}
                </button>
            </div>

            {/* Message */}
            {message.text && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Notifications */}
                <SettingSection title="Notifications" icon={Bell}>
                    <ToggleSetting
                        label="Notifications par email"
                        description="Recevez des alertes par email"
                        value={settings.emailNotifications}
                        onChange={() => handleToggle('emailNotifications')}
                    />
                    <ToggleSetting
                        label="Notifications SMS"
                        description="Recevez des alertes par SMS"
                        value={settings.smsNotifications}
                        onChange={() => handleToggle('smsNotifications')}
                    />
                    <ToggleSetting
                        label="Alertes nouvelles candidatures"
                        description="Soyez notifié des nouvelles candidatures sur vos missions"
                        value={settings.newApplicationAlerts}
                        onChange={() => handleToggle('newApplicationAlerts')}
                    />
                    <ToggleSetting
                        label="Mises à jour missions"
                        description="Notifications sur le statut de vos missions"
                        value={settings.missionUpdates}
                        onChange={() => handleToggle('missionUpdates')}
                    />
                    <ToggleSetting
                        label="Newsletter"
                        description="Recevez notre newsletter mensuelle"
                        value={settings.newsletterSubscription}
                        onChange={() => handleToggle('newsletterSubscription')}
                    />
                </SettingSection>

                {/* Confidentialité */}
                <SettingSection title="Confidentialité" icon={Eye}>
                    <div className="py-3 border-b border-slate-100">
                        <p className="font-medium text-slate-800 mb-2">Visibilité du profil</p>
                        <select
                            value={settings.profileVisibility}
                            onChange={(e) => setSettings(prev => ({ ...prev, profileVisibility: e.target.value }))}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="public">Public - Visible par tous les travailleurs</option>
                            <option value="limited">Limité - Visible par les travailleurs vérifiés uniquement</option>
                            <option value="private">Privé - Visible uniquement sur invitation</option>
                        </select>
                    </div>
                    <ToggleSetting
                        label="Afficher l'email de contact"
                        description="Permettre aux travailleurs de voir votre email"
                        value={settings.showEmail}
                        onChange={() => handleToggle('showEmail')}
                    />
                    <ToggleSetting
                        label="Afficher le téléphone"
                        description="Permettre aux travailleurs de voir votre numéro"
                        value={settings.showPhone}
                        onChange={() => handleToggle('showPhone')}
                    />
                </SettingSection>

                {/* Sécurité */}
                <SettingSection title="Sécurité" icon={Lock}>
                    {/* Password Change */}
                    <div className="py-3 border-b border-slate-100">
                        <button
                            onClick={() => setShowPasswordForm(!showPasswordForm)}
                            className="w-full flex items-center justify-between hover:bg-slate-50 -mx-6 px-6 py-2 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <KeyRound className="w-5 h-5 text-slate-400" />
                                <div className="text-left">
                                    <p className="font-medium text-slate-800">Modifier le mot de passe</p>
                                    <p className="text-sm text-slate-500">Changez votre mot de passe actuel</p>
                                </div>
                            </div>
                            <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${showPasswordForm ? 'rotate-90' : ''}`} />
                        </button>

                        {showPasswordForm && (
                            <form onSubmit={handlePasswordChange} className="mt-4 space-y-4 bg-slate-50 rounded-lg p-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Mot de passe actuel
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Nouveau mot de passe
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        placeholder="Min. 6 caractères"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Confirmer le nouveau mot de passe
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowPasswordForm(false);
                                            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                        }}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={passwordLoading}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                    >
                                        {passwordLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Modifier
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* 2FA */}
                    <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-slate-400" />
                            <div>
                                <p className="font-medium text-slate-800">Vérification en deux étapes</p>
                                <p className="text-sm text-slate-500">Ajoutez une couche de sécurité supplémentaire</p>
                            </div>
                        </div>
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">Bientôt</span>
                    </div>
                </SettingSection>

                {/* Préférences */}
                <SettingSection title="Préférences" icon={Globe}>
                    <div className="py-3 border-b border-slate-100">
                        <p className="font-medium text-slate-800 mb-2">Langue</p>
                        <select
                            value={settings.language}
                            onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="fr">Français</option>
                            <option value="ar">العربية</option>
                            <option value="en">English</option>
                        </select>
                    </div>
                    <ToggleSetting
                        label="Mode sombre"
                        description="Interface avec thème sombre"
                        value={settings.darkMode}
                        onChange={() => handleToggle('darkMode')}
                    />
                </SettingSection>
            </div>

            {/* Sidebar Customization */}
            <SettingSection title="Personnalisation du menu" icon={Settings}>
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                        Organisez les éléments de votre menu latéral selon vos préférences.
                        Glissez-déposez ou utilisez les flèches pour réorganiser.
                    </p>

                    <div className="bg-slate-50 rounded-lg p-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Ordre du menu</p>
                        <div className="space-y-2">
                            {/* Fixed items at top */}
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-100 border-slate-200">
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 flex items-center justify-center bg-slate-300 rounded text-xs font-bold text-slate-600">1</span>
                                    <span className="font-medium text-slate-500">Vue d'ensemble</span>
                                </div>
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                    <Lock className="w-3 h-3" /> Fixe
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-100 border-slate-200">
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 flex items-center justify-center bg-slate-300 rounded text-xs font-bold text-slate-600">2</span>
                                    <span className="font-medium text-slate-500">Mon Profil</span>
                                </div>
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                    <Lock className="w-3 h-3" /> Fixe
                                </span>
                            </div>

                            {/* Draggable items */}
                            {menuOrder.map((item, idx) => (
                                <div
                                    key={item.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, idx)}
                                    onDragOver={(e) => handleDragOver(e, idx)}
                                    onDragEnd={handleDragEnd}
                                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${draggedItem === idx
                                        ? 'bg-blue-50 border-blue-300 shadow-lg scale-[1.02]'
                                        : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'
                                        } cursor-grab active:cursor-grabbing`}
                                >
                                    <div className="flex items-center gap-3">
                                        <GripVertical className="w-4 h-4 text-slate-400" />
                                        <span className="w-6 h-6 flex items-center justify-center bg-blue-100 rounded text-xs font-bold text-blue-600">
                                            {idx + 3}
                                        </span>
                                        <span className="font-medium text-slate-800">{item.label}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => moveItem(idx, 'up')}
                                            disabled={idx === 0}
                                            className="p-1.5 hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                            title="Monter"
                                        >
                                            <ArrowUp className="w-4 h-4 text-slate-500" />
                                        </button>
                                        <button
                                            onClick={() => moveItem(idx, 'down')}
                                            disabled={idx === menuOrder.length - 1}
                                            className="p-1.5 hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                            title="Descendre"
                                        >
                                            <ArrowDown className="w-4 h-4 text-slate-500" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Fixed item at bottom */}
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-100 border-slate-200">
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 flex items-center justify-center bg-slate-300 rounded text-xs font-bold text-slate-600">8</span>
                                    <span className="font-medium text-slate-500">Paramètres</span>
                                </div>
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                    <Lock className="w-3 h-3" /> Fixe
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-blue-500 mt-3 text-center font-medium">
                            ✓ Glissez les éléments ou utilisez les flèches ↑↓
                        </p>
                    </div>
                </div>
            </SettingSection>

            {/* Account Info */}
            <div className="bg-slate-100 rounded-xl p-6">
                <h3 className="font-semibold text-slate-800 mb-4">Informations du compte</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                        <p className="text-slate-500">Email</p>
                        <p className="font-medium text-slate-800">{user?.email}</p>
                    </div>
                    <div>
                        <p className="text-slate-500">Statut du compte</p>
                        <p className="font-medium text-slate-800 flex items-center gap-1">
                            {user?.status === 'VALIDATED' ? (
                                <><Shield className="w-4 h-4 text-emerald-500" /> Vérifié</>
                            ) : (
                                <><AlertTriangle className="w-4 h-4 text-amber-500" /> En attente</>
                            )}
                        </p>
                    </div>
                    <div>
                        <p className="text-slate-500">Membre depuis</p>
                        <p className="font-medium text-slate-800">
                            {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                        </p>
                    </div>
                    <div>
                        <p className="text-slate-500">Dernière connexion</p>
                        <p className="font-medium text-slate-800">Aujourd'hui</p>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 className="font-semibold text-red-800 mb-2">Zone de danger</h3>
                <p className="text-sm text-red-600 mb-4">
                    Ces actions sont irréversibles. Procédez avec prudence.
                </p>
                <div className="flex gap-3">
                    <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium">
                        Désactiver mon compte
                    </button>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                        Supprimer mon compte
                    </button>
                </div>
            </div>
        </div>
    );
}
