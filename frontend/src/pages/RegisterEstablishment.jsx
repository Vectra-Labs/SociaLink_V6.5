import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Building2, User, FileCheck, Check,
    Mail, Phone, ArrowLeft, ArrowRight,
    AlertCircle, Upload, Info, Sparkles, Scan
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const STEPS = [
    { id: 1, label: 'Établissement', sublabel: 'Infos structure', icon: Building2 },
    { id: 2, label: 'Représentant', sublabel: 'Contact principal', icon: User },
    { id: 3, label: 'Validation', sublabel: 'Documents & Vérification', icon: FileCheck },
];

// 12 Régions du Maroc avec leurs villes
const MOROCCAN_REGIONS = {
    "Tanger-Tétouan-Al Hoceïma": [
        "Tanger", "Tétouan", "Al Hoceïma", "Chefchaouen", "Larache",
        "Ksar El Kébir", "Asilah", "Fnideq", "M'diq", "Ouezzane", "Martil"
    ],
    "L'Oriental": [
        "Oujda", "Nador", "Berkane", "Taourirt", "Jerada",
        "Driouch", "Guercif", "Figuig", "Zaio", "Ahfir"
    ],
    "Fès-Meknès": [
        "Fès", "Meknès", "Taza", "Ifrane", "Azrou", "Séfrou",
        "Moulay Yacoub", "El Hajeb", "Boulemane", "Imouzzer Kandar"
    ],
    "Rabat-Salé-Kénitra": [
        "Rabat", "Salé", "Kénitra", "Témara", "Skhirat",
        "Khémisset", "Sidi Slimane", "Sidi Kacem", "Tiflet", "Mehdia"
    ],
    "Béni Mellal-Khénifra": [
        "Béni Mellal", "Khénifra", "Fquih Ben Salah", "Azilal",
        "Kasba Tadla", "Khouribga", "Oued Zem", "Boujaad"
    ],
    "Casablanca-Settat": [
        "Casablanca", "Mohammedia", "El Jadida", "Settat", "Berrechid",
        "Benslimane", "Azemmour", "Nouaceur", "Médiouna", "Bouskoura", "Sidi Bennour"
    ],
    "Marrakech-Safi": [
        "Marrakech", "Safi", "Essaouira", "El Kelâa des Sraghna",
        "Chichaoua", "Youssoufia", "Rehamna", "Ben Guerir"
    ],
    "Drâa-Tafilalet": [
        "Errachidia", "Ouarzazate", "Tinghir", "Zagora",
        "Midelt", "Merzouga", "Rissani", "Goulmima"
    ],
    "Souss-Massa": [
        "Agadir", "Inezgane", "Taroudant", "Tiznit",
        "Ait Melloul", "Chtouka Ait Baha", "Tata"
    ],
    "Guelmim-Oued Noun": [
        "Guelmim", "Tan-Tan", "Sidi Ifni", "Assa-Zag"
    ],
    "Laâyoune-Sakia El Hamra": [
        "Laâyoune", "Boujdour", "Tarfaya", "Es-Semara"
    ],
    "Dakhla-Oued Ed-Dahab": [
        "Dakhla", "Aousserd"
    ]
};

