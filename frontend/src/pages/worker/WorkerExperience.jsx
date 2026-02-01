import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/client';
import { Briefcase, Plus, Trash2, Calendar, MapPin, Building2, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WorkerExperience() {
    const { user } = useAuth();
    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        start_date: '',
        end_date: '',
        description: '',
        current: false
    });

    useEffect(() => {
        loadExperiences();
    }, []);

    const loadExperiences = async () => {
        try {
            const { data } = await api.get('/worker/profile');
            // Assuming the profile data includes experiences as 'experiences' array
            setExperiences(data.data.experiences || []);
        } catch (error) {
            console.error('Failed to load experiences', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette expérience ?')) return;
        try {
            await api.delete(`/worker/experience/${id}`);
            setExperiences(prev => prev.filter(e => e.id !== id));
        } catch (error) {
            alert('Erreur lors de la suppression');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { data } = await api.post('/worker/experience', formData);
            setExperiences(prev => [data.data, ...prev]);
            setShowForm(false);
            setFormData({
                title: '',
                company: '',
                location: '',
                start_date: '',
                end_date: '',
                description: '',
                current: false
            });
        } catch (error) {
            alert('Erreur lors de l\'ajout');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Chargement...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Link to="/worker/dashboard" className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-2">
                        <ChevronLeft className="w-4 h-4" /> Retour au tableau de bord
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Briefcase className="w-7 h-7 text-blue-600" />
                        Mes Expériences
                    </h1>
                    <p className="text-slate-500">Gérez votre parcours professionnel</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Ajouter une expérience
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-semibold mb-4">Nouvelle expérience</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Intitulé du poste</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Entreprise / Organisme</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                                    value={formData.company}
                                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Lieu</label>
                                <input
                                    type="text"
                                    className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center gap-4 pt-7">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                        checked={formData.current}
                                        onChange={e => setFormData({ ...formData, current: e.target.checked })}
                                    />
                                    <span className="text-sm text-slate-700">Poste actuel</span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Date de début</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                                    value={formData.start_date}
                                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                />
                            </div>
                            {!formData.current && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Date de fin</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full h-10 px-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                                        value={formData.end_date}
                                        onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                    />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea
                                className="w-full h-24 px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
                                placeholder="Décrivez vos missions principales..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            ></textarea>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {submitting ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            <div className="grid gap-4">
                {experiences.length === 0 && !showForm ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                        <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">Aucune expérience ajoutée pour le moment</p>
                    </div>
                ) : (
                    experiences.map((exp) => (
                        <div key={exp.id} className="bg-white p-5 rounded-xl border border-slate-200 hover:shadow-md transition-shadow flex items-start justify-between group">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Building2 className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">{exp.title}</h3>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 mt-1">
                                        <span className="font-medium text-slate-700">{exp.company}</span>
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" /> {exp.location || 'Non spécifié'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(exp.start_date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })} -
                                            {exp.is_current ? ' Présent' : new Date(exp.end_date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                    {exp.description && (
                                        <p className="text-slate-600 mt-3 text-sm leading-relaxed">{exp.description}</p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(exp.id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                title="Supprimer"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
