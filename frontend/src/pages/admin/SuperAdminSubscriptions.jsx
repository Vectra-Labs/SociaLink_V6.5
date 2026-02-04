import { useState, useEffect } from 'react';
import {
    CreditCard, Check, X, Edit, Plus, Users,
    ShieldCheck, Eye, Search, Zap
} from 'lucide-react';
import api from '../../api/client';

const SuperAdminSubscriptions = () => {
    const [activeRole, setActiveRole] = useState('WORKER'); // WORKER or ESTABLISHMENT
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        code: 'BASIC',
        name: '',
        description: '',
        price_monthly_dh: 0,
        trial_days: 0,
        // Worker Limits
        max_active_applications: 3,
        can_view_urgent_missions: false,
        can_view_full_profiles: false,
        has_auto_matching: false,
        mission_view_delay_hours: 48,
        // Establishment Limits
        max_active_missions: 3,
        can_post_urgent: false,
        can_search_workers: false,
        urgent_mission_fee_percent: 30,

        is_active: true
    });

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const { data } = await api.get('/admin/plans');
            setPlans(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (plan) => {
        setEditingPlan(plan);
        setFormData({
            ...plan,
            price_monthly_dh: plan.price_monthly / 100, // Convert cents to DH
        });
        setShowModal(true);
    };

    const handleCreate = () => {
        setEditingPlan(null);
        setFormData({
            code: 'PREMIUM',
            name: '',
            target_role: activeRole,
            description: '',
            price_monthly_dh: 99,
            trial_days: 0,
            max_active_applications: 10,
            can_view_urgent_missions: false,
            can_view_full_profiles: false,
            has_auto_matching: false,
            mission_view_delay_hours: 24,
            max_active_missions: 5,
            can_post_urgent: false,
            can_search_workers: false,
            urgent_mission_fee_percent: 30,
            is_active: true
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                price_monthly: Math.round(parseFloat(formData.price_monthly_dh) * 100), // Save as cents
                target_role: activeRole
            };
            delete payload.price_monthly_dh;

            if (editingPlan) {
                await api.put(`/admin/plans/${editingPlan.plan_id}`, payload);
            } else {
                await api.post('/admin/plans', payload);
            }
            setShowModal(false);
            fetchPlans();
        } catch (error) {
            alert("Erreur: " + error.response?.data?.message || "Erreur inconnue");
        }
    };

    const filteredPlans = plans.filter(p => p.target_role === activeRole);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Offres & Abonnements</h1>
                    <p className="text-slate-500">Configurez les plans et les limites pour chaque rôle.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Créer une Offre
                </button>
            </div>

            {/* Role Toggles */}
            <div className="bg-slate-100 p-1 rounded-xl inline-flex">
                <button
                    onClick={() => setActiveRole('WORKER')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeRole === 'WORKER' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Travailleurs
                </button>
                <button
                    onClick={() => setActiveRole('ESTABLISHMENT')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeRole === 'ESTABLISHMENT' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Établissements
                </button>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredPlans.map((plan) => (
                    <div key={plan.plan_id} className={`group relative bg-white rounded-2xl border transition-all hover:shadow-lg ${plan.is_active ? 'border-slate-200' : 'border-slate-100 opacity-75'}`}>
                        {/* Status Badge */}
                        <div className="absolute top-4 right-4">
                            <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${plan.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                {plan.is_active ? 'Actif' : 'Désactivé'}
                            </span>
                        </div>

                        <div className="p-6">
                            <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                            <div className="flex items-baseline gap-1 mt-2">
                                <span className="text-3xl font-bold text-blue-600">{(plan.price_monthly / 100).toLocaleString()}</span>
                                <span className="text-sm text-slate-500">DH / mois</span>
                            </div>
                            <p className="text-sm text-slate-500 mt-2 min-h-[40px]">{plan.description || "Aucune description"}</p>

                            <hr className="my-4 border-slate-100" />

                            <div className="space-y-3 text-sm">
                                {activeRole === 'WORKER' ? (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <div className="p-1 rounded bg-blue-50 text-blue-600"><Edit className="w-3 h-3" /></div>
                                            <span className="text-slate-600"><strong>{plan.max_active_applications}</strong> candidatures actives</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`p-1 rounded ${plan.can_view_urgent_missions ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                                                {plan.can_view_urgent_missions ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                            </div>
                                            <span className={plan.can_view_urgent_missions ? 'text-slate-700' : 'text-slate-400'}>Missions urgentes</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="p-1 rounded bg-slate-50 text-slate-500"><Eye className="w-3 h-3" /></div>
                                            <span className="text-slate-600">Délai vue : <strong>{plan.mission_view_delay_hours}h</strong></span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <div className="p-1 rounded bg-blue-50 text-blue-600"><Edit className="w-3 h-3" /></div>
                                            <span className="text-slate-600"><strong>{plan.max_active_missions || 'Illimitées'}</strong> missions actives</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`p-1 rounded ${plan.can_search_workers ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                                                {plan.can_search_workers ? <Search className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                            </div>
                                            <span className={plan.can_search_workers ? 'text-slate-700' : 'text-slate-400'}>Recherche CVthèque</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            <button
                                onClick={() => handleEdit(plan)}
                                className="w-full mt-6 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                            >
                                Modifier l'offre
                            </button>
                        </div>
                    </div>
                ))}

                {/* Empty State Add Card */}
                <button
                    onClick={handleCreate}
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl hover:border-blue-300 hover:bg-blue-50/50 transition-all group min-h-[300px]"
                >
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors mb-4">
                        <Plus className="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
                    </div>
                    <p className="font-medium text-slate-900 group-hover:text-blue-700">Ajouter une offre</p>
                    <p className="text-xs text-slate-500">Pour {activeRole === 'WORKER' ? 'Travailleurs' : 'Établissements'}</p>
                </button>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-lg text-slate-900">
                                {editingPlan ? 'Modifier l\'Offre' : 'Nouvelle Offre'}
                            </h3>
                            <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* General Info */}
                            <div className="space-y-4 md:col-span-2">
                                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-2">Informations Générales</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-1">
                                        <label className="label">Nom de l'offre</label>
                                        <input className="input" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Premium" />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="label">Code (Unique)</label>
                                        <select className="input" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })}>
                                            <option value="BASIC">BASIC (Gratuit)</option>
                                            <option value="PREMIUM">PREMIUM</option>
                                            <option value="PRO">PRO</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="label">Description courte</label>
                                        <input className="input" value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Avantages clés..." />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="label">Prix Mensuel (DH)</label>
                                        <input className="input" type="number" required value={formData.price_monthly_dh} onChange={e => setFormData({ ...formData, price_monthly_dh: e.target.value })} />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="label">Essai gratuit (Jours)</label>
                                        <input className="input" type="number" value={formData.trial_days} onChange={e => setFormData({ ...formData, trial_days: parseInt(e.target.value) })} />
                                    </div>
                                </div>
                            </div>

                            {/* Features Config based on Role */}
                            <div className="space-y-4 md:col-span-2">
                                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-2">
                                    Configuration {activeRole === 'WORKER' ? 'Travailleur' : 'Établissement'}
                                </h4>

                                {activeRole === 'WORKER' ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="label">Max Candidatures Actives</label>
                                            <input className="input" type="number" value={formData.max_active_applications} onChange={e => setFormData({ ...formData, max_active_applications: parseInt(e.target.value) })} />
                                        </div>
                                        <div>
                                            <label className="label">Délai vue missions (heures)</label>
                                            <input className="input" type="number" value={formData.mission_view_delay_hours} onChange={e => setFormData({ ...formData, mission_view_delay_hours: parseInt(e.target.value) })} />
                                            <p className="text-[10px] text-slate-400">0 = Immédiat, 48 = 2 jours après</p>
                                        </div>

                                        <div className="col-span-2 space-y-2 pt-2">
                                            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                                                <input type="checkbox" checked={formData.can_view_urgent_missions} onChange={e => setFormData({ ...formData, can_view_urgent_missions: e.target.checked })} className="checkbox" />
                                                <span className="text-sm text-slate-700">Voir missions urgentes</span>
                                            </label>
                                            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                                                <input type="checkbox" checked={formData.has_auto_matching} onChange={e => setFormData({ ...formData, has_auto_matching: e.target.checked })} className="checkbox" />
                                                <span className="text-sm text-slate-700">Matching Automatique (IA)</span>
                                            </label>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="label">Max Missions Actives</label>
                                            <input className="input" type="number" value={formData.max_active_missions || ''} onChange={e => setFormData({ ...formData, max_active_missions: parseInt(e.target.value) })} placeholder="Vide = Illimité" />
                                        </div>
                                        <div>
                                            <label className="label">Frais Mission Urgente (%)</label>
                                            <input className="input" type="number" value={formData.urgent_mission_fee_percent} onChange={e => setFormData({ ...formData, urgent_mission_fee_percent: parseInt(e.target.value) })} />
                                        </div>

                                        <div className="col-span-2 space-y-2 pt-2">
                                            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                                                <input type="checkbox" checked={formData.can_post_urgent} onChange={e => setFormData({ ...formData, can_post_urgent: e.target.checked })} className="checkbox" />
                                                <span className="text-sm text-slate-700">Poster Missions Urgentes</span>
                                            </label>
                                            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
                                                <input type="checkbox" checked={formData.can_search_workers} onChange={e => setFormData({ ...formData, can_search_workers: e.target.checked })} className="checkbox" />
                                                <span className="text-sm text-slate-700">Accès CVthèque (Recherche)</span>
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <div className="mr-auto flex items-center gap-2">
                                    <span className="text-sm text-slate-600">Offre Active ?</span>
                                    <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} className="toggle" />
                                </div>
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Annuler</button>
                                <button type="submit" className="btn-primary">Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .label { @apply block text-xs font-semibold text-slate-500 mb-1 uppercase; }
                .input { @apply w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none; }
                .checkbox { @apply w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500; }
                .btn-primary { @apply px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200; }
                .btn-secondary { @apply px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors; }
            `}</style>
        </div>
    );
};

export default SuperAdminSubscriptions;
