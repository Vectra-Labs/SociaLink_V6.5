import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../hooks/useAuth';
import {
    Award, Plus, X, Search, Loader, CheckCircle,
    Star, Sparkles, TrendingUp, Users, Heart, Brain, Stethoscope,
    Home as HomeIcon, Baby, Shield, Activity, Briefcase, Calendar,
    Building2, MapPin, Edit2, Trash2, Clock, GraduationCap, Eye
} from 'lucide-react';

// Skill categories avec icônes et couleurs
const SKILL_CATEGORIES = {
    'Soins': { icon: Stethoscope, color: 'rose', gradient: 'from-rose-500 to-pink-600' },
    'Accompagnement': { icon: Heart, color: 'purple', gradient: 'from-purple-500 to-indigo-600' },
    'Petite enfance': { icon: Baby, color: 'amber', gradient: 'from-amber-500 to-orange-600' },
    'Handicap': { icon: Users, color: 'blue', gradient: 'from-blue-500 to-cyan-600' },
    'Gériatrie': { icon: HomeIcon, color: 'emerald', gradient: 'from-emerald-500 to-teal-600' },
    'Santé mentale': { icon: Brain, color: 'violet', gradient: 'from-violet-500 to-purple-600' },
    'Autre': { icon: Activity, color: 'slate', gradient: 'from-slate-500 to-gray-600' }
};

// Helper function to categorize skills
const categorizeSkill = (skillName) => {
    const name = skillName.toLowerCase();
    if (name.includes('soin') || name.includes('infirm') || name.includes('médic')) return 'Soins';
    if (name.includes('accomp') || name.includes('aide') || name.includes('assist')) return 'Accompagnement';
    if (name.includes('enfant') || name.includes('pédia') || name.includes('matern')) return 'Petite enfance';
    if (name.includes('handicap') || name.includes('pmr') || name.includes('auton')) return 'Handicap';
    if (name.includes('gériat') || name.includes('âgé') || name.includes('ehpad') || name.includes('senior')) return 'Gériatrie';
    if (name.includes('psycho') || name.includes('mental') || name.includes('psychiatr')) return 'Santé mentale';
    return 'Autre';
};

