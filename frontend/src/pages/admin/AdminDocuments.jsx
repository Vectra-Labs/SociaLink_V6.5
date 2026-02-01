import { useState, useEffect } from 'react';
import {
    FileCheck, Search, CheckCircle, XCircle, Eye, Download, FileText
} from 'lucide-react';

const AdminDocuments = () => {
    const [documents, setDocuments] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        // Mock data
        setDocuments([
            { id: 1, userName: 'Yassine Tazi', docType: "Diplôme d'État", uploadDate: '10/01/2024', status: 'pending', fileSize: '2.4 MB' },
            { id: 2, userName: 'Nadia Berrada', docType: 'Casier Judiciaire', uploadDate: '09/01/2024', status: 'pending', fileSize: '1.1 MB' },
            { id: 3, userName: 'Hassan Moukhliss', docType: 'Certificat de Formation', uploadDate: '08/01/2024', status: 'pending', fileSize: '3.2 MB' },
            { id: 4, userName: 'Laila Chraibi', docType: "Attestation d'emploi", uploadDate: '07/01/2024', status: 'approved', fileSize: '0.8 MB' },
            { id: 5, userName: 'Mehdi Alaoui', docType: "Diplôme d'État", uploadDate: '06/01/2024', status: 'rejected', fileSize: '2.1 MB' },
        ]);
    }, []);

    const handleApprove = (id) => {
        setDocuments(prev => prev.map(d => d.id === id ? { ...d, status: 'approved' } : d));
    };

    const handleReject = (id) => {
        setDocuments(prev => prev.map(d => d.id === id ? { ...d, status: 'rejected' } : d));
    };

    const filteredDocs = documents.filter(doc => {
        const matchesSearch = doc.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.docType.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'all' || doc.status === filter;
        return matchesSearch && matchesFilter;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'approved':
                return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Approuvé</span>;
            case 'rejected':
                return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">Rejeté</span>;
            default:
                return <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">En attente</span>;
        }
    };

    return (
        <div className="space-y-6">
            <header className="border-b border-slate-200 pb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Vérification des Documents</h1>
                    <p className="text-sm text-slate-500">{documents.filter(d => d.status === 'pending').length} documents en attente de validation</p>
                </div>
                <div className="flex items-center gap-4">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    >
                        <option value="all">Tous</option>
                        <option value="pending">En attente</option>
                        <option value="approved">Approuvés</option>
                        <option value="rejected">Rejetés</option>
                    </select>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        />
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredDocs.map((doc) => (
                    <div key={doc.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-amber-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800">{doc.docType}</p>
                                    <p className="text-sm text-slate-500">{doc.userName}</p>
                                </div>
                            </div>
                            {getStatusBadge(doc.status)}
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Date d'envoi</span>
                                <span className="text-slate-700">{doc.uploadDate}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Taille</span>
                                <span className="text-slate-700">{doc.fileSize}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50">
                                <Eye className="w-4 h-4" />
                                Aperçu
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50">
                                <Download className="w-4 h-4" />
                                Télécharger
                            </button>
                        </div>

                        {doc.status === 'pending' && (
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                                <button
                                    onClick={() => handleApprove(doc.id)}
                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Valider
                                </button>
                                <button
                                    onClick={() => handleReject(doc.id)}
                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Rejeter
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {filteredDocs.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <FileCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">Aucun document trouvé</p>
                </div>
            )}
        </div>
    );
};

export default AdminDocuments;
