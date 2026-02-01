import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';
import { useSubscription } from '../../context/SubscriptionContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import {
    Search, Filter, X, MapPin, Briefcase, Star, Lock,
    CheckCircle, MessageCircle, Send, Diamond
} from 'lucide-react';

const SearchWorker = () => {
    const navigate = useNavigate();
    const { isSubscribed, planCode } = useSubscription();
    const isPremium = isSubscribed || planCode === 'PRO';

    const [workers, setWorkers] = useState([]);
    const [specialities, setSpecialities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedWorker, setSelectedWorker] = useState(null);
    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    const [myMissions, setMyMissions] = useState([]);
    const [selectedMissionId, setSelectedMissionId] = useState('');
    const [inviting, setInviting] = useState(false);

    // Filters State
    const [filters, setFilters] = useState({
        search: '',
        speciality_ids: [],
        min_experience: '',
        available_now: false
    });

    const [pagination, setPagination] = useState({
        page: 1,
        total: 0,
        totalPages: 0
    });
    const [canViewFullProfiles, setCanViewFullProfiles] = useState(false);

    useEffect(() => {
        loadSpecialities();
        searchWorkers();
    }, []);

    const loadSpecialities = async () => {
        try {
            const { data } = await api.get('/specialities');
            setSpecialities(data.data || []);
        } catch (err) {
            console.error('Failed to load specialities', err);
        }
    };

    const searchWorkers = async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.min_experience) params.append('min_experience', filters.min_experience);
            if (filters.available_now) params.append('available_now', 'true');
            filters.speciality_ids.forEach(id => params.append('speciality_ids', id));
            params.append('page', page);
            params.append('limit', 12);

            const { data } = await api.get(`/establishment/search-workers?${params.toString()}`);
            setWorkers(data.data?.workers || []);
            setPagination(data.data?.pagination || { page: 1, total: 0, totalPages: 0 });
            setCanViewFullProfiles(data.data?.subscription?.canViewFullProfiles || false);
        } catch (err) {
            console.error('Failed to search workers', err);
        } finally {
            setLoading(false);
            setInitialLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        searchWorkers(1);
    };

    const toggleSpeciality = (id) => {
        setFilters(prev => ({
            ...prev,
            speciality_ids: prev.speciality_ids.includes(id)
                ? prev.speciality_ids.filter(s => s !== id)
                : [...prev.speciality_ids, id]
        }));
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            speciality_ids: [],
            min_experience: '',
            available_now: false
        });
        // Optionally trigger search immediately or let user do it
    };

    const startConversation = async (worker) => {
        try {
            await api.post('/messages', {
                receiverId: worker.id,
                content: `Bonjour ${worker.name.split(' ')[0]}, je suis intéressé par votre profil.`
            });
            setSelectedWorker(null);
            navigate('/establishment/messages');
        } catch (err) {
            console.error('Erreur démarrage conversation:', err);
            alert('Erreur lors du démarrage de la conversation');
        }
    };

    const loadMyMissions = async () => {
        try {
            const { data } = await api.get('/missions/my-missions');
            const open = (data.data || []).filter(m => m.status === 'OPEN');
            setMyMissions(open);
        } catch (err) {
            console.error('Failed to load missions', err);
        }
    };

    const handleInvite = async () => {
        if (!selectedMissionId) return;
        setInviting(true);
        try {
            await api.post('/applications/invite', {
                worker_id: selectedWorker.user_id,
                mission_id: selectedMissionId
            });
            alert('Invitation envoyée avec succès !');
            setInviteModalOpen(false);
            setSelectedWorker(null);
            setSelectedMissionId('');
        } catch (err) {
            console.error('Invite error', err);
            alert(err.response?.data?.message || 'Erreur lors de l\'envoi de l\'invitation');
        } finally {
            setInviting(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    };

    const activeFiltersCount = filters.speciality_ids.length + (filters.min_experience ? 1 : 0) + (filters.available_now ? 1 : 0);

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-slate-500 text-sm">Chargement des talents...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header Filter Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl px-8 py-6 shadow-md">
                <h1 className="text-2xl font-bold text-white mb-2">Vivier de Talents</h1>
                <p className="text-blue-100 text-sm mb-6 max-w-xl">
                    Recherchez parmi nos professionnels qualifiés et trouvez le profil idéal pour vos missions.
                </p>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="flex gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            placeholder="Rechercher par nom, titre, spécialité..."
                            className="w-full h-12 pl-12 pr-4 bg-white rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/40 shadow-sm transition-shadow"
                        />
                    </div>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setShowFilters(!showFilters)}
                        className={`h-12 px-6 ${showFilters ? 'bg-white text-blue-600' : 'bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white'}`}
                    >
                        <Filter className="w-5 h-5 mr-2" />
                        Filtres
                        {activeFiltersCount > 0 && (
                            <Badge variant="blue" className="ml-2 px-1.5 py-0.5 h-5 min-w-[1.25rem] justify-center text-xs">
                                {activeFiltersCount}
                            </Badge>
                        )}
                    </Button>
                    <Button type="submit" variant="secondary" className="h-12 px-8 font-bold text-blue-700 shadow-md">
                        Rechercher
                    </Button>
                </form>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <Card className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Filter className="w-5 h-5 text-blue-600" />
                                Affiner la recherche
                            </h3>
                            <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline">
                                Réinitialiser les critères
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Experience */}
                            <div className="lg:col-span-3 space-y-3">
                                <label className="block text-sm font-semibold text-slate-700">Expérience minimum</label>
                                <select
                                    value={filters.min_experience}
                                    onChange={(e) => setFilters(prev => ({ ...prev, min_experience: e.target.value }))}
                                    className="w-full h-11 px-3 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                >
                                    <option value="">Indifférent</option>
                                    <option value="1">1 an minimum</option>
                                    <option value="3">3 ans minimum</option>
                                    <option value="5">5 ans minimum</option>
                                    <option value="10">10 ans minimum</option>
                                </select>
                            </div>

                            {/* Specialities */}
                            <div className="lg:col-span-9 space-y-3">
                                <label className="block text-sm font-semibold text-slate-700">Spécialités</label>
                                <div className="flex flex-wrap gap-2">
                                    {specialities.map(spec => {
                                        const isSelected = filters.speciality_ids.includes(spec.speciality_id);
                                        return (
                                            <button
                                                key={spec.speciality_id}
                                                type="button"
                                                onClick={() => toggleSpeciality(spec.speciality_id)}
                                                className={`h-9 px-4 rounded-full text-sm font-medium transition-all border ${isSelected
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                    }`}
                                            >
                                                {spec.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Availability Toggle */}
                        <div className="mt-6 pt-6 border-t border-slate-100 flex items-center">
                            <label className="inline-flex items-center cursor-pointer group">
                                <span className="relative">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={filters.available_now}
                                        onChange={() => setFilters(prev => ({ ...prev, available_now: !prev.available_now }))}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </span>
                                <span className="ml-3 text-sm font-medium text-slate-700 group-hover:text-blue-700 transition-colors">
                                    Disponible immédiatement
                                </span>
                            </label>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Results Count & Premium CTA */}
            <div className="flex items-center justify-between px-1">
                <p className="text-slate-600 font-medium">
                    <span className="font-bold text-slate-900">{pagination.total}</span> talent{pagination.total > 1 ? 's' : ''} trouvé{pagination.total > 1 ? 's' : ''}
                </p>
                {!isPremium && (
                    <Link to="/pricing">
                        <Button size="sm" variant="secondary" className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-none hover:shadow-lg transform hover:-translate-y-0.5 transition-all">
                            <Diamond className="w-4 h-4 mr-1.5" fill="currentColor" />
                            Passer Pro
                        </Button>
                    </Link>
                )}
            </div>

            {/* Results Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p>Recherche en cours...</p>
                </div>
            ) : workers.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {workers.map(worker => (
                            <Card
                                key={worker.id}
                                onClick={() => !worker.is_locked && navigate(`/establishment/worker/${worker.user_id || worker.id}`)}
                                className={`group transition-all duration-300 ${worker.is_locked
                                    ? 'opacity-75 bg-slate-50 cursor-not-allowed'
                                    : 'hover:border-blue-300 hover:shadow-xl cursor-pointer hover:-translate-y-1'
                                    }`}
                            >
                                <CardContent className="p-5">
                                    {/* Header */}
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md overflow-hidden shrink-0">
                                            {worker.profile_pic_url ? (
                                                <img
                                                    src={worker.profile_pic_url}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.parentElement.innerHTML = getInitials(worker.name);
                                                    }}
                                                />
                                            ) : (
                                                getInitials(worker.name)
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <h3 className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                                    {worker.name}
                                                </h3>
                                                {worker.is_verified && <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-50" />}
                                                {worker.is_locked && <Lock className="w-4 h-4 text-slate-400" />}
                                            </div>
                                            <p className="text-xs text-slate-500 font-medium truncate uppercase tracking-wide">
                                                {worker.title || 'Médico-social'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                                            <span className="truncate">{worker.experience_years ? `${worker.experience_years} ans` : 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-3.5 h-3.5 text-blue-500" />
                                            <span className="truncate">{worker.city || 'N/C'}</span>
                                        </div>
                                    </div>

                                    {/* Specialties */}
                                    {worker.specialities?.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mb-4 max-h-12 overflow-hidden">
                                            {worker.specialities.slice(0, 3).map((spec, i) => (
                                                <Badge key={i} variant="blue" className="bg-blue-50 text-blue-700 border border-blue-100">
                                                    {spec}
                                                </Badge>
                                            ))}
                                            {worker.specialities.length > 3 && (
                                                <span className="text-[10px] text-slate-400 font-medium px-1">+{worker.specialities.length - 3}</span>
                                            )}
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
                                        <div className="flex items-center gap-1.5">
                                            {worker.rating > 0 && (
                                                <>
                                                    <Star className="w-4 h-4 text-blue-400 fill-blue-400" />
                                                    <span className="text-sm font-bold text-slate-700">{worker.rating}</span>
                                                    <span className="text-xs text-slate-400">({worker.review_count})</span>
                                                </>
                                            )}
                                        </div>

                                        {worker.is_available && (
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold border border-blue-100">
                                                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>
                                                DISPO
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex justify-center gap-2 pt-8">
                            {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => searchWorkers(page)}
                                    className={`w-10 h-10 rounded-lg text-sm font-bold transition-all transform hover:scale-105 ${pagination.page === page
                                        ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-600 ring-offset-2'
                                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Aucun talent trouvé</h3>
                    <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                        Essayez de modifier vos filtres ou d'élargir votre recherche.
                    </p>
                    <Button onClick={clearFilters} variant="primary">
                        Réinitialiser tous les filtres
                    </Button>
                </div>
            )}

            {/* Quick View Modal (Optional - keeping similar structure but cleaned up) */}
            {selectedWorker && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedWorker(null)}>
                    <Card className="w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between">
                            <h3 className="font-bold text-white text-lg">Aperçu du profil</h3>
                            <button onClick={() => setSelectedWorker(null)} className="text-white/80 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                    {selectedWorker.profile_pic_url ? (
                                        <img src={selectedWorker.profile_pic_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-xl font-bold text-slate-400">{getInitials(selectedWorker.name)}</span>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-xl text-slate-900">{selectedWorker.name}</h4>
                                    <p className="text-blue-600 font-medium">{selectedWorker.title || 'Professionnel'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Expérience</p>
                                    <p className="font-semibold text-slate-900">{selectedWorker.experience_years || 0} ans</p>
                                </div>
                                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Localisation</p>
                                    <p className="font-semibold text-slate-900">{selectedWorker.city || 'N/C'}</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button onClick={() => startConversation(selectedWorker)} className="flex-1" icon={MessageCircle}>
                                    Contacter
                                </Button>
                                <Button
                                    onClick={() => {
                                        loadMyMissions();
                                        setInviteModalOpen(true);
                                    }}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                                    icon={Send}
                                >
                                    Proposer
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Invite Modal reuse from WorkerProfileDetail logic mostly */}
            {inviteModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setInviteModalOpen(false)}>
                    <Card className="w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-slate-100">
                            <h3 className="font-bold text-slate-900">Proposer une mission</h3>
                            <p className="text-slate-500 text-sm">Sélectionnez une mission</p>
                        </div>
                        <CardContent className="p-4">
                            <div className="space-y-2 max-h-60 overflow-y-auto mb-4 custom-scrollbar">
                                {myMissions.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                        <p className="text-slate-500 text-sm mb-3">Aucune mission ouverte</p>
                                        <Link to="/establishment/missions/create" className="text-blue-600 font-bold text-sm hover:underline">
                                            Créer une mission
                                        </Link>
                                    </div>
                                ) : (
                                    myMissions.map(mission => (
                                        <label
                                            key={mission.mission_id}
                                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedMissionId === mission.mission_id
                                                ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500'
                                                : 'border-slate-200 hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedMissionId === mission.mission_id ? 'border-blue-600' : 'border-slate-300'
                                                }`}>
                                                {selectedMissionId === mission.mission_id && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                                                <input
                                                    type="radio"
                                                    name="mission"
                                                    value={mission.mission_id}
                                                    checked={selectedMissionId === mission.mission_id}
                                                    onChange={() => setSelectedMissionId(mission.mission_id)}
                                                    className="sr-only"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-900 text-sm truncate">{mission.title}</p>
                                                <p className="text-xs text-slate-500">
                                                    {new Date(mission.start_date).toLocaleDateString('fr-FR')}
                                                </p>
                                            </div>
                                        </label>
                                    ))
                                )}
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    className="flex-1"
                                    onClick={handleInvite}
                                    disabled={!selectedMissionId || inviting}
                                    isLoading={inviting}
                                >
                                    Envoyer l'invitation
                                </Button>
                                <Button variant="secondary" onClick={() => setInviteModalOpen(false)}>
                                    Annuler
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default SearchWorker;
