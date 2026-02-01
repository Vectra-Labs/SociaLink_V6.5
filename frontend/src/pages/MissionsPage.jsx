import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../api/client';
import {
    MapPin, Calendar, Clock, Zap, Search, Filter, AlertTriangle,
    Building2, Lock, CheckCircle, Eye, Users, Briefcase,
    Crown, GraduationCap, Shield, Car, Heart, BookOpen,
    Loader2, ChevronDown, ChevronUp, X, DollarSign, Star,
    Award, Coffee, Wifi, Baby, Utensils, Bus, Plus, Sparkles
} from 'lucide-react';

// Régions du Maroc
const REGIONS = [
    { id: 'all', label: 'Toutes les régions' },
    { id: 'casablanca-settat', label: 'Casablanca-Settat' },
    { id: 'rabat-sale-kenitra', label: 'Rabat-Salé-Kénitra' },
    { id: 'marrakech-safi', label: 'Marrakech-Safi' },
    { id: 'fes-meknes', label: 'Fès-Meknès' },
    { id: 'tanger-tetouan', label: 'Tanger-Tétouan-Al Hoceïma' },
    { id: 'oriental', label: 'Oriental' },
    { id: 'souss-massa', label: 'Souss-Massa' },
    { id: 'draa-tafilalet', label: 'Drâa-Tafilalet' },
    { id: 'beni-mellal', label: 'Béni Mellal-Khénifra' }
];

const SECTORS = [
    { id: 'sante', label: 'Santé', icon: Heart, color: 'text-rose-500' },
    { id: 'action-sociale', label: 'Action Sociale', icon: Users, color: 'text-blue-500' },
    { id: 'education', label: 'Éducation', icon: GraduationCap, color: 'text-amber-500' },
    { id: 'handicap', label: 'Handicap', icon: Shield, color: 'text-purple-500' },
    { id: 'personnes-agees', label: 'Personnes Âgées', icon: Users, color: 'text-teal-500' },
    { id: 'jeunesse', label: 'Jeunesse', icon: Sparkles, color: 'text-indigo-500' }
];

const CONTRACT_TYPES = [
    { id: 'CDI', label: 'CDI - Permanent' },
    { id: 'CDD', label: 'CDD - 24 mois' },
    { id: 'CDD-12', label: 'CDD - 12 mois' },
    { id: 'INTERIM', label: 'Intérim' },
    { id: 'STAGE', label: 'Stage' },
    { id: 'FREELANCE', label: 'Freelance' },
    { id: 'BENEVOLAT', label: 'Bénévolat' }
];

