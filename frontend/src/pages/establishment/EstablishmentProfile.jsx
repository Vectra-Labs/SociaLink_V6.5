
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/client';
import {
    Building2, CheckCircle, MapPin, Mail, Phone, Globe,
    Edit2, Save, X, Loader2, AlertCircle, Shield, Clock,
    History, Users, Briefcase, Award, Calendar, Camera, ImagePlus
} from 'lucide-react';
import LocationMap from '../../components/ui/LocationMap';

export default function EstablishmentProfile() {
    const { user } = useAuth();

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({});
    const [cities, setCities] = useState([]);

    // Photo & Banner Upload State
    const [logoPreview, setLogoPreview] = useState(null);
    const [logoFile, setLogoFile] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        contact_first_name: '',
        contact_last_name: '',
        phone: '',
        address: '',
        website: '',
        description: '',
        founding_year: '',
        employee_count: '',
        city_id: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setError(null);
            const [profileRes, statsRes, citiesRes] = await Promise.all([
                api.get('/establishment/profile'),
                api.get('/establishment/stats'),
                api.get('/general/cities').catch(() => ({ data: { data: [] } }))
            ]);

            const profileData = profileRes.data.data;
            setProfile(profileData);
            setStats(statsRes.data.data || {});
            setCities(citiesRes.data.data || []);

            setFormData({
                name: profileData.name || '',
                contact_first_name: profileData.contact_first_name || '',
                contact_last_name: profileData.contact_last_name || '',
                phone: profileData.phone || '',
                address: profileData.address || '',
                website: profileData.website || '',
                description: profileData.description || '',
                founding_year: profileData.founding_year || '',
                employee_count: profileData.employee_count || '',
                city_id: profileData.city_id || ''
            });
        } catch (err) {
            console.error('Failed to load profile:', err);
            setError("Impossible de charger le profil.");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError("Le logo ne doit pas dépasser 5 Mo");
                return;
            }
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleBannerChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError("La bannière ne doit pas dépasser 5 Mo");
                return;
            }
            setBannerFile(file);
            setBannerPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSuccessMsg('');

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined) {
                    data.append(key, formData[key]);
                }
            });
            if (logoFile) {
                data.append('logo', logoFile);
            }
            if (bannerFile) {
                data.append('banner', bannerFile);
            }

            const res = await api.put('/establishment/profile/update', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProfile(res.data.data);
            setLogoFile(null);
            setBannerFile(null);
            setSuccessMsg("Profil mis à jour avec succès !");
            setIsEditing(false);
            loadData();
        } catch (err) {
            console.error("Update failed:", err);
            setError("Erreur lors de la mise à jour du profil.");
        } finally {
            setSaving(false);
        }
    };

    const toggleEdit = () => {
        if (isEditing) {
            // Cancel - reset form
            setFormData({
                name: profile.name || '',
                contact_first_name: profile.contact_first_name || '',
                contact_last_name: profile.contact_last_name || '',
                phone: profile.phone || '',
                address: profile.address || '',
                website: profile.website || '',
                description: profile.description || '',
                founding_year: profile.founding_year || '',
                employee_count: profile.employee_count || '',
                city_id: profile.city_id || ''
            });
            setLogoPreview(null);
            setLogoFile(null);
            setBannerPreview(null);
            setBannerFile(null);
            setError(null);
        }
        setIsEditing(!isEditing);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!profile) return null;

    const isVerified = user?.status === 'VALIDATED';

    return (
        <div className="min-h-screen bg-slate-50/50 pb-10">
            {/* Feedback Messages */}
            {error && (
                <div className="mb-4">
                    <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" /> {error}
                    </div>
                </div>
            )}
            {successMsg && (
                <div className="mb-4">
                    <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" /> {successMsg}
                    </div>
                </div>
            )}

            {/* HERO SECTION */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                {/* Banner - Uploadable */}
                <div className="h-32 sm:h-40 bg-gradient-to-r from-blue-600 to-indigo-600 relative group">
                    {/* Banner Image */}
                    {(bannerPreview || profile.banner_url) ? (
                        <img
                            src={bannerPreview || profile.banner_url}
                            alt="Bannière"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    )}

                    {/* Upload Overlay - Only in Edit Mode */}
                    {isEditing && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <div className="text-center text-white">
                                <ImagePlus className="w-8 h-8 mx-auto mb-2" />
                                <p className="text-sm font-medium">Changer la bannière</p>
                                <p className="text-xs opacity-75">Max 5 Mo • 1200×300 recommandé</p>
                            </div>
                            <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                accept="image/*"
                                onChange={handleBannerChange}
                            />
                        </div>
                    )}
                </div>

                <div className="px-8 pb-6 relative">
                    <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 mb-4 gap-6">
                        {/* Logo - Circular */}
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full border-4 border-white bg-slate-100 overflow-hidden shadow-lg relative flex items-center justify-center">
                                {(logoPreview || profile.logo_url) ? (
                                    <img src={logoPreview || profile.logo_url} alt={profile.name} className="w-full h-full object-cover" />
                                ) : (
                                    <Building2 className="w-12 h-12 text-blue-600" />
                                )}
                                {/* Overlay for Edit Mode */}
                                {isEditing && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <Camera className="w-8 h-8 text-white" />
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            accept="image/*"
                                            onChange={handleLogoChange}
                                        />
                                    </div>
                                )}
                            </div>
                            {isVerified && !isEditing && (
                                <div className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow-sm" title="Établissement vérifié">
                                    <CheckCircle className="w-6 h-6 text-emerald-500 fill-emerald-50" />
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 pt-12 md:pt-0">
                            {isEditing ? (
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Nom de l'établissement"
                                    className="text-2xl font-bold p-2 border border-slate-300 rounded-lg w-full max-w-md focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            ) : (
                                <>
                                    <h1 className="text-2xl font-bold text-slate-900 mb-1">{profile.name || 'Mon Établissement'}</h1>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4 text-slate-400" />
                                            {profile.city?.name || 'Maroc'}
                                        </div>
                                        {profile.service && (
                                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                                {profile.service}
                                            </span>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            {isEditing ? (
                                <>
                                    <button onClick={toggleEdit} disabled={saving} className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium flex items-center gap-2">
                                        <X className="w-4 h-4" /> Annuler
                                    </button>
                                    <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2">
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Enregistrer
                                    </button>
                                </>
                            ) : (
                                <button onClick={toggleEdit} className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2">
                                    <Edit2 className="w-4 h-4" /> Modifier
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT COLUMN */}
                <div className="space-y-6">
                    {/* Status */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Shield className="w-5 h-5 text-blue-600" />
                            <h3 className="font-bold text-slate-900">Statut de Vérification</h3>
                        </div>
                        <div className={`rounded - xl p - 4 border ${isVerified ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'} `}>
                            <div className="flex items-start gap-3">
                                {isVerified ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <Clock className="w-5 h-5 text-amber-600" />}
                                <div>
                                    <p className={`font - bold ${isVerified ? 'text-emerald-900' : 'text-amber-900'} `}>
                                        {isVerified ? 'Établissement Vérifié' : 'En attente de validation'}
                                    </p>
                                    <p className={`text - xs mt - 1 ${isVerified ? 'text-emerald-700' : 'text-amber-700'} `}>
                                        {isVerified ? 'Votre établissement est visible par les travailleurs.' : 'Complétez vos informations.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4">Statistiques</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="w-5 h-5 text-blue-600" />
                                    <span className="text-slate-600">Missions actives</span>
                                </div>
                                <span className="font-bold text-slate-900">{stats.activeMissions || 0}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <Users className="w-5 h-5 text-indigo-600" />
                                    <span className="text-slate-600">Candidatures</span>
                                </div>
                                <span className="font-bold text-slate-900">{stats.pendingApplications || 0}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <Award className="w-5 h-5 text-sky-600" />
                                    <span className="text-slate-600">Profils suggérés</span>
                                </div>
                                <span className="font-bold text-slate-900">{stats.suggestions || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4">Coordonnées</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-slate-500">Email</p>
                                    <p className="text-sm font-medium text-slate-900">{user?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-slate-500">Téléphone</p>
                                    {isEditing ? (
                                        <input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full text-sm p-1 border rounded" />
                                    ) : (
                                        <p className="text-sm font-medium text-slate-900">{profile.phone || 'Non renseigné'}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                    <Globe className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-slate-500">Site web</p>
                                    {isEditing ? (
                                        <input name="website" value={formData.website} onChange={handleInputChange} className="w-full text-sm p-1 border rounded" placeholder="https://" />
                                    ) : (
                                        <p className="text-sm font-medium text-slate-900">{profile.website || 'Non renseigné'}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-slate-500">Adresse</p>
                                    {isEditing ? (
                                        <textarea name="address" value={formData.address} onChange={handleInputChange} rows={2} className="w-full text-sm p-1 border rounded resize-none" />
                                    ) : (
                                        <p className="text-sm font-medium text-slate-900">{profile.address || 'Non renseigné'}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="lg:col-span-2 space-y-6">
                    {/* About / Description */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <History className="w-5 h-5 text-blue-600" />
                            <h3 className="font-bold text-lg text-slate-900">À Propos de l'Établissement</h3>
                        </div>
                        {isEditing ? (
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={6}
                                placeholder="Décrivez l'histoire et la mission de votre établissement..."
                                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            />
                        ) : (
                            profile.description ? (
                                <p className="text-slate-600 leading-relaxed whitespace-pre-line">{profile.description}</p>
                            ) : (
                                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <p className="text-slate-500 mb-2">Aucune description disponible.</p>
                                    <button onClick={toggleEdit} className="text-sm text-blue-600 font-medium hover:underline">
                                        Ajouter une description
                                    </button>
                                </div>
                            )
                        )}
                    </div>

                    {/* Establishment Details */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="font-bold text-lg text-slate-900 mb-6">Informations Complémentaires</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Année de création</label>
                                {isEditing ? (
                                    <input
                                        name="founding_year"
                                        type="number"
                                        value={formData.founding_year}
                                        onChange={handleInputChange}
                                        placeholder="Ex: 2015"
                                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                                        <Calendar className="w-5 h-5 text-slate-400" />
                                        <span className="text-slate-900 font-medium">{profile.founding_year || 'Non renseigné'}</span>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Nombre d'employés</label>
                                {isEditing ? (
                                    <select
                                        name="employee_count"
                                        value={formData.employee_count}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                    >
                                        <option value="">Sélectionner</option>
                                        <option value="1-10">1-10 employés</option>
                                        <option value="11-50">11-50 employés</option>
                                        <option value="51-200">51-200 employés</option>
                                        <option value="201-500">201-500 employés</option>
                                        <option value="500+">Plus de 500 employés</option>
                                    </select>
                                ) : (
                                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                                        <Users className="w-5 h-5 text-slate-400" />
                                        <span className="text-slate-900 font-medium">{profile.employee_count || 'Non renseigné'}</span>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Personne de contact - Prénom</label>
                                {isEditing ? (
                                    <input
                                        name="contact_first_name"
                                        value={formData.contact_first_name}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                ) : (
                                    <p className="p-3 bg-slate-50 rounded-xl text-slate-900 font-medium">{profile.contact_first_name || 'Non renseigné'}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Personne de contact - Nom</label>
                                {isEditing ? (
                                    <input
                                        name="contact_last_name"
                                        value={formData.contact_last_name}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                ) : (
                                    <p className="p-3 bg-slate-50 rounded-xl text-slate-900 font-medium">{profile.contact_last_name || 'Non renseigné'}</p>
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Ville</label>
                                {isEditing ? (
                                    <select
                                        name="city_id"
                                        value={formData.city_id}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                                    >
                                        <option value="">Sélectionner une ville</option>
                                        {cities.map(c => (
                                            <option key={c.city_id} value={c.city_id}>{c.name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                                        <MapPin className="w-5 h-5 text-slate-400" />
                                        <span className="text-slate-900 font-medium">{profile.city?.name || 'Non renseigné'}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
