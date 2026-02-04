import { useState, useEffect } from 'react';
import { 
    Search, Filter, Send, Users, Building2, User, 
    CheckSquare, Square, Bell, Loader2, Mail, X, Check, AlertTriangle, Info,
    MoreHorizontal, ArrowRight, Trash2, RefreshCw
} from 'lucide-react';
import api from '../../api/client';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminMessages() {
    const [activeTab, setActiveTab] = useState('ALL'); // ALL, WORKER, ESTABLISHMENT
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, VALIDATED, PENDING, REJECTED
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    
    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    // Message Composition
    const [showCompose, setShowCompose] = useState(false);
    const [messageData, setMessageData] = useState({ title: '', message: '', type: 'INFO' });
    const [sending, setSending] = useState(false);
    const [sendStatus, setSendStatus] = useState(null); // 'success' | 'error'

    // Fetch Users (Debounced)
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const res = await api.get('/admin/messaging/users', {
                    params: {
                        role: activeTab === 'ALL' ? undefined : activeTab,
                        status: statusFilter === 'ALL' ? undefined : statusFilter,
                        search: searchQuery,
                        page,
                        limit: 18 // Grid friendly number
                    }
                });
                setUsers(res.data.data);
                setTotalUsers(res.data.meta.total);
                setTotalPages(Math.ceil(res.data.meta.total / 18));
            } catch (err) {
                console.error("Error fetching users:", err);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchUsers, 400);
        return () => clearTimeout(timeoutId);
    }, [activeTab, statusFilter, searchQuery, page]);

    // Selection Logic
    const toggleSelectAll = () => {
        if (selectedUsers.length === users.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(users.map(u => u.id));
        }
    };

    const toggleSelectUser = (id) => {
        if (selectedUsers.includes(id)) {
            setSelectedUsers(selectedUsers.filter(uid => uid !== id));
        } else {
            setSelectedUsers([...selectedUsers, id]);
        }
    };

    // Send Message
    const handleSend = async () => {
        if (!messageData.message) return;
        
        setSending(true);
        setSendStatus(null);
        try {
            await api.post('/admin/messaging/send', {
                ...messageData,
                targetUserIds: selectedUsers.length > 0 ? selectedUsers : null,
                targetRole: selectedUsers.length === 0 ? (activeTab === 'ALL' ? 'ALL' : activeTab) : null
            });
            
            setSendStatus('success');
            setTimeout(() => {
                setShowCompose(false);
                setMessageData({ title: '', message: '', type: 'INFO' });
                setSelectedUsers([]);
                setSendStatus(null);
            }, 1500);
        } catch (err) {
            console.error("Error sending messages:", err);
            setSendStatus('error');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex h-[calc(100vh-64px)] bg-slate-50/50">
            
            {/* --- LEFT SIDEBAR (FILTERS) --- */}
            <div className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-10">
                <div className="p-6 pb-2">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-blue-200 shadow-lg">
                            <Mail className="w-5 h-5" />
                        </div>
                        Messagerie
                    </h2>
                    <p className="text-sm text-slate-500 mt-2 pl-1">Gérez vos communications et notifications.</p>
                </div>

                <div className="p-4">
                    <button 
                        onClick={() => setShowCompose(true)}
                        className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-lg shadow-slate-200 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                        <Send className="w-4 h-4" />
                        Nouvelle Diffusion
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-4 overflow-y-auto">
                    <div>
                        <p className="px-2 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Vérification Comptes</p>
                        <div className="space-y-1">
                            {['ALL', 'WORKER', 'ESTABLISHMENT'].map((tab) => (
                                <button 
                                    key={tab}
                                    onClick={() => { setActiveTab(tab); setPage(1); setSelectedUsers([]); }}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                                        activeTab === tab 
                                        ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100' 
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {tab === 'ALL' && <Users className={`w-4 h-4 ${activeTab === tab ? 'text-blue-600' : 'text-slate-400'}`} />}
                                        {tab === 'WORKER' && <User className={`w-4 h-4 ${activeTab === tab ? 'text-blue-600' : 'text-slate-400'}`} />}
                                        {tab === 'ESTABLISHMENT' && <Building2 className={`w-4 h-4 ${activeTab === tab ? 'text-blue-600' : 'text-slate-400'}`} />}
                                        <span>
                                            {tab === 'ALL' && 'Tous'}
                                            {tab === 'WORKER' && 'Travailleurs'}
                                            {tab === 'ESTABLISHMENT' && 'Établissements'}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="px-2 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Statut du compte</p>
                        <div className="space-y-1">
                             {/* Status Filter */}
                             <select 
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer hover:border-blue-300 transition-colors"
                            >
                                <option value="ALL">Tous les statuts</option>
                                <option value="VALIDATED">✅ Validé</option>
                                <option value="PENDING">⏳ En attente</option>
                                <option value="REJECTED">❌ Rejeté</option>
                                <option value="SUSPENDED">⛔ Suspendu</option>
                            </select>
                        </div>
                    </div>
                </nav>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-blue-900">
                            <Info className="w-4 h-4 text-blue-600" />
                            Astuce
                        </h4>
                        <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                            Sélectionnez plusieurs utilisateurs pour envoyer une notification ciblée, ou utilisez "Nouvelle Diffusion" sans sélection pour envoyer à tous.
                        </p>
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50/30">
                
                {/* Header / Search */}
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-8 py-4 flex items-center justify-between gap-6 transition-all">
                    <div className="relative flex-1 max-w-xl group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Rechercher un utilisateur (Nom, Email)..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-100/50 border-0 rounded-2xl text-slate-900 placeholder-slate-500 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:shadow-lg transition-all outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm text-sm font-medium text-slate-600">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            {totalUsers} Utilisateurs
                        </div>

                        {selectedUsers.length > 0 && (
                            <motion.button 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={() => setShowCompose(true)}
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium shadow-md shadow-blue-200 transition-all flex items-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                Envoyer à ({selectedUsers.length})
                            </motion.button>
                        )}
                        
                        <div className="h-8 w-px bg-slate-200 mx-2"></div>

                        <button 
                            onClick={toggleSelectAll} 
                            className={`p-2.5 rounded-xl transition-all ${
                                users.length > 0 && selectedUsers.length === users.length 
                                ? 'bg-blue-100 text-blue-600' 
                                : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
                            }`}
                            title="Tout sélectionner"
                        >
                            <CheckSquare className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={() => setPage(1)} // Refresh logic could be improved
                            className="p-2.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-xl transition-all"
                            title="Actualiser"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* User Grid */}
                <div className="flex-1 overflow-y-auto p-8">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center">
                            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                            <p className="text-slate-400 font-medium">Chargement des utilisateurs...</p>
                        </div>
                    ) : users.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            <AnimatePresence>
                                {users.map((user, index) => (
                                    <motion.div 
                                        key={user.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: index * 0.03 }}
                                        onClick={() => toggleSelectUser(user.id)}
                                        className={`group relative bg-white rounded-2xl border transition-all cursor-pointer overflow-hidden ${
                                            selectedUsers.includes(user.id)
                                            ? 'border-blue-500 ring-2 ring-blue-100 shadow-lg shadow-blue-100 z-10'
                                            : 'border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200'
                                        }`}
                                    >
                                        {/* Selection Checkbox */}
                                        <div className={`absolute top-3 right-3 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                            selectedUsers.includes(user.id)
                                            ? 'bg-blue-500 border-blue-500 scale-100'
                                            : 'bg-white border-slate-200 scale-90 opacity-0 group-hover:opacity-100'
                                        }`}>
                                            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                        </div>

                                        <div className="p-5 flex flex-col items-center text-center">
                                            <div className="relative mb-4">
                                                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold shadow-inner ${
                                                    user.avatar ? 'bg-white' : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                                                }`}>
                                                    {user.avatar ? (
                                                        <img src={user.avatar} alt="" className="w-full h-full object-cover rounded-full" />
                                                    ) : (
                                                        user.name?.slice(0, 2).toUpperCase()
                                                    )}
                                                </div>
                                                <span className={`absolute -bottom-2 -right-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-full border-2 border-white ${
                                                    user.role === 'WORKER' 
                                                    ? 'bg-emerald-100 text-emerald-700' 
                                                    : 'bg-indigo-100 text-indigo-700'
                                                }`}>
                                                    {user.role === 'WORKER' ? 'Worker' : 'Estab'}
                                                </span>
                                            </div>
                                            
                                            <h3 className="font-bold text-slate-900 truncate w-full px-2" title={user.name}>{user.name}</h3>
                                            <p className="text-xs text-slate-500 truncate w-full px-2 mb-4">{user.email}</p>
                                            
                                            <div className="w-full pt-4 border-t border-slate-50 flex justify-between items-center px-2">
                                                <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                                                    ID: {user.id.toString().slice(0, 6)}...
                                                </span>
                                                <button className="text-slate-300 hover:text-blue-600 transition-colors">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                                <Search className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-700 mb-2">Aucun utilisateur trouvé</h3>
                            <p className="max-w-xs text-center text-slate-500">Essayez de modifier vos termes de recherche ou changez les filtres.</p>
                            <button onClick={() => {setSearchQuery(''); setActiveTab('ALL');}} className="mt-6 px-6 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium rounded-lg transition-all">
                                Réinitialiser les filtres
                            </button>
                        </div>
                    )}
                </div>

                {/* Pagination Footer */}
                <div className="bg-white border-t border-slate-200 px-8 py-4 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        Affichage de <span className="font-bold text-slate-900">{users.length}</span> sur <span className="font-bold text-slate-900">{totalUsers}</span> résultats
                    </p>
                    <div className="flex items-center gap-2">
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            ←
                        </button>
                        <div className="px-4 py-2 bg-slate-50 rounded-xl text-sm font-bold text-slate-700">
                            Page {page}
                        </div>
                        <button 
                            disabled={page === totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            →
                        </button>
                    </div>
                </div>
            </div>

            {/* --- COMPOSE MODAL (PREMIUM) --- */}
            <AnimatePresence>
                {showCompose && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCompose(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden relative z-10"
                        >
                            {/* Modal Header */}
                            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
                                <div>
                                    <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                            <Send className="w-5 h-5" />
                                        </div>
                                        Nouvelle Notification
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-1">Envoyez une alerte interne aux utilisateurs.</p>
                                </div>
                                <button onClick={() => setShowCompose(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            
                            <div className="p-8 space-y-6">
                                {/* Audience Indicator */}
                                <div className={`border rounded-xl p-4 flex items-start gap-4 ${
                                    selectedUsers.length > 0 
                                    ? 'bg-blue-50 border-blue-100' 
                                    : 'bg-slate-50 border-slate-100'
                                }`}>
                                    <div className={`p-2 rounded-lg shrink-0 ${selectedUsers.length > 0 ? 'bg-blue-200 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className={`text-sm font-bold ${selectedUsers.length > 0 ? 'text-blue-900' : 'text-slate-900'}`}>
                                            Cible de la diffusion
                                        </h4>
                                        <p className={`text-sm mt-1 ${selectedUsers.length > 0 ? 'text-blue-700' : 'text-slate-600'}`}>
                                            {selectedUsers.length > 0 
                                                ? `${selectedUsers.length} utilisateur(s) spécifiquement sélectionné(s).`
                                                : activeTab === 'ALL' 
                                                    ? 'Diffusion globale à TOUS les utilisateurs du site.' 
                                                    : `Diffusion à la catégorie : ${activeTab === 'WORKER' ? 'Travailleurs' : 'Établissements'}.`
                                            }
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Titre du message <span className="text-slate-400 font-normal">(Optionnel)</span></label>
                                        <input 
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
                                            placeholder="Ex: Maintenance système, Nouvelle fonctionnalité..."
                                            value={messageData.title}
                                            onChange={e => setMessageData({...messageData, title: e.target.value})}
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Contenu du message <span className="text-red-500">*</span></label>
                                        <textarea 
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all min-h-[160px] resize-none"
                                            placeholder="Écrivez votre message ici..."
                                            value={messageData.message}
                                            onChange={e => setMessageData({...messageData, message: e.target.value})}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Type d'alerte</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { id: 'INFO', label: 'Information', icon: Info, color: 'blue' },
                                                { id: 'WARNING', label: 'Avertissement', icon: AlertTriangle, color: 'amber' },
                                                { id: 'SUCCESS', label: 'Succès', icon: Check, color: 'emerald' }
                                            ].map(type => (
                                                <button
                                                    key={type.id}
                                                    onClick={() => setMessageData({...messageData, type: type.id})}
                                                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                                                        messageData.type === type.id
                                                        ? `border-${type.color}-500 bg-${type.color}-50 text-${type.color}-700`
                                                        : 'border-transparent bg-slate-50 text-slate-500 hover:bg-slate-100'
                                                    }`}
                                                >
                                                    <type.icon className="w-6 h-6" />
                                                    <span className="text-xs font-bold">{type.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="px-8 py-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Bell className="w-4 h-4" />
                                    <span>Sera visible dans les notifications</span>
                                </div>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => setShowCompose(false)} 
                                        className="px-6 py-3 text-slate-600 font-bold hover:bg-white hover:shadow-sm rounded-xl transition-all"
                                    >
                                        Annuler
                                    </button>
                                    <button 
                                        onClick={handleSend}
                                        disabled={sending || !messageData.message}
                                        className={`relative px-8 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg shadow-slate-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden ${
                                            sendStatus === 'success' ? 'bg-emerald-500' : 
                                            sendStatus === 'error' ? 'bg-red-500' : ''
                                        }`}
                                    >
                                        <AnimatePresence mode='wait'>
                                            {sending ? (
                                                <motion.div 
                                                    key="loading"
                                                    initial={{ y: 20, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    exit={{ y: -20, opacity: 0 }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Envoi...
                                                </motion.div>
                                            ) : sendStatus === 'success' ? (
                                                <motion.div 
                                                    key="success"
                                                    initial={{ scale: 0.5, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Check className="w-5 h-5" />
                                                    Envoyé !
                                                </motion.div>
                                            ) : (
                                                <motion.div 
                                                    key="idle"
                                                    initial={{ y: 20, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    exit={{ y: -20, opacity: 0 }}
                                                    className="flex items-center gap-2"
                                                >
                                                    Envoyer la notification
                                                    <ArrowRight className="w-4 h-4" />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