const RegisterEstablishment = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [extractedDoc, setExtractedDoc] = useState(null);

    // Form data
    const [formData, setFormData] = useState({
        establishmentName: '',
        establishmentType: '',
        region: '',
        city: '',
        ice: '',
        contactName: '',
        contactFunction: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        documents: null,
    });

    const updateFormData = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Simulated OCR extraction for official documents
    const handleDocumentUpload = async (file) => {
        setIsScanning(true);

        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock OCR result
        const mockExtractedData = {
            type: 'Attestation ICE',
            iceNumber: '001234567890000',
            establishmentName: formData.establishmentName || 'Association Al Amal',
            date: '2023-01-15',
            fileName: file.name
        };

        setExtractedDoc(mockExtractedData);
        if (mockExtractedData.iceNumber) {
            updateFormData('ice', mockExtractedData.iceNumber);
        }
        setIsScanning(false);
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError('');

        try {
            const [firstName, ...lastNameParts] = formData.contactName.split(' ');
            const lastName = lastNameParts.join(' ') || '';

            const response = await axios.post(`${API_URL}/auth/register`, {
                email: formData.email,
                password: formData.password,
                role: 'ESTABLISHMENT',
                name: formData.establishmentName,
                contactFirstName: firstName,
                contactLastName: lastName,
                contactFunction: formData.contactFunction,
                phone: formData.phone,
                iceNumber: formData.ice,
            });

            if (response.data.requiresVerification) {
                navigate('/verify-email', { state: { email: formData.email } });
            } else if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
        } finally {
            setIsLoading(false);
        }
    };

    const nextStep = () => {
        if (currentStep < 3) setCurrentStep(prev => prev + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 flex items-center justify-center p-6">
            <div className="w-full max-w-5xl">
                {/* Logo Only */}
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

                        {/* Left Sidebar - Steps */}
                        <div className="lg:w-72 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8">
                            <div className="mb-8">
                                <h1 className="text-xl font-bold text-white mb-2">Inscription Établissement</h1>
                                <p className="text-blue-100 text-sm">
                                    Recrutez les meilleurs professionnels du social.
                                </p>
                            </div>

                            {/* Steps */}
                            <nav className="space-y-2">
                                {STEPS.map((step, index) => {
                                    const Icon = step.icon;
                                    const isActive = currentStep === step.id;
                                    const isCompleted = currentStep > step.id;

                                    return (
                                        <div key={step.id}>
                                            <button
                                                onClick={() => setCurrentStep(step.id)}
                                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${isActive
                                                    ? 'bg-blue-600 text-white'
                                                    : isCompleted
                                                        ? 'text-emerald-300 hover:bg-white/10'
                                                        : 'text-blue-200 hover:bg-white/10'
                                                    }`}
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold ${isActive
                                                    ? 'bg-white/20'
                                                    : isCompleted
                                                        ? 'bg-emerald-500/20'
                                                        : 'bg-white/10'
                                                    }`}>
                                                    {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-medium text-sm">{step.label}</p>
                                                    <p className={`text-xs ${isActive ? 'text-white/70' : 'text-blue-200/70'}`}>
                                                        {step.sublabel}
                                                    </p>
                                                </div>
                                            </button>
                                            {index < STEPS.length - 1 && (
                                                <div className="ml-7 h-4 border-l-2 border-white/20" />
                                            )}
                                        </div>
                                    );
                                })}
                            </nav>

                            {/* Info Notice */}
                            <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                                <div className="flex items-start gap-2">
                                    <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-blue-400 font-semibold text-xs">VÉRIFICATION 24-48H</p>
                                        <p className="text-blue-100 text-xs mt-1">
                                            Vos documents seront validés par notre équipe avant activation.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Login Link */}
                            <p className="mt-6 text-center text-blue-100 text-sm">
                                Déjà inscrit ? <Link to="/login" className="text-white hover:underline font-medium">Connexion</Link>
                            </p>
                        </div>

                        {/* Right Content - Form */}
                        <div className="flex-1 p-8 lg:p-12">
                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5" />
                                    {error}
                                </div>
                            )}

                            {/* Step 1: Establishment Info */}
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 mb-1">Détails de l'établissement</h2>
                                        <p className="text-slate-500 text-sm">Informations officielles de votre structure.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nom de la structure</label>
                                            <input
                                                type="text"
                                                value={formData.establishmentName}
                                                onChange={(e) => updateFormData('establishmentName', e.target.value)}
                                                placeholder="Ex: Association Al Amal"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Type juridique</label>
                                            <select
                                                value={formData.establishmentType}
                                                onChange={(e) => updateFormData('establishmentType', e.target.value)}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                            >
                                                <option value="">Sélectionner</option>
                                                <option value="association">Association (Loi 1958)</option>
                                                <option value="fondation">Fondation</option>
                                                <option value="cooperative">Coopérative</option>
                                                <option value="public">Établissement public</option>
                                                <option value="private">Structure privée</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Région</label>
                                            <select
                                                value={formData.region}
                                                onChange={(e) => {
                                                    updateFormData('region', e.target.value);
                                                    updateFormData('city', '');
                                                }}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                            >
                                                <option value="">Sélectionner une région</option>
                                                {Object.keys(MOROCCAN_REGIONS).map(region => (
                                                    <option key={region} value={region}>{region}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Ville</label>
                                            <select
                                                value={formData.city}
                                                onChange={(e) => updateFormData('city', e.target.value)}
                                                disabled={!formData.region}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-50"
                                            >
                                                <option value="">{formData.region ? 'Sélectionner une ville' : 'Choisir d\'abord une région'}</option>
                                                {formData.region && MOROCCAN_REGIONS[formData.region]?.map(city => (
                                                    <option key={city} value={city}>{city}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Numéro ICE</label>
                                            <input
                                                type="text"
                                                value={formData.ice}
                                                onChange={(e) => updateFormData('ice', e.target.value)}
                                                placeholder="001234567890000"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Representative Info */}
                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    {/* Summary of Step 1 */}
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Check className="w-4 h-4 text-green-500" />
                                                <span className="font-medium text-slate-700 text-sm">Établissement: {formData.establishmentName || '—'}</span>
                                            </div>
                                            <button onClick={() => setCurrentStep(1)} className="text-xs text-blue-600 hover:underline">Modifier</button>
                                        </div>
                                        <p className="text-xs text-slate-500">{formData.city} • ICE: {formData.ice || '—'}</p>
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 mb-1">Informations du Représentant</h2>
                                        <p className="text-slate-500 text-sm">Personne de contact principale pour le compte.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nom et Prénom <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                value={formData.contactName}
                                                onChange={(e) => updateFormData('contactName', e.target.value)}
                                                placeholder="Karim Bennani"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Fonction <span className="text-red-500">*</span></label>
                                            <select
                                                value={formData.contactFunction}
                                                onChange={(e) => updateFormData('contactFunction', e.target.value)}
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                            >
                                                <option value="">Sélectionner</option>
                                                <option value="director">Directeur</option>
                                                <option value="hr">Responsable RH</option>
                                                <option value="coordinator">Coordinateur</option>
                                                <option value="president">Président</option>
                                                <option value="other">Autre</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Professionnel <span className="text-red-500">*</span></label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => updateFormData('email', e.target.value)}
                                                placeholder="contact@etablissement.ma"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                            />
                                            <p className="text-xs text-slate-400 mt-1">Cet email sera votre identifiant de connexion.</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Téléphone Mobile <span className="text-red-500">*</span></label>
                                            <div className="flex">
                                                <span className="inline-flex items-center px-3 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-slate-500 text-sm">
                                                    🇲🇦 +212
                                                </span>
                                                <input
                                                    type="tel"
                                                    value={formData.phone}
                                                    onChange={(e) => updateFormData('phone', e.target.value)}
                                                    placeholder="6 XX XX XX XX"
                                                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Mot de passe <span className="text-red-500">*</span></label>
                                            <input
                                                type="password"
                                                value={formData.password}
                                                onChange={(e) => updateFormData('password', e.target.value)}
                                                placeholder="Min. 8 caractères"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirmer <span className="text-red-500">*</span></label>
                                            <input
                                                type="password"
                                                value={formData.confirmPassword}
                                                onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                                                placeholder="Retapez le mot de passe"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Documents with OCR */}
                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 mb-1">Documents & Validation</h2>
                                        <p className="text-slate-500 text-sm">Veuillez télécharger vos documents officiels pour vérification par notre équipe.</p>
                                    </div>

                                    {/* OCR Upload Zone */}
                                    <div className="p-6 border-2 border-dashed border-slate-300 rounded-2xl text-center hover:border-blue-400 transition-colors">
                                        <div className="flex items-center justify-center gap-3 mb-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                                <Scan className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                                <Sparkles className="w-6 h-6 text-purple-600" />
                                            </div>
                                        </div>
                                        <p className="text-slate-600 mb-2 font-medium">Justificatif d'activité (Obligatoire)</p>
                                        <p className="text-slate-400 text-sm mb-4">Statuts, Autorisation d'exercice ou Attestation ICE</p>
                                        <input
                                            type="file"
                                            id="doc-upload"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            className="hidden"
                                            onChange={(e) => e.target.files[0] && handleDocumentUpload(e.target.files[0])}
                                        />
                                        <label
                                            htmlFor="doc-upload"
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 cursor-pointer transition-colors"
                                        >
                                            <Upload className="w-4 h-4" />
                                            {isScanning ? 'Analyse OCR...' : 'Sélectionner un fichier'}
                                        </label>
                                        <p className="text-xs text-slate-400 mt-3">Nos équipes vérifieront vos documents manuellement pour valider votre établissement.</p>
                                    </div>

                                    {/* Scanning Animation */}
                                    {isScanning && (
                                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl animate-pulse">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center animate-spin">
                                                    <Scan className="w-4 h-4 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-blue-800">Analyse OCR en cours...</p>
                                                    <p className="text-sm text-blue-600">Extraction du N° ICE et informations officielles</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Extracted Document */}
                                    {extractedDoc && (
                                        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                                            <div className="flex items-start gap-3">
                                                <Check className="w-5 h-5 text-green-600 mt-0.5" />
                                                <div className="flex-1">
                                                    <p className="font-medium text-slate-800">{extractedDoc.type}</p>
                                                    <p className="text-sm text-slate-500">{extractedDoc.fileName}</p>
                                                    <div className="flex gap-4 mt-2 text-xs text-slate-500">
                                                        <span>🏢 {extractedDoc.establishmentName}</span>
                                                        <span>🔢 ICE: {extractedDoc.iceNumber}</span>
                                                    </div>
                                                </div>
                                                <button className="text-sm text-blue-600 hover:underline">Modifier</button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Info Notice */}
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                        <div className="flex items-start gap-3">
                                            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-blue-800">Processus de vérification</p>
                                                <p className="text-sm text-blue-600 mt-1">
                                                    Votre compte sera créé avec le statut <span className="font-semibold">"En attente de validation"</span>.
                                                    Notre équipe vérifiera vos documents sous 24-48h.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Navigation */}
                            <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-200">
                                {currentStep > 1 ? (
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="flex items-center gap-2 text-slate-600 hover:text-slate-800 text-sm"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Retour
                                    </button>
                                ) : (
                                    <div />
                                )}

                                {currentStep < 3 ? (
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                                    >
                                        Suivant
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {isLoading ? 'Envoi en cours...' : 'Soumettre la demande'}
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterEstablishment;