export default function SpecialitiesManager() {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Skills state
    const [allSpecialities, setAllSpecialities] = useState([]);
    const [mySpecialities, setMySpecialities] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('ALL');

    // Experiences state
    const [experiences, setExperiences] = useState([]);
    const [showExpForm, setShowExpForm] = useState(false);
    const [editingExp, setEditingExp] = useState(null);
    const [expForm, setExpForm] = useState({
        establishment_name: '',
        job_title: '',
        description: '',
        start_date: '',
        end_date: '',
        is_current_role: false
    });

    // UI state
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [activeTab, setActiveTab] = useState('skills'); // 'skills' or 'experience'
    const [showSkillModal, setShowSkillModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [allRes, myRes, expRes] = await Promise.all([
                api.get('/specialities'),
                api.get('/worker/specialities'),
                api.get('/worker/profile').then(res => res.data.data?.experiences || []).catch(() => [])
            ]);
            setAllSpecialities(allRes.data.data || []);
            setMySpecialities(myRes.data.data || []);
            setExperiences(expRes);
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Erreur lors du chargement des données.' });
        } finally {
            setLoading(false);
        }
    };

    // Group my skills by category
    const mySkillsByCategory = useMemo(() => {
        const grouped = {};
        mySpecialities.forEach(skill => {
            const cat = categorizeSkill(skill.name);
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(skill);
        });
        return grouped;
    }, [mySpecialities]);

    // Available skills with filtering
    const availableSpecialities = useMemo(() => {
        return allSpecialities
            .filter(s => !mySpecialities.some(my => my.speciality_id === s.speciality_id))
            .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(s => activeCategory === 'ALL' || categorizeSkill(s.name) === activeCategory);
    }, [allSpecialities, mySpecialities, searchTerm, activeCategory]);

    // Count skills per category
    const categoryStats = useMemo(() => {
        const stats = { ALL: 0 };
        allSpecialities
            .filter(s => !mySpecialities.some(my => my.speciality_id === s.speciality_id))
            .forEach(s => {
                const cat = categorizeSkill(s.name);
                stats[cat] = (stats[cat] || 0) + 1;
                stats.ALL++;
            });
        return stats;
    }, [allSpecialities, mySpecialities]);

    const handleToggle = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleAddSkills = async () => {
        if (selectedIds.length === 0) return;
        setSaving(true);
        try {
            await api.post('/worker/add/specialities', { speciality_ids: selectedIds });
            setMessage({ type: 'success', text: `${selectedIds.length} compétence(s) ajoutée(s) !` });
            setSelectedIds([]);
            setShowSkillModal(false);
            fetchData();
        } catch (error) {
            setMessage({ type: 'error', text: 'Impossible d\'ajouter les compétences.' });
        } finally {
            setSaving(false);
        }
    };

    const handleRemoveSkill = async (id) => {
        try {
            await api.delete(`/worker/specialities/${id}`);
            setMySpecialities(prev => prev.filter(s => s.speciality_id !== id));
            setMessage({ type: 'success', text: 'Compétence retirée.' });
            setTimeout(() => setMessage({ type: '', text: '' }), 2000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de la suppression.' });
        }
    };

    // Experience handlers
    const handleExpSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingExp) {
                // Update - not implemented yet
                setMessage({ type: 'info', text: 'Modification en cours...' });
            } else {
                await api.post('/worker/experience', expForm);
                setMessage({ type: 'success', text: 'Expérience ajoutée avec succès !' });
            }
            setShowExpForm(false);
            setEditingExp(null);
            setExpForm({
                establishment_name: '',
                job_title: '',
                description: '',
                start_date: '',
                end_date: '',
                is_current_role: false
            });
            fetchData();
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement.' });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteExp = async (id) => {
        if (!confirm('Supprimer cette expérience ?')) return;
        try {
            await api.delete(`/worker/experience/${id}`);
            setExperiences(prev => prev.filter(e => e.experience_id !== id));
            setMessage({ type: 'success', text: 'Expérience supprimée.' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de la suppression.' });
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full bg-blue-100 animate-pulse mx-auto" />
                        <Loader className="w-8 h-8 text-blue-600 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="mt-4 text-slate-500">Chargement du profil...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-10">
            {/* Hero Section - Profile Strength */}
            <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-6 mb-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-2xl font-bold mb-1">Mon Portfolio Professionnel</h1>
                            <p className="text-white/80">Valorisez vos compétences et expériences pour attirer les meilleurs recruteurs</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Eye className="w-5 h-5 text-white/60" />
                            <span className="text-sm text-white/80">Visible par les établissements</span>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <div className="text-3xl font-bold">{mySpecialities.length}</div>
                            <div className="text-sm text-white/80">Compétences</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <div className="text-3xl font-bold">{experiences.length}</div>
                            <div className="text-sm text-white/80">Expériences</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <div className="text-3xl font-bold">{user?.workerProfile?.experience_years || 0}</div>
                            <div className="text-sm text-white/80">Années d'exp.</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <div className="text-3xl font-bold flex items-center justify-center gap-1">
                                {Math.min(100, Math.round((mySpecialities.length * 10 + experiences.length * 20 + (user?.workerProfile?.bio ? 20 : 0))))}%
                            </div>
                            <div className="text-sm text-white/80">Profil complet</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Message Toast */}
            {message.text && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-fade-in ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' :
                            'bg-blue-50 text-blue-700 border border-blue-100'
                    }`}>
                    <CheckCircle className="w-5 h-5" />
                    {message.text}
                </div>
            )}

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-xl">
                <button
                    onClick={() => setActiveTab('skills')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${activeTab === 'skills'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-600 hover:text-slate-800'
                        }`}
                >
                    <Award className="w-5 h-5" />
                    Compétences ({mySpecialities.length})
                </button>
                <button
                    onClick={() => setActiveTab('experience')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${activeTab === 'experience'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-600 hover:text-slate-800'
                        }`}
                >
                    <Briefcase className="w-5 h-5" />
                    Expériences ({experiences.length})
                </button>
            </div>

            {/* SKILLS TAB */}
            {activeTab === 'skills' && (
                <div className="space-y-6">
                    {/* Add Skills Button */}
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold text-slate-800">Mes compétences</h2>
                        <button
                            onClick={() => setShowSkillModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Ajouter des compétences
                        </button>
                    </div>

                    {/* My Skills Display */}
                    {mySpecialities.length > 0 ? (
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <div className="space-y-4">
                                {Object.entries(mySkillsByCategory).map(([category, skills]) => {
                                    const catInfo = SKILL_CATEGORIES[category] || SKILL_CATEGORIES['Autre'];
                                    const Icon = catInfo.icon;

                                    return (
                                        <div key={category}>
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${catInfo.gradient} flex items-center justify-center`}>
                                                    <Icon className="w-4 h-4 text-white" />
                                                </div>
                                                <span className="font-medium text-slate-700">{category}</span>
                                                <span className="text-xs text-slate-400">({skills.length})</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2 pl-10">
                                                {skills.map(skill => (
                                                    <span
                                                        key={skill.speciality_id}
                                                        className="group relative px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
                                                    >
                                                        {skill.name}
                                                        <button
                                                            onClick={() => handleRemoveSkill(skill.speciality_id)}
                                                            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Sparkles className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-2">Aucune compétence ajoutée</h3>
                            <p className="text-slate-500 mb-6">Ajoutez vos spécialités pour être visible par les recruteurs</p>
                            <button
                                onClick={() => setShowSkillModal(true)}
                                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-5 h-5 inline mr-2" />
                                Ajouter mes compétences
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* EXPERIENCE TAB */}
            {activeTab === 'experience' && (
                <div className="space-y-6">
                    {/* Add Experience Button */}
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold text-slate-800">Mes expériences professionnelles</h2>
                        <button
                            onClick={() => { setShowExpForm(true); setEditingExp(null); }}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Ajouter une expérience
                        </button>
                    </div>

                    {/* Experience Form Modal */}
                    {showExpForm && (
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-lg">
                            <h3 className="text-lg font-bold text-slate-800 mb-4">
                                {editingExp ? 'Modifier l\'expérience' : 'Nouvelle expérience'}
                            </h3>
                            <form onSubmit={handleExpSubmit} className="space-y-4">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Poste occupé *</label>
                                        <input
                                            type="text"
                                            required
                                            value={expForm.job_title}
                                            onChange={(e) => setExpForm({ ...expForm, job_title: e.target.value })}
                                            placeholder="Ex: Aide-soignant(e)"
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Établissement *</label>
                                        <input
                                            type="text"
                                            required
                                            value={expForm.establishment_name}
                                            onChange={(e) => setExpForm({ ...expForm, establishment_name: e.target.value })}
                                            placeholder="Ex: CHU Mohammed VI"
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Date de début *</label>
                                        <input
                                            type="date"
                                            required
                                            value={expForm.start_date}
                                            onChange={(e) => setExpForm({ ...expForm, start_date: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Date de fin</label>
                                        <input
                                            type="date"
                                            value={expForm.end_date}
                                            onChange={(e) => setExpForm({ ...expForm, end_date: e.target.value })}
                                            disabled={expForm.is_current_role}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-slate-50"
                                        />
                                        <label className="flex items-center gap-2 mt-2">
                                            <input
                                                type="checkbox"
                                                checked={expForm.is_current_role}
                                                onChange={(e) => setExpForm({ ...expForm, is_current_role: e.target.checked, end_date: '' })}
                                                className="rounded text-blue-600"
                                            />
                                            <span className="text-sm text-slate-600">Poste actuel</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                    <textarea
                                        value={expForm.description}
                                        onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                                        rows={3}
                                        placeholder="Décrivez vos missions et responsabilités..."
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => { setShowExpForm(false); setEditingExp(null); }}
                                        className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {saving && <Loader className="w-4 h-4 animate-spin" />}
                                        {editingExp ? 'Modifier' : 'Ajouter'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Experiences List */}
                    {experiences.length > 0 ? (
                        <div className="space-y-4">
                            {experiences.map((exp, idx) => (
                                <div key={exp.experience_id || idx} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <Briefcase className="w-6 h-6 text-slate-500" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800">{exp.job_title}</h4>
                                                <p className="text-slate-600 flex items-center gap-1">
                                                    <Building2 className="w-4 h-4" />
                                                    {exp.establishment_name}
                                                </p>
                                                <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDate(exp.start_date)} — {exp.is_current_role ? 'Présent' : formatDate(exp.end_date)}
                                                </p>
                                                {exp.description && (
                                                    <p className="text-sm text-slate-500 mt-2">{exp.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDeleteExp(exp.experience_id)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : !showExpForm && (
                        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Briefcase className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-2">Aucune expérience ajoutée</h3>
                            <p className="text-slate-500 mb-6">Ajoutez vos expériences professionnelles pour renforcer votre profil</p>
                            <button
                                onClick={() => setShowExpForm(true)}
                                className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
                            >
                                <Plus className="w-5 h-5 inline mr-2" />
                                Ajouter une expérience
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* SKILL MODAL */}
            {showSkillModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Ajouter des compétences</h3>
                                <p className="text-sm text-slate-500">{categoryStats.ALL} compétences disponibles</p>
                            </div>
                            <button
                                onClick={() => { setShowSkillModal(false); setSelectedIds([]); }}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Search */}
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher une compétence..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>

                            {/* Category Filters */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                <button
                                    onClick={() => setActiveCategory('ALL')}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeCategory === 'ALL'
                                            ? 'bg-slate-800 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    Tous ({categoryStats.ALL || 0})
                                </button>
                                {Object.entries(SKILL_CATEGORIES).map(([cat, info]) => {
                                    const Icon = info.icon;
                                    const count = categoryStats[cat] || 0;
                                    if (count === 0) return null;

                                    return (
                                        <button
                                            key={cat}
                                            onClick={() => setActiveCategory(cat)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeCategory === cat
                                                    ? `bg-gradient-to-r ${info.gradient} text-white`
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {cat} ({count})
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Skills Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-2">
                                {availableSpecialities.map(skill => {
                                    const isSelected = selectedIds.includes(skill.speciality_id);
                                    const category = categorizeSkill(skill.name);
                                    const catInfo = SKILL_CATEGORIES[category] || SKILL_CATEGORIES['Autre'];

                                    return (
                                        <button
                                            key={skill.speciality_id}
                                            onClick={() => handleToggle(skill.speciality_id)}
                                            className={`p-3 rounded-xl border-2 transition-all text-left ${isSelected
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-slate-200 hover:border-slate-300 bg-white'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <span className={`text-sm font-medium ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
                                                    {skill.name}
                                                </span>
                                                {isSelected && <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {availableSpecialities.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-slate-500">
                                        {searchTerm ? 'Aucune compétence trouvée' : 'Toutes les compétences sont déjà ajoutées !'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-slate-200 flex justify-between items-center bg-slate-50">
                            <span className="text-sm text-slate-500">
                                {selectedIds.length} compétence(s) sélectionnée(s)
                            </span>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setShowSkillModal(false); setSelectedIds([]); }}
                                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-white"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleAddSkills}
                                    disabled={selectedIds.length === 0 || saving}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {saving && <Loader className="w-4 h-4 animate-spin" />}
                                    Ajouter ({selectedIds.length})
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
