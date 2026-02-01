import { useState, useEffect } from 'react';
import { User, Camera, Phone, Building2, Save, Loader2, Shield, CheckCircle } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../hooks/useAuth';

const AdminProfile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        department: ''
    });
    const [profilePic, setProfilePic] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/admin/profile');
            setFormData({
                first_name: data.first_name || '',
                last_name: data.last_name || '',
                phone: data.phone || '',
                department: data.department || ''
            });
            setProfilePic(data.profile_pic_url);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/admin/profile', formData);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingPhoto(true);
        const formDataUpload = new FormData();
        formDataUpload.append('photo', file);

        try {
            const { data } = await api.put('/admin/profile/photo', formDataUpload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProfilePic(data.profile_pic_url);
        } catch (error) {
            console.error('Error uploading photo:', error);
            alert('Erreur lors de l\'upload de la photo');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const departments = [
        'Vérification Documents',
        'Support Utilisateurs',
        'Gestion Litiges',
        'Administration Générale',
        'Supervision'
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Mon Profil Administrateur</h1>
                    <p className="text-slate-500">Gérez vos informations personnelles pour être identifiable.</p>
                </div>
                {user?.role === 'SUPER_ADMIN' && (
                    <span className="px-3 py-1.5 bg-purple-100 text-purple-700 text-sm font-medium rounded-full flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        Super Admin
                    </span>
                )}
            </div>

            {/* Success Message */}
            {success && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Profil mis à jour avec succès !</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Photo Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Camera className="w-5 h-5 text-blue-600" />
                        Photo de Profil
                    </h3>

                    <div className="flex flex-col items-center">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full border-4 border-slate-100 overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                {profilePic ? (
                                    <img src={profilePic} alt="Profil" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-16 h-16 text-white" />
                                )}
                            </div>

                            <label className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center cursor-pointer shadow-lg transition-colors">
                                {uploadingPhoto ? (
                                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                                ) : (
                                    <Camera className="w-5 h-5 text-white" />
                                )}
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    disabled={uploadingPhoto}
                                />
                            </label>
                        </div>

                        <p className="text-sm text-slate-500 mt-4 text-center">
                            Cette photo sera visible par le Super Admin pour vous identifier.
                        </p>
                    </div>
                </div>

                {/* Form Card */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
                        Informations Personnelles
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Prénom</label>
                                <input
                                    type="text"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Votre prénom"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Nom</label>
                                <input
                                    type="text"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Votre nom"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                <Phone className="w-4 h-4 inline mr-1" />
                                Téléphone
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="06 00 00 00 00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                <Building2 className="w-4 h-4 inline mr-1" />
                                Département / Service
                            </label>
                            <select
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
                            >
                                <option value="">Sélectionner un département</option>
                                {departments.map((dept) => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                            >
                                {saving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                Enregistrer
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Informations du Compte</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Email</p>
                        <p className="text-slate-900 font-medium">{user?.email}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Rôle</p>
                        <p className="text-slate-900 font-medium">{user?.role === 'SUPER_ADMIN' ? 'Super Administrateur' : 'Administrateur'}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Statut</p>
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                            Actif
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
