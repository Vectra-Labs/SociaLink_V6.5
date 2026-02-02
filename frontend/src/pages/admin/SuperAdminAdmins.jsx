import { useState, useEffect, useRef } from 'react';
import {
    ShieldCheck, Plus, Search, Filter, MoreVertical,
    CheckCircle, XCircle, RotateCcw, Lock, FileText, Camera,
    User, Mail, Phone, Building2, Shield, Trash2, Edit3
} from 'lucide-react';
import api from '../../api/client';

const SuperAdminAdmins = () => {
    const [activeTab, setActiveTab] = useState('list');
    const [admins, setAdmins] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Form State - now includes profile info
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'ADMIN',
        permissions: [],
        status: 'VALIDATED',
        // Profile fields
        first_name: '',
        last_name: '',
        phone: '',
        department: '',
        profile_pic_url: ''
    });

    const [previewImage, setPreviewImage] = useState(null);

    const AVAILABLE_PERMISSIONS = [
        { id: 'CAN_VALIDATE_WORKERS', label: 'Valider Travailleurs', icon: User },
        { id: 'CAN_VALIDATE_ESTABLISHMENTS', label: 'Valider Établissements', icon: Building2 },
        { id: 'CAN_MANAGE_DISPUTES', label: 'Gérer Litiges', icon: Shield },
        { id: 'CAN_MANAGE_DOCUMENTS', label: 'Vérifier Documents', icon: FileText },
        { id: 'CAN_MANAGE_SETTINGS', label: 'Gérer Paramètres', icon: Lock }
    ];

    const DEPARTMENTS = [
        'Vérification Profils',
        'Support Client',
        'Modération Litiges',
        'Validation Documents',
        'Administration Générale'
    ];

    useEffect(() => {
        if (activeTab === 'list') fetchAdmins();
        if (activeTab === 'logs') fetchLogs();
    }, [activeTab]);

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/super-admin/admins');
            setAdmins(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/super-admin/logs');
            setLogs(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingAdmin) {
                // Update admin - includes profile data
                await api.put(`/super-admin/admins/${editingAdmin.user_id}`, {
                    permissions: formData.permissions,
                    role: formData.role,
                    status: formData.status,
                    profile: {
                        first_name: formData.first_name,
                        last_name: formData.last_name,
                        phone: formData.phone,
                        department: formData.department,
                        profile_pic_url: formData.profile_pic_url
                    }
                });
            } else {
                // Create admin - includes initial profile
                await api.post('/super-admin/admins', {
                    email: formData.email,
                    password: formData.password,
                    role: 'ADMIN',
                    permissions: formData.permissions,
                    profile: {
                        first_name: formData.first_name,
                        last_name: formData.last_name,
                        phone: formData.phone,
                        department: formData.department
                    }
                });
            }
            setShowModal(false);
            setEditingAdmin(null);
            fetchAdmins();
            resetForm();
        } catch (error) {
            alert("Erreur: " + (error.response?.data?.message || "Erreur inconnue"));
        }
    };

    const resetForm = () => {
        setFormData({
            email: '',
            password: '',
            role: 'ADMIN',
            permissions: [],
            status: 'VALIDATED',
            first_name: '',
            last_name: '',
            phone: '',
            department: '',
            profile_pic_url: ''
        });
        setPreviewImage(null);
    };

    const handleEdit = (admin) => {
        setEditingAdmin(admin);
        // Parse permissions - handle both array and JSON string formats
        let permissions = admin.admin_permissions;
        if (typeof permissions === 'string') {
            try { permissions = JSON.parse(permissions); } catch { permissions = []; }
        }
        if (!Array.isArray(permissions)) permissions = [];
        
        setFormData({
            email: admin.email,
            password: '',
            role: admin.role,
            permissions: permissions,
            status: admin.status,
            first_name: admin.adminProfile?.first_name || '',
            last_name: admin.adminProfile?.last_name || '',
            phone: admin.adminProfile?.phone || '',
            department: admin.adminProfile?.department || '',
            profile_pic_url: admin.adminProfile?.profile_pic_url || ''
        });
        setPreviewImage(admin.adminProfile?.profile_pic_url || null);
        setShowModal(true);
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => setPreviewImage(reader.result);
        reader.readAsDataURL(file);

        // Upload
        setUploading(true);
        try {
            const formDataUpload = new FormData();
            formDataUpload.append('photo', file);

            // If editing, upload to admin profile endpoint
            if (editingAdmin) {
                const { data } = await api.put(
                    `/admin/profile/${editingAdmin.user_id}/photo`,
                    formDataUpload,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
                setFormData(prev => ({ ...prev, profile_pic_url: data.profile_pic_url }));
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Erreur lors du téléchargement de la photo');
        } finally {
            setUploading(false);
        }
    };

    const togglePermission = (permId) => {
        setFormData(prev => {
            const perms = prev.permissions.includes(permId)
                ? prev.permissions.filter(p => p !== permId)
                : [...prev.permissions, permId];
            return { ...prev, permissions: perms };
        });
    };

    const handleDelete = async (adminId) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cet administrateur ? Cette action est irréversible.")) return;
        try {
            await api.delete(`/super-admin/admins/${adminId}`);
            fetchAdmins();
        } catch (error) {
            alert("Erreur lors de la suppression");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Gestion de l'Équipe Admin</h1>
                    <p className="text-slate-500">Gérez les accès, profils et permissions des administrateurs.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-slate-100 rounded-lg p-1 flex">
                        <button
                            onClick={() => setActiveTab('list')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'list'
                                    ? 'bg-white shadow text-purple-600'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Équipe
                        </button>
                        <button
                            onClick={() => setActiveTab('logs')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'logs'
                                    ? 'bg-white shadow text-purple-600'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Journal d'audit
                        </button>
                    </div>
                    <button
                        onClick={() => { resetForm(); setEditingAdmin(null); setShowModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/20 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Nouvel Admin
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900">{admins.length}</p>
                        <p className="text-sm text-slate-500">Administrateurs</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900">
                            {admins.filter(a => a.status === 'VALIDATED').length}
                        </p>
                        <p className="text-sm text-slate-500">Actifs</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                        <Lock className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-slate-900">
                            {admins.filter(a => a.role === 'SUPER_ADMIN').length}
                        </p>
                        <p className="text-sm text-slate-500">Super Admins</p>
                    </div>
                </div>
            </div>

            {/* Admin List */}
            {activeTab === 'list' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
                            <p className="text-slate-500 mt-3">Chargement...</p>
                        </div>
                    ) : admins.length === 0 ? (
                        <div className="p-12 text-center">
                            <ShieldCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-medium">Aucun administrateur</p>
                            <p className="text-sm text-slate-400 mt-1">Créez votre premier administrateur</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {admins.map((admin) => (
                                <div key={admin.user_id} className="p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            {/* Avatar */}
                                            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden ${admin.role === 'SUPER_ADMIN'
                                                    ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                                                    : 'bg-gradient-to-br from-blue-400 to-cyan-500'
                                                }`}>
                                                {admin.adminProfile?.profile_pic_url ? (
                                                    <img src={admin.adminProfile.profile_pic_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <>{(admin.adminProfile?.first_name?.[0] || admin.email[0]).toUpperCase()}</>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <p className="font-semibold text-slate-900">
                                                        {admin.adminProfile?.first_name && admin.adminProfile?.last_name
                                                            ? `${admin.adminProfile.first_name} ${admin.adminProfile.last_name}`
                                                            : admin.email}
                                                    </p>
                                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${admin.role === 'SUPER_ADMIN'
                                                            ? 'bg-purple-100 text-purple-700'
                                                            : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {admin.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                                                    </span>
                                                    {admin.status !== 'VALIDATED' && (
                                                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
                                                            Suspendu
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-500">{admin.email}</p>
                                                <div className="flex items-center gap-4 mt-1">
                                                    {admin.adminProfile?.department && (
                                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                                            <Building2 className="w-3 h-3" />
                                                            {admin.adminProfile.department}
                                                        </span>
                                                    )}
                                                    {admin.adminProfile?.phone && (
                                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                                            <Phone className="w-3 h-3" />
                                                            {admin.adminProfile.phone}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Permissions & Actions */}
                                        <div className="flex items-center gap-6">
                                            <div className="flex flex-wrap gap-1 max-w-xs">
                                                {(() => {
                                                    // Handle both array and JSON string formats
                                                    let perms = admin.admin_permissions;
                                                    if (typeof perms === 'string') {
                                                        try { perms = JSON.parse(perms); } catch { perms = []; }
                                                    }
                                                    if (!Array.isArray(perms)) perms = [];
                                                    
                                                    return (
                                                        <>
                                                            {perms.slice(0, 3).map(p => (
                                                                <span key={p} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                                                                    {AVAILABLE_PERMISSIONS.find(ap => ap.id === p)?.label.split(' ')[0] || p}
                                                                </span>
                                                            ))}
                                                            {perms.length > 3 && (
                                                                <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-xs">
                                                                    +{perms.length - 3}
                                                                </span>
                                                            )}
                                                        </>
                                                    );
                                                })()}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(admin)}
                                                    className="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                    title="Modifier le profil"
                                                >
                                                    <Edit3 className="w-5 h-5" />
                                                </button>
                                                {admin.role !== 'SUPER_ADMIN' && (
                                                    <button
                                                        onClick={() => handleDelete(admin.user_id)}
                                                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Logs View */}
            {activeTab === 'logs' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Admin</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Cible</th>
                                <th className="px-6 py-4">Détails</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {logs.map((log) => (
                                <tr key={log.log_id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {new Date(log.created_at).toLocaleString('fr-FR')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-medium text-slate-900">{log.admin?.email}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 text-xs font-mono bg-slate-100 rounded border border-slate-200">
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {log.target_type} #{log.target_id}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-400 font-mono max-w-xs truncate">
                                        {JSON.stringify(log.details)}
                                    </td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        <FileText className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                                        Aucun log disponible
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal - Create/Edit Admin */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50">
                            <h3 className="font-bold text-lg text-slate-900">
                                {editingAdmin ? 'Modifier le profil Admin' : 'Créer un nouvel Admin'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Profile Photo */}
                            <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                                <div className="relative">
                                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-2xl overflow-hidden ${previewImage ? '' : 'bg-gradient-to-br from-purple-500 to-indigo-600'
                                        }`}>
                                        {previewImage ? (
                                            <img src={previewImage} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-10 h-10" />
                                        )}
                                    </div>
                                    {editingAdmin && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="absolute bottom-0 right-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-purple-700 transition-colors"
                                                disabled={uploading}
                                            >
                                                {uploading ? (
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Camera className="w-4 h-4" />
                                                )}
                                            </button>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handlePhotoUpload}
                                                className="hidden"
                                            />
                                        </>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-900">Photo de profil</h4>
                                    <p className="text-sm text-slate-500">
                                        {editingAdmin ? 'Cliquez sur l\'icône pour changer la photo' : 'La photo peut être ajoutée après création'}
                                    </p>
                                </div>
                            </div>

                            {/* Personal Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Prénom *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="Jean"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="Dupont"
                                    />
                                </div>
                            </div>

                            {/* Contact Info */}
                            {!editingAdmin && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                            placeholder="admin@socialink.ma"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe *</label>
                                        <input
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="+212 6XX XXX XXX"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Département</label>
                                    <select
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                    >
                                        <option value="">Sélectionner...</option>
                                        {DEPARTMENTS.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Status (edit only) */}
                            {editingAdmin && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Statut du compte</label>
                                    <select
                                        value={formData.status || 'VALIDATED'}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="VALIDATED">Actif (Validé)</option>
                                        <option value="SUSPENDED">Suspendu (Accès bloqué)</option>
                                    </select>
                                </div>
                            )}

                            {/* Permissions */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-3">Privilèges & Accès</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {AVAILABLE_PERMISSIONS.map((perm) => {
                                        const isSelected = formData.permissions.includes(perm.id);
                                        const Icon = perm.icon;
                                        return (
                                            <div
                                                key={perm.id}
                                                onClick={() => togglePermission(perm.id)}
                                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isSelected
                                                        ? 'bg-purple-50 border-purple-200 shadow-sm'
                                                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-500'
                                                    }`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <span className={`text-sm font-medium ${isSelected ? 'text-purple-900' : 'text-slate-700'}`}>
                                                    {perm.label}
                                                </span>
                                                {isSelected && (
                                                    <CheckCircle className="w-5 h-5 text-purple-600 ml-auto" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 font-medium shadow-lg shadow-purple-500/20"
                                >
                                    {editingAdmin ? 'Enregistrer' : 'Créer l\'Admin'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminAdmins;