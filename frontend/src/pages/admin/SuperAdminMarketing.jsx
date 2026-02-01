import { useState, useEffect } from 'react';
import {
    Megaphone, Bell, Image as ImageIcon, Plus, Trash2, Edit2,
    Send, CheckCircle, AlertTriangle, ToggleLeft, ToggleRight
} from 'lucide-react';
import api from '../../api/client';

const SuperAdminMarketing = () => {
    const [activeTab, setActiveTab] = useState('BANNERS'); // BANNERS | NOTIFICATIONS
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(false);

    // Banner Form State
    const [showBannerModal, setShowBannerModal] = useState(false);
    const [bannerData, setBannerData] = useState({
        title: '', message: '', image_url: '', link: '',
        target_role: '', priority: 0, is_active: true
    });
    const [editingId, setEditingId] = useState(null);

    // Notification Form State
    const [notifData, setNotifData] = useState({
        title: '', message: '', target_role: 'ALL', target_status: 'VALIDATED'
    });
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (activeTab === 'BANNERS') fetchBanners();
    }, [activeTab]);

    const fetchBanners = async () => {
        try {
            const { data } = await api.get('/super-admin/banners');
            setBanners(data);
        } catch (error) {
            console.error("Error fetching banners", error);
        }
    };

    // --- BANNER HANDLERS ---
    const handleEditBanner = (bn) => {
        setEditingId(bn.banner_id);
        setBannerData(bn);
        setShowBannerModal(true);
    };

    const handleCreateBanner = () => {
        setEditingId(null);
        setBannerData({
            title: '', message: '', image_url: '', link: '',
            target_role: '', priority: 0, is_active: true
        });
        setShowBannerModal(true);
    };

    const handleDeleteBanner = async (id) => {
        if (!window.confirm("Supprimer cette bannière ?")) return;
        try {
            await api.delete(`/super-admin/banners/${id}`);
            fetchBanners();
        } catch (e) {
            alert("Erreur suppression");
        }
    };

    const submitBanner = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/super-admin/banners/${editingId}`, bannerData);
            } else {
                await api.post('/super-admin/banners', bannerData);
            }
            setShowBannerModal(false);
            fetchBanners();
        } catch (error) {
            alert("Erreur sauvegarde");
        }
    };

    const toggleBannerStatus = async (bn) => {
        try {
            await api.put(`/super-admin/banners/${bn.banner_id}`, { ...bn, is_active: !bn.is_active });
            fetchBanners();
        } catch (e) { console.error(e); }
    };

    // --- NOTIFICATION HANDLERS ---
    const sendNotification = async (e) => {
        e.preventDefault();
        if (!window.confirm("Êtes-vous sûr d'envoyer cette notification à tous les utilisateurs ciblés ?")) return;

        setSending(true);
        try {
            const { data } = await api.post('/super-admin/notifications/broadcast', notifData);
            alert(data.message);
            setNotifData({ title: '', message: '', target_role: 'ALL', target_status: 'VALIDATED' });
        } catch (error) {
            alert("Erreur lors de l'envoi: " + (error.response?.data?.message || "Erreur serveur"));
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Marketing & Communication</h1>
                    <p className="text-slate-500">Gérez les bannières publicitaires et les notifications push.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('BANNERS')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'BANNERS' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <ImageIcon className="w-4 h-4" /> Bannières Publicitaires
                </button>
                <button
                    onClick={() => setActiveTab('NOTIFICATIONS')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'NOTIFICATIONS' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <Megaphone className="w-4 h-4" /> Notifications Push
                </button>
            </div>

            {/* Content */}
            {activeTab === 'BANNERS' ? (
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <button onClick={handleCreateBanner} className="btn-primary flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Nouvelle Bannière
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {banners.map((bn) => (
                            <div key={bn.banner_id} className={`bg-white rounded-xl border p-4 shadow-sm flex gap-4 ${!bn.is_active ? 'opacity-70 grayscale' : ''}`}>
                                <div className="w-24 h-24 bg-slate-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                                    {bn.image_url ? (
                                        <img src={bn.image_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="text-slate-300 w-8 h-8" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-slate-900 truncate">{bn.title}</h3>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Cible: <span className="uppercase font-medium bg-slate-100 px-1 rounded">{bn.target_role || 'Tous'}</span>
                                            </p>
                                        </div>
                                        <button onClick={() => toggleBannerStatus(bn)} className="text-slate-400 hover:text-blue-600">
                                            {bn.is_active ? <ToggleRight className="w-6 h-6 text-green-500" /> : <ToggleLeft className="w-6 h-6" />}
                                        </button>
                                    </div>
                                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">{bn.message}</p>
                                    <div className="flex gap-2 mt-3 justify-end">
                                        <button onClick={() => handleEditBanner(bn)} className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => handleDeleteBanner(bn.banner_id)} className="p-1.5 hover:bg-red-50 rounded text-red-500"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {banners.length === 0 && (
                            <div className="col-span-2 text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed">
                                Aucune bannière active
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="max-w-2xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-blue-50/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <Send className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">Envoi de Notification Groupée</h3>
                                <p className="text-sm text-slate-500">Envoyez une alerte à tous vos utilisateurs.</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={sendNotification} className="p-6 space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">Cible (Rôle)</label>
                                <select className="input" value={notifData.target_role} onChange={e => setNotifData({ ...notifData, target_role: e.target.value })}>
                                    <option value="ALL">Tous les utilisateurs</option>
                                    <option value="WORKER">Travailleurs uniquement</option>
                                    <option value="ESTABLISHMENT">Établissements uniquement</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">Filtre (Status)</label>
                                <select className="input" value={notifData.target_status} onChange={e => setNotifData({ ...notifData, target_status: e.target.value })}>
                                    <option value="">Tous les status</option>
                                    <option value="VALIDATED">Utilisateurs Validés</option>
                                    <option value="PENDING">En attente de validation</option>
                                    <option value="SUSPENDED">Suspendus</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="label">Titre de la notification</label>
                            <input
                                className="input font-bold"
                                placeholder="Ex: Maintenance système"
                                value={notifData.title}
                                onChange={e => setNotifData({ ...notifData, title: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <label className="label">Message</label>
                            <textarea
                                className="input min-h-[100px]"
                                placeholder="Votre message ici..."
                                value={notifData.message}
                                onChange={e => setNotifData({ ...notifData, message: e.target.value })}
                                required
                            />
                        </div>

                        <div className="bg-yellow-50 p-4 rounded-lg flex gap-3 text-sm text-yellow-800">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                            <p>Attention : Cette action est irréversible et enverra une notification à potentiellement des centaines d'utilisateurs. Utilisez avec précaution.</p>
                        </div>

                        <div className="flex justify-end">
                            <button type="submit" disabled={sending} className="btn-primary w-full md:w-auto flex justify-center items-center gap-2">
                                {sending ? 'Envoi en cours...' : <><Send className="w-4 h-4" /> Envoyer la notification</>}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Banner Modal */}
            {showBannerModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
                        <h3 className="text-lg font-bold mb-4">{editingId ? 'Modifier Bannière' : 'Nouvelle Bannière'}</h3>
                        <form onSubmit={submitBanner} className="space-y-4">
                            <div>
                                <label className="label">Titre</label>
                                <input className="input" value={bannerData.title} onChange={e => setBannerData({ ...bannerData, title: e.target.value })} required />
                            </div>
                            <div>
                                <label className="label">Message (Sous-titre)</label>
                                <input className="input" value={bannerData.message || ''} onChange={e => setBannerData({ ...bannerData, message: e.target.value })} />
                            </div>
                            <div>
                                <label className="label">URL Image</label>
                                <input className="input" value={bannerData.image_url || ''} onChange={e => setBannerData({ ...bannerData, image_url: e.target.value })} placeholder="https://..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Cible</label>
                                    <select className="input" value={bannerData.target_role || ''} onChange={e => setBannerData({ ...bannerData, target_role: e.target.value || null })}>
                                        <option value="">Tout le monde</option>
                                        <option value="WORKER">Travailleurs</option>
                                        <option value="ESTABLISHMENT">Établissements</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Priorité</label>
                                    <input type="number" className="input" value={bannerData.priority} onChange={e => setBannerData({ ...bannerData, priority: parseInt(e.target.value) })} />
                                </div>
                            </div>
                            <div className="flex gap-2 items-center pt-2">
                                <label className="label mb-0 mr-2">Active ?</label>
                                <input type="checkbox" checked={bannerData.is_active} onChange={e => setBannerData({ ...bannerData, is_active: e.target.checked })} className="w-5 h-5" />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowBannerModal(false)} className="px-4 py-2 border rounded-lg">Annuler</button>
                                <button type="submit" className="btn-primary">Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .label { @apply block text-xs font-semibold text-slate-500 mb-1 uppercase; }
                .input { @apply w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none; }
                .btn-primary { @apply px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200; }
            `}</style>
        </div>
    );
};

export default SuperAdminMarketing;
