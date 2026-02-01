import { useState, useEffect } from 'react';
import {
    Search, Filter, Star, MapPin, Briefcase, CheckCircle,
    ChevronDown, ChevronUp, User, Award, Calendar, Lock, X, Loader2
} from 'lucide-react';
import api from '../../api/client';

const WorkerSearchSection = ({ isPremium }) => {
    const [workers, setWorkers] = useState([]);
    const [specialities, setSpecialities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedWorker, setSelectedWorker] = useState(null);
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
            params.append('limit', 6);

            const { data } = await api.get(`/establishment/search-workers?${params.toString()}`);
            setWorkers(data.data?.workers || []);
            setPagination(data.data?.pagination || { page: 1, total: 0, totalPages: 0 });
            setCanViewFullProfiles(data.data?.subscription?.canViewFullProfiles || false);
        } catch (err) {
            console.error('Failed to search workers', err);
        } finally {
            setLoading(false);
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

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Search className="w-5 h-5 text-slate-600" />
                    Rechercher des Talents
                </h3>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                    <Filter className="w-4 h-4" />
                    Filtres
                    {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="mb-4">
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            placeholder="Rechercher par nom, titre..."
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                    >
                        Rechercher
                    </button>
                </div>
            </form>

            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-slate-50 rounded-lg p-4 mb-6 space-y-4">
                    {/* Experience Filter */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Expérience minimum</label>
                        <select
                            value={filters.min_experience}
                            onChange={(e) => setFilters(prev => ({ ...prev, min_experience: e.target.value }))}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="">Tous niveaux</option>
                            <option value="1">1+ an</option>
                            <option value="3">3+ ans</option>
                            <option value="5">5+ ans</option>
                            <option value="10">10+ ans</option>
                        </select>
                    </div>

                    {/* Specialities */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Spécialités</label>
                        <div className="flex flex-wrap gap-2">
                            {specialities.slice(0, 8).map(spec => (
                                <button
                                    key={spec.speciality_id}
                                    type="button"
                                    onClick={() => toggleSpeciality(spec.speciality_id)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filters.speciality_ids.includes(spec.speciality_id)
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300'
                                        }`}
                                >
                                    {spec.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Availability */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="available_now"
                            checked={filters.available_now}
                            onChange={(e) => setFilters(prev => ({ ...prev, available_now: e.target.checked }))}
                            className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <label htmlFor="available_now" className="text-sm text-slate-700">
                            Disponible cette semaine uniquement
                        </label>
                    </div>

                    <button
                        onClick={() => searchWorkers(1)}
                        className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                    >
                        Appliquer les filtres
                    </button>
                </div>
            )}

            {/* Results */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                </div>
            ) : workers.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {workers.map(worker => (
                            <div
                                key={worker.id}
                                onClick={() => !worker.is_locked && setSelectedWorker(worker)}
                                className={`relative bg-white border rounded-xl p-4 transition-all ${worker.is_locked
                                        ? 'border-slate-200 opacity-75'
                                        : 'border-slate-200 hover:border-emerald-300 hover:shadow-md cursor-pointer'
                                    }`}
                            >
                                {worker.is_locked && (
                                    <div className="absolute top-2 right-2">
                                        <Lock className="w-4 h-4 text-slate-400" />
                                    </div>
                                )}

                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold">
                                        {worker.profile_pic_url ? (
                                            <img src={worker.profile_pic_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                                        ) : (
                                            worker.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-800 truncate">{worker.name}</p>
                                        <p className="text-sm text-slate-500 truncate">{worker.title}</p>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Briefcase className="w-4 h-4 text-slate-400" />
                                        {worker.experience_years ? `${worker.experience_years} ans d'exp.` : 'Non spécifié'}
                                    </div>

                                    {worker.city && (
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <MapPin className="w-4 h-4 text-slate-400" />
                                            {worker.city}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2">
                                        {worker.is_verified && (
                                            <span className="flex items-center gap-1 text-emerald-600 text-xs">
                                                <CheckCircle className="w-3 h-3" /> Vérifié
                                            </span>
                                        )}
                                        {worker.is_available && (
                                            <span className="flex items-center gap-1 text-blue-600 text-xs">
                                                <Calendar className="w-3 h-3" /> Dispo
                                            </span>
                                        )}
                                    </div>

                                    {worker.rating && (
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                            <span className="text-slate-700 font-medium">{worker.rating}</span>
                                            <span className="text-slate-400">({worker.review_count} avis)</span>
                                        </div>
                                    )}
                                </div>

                                {worker.specialities?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-3">
                                        {worker.specialities.slice(0, 2).map((spec, i) => (
                                            <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                                                {spec}
                                            </span>
                                        ))}
                                        {worker.specialities.length > 2 && (
                                            <span className="text-xs text-slate-500">+{worker.specialities.length - 2}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex justify-center gap-2">
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => searchWorkers(page)}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${pagination.page === page
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* PRO Upgrade Banner */}
                    {!canViewFullProfiles && (
                        <div className="mt-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg p-4 text-white">
                            <div className="flex items-center gap-3">
                                <Award className="w-8 h-8" />
                                <div className="flex-1">
                                    <p className="font-semibold">Passez à Pro pour voir les profils complets</p>
                                    <p className="text-sm text-amber-100">Accédez aux coordonnées et biographies des candidats</p>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-12 text-slate-500">
                    <User className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p className="font-medium">Aucun professionnel trouvé</p>
                    <p className="text-sm">Essayez de modifier vos critères de recherche</p>
                </div>
            )}

            {/* Worker Detail Modal */}
            {selectedWorker && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-xl">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-xl">
                                    {selectedWorker.profile_pic_url ? (
                                        <img src={selectedWorker.profile_pic_url} alt="" className="w-16 h-16 rounded-full object-cover" />
                                    ) : (
                                        selectedWorker.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">{selectedWorker.name}</h3>
                                    <p className="text-slate-500">{selectedWorker.title}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedWorker(null)}
                                className="p-1 hover:bg-slate-100 rounded-lg"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {selectedWorker.bio && (
                                <div>
                                    <h4 className="text-sm font-medium text-slate-700 mb-1">À propos</h4>
                                    <p className="text-slate-600">{selectedWorker.bio}</p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-slate-400" />
                                    <span className="text-slate-600">{selectedWorker.experience_years || 0} ans d'exp.</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    <span className="text-slate-600">{selectedWorker.city || 'Non spécifié'}</span>
                                </div>
                            </div>

                            {selectedWorker.specialities?.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-slate-700 mb-2">Spécialités</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedWorker.specialities.map((spec, i) => (
                                            <span key={i} className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">
                                                {spec}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 mt-6">
                                <button className="flex-1 py-2 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
                                    Contacter
                                </button>
                                <button
                                    onClick={() => setSelectedWorker(null)}
                                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkerSearchSection;
