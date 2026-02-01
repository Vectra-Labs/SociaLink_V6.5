import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    MapPin, Mail, Phone, Edit2,
    Shield, Camera, Save, X, Loader2, Upload,
    Briefcase, GraduationCap, Download, Star,
    Calendar, CheckCircle2, Car, Languages, Globe,
    FileText, ExternalLink, Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Hooks
import { useAuth } from '../../hooks/useAuth';
import {
    useWorkerProfile,
    useUpdateWorkerProfile,
    useWorkerCalendar,
    useWorkerExperiences,
    useWorkerSpecialities,
    useWorkerDocuments,
    useWorkerLanguages,
    useAddWorkerLanguage,
    useUpdateWorkerLanguage,
    useDeleteWorkerLanguage,
    useToggleAvailability
} from '../../hooks/useWorkerProfile';
import api from '../../api/client';

// Validation Schema
const profileSchema = z.object({
    first_name: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
    last_name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    phone: z.string().min(10, "Numéro de téléphone invalide").optional().or(z.literal('')),
    bio: z.string().optional(),
    address: z.string().optional(),
    city_id: z.string().optional().or(z.literal('')),
});

export default function EditProfile() {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [cvUploading, setCvUploading] = useState(false);

    // Languages State
    const [isEditingLanguages, setIsEditingLanguages] = useState(false);
    const [newLanguage, setNewLanguage] = useState({ name: 'Arabe', level: 'Courant', flag: '🇲🇦', code: 'AR' });

    // Mock Language Options
    const LANGUAGE_OPTIONS = [
        { code: 'AR', name: 'Arabe', flag: '🇲🇦' },
        { code: 'AMZ', name: 'Amazigh', flag: '🇲🇦' },
        { code: 'FR', name: 'Français', flag: '🇫🇷' },
        { code: 'EN', name: 'Anglais', flag: '🇬🇧' },
        { code: 'ES', name: 'Espagnol', flag: '🇪🇸' },
        { code: 'DE', name: 'Allemand', flag: '🇩🇪' },
    ];

    const LEVEL_OPTIONS = ['Débutant', 'Intermédiaire', 'Courant', 'Natif'];

    const { data: languages } = useWorkerLanguages();
    const addLanguageMutation = useAddWorkerLanguage();
    const deleteLanguageMutation = useDeleteWorkerLanguage();
    const toggleAvailabilityMutation = useToggleAvailability();

    const handleAddLanguage = () => {
        if (!newLanguage.name) return;
        // Find existing to avoid duplicates in UI logic if needed, but DB handles IDs.
        // Optimistic check:
        if (languages?.some(l => l.name === newLanguage.name)) {
            alert("Cette langue est déjà ajoutée.");
            return;
        }

        const selectedOption = LANGUAGE_OPTIONS.find(l => l.name === newLanguage.name);

        addLanguageMutation.mutate({
            name: newLanguage.name,
            level: newLanguage.level,
            code: selectedOption?.code || 'FR'
        }, {
            onSuccess: () => setIsEditingLanguages(false)
        });
    };

    const handleRemoveLanguage = (id) => {
        deleteLanguageMutation.mutate(id);
    };
    const { data: profile, isLoading: profileLoading } = useWorkerProfile();
    const { data: experiences } = useWorkerExperiences();
    const { data: specialities } = useWorkerSpecialities();
    const { data: documents } = useWorkerDocuments();
    const { data: calendarData } = useWorkerCalendar();

    // Mutation
    const updateProfileMutation = useUpdateWorkerProfile();

    // Form
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(profileSchema),
        values: profile || {},
    });

    const onSubmit = (data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key]) formData.append(key, data[key]);
        });
        updateProfileMutation.mutate(formData, {
            onSuccess: () => setIsEditing(false)
        });
    };

    // File Handlers
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('photo', file);
        updateProfileMutation.mutate(formData);
    };

    const handleBannerChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('banner', file);
        updateProfileMutation.mutate(formData);
    };

    const handleCvUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setCvUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'CV');
            await api.post('/worker/documents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            window.location.reload();
        } catch (err) {
            console.error("CV Upload failed", err);
            alert("Erreur upload CV");
        } finally {
            setCvUploading(false);
        }
    };

    if (profileLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>;
    if (!profile) return null;

    // Derived Data
    const fullName = `${profile.first_name} ${profile.last_name}`;
    const cityName = profile.city?.name || 'Maroc';
    const isVerified = user?.status === 'VALIDATED';

    // Calculate Availability
    const checkAvailability = () => {
        if (!calendarData?.events) return false;
        // Simple logic: has at least one 'AVAILABLE' event active or in the future
        const now = new Date();
        return calendarData.events.some(e => e.type === 'AVAILABLE' && new Date(e.end_date) > now);
    };
    const isAvailable = checkAvailability();

    // Filter Diplomas from documents
    const diplomas = documents?.filter(d => d.type === 'DIPLOMA' || d.type === 'CERTIFICATE') || [];

    return (
        <div className="min-h-screen bg-slate-50/50 pb-10 font-sans">

            {/* --- Profile Header (Photoshop Design 2) --- */}
            <div className="rounded-3xl bg-white shadow-xl overflow-hidden border border-slate-100 mb-10">
                {/* Full Width Banner */}
                <div className="relative h-36 md:h-48 overflow-hidden">
                    {profile.banner_url ? (
                        <img
                            src={profile.banner_url}
                            alt="Cover"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600"></div>
                    )}

                    {/* Edit Banner Button */}
                    {isEditing && (
                        <label className="absolute top-4 right-4 px-4 py-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-lg text-white cursor-pointer transition-all flex items-center gap-2">
                            <Camera className="w-4 h-4" />
                            <span className="text-sm font-medium">Modifier</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleBannerChange} />
                        </label>
                    )}
                </div>

                {/* Info Section */}
                <div className="px-6 md:px-8 py-4 md:py-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">

                        {/* Avatar - Overlapping banner */}
                        <div className="relative -mt-20 md:-mt-24 z-10 shrink-0 self-center md:self-auto">
                            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                                {profile.profile_pic_url ? (
                                    <img src={profile.profile_pic_url} alt={fullName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-slate-400 bg-gradient-to-br from-slate-50 to-slate-100">
                                        {profile.first_name?.[0]}{profile.last_name?.[0]}
                                    </div>
                                )}
                            </div>
                            {/* Blue verification badge */}
                            <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full border-[3px] border-white shadow-sm">
                                <Shield className="w-3.5 h-3.5 fill-current" />
                            </div>
                            {isEditing && (
                                <label className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera className="w-6 h-6" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                                </label>
                            )}
                        </div>

                        {/* Info Block */}
                        <div className="flex-1 text-center md:text-left">
                            {/* Row 1: Name + Availability Badge */}
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                <h1 className="text-xl md:text-2xl font-bold text-slate-900">{fullName}</h1>
                                <button
                                    onClick={() => toggleAvailabilityMutation.mutate()}
                                    disabled={toggleAvailabilityMutation.isPending}
                                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium transition-all self-center md:self-auto ${isAvailable
                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                        : 'bg-slate-50 text-slate-500 border-slate-200'
                                        }`}
                                >
                                    <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                    {isAvailable ? 'Disponible pour missions immédiates' : 'Indisponible'}
                                </button>
                            </div>

                            {/* Row 2: Profession */}
                            <p className="text-blue-600 font-medium mt-1">{specialities?.[0]?.name || 'Travailleur Social'}</p>

                            {/* Row 3: Location */}
                            <div className="flex items-center justify-center md:justify-start gap-1.5 mt-2 text-sm text-slate-500">
                                <MapPin className="w-4 h-4" />
                                <span>{cityName}</span>
                            </div>
                        </div>

                        {/* Buttons - Right side */}
                        <div className="flex items-center justify-center md:justify-end gap-3 mt-2 md:mt-0">
                            {isEditing ? (
                                <>
                                    <button onClick={() => { setIsEditing(false); reset(); }} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors">
                                        Annuler
                                    </button>
                                    <button type="submit" form="profile-form" disabled={updateProfileMutation.isPending} className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-md flex items-center gap-2 transition-colors">
                                        {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Enregistrer
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => setIsEditing(true)} className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-md flex items-center gap-2 transition-colors">
                                        <Edit2 className="w-4 h-4" /> Modifier
                                    </button>
                                    {profile.cv_url ? (
                                        <a href={profile.cv_url} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 flex items-center gap-2 bg-white transition-colors">
                                            <Download className="w-4 h-4" /> CV Vérifié
                                        </a>
                                    ) : (
                                        <label className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 flex items-center gap-2 bg-white cursor-pointer transition-colors">
                                            {cvUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                            Ajouter CV
                                            <input type="file" accept=".pdf" className="hidden" onChange={handleCvUpload} disabled={cvUploading} />
                                        </label>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 2. MAIN CONTENT GRID --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* === LEFT SIDEBAR === */}
                <div className="space-y-6">

                    {/* Contact & Mobility */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Phone className="w-5 h-5 text-blue-600" />
                            Coordonnées
                        </h3>
                        {isEditing ? (
                            <form id="profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Prénom & Nom</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input {...register('first_name')} className="w-full p-2 border rounded-lg text-sm" placeholder="Prénom" />
                                        <input {...register('last_name')} className="w-full p-2 border rounded-lg text-sm" placeholder="Nom" />
                                    </div>
                                    {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Téléphone</label>
                                    <input {...register('phone')} className="w-full p-2 border rounded-lg text-sm" placeholder="06..." />
                                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Adresse</label>
                                    <textarea {...register('address')} className="w-full p-2 border rounded-lg text-sm" rows={2} placeholder="Votre adresse..." />
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-start gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="p-2 bg-white rounded-lg shadow-sm text-slate-500"><Phone className="w-4 h-4" /></div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-semibold uppercase">Téléphone</p>
                                        <p className="text-sm font-medium text-slate-900">{profile.phone || "Non renseigné"}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="p-2 bg-white rounded-lg shadow-sm text-slate-500"><MapPin className="w-4 h-4" /></div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-semibold uppercase">Adresse</p>
                                        <p className="text-sm font-medium text-slate-900">{profile.address || "Non renseigné"}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="p-2 bg-white rounded-lg shadow-sm text-slate-500"><Mail className="w-4 h-4" /></div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-semibold uppercase">Email</p>
                                        <p className="text-sm font-medium text-slate-900 truncate max-w-[180px]">{user?.email}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Skills / Specialities */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative group">
                        <Link to="/worker/specialities" className="absolute top-4 right-4 p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                        </Link>
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <StarsIcon className="w-5 h-5 text-amber-500" />
                            Compétences
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {specialities && specialities.length > 0 ? (
                                specialities.map((spec) => (
                                    <span key={spec.speciality_id || Math.random()} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                        {spec.name}
                                    </span>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 italic">Aucune compétence ajoutée.</p>
                            )}
                        </div>
                    </div>

                    {/* Languages (Mocked for now as per plan) */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative group">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <Languages className="w-5 h-5 text-indigo-500" />
                                Langues
                            </h3>
                            <button
                                onClick={() => setIsEditingLanguages(!isEditingLanguages)}
                                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                                title="Modifier les langues"
                            >
                                {isEditingLanguages ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* Add Language Form */}
                        {isEditingLanguages && (
                            <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animation-fade-in">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <select
                                        className="p-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={newLanguage.name}
                                        onChange={(e) => {
                                            const selected = LANGUAGE_OPTIONS.find(l => l.name === e.target.value);
                                            setNewLanguage({ ...newLanguage, name: selected.name, flag: selected.flag, code: selected.code });
                                        }}
                                    >
                                        {LANGUAGE_OPTIONS.map(l => (
                                            <option key={l.code} value={l.name}>{l.flag} {l.name}</option>
                                        ))}
                                    </select>
                                    <select
                                        className="p-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        value={newLanguage.level}
                                        onChange={(e) => setNewLanguage({ ...newLanguage, level: e.target.value })}
                                    >
                                        {LEVEL_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>
                                <button
                                    onClick={handleAddLanguage}
                                    className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <div className="w-4 h-4 font-bold">+</div> Ajouter
                                </button>
                            </div>
                        )}

                        {/* Languages List */}
                        <div className="space-y-3">
                            {languages && languages.length > 0 ? (
                                languages.map((lang) => {
                                    const flag = LANGUAGE_OPTIONS.find(opt => opt.code === lang.code)?.flag || '🌐';
                                    return (
                                        <div key={lang.id} className="flex items-center justify-between group/item p-1 hover:bg-slate-50 rounded-lg transition-colors">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">{flag}</span>
                                                <span className="text-sm font-medium text-slate-700">{lang.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-bold px-2 py-1 rounded ${lang.level === 'Natif' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                                                    {lang.level}
                                                </span>
                                                {isEditingLanguages && (
                                                    <button
                                                        onClick={() => handleRemoveLanguage(lang.id)}
                                                        className="text-slate-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                                                        title="Supprimer"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-sm text-slate-400 italic">Aucune langue ajoutée.</p>
                            )}
                        </div>
                    </div>

                </div>

                {/* === RIGHT MAIN CONTENT === */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Bio / About */}
                    <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm relative group">
                        <h3 className="font-bold text-xl text-slate-900 mb-4">À propos</h3>
                        {isEditing ? (
                            <textarea
                                {...register('bio')}
                                className="w-full p-4 border rounded-xl bg-slate-50 text-slate-800 leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                rows={6}
                                placeholder="Présentez-vous en quelques lignes..."
                            />
                        ) : (
                            <div className="prose prose-slate max-w-none">
                                {profile.bio ? (
                                    <p className="text-slate-600 leading-relaxed whitespace-pre-line text-lg">
                                        {profile.bio}
                                    </p>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                        <FileText className="w-8 h-8 mb-2 opacity-50" />
                                        <p>Ajoutez une description pour vous présenter.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>

                    {/* Experience Timeline */}
                    <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm relative">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold text-xl text-slate-900 flex items-center gap-3">
                                <Briefcase className="w-6 h-6 text-blue-600" />
                                Expérience Professionnelle
                            </h3>
                            <Link to="/worker/experiences" className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all">
                                <Edit2 className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="relative border-l-2 border-slate-100 ml-3 space-y-10 pl-8 pb-4">
                            {experiences && experiences.length > 0 ? (
                                experiences.map((exp, idx) => (
                                    <div key={idx} className="relative group">
                                        {/* Timeline Dot */}
                                        <div className="absolute -left-[41px] top-1.5 w-5 h-5 rounded-full border-4 border-white bg-blue-600 shadow-sm group-hover:scale-125 transition-transform" />

                                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-1">
                                            <h4 className="text-lg font-bold text-slate-900">{exp.position}</h4>
                                            <span className="text-sm font-medium text-slate-400 tabular-nums">
                                                {new Date(exp.start_date).getFullYear()} - {exp.end_date ? new Date(exp.end_date).getFullYear() : 'Présent'}
                                            </span>
                                        </div>
                                        <p className="text-blue-600 font-medium mb-3">{exp.establishment_name}</p>
                                        <p className="text-slate-600 leading-relaxed text-sm">
                                            {exp.description}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-500 italic">Aucune expérience ajoutée.</p>
                            )}
                        </div>
                    </section>

                    {/* Diplomas & Certificates */}
                    <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm relative">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold text-xl text-slate-900 flex items-center gap-3">
                                <GraduationCap className="w-6 h-6 text-emerald-600" />
                                Diplômes & Certifications
                            </h3>
                            <Link to="/worker/diplomas" className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all">
                                <Edit2 className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {diplomas && diplomas.length > 0 ? (
                                diplomas.map((dip) => (
                                    <div key={dip.id} className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group cursor-pointer">
                                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100 transition-colors">
                                            <CheckCircle2 className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-slate-900 line-clamp-1" title={dip.name}>{dip.name}</h4>
                                            <p className="text-sm text-slate-500 mt-1">{dip.fileName}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Vérifié</span>
                                                <a href={dip.file_url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1">
                                                    Voir <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                    <p className="text-slate-500">Ajoutez vos diplômes pour rassurer les recruteurs.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

// Helper Icon Component
function StarsIcon({ className }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
    );
}