// Missions factices pour remplir le feed
const FAKE_MISSIONS = [
    {
        mission_id: 'fake-1',
        title: 'Éducateur Spécialisé - Centre de Protection de l\'Enfance',
        establishment: { name: 'Association INSAF' },
        city: { name: 'Mohammedia, Centre-Ville' },
        region: 'Casablanca-Settat',
        contract_type: 'CDI',
        sector: 'Protection de l\'Enfance',
        sector_icon: 'education',
        work_mode: 'Sur site',
        experience_level: 'Intermédiaire',
        positions_count: 3,
        budget: 11000,
        salary_min: 8000,
        salary_max: 11000,
        description: 'Au sein de notre centre d\'accueil pour enfants en situation de difficulté, vous accompagnerez des jeunes de 6 à 18 ans dans leur parcours éducatif et social. Vous participerez à l\'élaboration et au suivi d\'un projet...',
        skills: ['Éducation spécialisée', 'Protection de l\'enfance', 'Animation de groupe', 'Relation d\'aide'],
        benefits: ['CNSS', 'Mutuelle', 'Transport', 'Formation'],
        end_date: '2025-02-28',
        views_count: 147,
        applications_count: 23,
        is_urgent: false,
        is_verified: true
    },
    {
        mission_id: 'fake-2',
        title: 'Assistant(e) Social(e) - Services Sociaux Municipaux',
        establishment: { name: 'Commune de Rabat' },
        city: { name: 'Rabat, Hassan' },
        region: 'Rabat-Salé-Kénitra',
        contract_type: 'CDI',
        sector: 'Action Sociale',
        sector_icon: 'action-sociale',
        work_mode: 'Sur site',
        experience_level: 'Intermédiaire',
        positions_count: 2,
        budget: 9000,
        salary_min: 7000,
        salary_max: 9000,
        description: 'Au sein de la Direction des Affaires Sociales de la Commune de Rabat, vous assurerez l\'accompagnement des familles en difficulté. Vous réaliserez des enquêtes sociales, monterez des dossiers d\'aide...',
        skills: ['Accompagnement social', 'Entretien social', 'Rédaction de rapport', 'Écoute active'],
        benefits: ['CNSS', 'Mutuelle', 'Congés payés'],
        end_date: '2025-02-15',
        views_count: 203,
        applications_count: 45,
        is_urgent: false,
        is_verified: true
    },
    {
        mission_id: 'fake-3',
        title: 'Chargé(e) d\'Insertion Professionnelle',
        establishment: { name: 'ANAPEC Kénitra' },
        city: { name: 'Kénitra, Centre-Ville' },
        region: 'Rabat-Salé-Kénitra',
        contract_type: 'CDD',
        sector: 'Insertion',
        sector_icon: 'jeunesse',
        work_mode: 'Sur site',
        experience_level: 'Intermédiaire',
        positions_count: 2,
        budget: 10000,
        salary_min: 8000,
        salary_max: 10000,
        description: 'Accompagnement des demandeurs d\'emploi dans leur parcours d\'insertion professionnelle. Animation d\'ateliers collectifs, entretiens individuels, mise en relation avec les entreprises, suivi des placements...',
        skills: ['Insertion professionnelle', 'Animation de groupe', 'Communication', 'Écoute active'],
        benefits: ['CNSS', 'Transport', 'Primes'],
        end_date: '2025-02-20',
        views_count: 156,
        applications_count: 31,
        is_urgent: false,
        is_verified: true
    },
    {
        mission_id: 'fake-4',
        title: 'Animateur(trice) Socio-Culturel - Maison de Jeunes',
        establishment: { name: 'Direction Régionale de la Jeunesse' },
        city: { name: 'Marrakech, Médina' },
        region: 'Marrakech-Safi',
        contract_type: 'CDD',
        sector: 'Jeunesse',
        sector_icon: 'jeunesse',
        work_mode: 'Sur site',
        experience_level: 'Débutant',
        positions_count: 4,
        budget: 7000,
        salary_min: 5000,
        salary_max: 7000,
        description: 'Animation d\'activités culturelles, sportives et éducatives pour les jeunes de 16 à 25 ans. Vous organiserez des ateliers, des sorties éducatives et des événements culturels. Vous contribuerez à la...',
        skills: ['Animation de groupe', 'Éducation populaire', 'Communication', 'Gestion de projet'],
        benefits: ['CNSS', 'Transport'],
        end_date: '2025-03-01',
        views_count: 234,
        applications_count: 67,
        is_urgent: false,
        is_verified: true
    },
    {
        mission_id: 'fake-5',
        title: 'Médiateur(trice) Familial(e)',
        establishment: { name: 'Centre de Médiation Familiale de Meknès' },
        city: { name: 'Meknès, Centre-Ville' },
        region: 'Fès-Meknès',
        contract_type: 'CDD',
        sector: 'Action Sociale',
        sector_icon: 'action-sociale',
        work_mode: 'Hybride',
        experience_level: 'Confirmé',
        positions_count: 1,
        budget: 12000,
        salary_min: 9000,
        salary_max: 12000,
        description: 'Accompagnement des familles en conflit vers des solutions amiables. Vous conduirez des entretiens de médiation, rédigerez des accords et consoliderez le partenariat avec les tribunaux de la famille...',
        skills: ['Médiation familiale', 'Écoute active', 'Communication', 'Intervention de crise'],
        benefits: ['CNSS', 'Formation'],
        end_date: '2025-02-15',
        views_count: 78,
        applications_count: 12,
        is_urgent: false,
        is_verified: true
    }
];

