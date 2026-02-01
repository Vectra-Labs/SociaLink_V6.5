import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import {
    Briefcase, Calendar, MapPin, DollarSign,
    AlignLeft, Save, ArrowLeft, Loader, CheckCircle, AlertCircle,
    Users, Building2, Zap, GraduationCap, Heart, Info
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

// Constants
const SECTORS = [
    'Action Sociale', 'Aide à Domicile', 'Médical', 'Petite Enfance',
    'Éducation Spécialisée', 'Animation', 'Handicap', 'Personnes Âgées',
    'Insertion Professionnelle', 'Autre'
];

const CONTRACT_TYPES = [
    { value: 'CDI', label: 'CDI' },
    { value: 'CDD', label: 'CDD' },
    { value: 'INTERIM', label: 'Intérim' },
    { value: 'STAGE', label: 'Stage' },
    { value: 'BENEVOLAT', label: 'Bénévolat' },
    { value: 'FREELANCE', label: 'Freelance' }
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
    'Éducation spécialisée', 'Accompagnement social', 'Écoute active',
    'Protection de l\'enfance', 'Animation de groupe', 'Relation d\'aide',
    'Gestion de conflit', 'Soins infirmiers', 'Premiers secours', 'Permis B'
];

const CreateMission = () => {
    const navigate = useNavigate();
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [formData, setFormData] = useState({
        title: '', description: '', sector: '',
        contract_type: 'CDD', work_mode: 'ON_SITE', experience_level: 'INTERMEDIATE', positions_count: 1,
        salary_min: '', salary_max: '', budget: '',
        city_id: '', start_date: '', end_date: '', application_deadline: '', is_urgent: false,
        benefits: [], skills: []
    });

    useEffect(() => {
        fetchCities();
    }, []);

    const fetchCities = async () => {
        try {
            const { data } = await api.get('/general/cities');
            setCities(data.data || []);
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Impossible de charger les villes.' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
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
            const payload = {
                ...formData,
                budget: formData.salary_max ? parseFloat(formData.salary_max) : null,
                salary_min: formData.salary_min ? parseFloat(formData.salary_min) : null,
                salary_max: formData.salary_max ? parseFloat(formData.salary_max) : null,
                city_id: parseInt(formData.city_id),
                positions_count: parseInt(formData.positions_count) || 1
            };

            await api.post('/missions/create', payload);
            setMessage({ type: 'success', text: 'Mission publiée avec succès !' });
            setTimeout(() => navigate('/establishment/missions'), 1000);
        } catch (error) {
            const errMsg = error.response?.data?.message || 'Erreur lors de la création.';
            setMessage({ type: 'error', text: errMsg });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto pb-10">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" onClick={() => navigate('/establishment/dashboard')} className="pl-0 hover:bg-transparent">
                    <ArrowLeft className="w-6 h-6 text-slate-500 hover:text-blue-600 transition-colors" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Nouvelle Mission</h1>
                    <p className="text-slate-500">Publiez une offre détaillée pour trouver le candidat idéal</p>
                </div>
            </div>

            {message.text && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'
                    }`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Section 1: Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-blue-600" /> Informations de base
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Titre de la mission *</label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Ex: Éducateur spécialisé"
                                required
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Secteur / Catégorie *</label>
                            <select
                                name="sector"
                                value={formData.sector}
                                onChange={handleChange}
                                required
                                className="input-field"
                            >
                                <option value="">Sélectionner</option>
                                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
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
                                className="input-field"
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
                                    placeholder="Détaillez les responsabilités..."
                                    className="input-field pl-10 resize-none"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section 2: Job Type */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600" /> Type de poste
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Type de contrat *</label>
                            <select
                                name="contract_type"
                                value={formData.contract_type}
                                onChange={handleChange}
                                required
                                className="input-field"
                            >
                                {CONTRACT_TYPES.map(ct => <option key={ct.value} value={ct.value}>{ct.label}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Niveau d'expérience *</label>
                            <select
                                name="experience_level"
                                value={formData.experience_level}
                                onChange={handleChange}
                                required
                                className="input-field"
                            >
                                {EXPERIENCE_LEVELS.map(el => <option key={el.value} value={el.value}>{el.label}</option>)}
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
                                            className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${isSelected
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
                    </CardContent>
                </Card>

                {/* Section 3: Salary */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-blue-600" /> Rémunération
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Salaire min (MAD)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="number"
                                    name="salary_min"
                                    value={formData.salary_min}
                                    onChange={handleChange}
                                    className="input-field pl-10"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Salaire max (MAD)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="number"
                                    name="salary_max"
                                    value={formData.salary_max}
                                    onChange={handleChange}
                                    className="input-field pl-10"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section 4: Skills & Benefits */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-blue-600" /> Compétences & Avantages
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">Compétences requises</label>
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
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">Avantages proposés</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {BENEFITS_OPTIONS.map(benefit => {
                                    const Icon = benefit.icon;
                                    const isSelected = formData.benefits.includes(benefit.value);
                                    return (
                                        <button
                                            key={benefit.value}
                                            type="button"
                                            onClick={() => handleBenefitToggle(benefit.value)}
                                            className={`p-3 rounded-xl border transition-all flex items-center gap-2 ${isSelected
                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                : 'border-slate-200 hover:border-slate-300 text-slate-600'
                                                }`}
                                        >
                                            <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                                            <span className="text-sm font-medium">{benefit.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section 5: Location & Dates */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-600" /> Localisation & Dates
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Ville *</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select
                                    name="city_id"
                                    value={formData.city_id}
                                    onChange={handleChange}
                                    required
                                    className="input-field pl-10"
                                >
                                    <option value="">Sélectionner</option>
                                    {cities.map(c => <option key={c.city_id} value={c.city_id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Date limite candidature</label>
                            <input
                                type="date"
                                name="application_deadline"
                                value={formData.application_deadline}
                                onChange={handleChange}
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Début *</label>
                            <input
                                type="date"
                                name="start_date"
                                value={formData.start_date}
                                onChange={handleChange}
                                required
                                className="input-field"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Fin *</label>
                            <input
                                type="date"
                                name="end_date"
                                value={formData.end_date}
                                onChange={handleChange}
                                required
                                className="input-field"
                            />
                        </div>

                        {/* Urgent Toggle - Blue/Indigo instead of Red/Yellow */}
                        <div className="md:col-span-2 pt-4 border-t border-slate-100">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="is_urgent"
                                        checked={formData.is_urgent}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-indigo-600 transition-colors"></div>
                                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Zap className={`w-4 h-4 ${formData.is_urgent ? 'text-indigo-600' : 'text-slate-400'}`} />
                                    <span className={`font-medium ${formData.is_urgent ? 'text-indigo-700' : 'text-slate-700'}`}>
                                        Mission urgente
                                    </span>
                                </div>
                            </label>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-4 pt-4">
                    <Button variant="secondary" onClick={() => navigate('/establishment/missions')}>
                        Annuler
                    </Button>
                    <Button type="submit" isLoading={submitting} icon={Save}>
                        Publier la mission
                    </Button>
                </div>
            </form>

            {/* Inline Styles for Inputs */}
            <style>{`
                .input-field {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    background-color: #f8fafc; /* slate-50 */
                    border: 1px solid #e2e8f0; /* slate-200 */
                    border-radius: 0.75rem; /* rounded-xl */
                    transition: all 0.2s;
                    outline: none;
                }
                .input-field:focus {
                    background-color: #ffffff;
                    border-color: #3b82f6; /* blue-500 */
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }
            `}</style>
        </div>
    );
};

export default CreateMission;
