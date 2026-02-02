import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    User, Mail, Phone, MapPin, Lock, Send, AlertCircle,
    CheckCircle, Linkedin, ArrowRight, Loader2, FileText,
    Shield, Award, Briefcase, Eye, EyeOff
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const RegisterWorker = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Dynamic Data
    const [regionsList, setRegionsList] = useState([]);
    const [citiesList, setCitiesList] = useState([]);
    const [filteredCities, setFilteredCities] = useState([]);

    // Fetch Cities
    useEffect(() => {
        const fetchCities = async () => {
            try {
                const res = await axios.get(`${API_URL}/general/cities`);
                const citiesData = res.data.data;
                setCitiesList(citiesData);

                // Extract unique regions
                const uniqueRegions = [...new Set(citiesData.map(c => c.region?.name).filter(Boolean))].sort();
                setRegionsList(uniqueRegions);
            } catch (err) {
                console.error("Failed to fetch cities", err);
            }
        };
        fetchCities();
    }, []);

    // Form data
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        cnie: '',
        phone: '',
        birthPlace: '',
        region: '',
        city_id: '',
        email: '',
        address: '',
        password: '',
        confirmPassword: '',
        linkedin: '',
    });

    const updateFormData = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
        
        if (field === 'region') {
            const filtered = citiesList.filter(c => c.region?.name === value);
            setFilteredCities(filtered);
            setFormData(prev => ({ ...prev, region: value, city_id: '' }));
        }
    };

    const validateForm = () => {
        if (!formData.firstName.trim()) return 'Le prénom est requis';
        if (!formData.lastName.trim()) return 'Le nom est requis';
        if (!formData.cnie.trim()) return 'Le numéro CNIE est requis';
        if (!formData.phone.trim()) return 'Le téléphone est requis';
        if (!formData.city_id) return 'La ville est requise';
        if (!formData.email.trim()) return 'L\'email est requis';
        if (!formData.email.includes('@')) return 'Email invalide';
        if (!formData.password) return 'Le mot de passe est requis';
        if (formData.password.length < 6) return 'Mot de passe trop court (min. 6 caractères)';
        if (formData.password !== formData.confirmPassword) return 'Les mots de passe ne correspondent pas';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await axios.post(`${API_URL}/auth/register/worker`, {
                email: formData.email,
                password: formData.password,
                first_name: formData.firstName,
                last_name: formData.lastName,
                phone: `+212${formData.phone.replace(/\s/g, '')}`,
                address: formData.address,
                city_id: formData.city_id,
                region: formData.region,
                cnie: formData.cnie,
                birth_place: formData.birthPlace,
                linkedin_url: formData.linkedin,
            });

            if (response.data.requiresVerification) {
                navigate('/verify-email', { state: { email: formData.email } });
            } else if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                setSuccess(true);
                setTimeout(() => navigate('/worker/dashboard'), 2000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 flex items-center justify-center p-6">
            <div className="w-full max-w-5xl">
                {/* Logo */}
                <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
                    <img
                        src="/logo.png"
                        alt="SociaLink"
                        className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="text-xl font-bold text-slate-800">SociaLink</span>
                </Link>

                {/* Main Card Container */}
                <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
                    <div className="flex flex-col lg:flex-row">

                        {/* Left Sidebar - Info Panel */}
                        <div className="lg:w-80 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8">
                            <div className="mb-8">
                                <h1 className="text-xl font-bold text-white mb-2">Inscription Travailleur</h1>
                                <p className="text-blue-100 text-sm">
                                    Rejoignez le réseau n°1 des travailleurs sociaux au Maroc.
                                </p>
                            </div>

                            {/* Benefits */}
                            <div className="space-y-4 mb-8">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                                        <Briefcase className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm">Missions Vérifiées</p>
                                        <p className="text-blue-100 text-xs">Accédez à des offres d'établissements certifiés</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                                        <Shield className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm">Profil Certifié</p>
                                        <p className="text-blue-100 text-xs">Badge de confiance après validation</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                                        <Award className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm">Visibilité Premium</p>
                                        <p className="text-blue-100 text-xs">Mettez en avant votre expertise</p>
                                    </div>
                                </div>
                            </div>

                            {/* Validation Notice */}
                            <div className="p-4 bg-white/10 border border-white/20 rounded-xl">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-amber-300 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-amber-300 font-semibold text-xs">VÉRIFICATION 24-48H</p>
                                        <p className="text-blue-100 text-xs mt-1">
                                            Votre profil sera validé par notre équipe avant activation.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <p className="mt-8 text-center text-blue-100 text-sm">
                                Déjà inscrit ? <Link to="/login" className="text-white hover:underline font-medium">Connexion</Link>
                            </p>
                        </div>

                        {/* Right Content - Form */}
                        <div className="flex-1 p-8 lg:p-10">
                            {/* Success Message */}
                            {success && (
                                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center gap-3">
                                    <CheckCircle className="w-6 h-6" />
                                    <div>
                                        <p className="font-semibold">Inscription réussie !</p>
                                        <p className="text-sm">Redirection vers votre tableau de bord...</p>
                                    </div>
                                </div>
                            )}

                            {/* Form Header */}
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-slate-900 mb-1">Créer votre compte</h2>
                                <p className="text-slate-500 text-sm">Remplissez le formulaire ci-dessous pour rejoindre notre réseau.</p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Row 1: Prénom / Nom */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                            Prénom <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => updateFormData('firstName', e.target.value)}
                                            placeholder="Ex: Amine"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                            Nom <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => updateFormData('lastName', e.target.value)}
                                            placeholder="Ex: Benani"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Row 2: CNIE / Téléphone */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                            CNIE <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.cnie}
                                            onChange={(e) => updateFormData('cnie', e.target.value)}
                                            placeholder="AB123456"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                            Téléphone <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => updateFormData('phone', e.target.value)}
                                            placeholder="+212 6 XX XX XX XX"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Row 3: Lieu de naissance */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Lieu de naissance
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.birthPlace}
                                        onChange={(e) => updateFormData('birthPlace', e.target.value)}
                                        placeholder="Ex: Casablanca"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                    />
                                </div>

                                {/* Row 4: Région / Ville */}
                                {/* Row 4: Région / Ville */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                            Région <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.region}
                                            onChange={(e) => updateFormData('region', e.target.value)}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="">Sélectionner une région</option>
                                            {regionsList.map(region => (
                                                <option key={region} value={region}>{region}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                            Ville <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.city_id}
                                            onChange={(e) => updateFormData('city_id', e.target.value)}
                                            disabled={!formData.region}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="">{formData.region ? 'Sélectionner une ville' : 'Choisir d\'abord une région'}</option>
                                            {filteredCities.map(city => (
                                                <option key={city.city_id} value={city.city_id}>{city.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Row 4: Email / Adresse */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => updateFormData('email', e.target.value)}
                                            placeholder="vous@exemple.com"
                                            autoComplete="off"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                            Adresse
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => updateFormData('address', e.target.value)}
                                            placeholder="Rue, Quartier..."
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Row 5: Password / Confirm */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                            Mot de passe <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={formData.password}
                                                onChange={(e) => updateFormData('password', e.target.value)}
                                                placeholder="Min. 6 caractères"
                                                autoComplete="new-password"
                                                className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                            Confirmer <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={formData.confirmPassword}
                                                onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                                                placeholder="Retapez le mot de passe"
                                                autoComplete="new-password"
                                                className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Row 6: LinkedIn */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        <Linkedin className="w-4 h-4 inline mr-1.5 text-blue-500" />
                                        LinkedIn <span className="text-slate-400 text-xs">(optionnel)</span>
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.linkedin}
                                        onChange={(e) => updateFormData('linkedin', e.target.value)}
                                        placeholder="https://linkedin.com/in/votre-profil"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                    />
                                </div>

                                {/* Info Box */}
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                    <div className="flex items-start gap-3">
                                        <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-blue-800 text-sm">Prochaine étape</p>
                                            <p className="text-blue-600 text-xs mt-1">
                                                Après inscription, vous pourrez compléter votre profil avec vos compétences,
                                                diplômes et expériences depuis votre tableau de bord.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/25"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Inscription en cours...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Créer mon compte
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Footer */}
                            <p className="mt-6 text-center text-slate-400 text-xs">
                                En vous inscrivant, vous acceptez nos{' '}
                                <Link to="/terms" className="text-blue-500 hover:underline">Conditions d'utilisation</Link>
                                {' '}et notre{' '}
                                <Link to="/privacy" className="text-blue-500 hover:underline">Politique de confidentialité</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterWorker;
