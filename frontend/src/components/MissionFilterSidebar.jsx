import { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, X, SlidersHorizontal } from 'lucide-react';

export default function MissionFilterSidebar({ filters, setFilters, onReset }) {
    const [openSections, setOpenSections] = useState({
        region: true,
        sector: true,
        contract: false
    });

    const toggleSection = (key) => {
        setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const sectors = [
        { id: 'sante', label: 'Santé' },
        { id: 'action_sociale', label: 'Action Sociale' },
        { id: 'education', label: 'Éducation' },
        { id: 'handicap', label: 'Handicap' },
        { id: 'personnes_agees', label: 'Personnes Âgées' },
        { id: 'jeunesse', label: 'Jeunesse' }
    ];

    const contractTypes = ['CDI', 'CDD', 'INTERIM', 'STAGE', 'BENEVOLAT', 'FREELANCE'];

    const handleSectorToggle = (sectorId) => {
        // For now, single select
        setFilters(prev => ({
            ...prev,
            sector: prev.sector === sectorId ? '' : sectorId
        }));
    };

    const handleContractToggle = (type) => {
        setFilters(prev => ({
            ...prev,
            contract_type: prev.contract_type === type ? '' : type
        }));
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden sticky top-24">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filtres
                </h3>
                <button
                    onClick={onReset}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                    Réinitialiser
                </button>
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
                        <select
                            value={filters.city_id || ''}
                            onChange={(e) => setFilters(prev => ({ ...prev, city_id: e.target.value }))}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                        >
                            <option value="">Toutes les régions</option>
                            <option value="1">Casablanca-Settat</option>
                            <option value="2">Rabat-Salé-Kénitra</option>
                            <option value="3">Marrakech-Safi</option>
                            <option value="4">Fès-Meknès</option>
                            <option value="5">Tanger-Tétouan-Al Hoceïma</option>
                        </select>
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
                        {sectors.map(sector => (
                            <label key={sector.id} className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${filters.sector === sector.id
                                        ? 'bg-blue-600 border-blue-600'
                                        : 'border-slate-300 group-hover:border-blue-400 bg-white'
                                    }`}>
                                    {filters.sector === sector.id && (
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M12.207 4.793a1 1 0 0 1 0 1.414l-5 5a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L6.5 9.086l4.293-4.293a1 1 0 0 1 1.414 0z" />
                                        </svg>
                                    )}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={filters.sector === sector.id}
                                    onChange={() => handleSectorToggle(sector.id)}
                                />
                                <span className={`text-sm ${filters.sector === sector.id ? 'text-blue-700 font-medium' : 'text-slate-600'}`}>
                                    {sector.label}
                                </span>
                            </label>
                        ))}
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
                        {contractTypes.map(type => (
                            <label key={type} className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${filters.contract_type === type
                                        ? 'bg-blue-600 border-blue-600'
                                        : 'border-slate-300 group-hover:border-blue-400 bg-white'
                                    }`}>
                                    {filters.contract_type === type && (
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M12.207 4.793a1 1 0 0 1 0 1.414l-5 5a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L6.5 9.086l4.293-4.293a1 1 0 0 1 1.414 0z" />
                                        </svg>
                                    )}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={filters.contract_type === type}
                                    onChange={() => handleContractToggle(type)}
                                />
                                <span className={`text-sm ${filters.contract_type === type ? 'text-blue-700 font-medium' : 'text-slate-600'}`}>
                                    {type}
                                </span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            {/* Budget Slider */}
            <div className="p-4">
                <label className="font-semibold text-slate-700 text-sm block mb-3">Budget minimum</label>
                <input
                    type="range"
                    min="0"
                    max="20000"
                    step="1000"
                    value={filters.min_budget || 0}
                    onChange={(e) => setFilters(prev => ({ ...prev, min_budget: e.target.value }))}
                    className="w-full accent-blue-600 h-2 bg-slate-200 rounded-full"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                    <span>0 DH</span>
                    <span className="font-semibold text-blue-600">{filters.min_budget || 0} DH+</span>
                </div>
            </div>

            {/* Urgent Only Toggle */}
            <div className="p-4 border-t border-slate-100">
                <label className="flex items-center justify-between cursor-pointer">
                    <span className="font-semibold text-slate-700 text-sm">Urgences uniquement</span>
                    <div
                        className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${filters.is_urgent ? 'bg-red-500' : 'bg-slate-200'
                            }`}
                        onClick={() => setFilters(prev => ({ ...prev, is_urgent: !prev.is_urgent }))}
                    >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow ${filters.is_urgent ? 'left-5' : 'left-1'
                            }`} />
                    </div>
                </label>
            </div>
        </div>
    );
}
