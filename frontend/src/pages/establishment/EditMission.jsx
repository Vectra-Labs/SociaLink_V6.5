import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/client';
import {
    Briefcase, Calendar, MapPin, DollarSign,
    AlignLeft, Save, ArrowLeft, Loader, CheckCircle, AlertCircle,
    Users, Building2, Clock, Zap, GraduationCap, Heart
} from 'lucide-react';

// Constants
const SECTORS = [
    'Action Sociale',
    'Aide à Domicile',
    'Médical',
    'Petite Enfance',
    'Éducation Spécialisée',
    'Animation',
    'Handicap',
    'Personnes Âgées',
    'Insertion Professionnelle',
    'Autre'
];

const CONTRACT_TYPES = [
    { value: 'CDI', label: 'CDI' },
    { value: 'CDD', label: 'CDD' },
    { value: 'INTERIM', label: 'Intérim' },
    { value: 'STAGE', label: 'Stage' },
    { value: 'BENEVOLAT', label: 'Bénévolat' },
    { value: 'FREELANCE', label: 'Freelance / Mission' }
];

const WORK_MODES = [
    { value: 'ON_SITE', label: 'Sur site', icon: Building2 },
    { value: 'REMOTE', label: 'Télétravail', icon: MapPin },
    { value: 'HYBRID', label: 'Hybride', icon: Users }
];

const EXPERIENCE_LEVELS = [
    { value: 'JUNIOR', label: 'Junior (0-2 ans)' },
    { value: 'INTERMEDIATE', label: 'Intermédiaire (2-5 ans)' },
    { value: 'SENIOR', label: 'Senior (5-10 ans)' },
    { value: 'EXPERT', label: 'Expert (10+ ans)' }
];

const BENEFITS_OPTIONS = [
    { value: 'CNSS', label: 'CNSS', icon: CheckCircle },
    { value: 'MUTUELLE', label: 'Mutuelle', icon: Heart },
    { value: 'TRANSPORT', label: 'Transport', icon: MapPin },
    { value: 'FORMATION', label: 'Formation', icon: GraduationCap },
    { value: 'LOGEMENT', label: 'Logement', icon: Building2 },
    { value: 'REPAS', label: 'Repas', icon: Heart }
];

const SKILLS_OPTIONS = [
    'Éducation spécialisée',
    'Accompagnement social',
    'Écoute active',
    'Protection de l\'enfance',
    'Animation de groupe',
    'Relation d\'aide',
    'Gestion de conflit',
    'Soins infirmiers',
    'Premiers secours',
    'Permis B'
];