export default function MissionsPage() {
    const { user, loading: authLoading } = useAuth();
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [meta, setMeta] = useState({});

    // Filters
    const [region, setRegion] = useState('all');
    const [sectors, setSectors] = useState([]);
    const [contractTypes, setContractTypes] = useState([]);
    const [sort, setSort] = useState('recent');
    const [search, setSearch] = useState('');

    // UI State
    const [openSections, setOpenSections] = useState({
        region: true,
        sector: true,
        contract: false,
        salary: false,
        workMode: false,
        experience: false
    });
    const [userSubscription, setUserSubscription] = useState(null);
    const [minSalary, setMinSalary] = useState(0);
    const [urgentOnly, setUrgentOnly] = useState(false);
    const [workMode, setWorkMode] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('');
    const [verifiedOnly, setVerifiedOnly] = useState(false);

    const toggleSection = (key) => {
        setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Fetch missions from API
    useEffect(() => {
        const fetchMissions = async () => {
            try {
                setLoading(true);
                const response = await api.get('/missions/all');
                const apiMissions = response.data.data || [];
                // Combine API missions with fake missions if empty
                const allMissions = apiMissions.length > 0 ? apiMissions : FAKE_MISSIONS;
                setMissions(allMissions);
                setMeta(response.data.meta || { total: allMissions.length });
            } catch (err) {
                console.error('Error fetching missions:', err);
                // Fallback to fake missions on error
                setMissions(FAKE_MISSIONS);
                setMeta({ total: FAKE_MISSIONS.length });
            } finally {
                setLoading(false);
            }
        };

        // Fetch user subscription status for workers
        const fetchSubscription = async () => {
            try {
                const response = await api.get('/subscriptions/current');
                // API returns isPremium, plan, status directly in response.data
                setUserSubscription(response.data);
            } catch (err) {
                // Silent fallback - no subscription
                setUserSubscription(null);
            }
        };

        if (user) {
            fetchMissions();
            if (user.role === 'WORKER') {
                fetchSubscription();
            }
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [user, authLoading]);

    // Redirect visitors to login
    if (!authLoading && !user) {
        return <Navigate to="/login" state={{ from: '/missions', message: 'Connectez-vous pour accéder aux missions' }} />;
    }

    // Check user status
    const isWorker = user?.role === 'WORKER';
    const isValidated = user?.status === 'VALIDATED';
    // Robust premium detection - check multiple sources
    const isPremium =
        meta?.isSubscriber === true ||
        userSubscription?.isPremium === true ||
        (userSubscription?.plan?.code && userSubscription?.plan?.code !== 'BASIC') ||
        user?.subscription_status === 'ACTIVE';

    // Determine access level
    const getAccessLevel = () => {
        if (!isWorker) return 'OTHER';
        if (!isValidated) return 'NOT_VALIDATED';
        if (isPremium) return 'PREMIUM';
        return 'BASIC';
    };

    const accessLevel = getAccessLevel();

    // Filter missions for BASIC users
    const getVisibleMissions = () => {
        if (accessLevel === 'NOT_VALIDATED') return [];
        if (accessLevel === 'PREMIUM' || accessLevel === 'OTHER') return missions;

        // BASIC: Show max 3 non-redacted, rest are redacted
        return missions.map((m, idx) => {
            if (idx >= 3) {
                return {
                    ...m,
                    is_redacted: true,
                    redaction_reason: 'BASIC_LIMIT_REACHED'
                };
            }
            return m;
        });
    };

    const visibleMissions = getVisibleMissions();

    // Toggle sector filter
    const toggleSector = (sectorId) => {
        setSectors(prev =>
            prev.includes(sectorId)
                ? prev.filter(s => s !== sectorId)
                : [...prev, sectorId]
        );
    };

    // Toggle contract type filter
    const toggleContractType = (typeId) => {
        setContractTypes(prev =>
            prev.includes(typeId)
                ? prev.filter(t => t !== typeId)
                : [...prev, typeId]
        );
    };

    // Reset all filters
    const resetFilters = () => {
        setRegion('all');
        setSectors([]);
        setContractTypes([]);
        setSearch('');
        setMinSalary(0);
        setUrgentOnly(false);
        setWorkMode('');
        setExperienceLevel('');
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
                    <p className="text-slate-600">Chargement des missions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* ACCESS BANNER - Only for BASIC users (NOT for Premium) */}
            {accessLevel === 'NOT_VALIDATED' && (
                <div className="bg-amber-50 border-b border-amber-200 px-4 py-4">
                    <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
                        <AlertTriangle className="w-6 h-6 text-amber-500" />
                        <div className="text-center">
                            <p className="text-amber-800 font-semibold">Compte en attente de validation</p>
                            <p className="text-amber-700 text-sm">
                                Votre compte est en cours de vérification par notre équipe. Vous pourrez accéder aux missions une fois validé.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {accessLevel === 'BASIC' && (
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 px-4 py-3">
                    <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-blue-500" />
                            <span className="text-blue-800 font-semibold">Accès limité</span>
                            <span className="text-blue-700 text-sm hidden md:inline ml-2">
                                Vous voyez un aperçu limité des missions. Passez à Premium pour un accès complet aux missions urgentes et récentes.
                            </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs bg-blue-200 text-blue-800 px-2.5 py-1 rounded-full font-medium">
                                Maximum 3 missions visibles
                            </span>
                            <span className="text-xs bg-blue-200 text-blue-800 px-2.5 py-1 rounded-full font-medium">
                                Pas de missions urgentes
                            </span>
                            <span className="text-xs bg-blue-200 text-blue-800 px-2.5 py-1 rounded-full font-medium">
                                Missions +48h uniquement
                            </span>
                            <Link
                                to="/worker/subscription"
                                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 hover:shadow-lg transition-shadow ml-2"
                            >
                                <Crown className="w-4 h-4" /> Passer à Premium
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* SEARCH BAR - Centered */}
            <div className="bg-white border-b border-slate-200 px-4 py-4">
                <div className="max-w-3xl mx-auto">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher une mission, organisation..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            {accessLevel === 'NOT_VALIDATED' ? (
                <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                    <div className="bg-white rounded-2xl border border-slate-200 p-10 shadow-sm">
                        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock className="w-10 h-10 text-amber-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-3">En attente de validation</h2>
                        <p className="text-slate-600 mb-6 max-w-md mx-auto">
                            Votre compte est en cours de vérification. Notre équipe examine vos documents et validera votre profil sous 24-48h.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link
                                to="/worker/dashboard"
                                className="px-6 py-3 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                Retour au tableau de bord
                            </Link>
                            <Link
                                to="/worker/profile"
                                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
                            >
                                Compléter mon profil
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
                    {/* SIDEBAR FILTERS */}
                    <aside className="w-72 shrink-0 hidden lg:block">
                        <div className="sticky top-4 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                            {/* Header */}
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Filter className="w-5 h-5 text-blue-600" />
                                    Filtres
                                </h3>
                                {(region !== 'all' || sectors.length > 0 || contractTypes.length > 0) && (
                                    <button
                                        onClick={resetFilters}
                                        className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
                                    >
                                        Réinitialiser
                                    </button>
                                )}
                            </div>

                            {/* Region Section */}
                            <div className="border-b border-slate-100">
                                <button
                                    className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                                    onClick={() => toggleSection('region')}
                                >
                                    <span className="font-semibold text-slate-700 text-sm">Région</span>
                                    {openSections.region ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                </button>
                                {openSections.region && (
                                    <div className="px-4 pb-4">
                                        <div className="relative">
                                            <select
                                                value={region}
                                                onChange={e => setRegion(e.target.value)}
                                                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            >
                                                {REGIONS.map(r => (
                                                    <option key={r.id} value={r.id}>{r.label}</option>
                                                ))}
                                            </select>
                                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sector Section */}
                            <div className="border-b border-slate-100">
                                <button
                                    className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                                    onClick={() => toggleSection('sector')}
                                >
                                    <span className="font-semibold text-slate-700 text-sm">Secteur d'activité</span>
                                    {openSections.sector ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                </button>
                                {openSections.sector && (
                                    <div className="px-4 pb-4 space-y-2">
                                        {SECTORS.map(s => {
                                            const IconComponent = s.icon;
                                            return (
                                                <label
                                                    key={s.id}
                                                    className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-slate-50 transition-colors"
                                                >
                                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${sectors.includes(s.id)
                                                        ? 'bg-blue-600 border-blue-600'
                                                        : 'border-slate-300 group-hover:border-blue-400 bg-white'
                                                        }`}>
                                                        {sectors.includes(s.id) && (
                                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 16 16">
                                                                <path d="M12.207 4.793a1 1 0 0 1 0 1.414l-5 5a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L6.5 9.086l4.293-4.293a1 1 0 0 1 1.414 0z" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <input
                                                        type="checkbox"
                                                        className="hidden"
                                                        checked={sectors.includes(s.id)}
                                                        onChange={() => toggleSector(s.id)}
                                                    />
                                                    <IconComponent className={`w-4 h-4 ${s.color}`} />
                                                    <span className={`text-sm ${sectors.includes(s.id) ? 'text-blue-700 font-medium' : 'text-slate-600'}`}>
                                                        {s.label}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Contract Type Section */}
                            <div className="border-b border-slate-100">
                                <button
                                    className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                                    onClick={() => toggleSection('contract')}
                                >
                                    <span className="font-semibold text-slate-700 text-sm">Type de contrat</span>
                                    {openSections.contract ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                </button>
                                {openSections.contract && (
                                    <div className="px-4 pb-4 space-y-2">
                                        {CONTRACT_TYPES.map(type => (
                                            <label
                                                key={type.id}
                                                className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-slate-50 transition-colors"
                                            >
                                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${contractTypes.includes(type.id)
                                                    ? 'bg-blue-600 border-blue-600'
                                                    : 'border-slate-300 group-hover:border-blue-400 bg-white'
                                                    }`}>
                                                    {contractTypes.includes(type.id) && (
                                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 16 16">
                                                            <path d="M12.207 4.793a1 1 0 0 1 0 1.414l-5 5a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L6.5 9.086l4.293-4.293a1 1 0 0 1 1.414 0z" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={contractTypes.includes(type.id)}
                                                    onChange={() => toggleContractType(type.id)}
                                                />
                                                <span className={`text-sm ${contractTypes.includes(type.id) ? 'text-blue-700 font-medium' : 'text-slate-600'}`}>
                                                    {type.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Salary Section */}
                            <div className="border-b border-slate-100">
                                <button
                                    className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                                    onClick={() => toggleSection('salary')}
                                >
                                    <span className="font-semibold text-slate-700 text-sm">Salaire mensuel</span>
                                    {openSections.salary ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                </button>
                                {openSections.salary && (
                                    <div className="px-4 pb-4">
                                        <input
                                            type="range"
                                            min="0"
                                            max="20000"
                                            step="1000"
                                            value={minSalary}
                                            onChange={(e) => setMinSalary(parseInt(e.target.value))}
                                            className="w-full accent-blue-600 h-2 bg-slate-200 rounded-full cursor-pointer"
                                        />
                                        <div className="flex justify-between text-xs text-slate-500 mt-2">
                                            <span>0 DH</span>
                                            <span className="font-semibold text-blue-600">{minSalary.toLocaleString('fr-FR')} DH+</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Urgent Toggle */}
                            <div className="border-b border-slate-100 p-4">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="font-semibold text-slate-700 text-sm">Missions urgentes uniquement</span>
                                    <div
                                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${urgentOnly ? 'bg-red-500' : 'bg-slate-200'}`}
                                        onClick={() => setUrgentOnly(!urgentOnly)}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${urgentOnly ? 'left-6' : 'left-1'}`} />
                                    </div>
                                </label>
                            </div>

                            {/* Verified Employers Toggle */}
                            <div className="border-b border-slate-100 p-4">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="font-semibold text-slate-700 text-sm">Employeurs vérifiés uniquement</span>
                                    <div
                                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${verifiedOnly ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                        onClick={() => setVerifiedOnly(!verifiedOnly)}
                                    >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${verifiedOnly ? 'left-6' : 'left-1'}`} />
                                    </div>
                                </label>
                            </div>

                            {/* Work Mode Section */}
                            <div className="border-b border-slate-100">
                                <button
                                    className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                                    onClick={() => toggleSection('workMode')}
                                >
                                    <span className="font-semibold text-slate-700 text-sm">Mode de travail</span>
                                    {openSections.workMode ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                </button>
                                {openSections.workMode && (
                                    <div className="px-4 pb-4 space-y-2">
                                        {['Sur site', 'Hybride', 'Télétravail'].map(mode => (
                                            <label
                                                key={mode}
                                                className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-slate-50 transition-colors"
                                            >
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${workMode === mode
                                                    ? 'bg-blue-600 border-blue-600'
                                                    : 'border-slate-300 group-hover:border-blue-400 bg-white'
                                                    }`}>
                                                    {workMode === mode && <div className="w-2 h-2 bg-white rounded-full" />}
                                                </div>
                                                <input
                                                    type="radio"
                                                    name="workMode"
                                                    className="hidden"
                                                    checked={workMode === mode}
                                                    onChange={() => setWorkMode(workMode === mode ? '' : mode)}
                                                />
                                                <span className={`text-sm ${workMode === mode ? 'text-blue-700 font-medium' : 'text-slate-600'}`}>
                                                    {mode}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Experience Level Section */}
                            <div className="border-b border-slate-100">
                                <button
                                    className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                                    onClick={() => toggleSection('experience')}
                                >
                                    <span className="font-semibold text-slate-700 text-sm">Niveau d'expérience</span>
                                    {openSections.experience ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                </button>
                                {openSections.experience && (
                                    <div className="px-4 pb-4 space-y-2">
                                        {['Débutant', 'Intermédiaire', 'Confirmé', 'Expert'].map(level => (
                                            <label
                                                key={level}
                                                className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-slate-50 transition-colors"
                                            >
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${experienceLevel === level
                                                    ? 'bg-blue-600 border-blue-600'
                                                    : 'border-slate-300 group-hover:border-blue-400 bg-white'
                                                    }`}>
                                                    {experienceLevel === level && <div className="w-2 h-2 bg-white rounded-full" />}
                                                </div>
                                                <input
                                                    type="radio"
                                                    name="experience"
                                                    className="hidden"
                                                    checked={experienceLevel === level}
                                                    onChange={() => setExperienceLevel(experienceLevel === level ? '' : level)}
                                                />
                                                <span className={`text-sm ${experienceLevel === level ? 'text-blue-700 font-medium' : 'text-slate-600'}`}>
                                                    {level}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* MISSIONS LIST */}
                    <main className="flex-1">
                        {/* Sort Bar */}
                        <div className="flex items-center justify-between mb-5 text-sm">
                            <span className="text-slate-500">
                                Affichage 1-{visibleMissions.length} sur {meta.total || visibleMissions.length} résultats
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-slate-500">Trier par</span>
                                <select
                                    value={sort}
                                    onChange={e => setSort(e.target.value)}
                                    className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                >
                                    <option value="recent">Plus récent</option>
                                    <option value="salary">Salaire décroissant</option>
                                    <option value="urgent">Urgent d'abord</option>
                                </select>
                            </div>
                        </div>

                        {/* Mission Cards */}
                        {visibleMissions.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
                                <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-slate-700 mb-2">Aucune mission disponible</h3>
                                <p className="text-slate-500">De nouvelles missions seront bientôt publiées.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {visibleMissions.map((mission, idx) => (
                                    <MissionCard
                                        key={mission.mission_id || idx}
                                        mission={mission}
                                        isLocked={mission.is_redacted}
                                        accessLevel={accessLevel}
                                        index={idx}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Load More */}
                        {meta.pages > 1 && (
                            <div className="mt-8 text-center">
                                <button className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors">
                                    Charger plus de missions
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            )}
        </div>
    );
}

// MISSION CARD COMPONENT - Redesigned
function MissionCard({ mission, isLocked, accessLevel, index }) {
    const getBlurMessage = () => {
        if (!mission.redaction_reason) return "Contenu réservé";

        switch (mission.redaction_reason) {
            case 'RECENT_MISSION_PREMIUM_ONLY':
                return "Mission récente — Exclusivité Premium";
            case 'URGENT_PREMIUM_ONLY':
                return "Mission urgente — Réservée aux Premium";
            case 'BASIC_LIMIT_REACHED':
                return "Limite atteinte — Passez à Premium";
            default:
                return "Contenu réservé aux membres Premium";
        }
    };

    // Extract data with fallbacks
    const salaryMin = mission.salary_min || (mission.budget ? Math.round(mission.budget * 0.8) : null);
    const salaryMax = mission.salary_max || mission.budget;
    const skills = mission.skills || ['Éducation spécialisée', 'Accompagnement social', 'Écoute active'];
    const benefits = mission.benefits || ['CNSS', 'Mutuelle'];

    const getBenefitIcon = (benefit) => {
        const icons = {
            'CNSS': Shield,
            'Mutuelle': Heart,
            'Transport': Bus,
            'Formation': GraduationCap,
            'Primes': Star,
            'Congés payés': Coffee
        };
        return icons[benefit] || CheckCircle;
    };

    const getSectorIcon = () => {
        const sector = SECTORS.find(s => s.id === mission.sector_icon) || SECTORS[1];
        return sector;
    };

    const sectorInfo = getSectorIcon();
    const SectorIcon = sectorInfo.icon;

    return (
        <div className={`bg-white rounded-2xl border overflow-hidden transition-all relative ${isLocked
            ? 'border-slate-200 opacity-75'
            : 'border-slate-200 hover:border-blue-300 hover:shadow-lg'
            }`}>
            {/* Locked Overlay */}
            {isLocked && (
                <div className="absolute inset-0 z-20 bg-white/70 backdrop-blur-[4px] flex items-center justify-center">
                    <div className="bg-white border border-slate-200 shadow-xl px-5 py-3 rounded-full flex items-center gap-3">
                        <Lock className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-semibold text-slate-600">{getBlurMessage()}</span>
                        {accessLevel === 'BASIC' && (
                            <Link
                                to="/worker/subscription"
                                className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-bold rounded-lg hover:shadow-md transition-shadow"
                            >
                                Premium
                            </Link>
                        )}
                    </div>
                </div>
            )}

            <div className="p-5 flex">
                {/* MAIN CONTENT */}
                <div className="flex-1 pr-5 border-r border-slate-100">
                    {/* Top Badges Row */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                        {mission.is_verified && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                                <CheckCircle className="w-3.5 h-3.5" /> Vérifié
                            </span>
                        )}
                        <span className={`inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full`}>
                            <SectorIcon className={`w-3.5 h-3.5 ${sectorInfo.color}`} />
                            {mission.sector || 'Action Sociale'}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                            {mission.positions_count || 1} poste{(mission.positions_count || 1) > 1 ? 's' : ''}
                        </span>
                        {mission.is_urgent && !isLocked && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-100 animate-pulse">
                                <Zap className="w-3 h-3" /> Urgent
                            </span>
                        )}
                    </div>

                    {/* Title & Logo */}
                    <div className="flex items-start gap-4 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                            {mission.establishment?.logo_url ? (
                                <img src={mission.establishment.logo_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <Building2 className="w-6 h-6 text-slate-300" />
                            )}
                        </div>
                        <div>
                            <h3 className={`text-lg font-bold text-slate-800 mb-1 leading-tight ${isLocked ? 'blur-[2px]' : ''}`}>
                                {mission.title || 'Titre de la mission'}
                            </h3>
                            <p className="text-sm text-slate-500 font-medium">
                                {mission.establishment?.name || 'Établissement'}
                            </p>
                        </div>
                    </div>

                    {/* Meta Info Row */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 mb-4">
                        <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            {mission.city?.name || 'Maroc'}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Briefcase className="w-4 h-4 text-slate-400" />
                            {mission.contract_type || 'CDI'}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-slate-400" />
                            {mission.work_mode || 'Sur site'}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-slate-400" />
                            {mission.experience_level || 'Intermédiaire'}
                        </span>
                    </div>

                    {/* Description */}
                    <p className={`text-sm text-slate-600 mb-4 line-clamp-2 ${isLocked ? 'blur-[3px] select-none' : ''}`}>
                        {mission.description || 'Description de la mission disponible pour les membres.'}
                    </p>

                    {/* Skills Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {skills.slice(0, 4).map((skill, idx) => (
                            <span key={idx} className="px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
                                {skill}
                            </span>
                        ))}
                    </div>

                    {/* Benefits */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {benefits.slice(0, 4).map((benefit, idx) => {
                            const BenefitIcon = getBenefitIcon(benefit);
                            return (
                                <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full">
                                    <BenefitIcon className="w-3 h-3" /> {benefit}
                                </span>
                            );
                        })}
                    </div>

                    {/* Footer Row */}
                    <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            Date limite: {mission.end_date ? new Date(mission.end_date).toLocaleDateString('fr-FR') : 'Non précisée'}
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-500">
                            <MapPin className="w-3.5 h-3.5" />
                            {mission.region || mission.city?.name || 'Maroc'}
                        </span>
                    </div>
                </div>

                {/* RIGHT COLUMN - Salary & Actions */}
                <div className="w-40 pl-5 flex flex-col justify-between">
                    {/* Salary */}
                    <div className="text-right">
                        {!isLocked && salaryMin && (
                            <p className="text-sm font-bold text-slate-500">
                                {salaryMin.toLocaleString('fr-FR')} -
                            </p>
                        )}
                        <p className={`text-xl font-extrabold text-slate-800 ${isLocked ? 'blur-[3px]' : ''}`}>
                            {salaryMax ? `${salaryMax.toLocaleString('fr-FR')}` : 'À négocier'}
                            <span className="text-sm font-semibold text-blue-600 ml-1">DH</span>
                        </p>
                        <p className="text-xs text-slate-400">par mois</p>
                    </div>

                    {/* Stats */}
                    <div className="my-4 space-y-1.5 text-right">
                        <p className="text-xs text-slate-500">
                            <Eye className="w-3.5 h-3.5 inline mr-1" />
                            <span className="font-semibold">{mission.views_count || Math.floor(Math.random() * 200) + 50}</span> vues
                        </p>
                        <p className="text-xs text-emerald-600">
                            <Users className="w-3.5 h-3.5 inline mr-1" />
                            <span className="font-semibold">{mission.applications_count || Math.floor(Math.random() * 30) + 5}</span> candidatures
                        </p>
                    </div>

                    {/* Action Button */}
                    {isLocked ? (
                        <div className="w-full py-2.5 px-3 bg-slate-100 text-slate-400 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5">
                            <Lock className="w-3.5 h-3.5" /> Verrouillé
                        </div>
                    ) : (
                        <Link
                            to={`/worker/missions/${mission.mission_id}`}
                            className="w-full py-2.5 px-3 bg-blue-600 text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors text-center block"
                            style={{ color: '#FFFFFF' }}
                        >
                            Voir l'offre
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