const EditMission = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        // Basic Info
        title: '',
        description: '',
        sector: '',
        // Job Type
        contract_type: 'CDD',
        work_mode: 'ON_SITE',
        experience_level: 'INTERMEDIATE',
        positions_count: 1,
        // Salary
        salary_min: '',
        salary_max: '',
        budget: '', // Legacy field
        // Location & Dates
        city_id: '',
        start_date: '',
        end_date: '',
        application_deadline: '',
        is_urgent: false,
        // Benefits & Skills
        benefits: [],
        skills: []
    });

    useEffect(() => {
        Promise.all([fetchMission(), fetchCities()]).finally(() => setLoading(false));
    }, [id]);

    const fetchCities = async () => {
        try {
            const { data } = await api.get('/general/cities');
            setCities(data.data || []);
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Impossible de charger la liste des villes.' });
        }
    };

    const fetchMission = async () => {
        try {
            const { data } = await api.get(`/missions/${id}`);
            const mission = data.data;

            // Format dates for input type="date"
            const formatDate = (dateString) => dateString ? new Date(dateString).toISOString().split('T')[0] : '';

            setFormData({
                title: mission.title || '',
                description: mission.description || '',
                sector: mission.sector || '',
                contract_type: mission.contract_type || 'CDD',
                work_mode: mission.work_mode || 'ON_SITE',
                experience_level: mission.experience_level || 'INTERMEDIATE',
                positions_count: mission.positions_count || 1,
                salary_min: mission.salary_min || '',
                salary_max: mission.salary_max || mission.budget || '',
                budget: mission.budget || '',
                city_id: mission.city_id || '',
                start_date: formatDate(mission.start_date),
                end_date: formatDate(mission.end_date),
                application_deadline: formatDate(mission.application_deadline),
                is_urgent: mission.is_urgent || false,
                benefits: mission.benefits || [],
                skills: mission.skills || []
            });
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Impossible de charger la mission.' });
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleBenefitToggle = (benefit) => {
        setFormData(prev => ({
            ...prev,
            benefits: prev.benefits.includes(benefit)
                ? prev.benefits.filter(b => b !== benefit)
                : [...prev.benefits, benefit]
        }));
    };

    const handleSkillToggle = (skill) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.includes(skill)
                ? prev.skills.filter(s => s !== skill)
                : [...prev.skills, skill]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            // Prepare payload
            const payload = {
                ...formData,
                budget: formData.salary_max ? parseFloat(formData.salary_max) : null,
                salary_min: formData.salary_min ? parseFloat(formData.salary_min) : null,
                salary_max: formData.salary_max ? parseFloat(formData.salary_max) : null,
                city_id: parseInt(formData.city_id),
                positions_count: parseInt(formData.positions_count) || 1
            };

            await api.put(`/missions/${id}`, payload);
            setMessage({ type: 'success', text: 'Mission mise à jour avec succès !' });
            setTimeout(() => {
                navigate('/establishment/missions');
            }, 1000);
        } catch (error) {
            const errMsg = error.response?.data?.message || 'Erreur lors de la mise à jour de la mission.';
            setMessage({ type: 'error', text: errMsg });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-10">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/establishment/missions')}
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Modifier la Mission</h1>
                    <p className="text-slate-500">Mettez à jour les informations de votre offre</p>
                </div>
            </div>

            {message.text && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Section 1: Basic Info */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-slate-800">Informations de base</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Titre de la mission *</label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Ex: Éducateur spécialisé pour centre de jeunesse"
                                required
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Secteur / Catégorie *</label>
                            <select
                                name="sector"
                                value={formData.sector}
                                onChange={handleChange}
                                required
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                            >
                                <option value="">Sélectionner un secteur</option>
                                {SECTORS.map(sector => (
                                    <option key={sector} value={sector}>{sector}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de postes *</label>
                            <input
                                type="number"
                                name="positions_count"
                                value={formData.positions_count}
                                onChange={handleChange}
                                min="1"
                                max="50"
                                required
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description complète *</label>
                            <div className="relative">
                                <AlignLeft className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    required
                                    rows="5"
                                    placeholder="Détaillez les responsabilités, le profil recherché, les missions quotidiennes..."
                                    className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Job Type */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-slate-800">Type de poste</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Type de contrat *</label>
                            <select
                                name="contract_type"
                                value={formData.contract_type}
                                onChange={handleChange}
                                required
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                            >
                                {CONTRACT_TYPES.map(ct => (
                                    <option key={ct.value} value={ct.value}>{ct.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Niveau d'expérience *</label>
                            <select
                                name="experience_level"
                                value={formData.experience_level}
                                onChange={handleChange}
                                required
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                            >
                                {EXPERIENCE_LEVELS.map(el => (
                                    <option key={el.value} value={el.value}>{el.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-3">Mode de travail *</label>
                            <div className="grid grid-cols-3 gap-3">
                                {WORK_MODES.map(mode => {
                                    const Icon = mode.icon;
                                    const isSelected = formData.work_mode === mode.value;
                                    return (
                                        <button
                                            key={mode.value}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, work_mode: mode.value }))}
                                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${isSelected
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-slate-200 hover:border-slate-300 text-slate-600'
                                                }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span className="text-sm font-medium">{mode.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 3: Salary */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-slate-800">Rémunération</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Salaire minimum (MAD/mois)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="number"
                                    name="salary_min"
                                    value={formData.salary_min}
                                    onChange={handleChange}
                                    placeholder="Ex: 5000"
                                    className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Salaire maximum (MAD/mois)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="number"
                                    name="salary_max"
                                    value={formData.salary_max}
                                    onChange={handleChange}
                                    placeholder="Ex: 8000"
                                    className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-slate-500">
                        💡 Laissez vide si le salaire est "À négocier"
                    </p>
                </div>

                {/* Section: Skills */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <GraduationCap className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-slate-800">Compétences requises</h3>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {SKILLS_OPTIONS.map(skill => {
                            const isSelected = formData.skills.includes(skill);
                            return (
                                <button
                                    key={skill}
                                    type="button"
                                    onClick={() => handleSkillToggle(skill)}
                                    className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all flex items-center gap-2 ${isSelected
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                                        }`}
                                >
                                    {skill}
                                    {isSelected && <CheckCircle className="w-3 h-3" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Section 4: Benefits */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Heart className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-slate-800">Avantages proposés</h3>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {BENEFITS_OPTIONS.map(benefit => {
                            const Icon = benefit.icon;
                            const isSelected = formData.benefits.includes(benefit.value);
                            return (
                                <button
                                    key={benefit.value}
                                    type="button"
                                    onClick={() => handleBenefitToggle(benefit.value)}
                                    className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${isSelected
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                                        }`}
                                >
                                    <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                                    <span className="text-sm font-medium">{benefit.label}</span>
                                    {isSelected && <CheckCircle className="w-4 h-4 ml-auto text-emerald-600" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Section 5: Location & Dates */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-slate-800">Localisation & Dates</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Ville *</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select
                                    name="city_id"
                                    value={formData.city_id}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Sélectionner une ville</option>
                                    {cities.map(city => (
                                        <option key={city.city_id} value={city.city_id}>
                                            {city.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Date limite de candidature</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="date"
                                    name="application_deadline"
                                    value={formData.application_deadline}
                                    onChange={handleChange}
                                    className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Date de début *</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="date"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Date de fin *</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="date"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Urgent Toggle */}
                    <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    name="is_urgent"
                                    checked={formData.is_urgent}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-red-500 transition-colors"></div>
                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Zap className={`w-4 h-4 ${formData.is_urgent ? 'text-red-500' : 'text-slate-400'}`} />
                                <span className={`font-medium ${formData.is_urgent ? 'text-red-600' : 'text-slate-700'}`}>
                                    Mission urgente
                                </span>
                            </div>
                        </label>
                        <span className="text-xs text-slate-500">
                            Les missions urgentes sont mises en avant (Premium requis)
                        </span>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/establishment/missions')}
                        className="px-6 py-3 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                Mise à jour...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Mettre à jour la mission
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditMission;
