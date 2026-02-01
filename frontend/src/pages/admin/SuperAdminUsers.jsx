import { useState, useEffect } from 'react';
import {
    Search, Filter, MoreVertical, CheckCircle, XCircle,
    AlertTriangle, User, Building2, Briefcase, ChevronLeft, ChevronRight,
    Eye, FileText, Calendar, MapPin, Phone, Mail, Award, Clock
} from 'lucide-react';
import api from '../../api/client';

const SuperAdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        role: 'ALL',
        status: 'ALL',
        page: 1
    });
    const [pagination, setPagination] = useState({ total: 0, pages: 1 });

    // Details Modal State
    const [selectedUser, setSelectedUser] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [filters]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams(filters).toString();
            const { data } = await api.get(`/super-admin/users?${query}`);
            setUsers(data.users);
            setPagination(data.pagination);
        } catch (error) {
            console.error("Error fetching users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (user) => {
        setSelectedUser(user);
        setLoadingDetails(true);
        setUserDetails(null);
        try {
            const { data } = await api.get(`/super-admin/users/${user.user_id}`);
            setUserDetails(data);
        } catch (error) {
            alert("Erreur chargement détails (Vérifiez la console)");
            console.error(error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleStatusChange = async (userId, newStatus) => {
        if (!window.confirm(`Êtes-vous sûr de vouloir changer le statut à ${newStatus} ?`)) return;
        try {
            await api.put(`/super-admin/users/${userId}/status`, { status: newStatus });
            fetchUsers();
            if (selectedUser?.user_id === userId) {
                // Refresh modal if open
                handleViewDetails({ ...selectedUser, status: newStatus });
            }
        } catch (error) {
            alert("Erreur lors de la mise à jour");
        }
    };

    const getDocumentsList = (user) => {
        const docs = [];
        if (!user) return docs;

        if (user.role === 'WORKER' && user.workerProfile) {
            if (user.workerProfile.cv_url) {
                docs.push({
                    id: 'cv',
                    type: 'CV',
                    file_url: user.workerProfile.cv_url,
                    status: user.workerProfile.verification_status
                });
            }
            if (user.workerProfile.diplomas && Array.isArray(user.workerProfile.diplomas)) {
                user.workerProfile.diplomas.forEach(d => {
                    docs.push({
                        id: `dip_${d.diploma_id}`,
                        type: `Diplôme: ${d.name}`,
                        file_url: d.file_path,
                        status: d.verification_status
                    });
                });
            }
        }
        // Add Establishment docs logic if they exist in future (e.g. Kbis url in profile)
        return docs;
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            VALIDATED: 'bg-green-100 text-green-700',
            PENDING: 'bg-orange-100 text-orange-700',
            SUSPENDED: 'bg-red-100 text-red-700'
        };
        const labels = {
            VALIDATED: 'Validé',
            PENDING: 'En Attente',
            SUSPENDED: 'Suspendu'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${styles[status] || 'bg-slate-100 text-slate-500'}`}>
                {labels[status] || status}
            </span>
        );
    };

    const RoleBadge = ({ role }) => {
        if (role === 'WORKER') return <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs font-medium"><Briefcase className="w-3 h-3" /> Travailleur</span>;
        if (role === 'ESTABLISHMENT') return <span className="flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-1 rounded text-xs font-medium"><Building2 className="w-3 h-3" /> Établissement</span>;
        return <span className="text-slate-500 text-xs">{role}</span>;
    };

    const documents = userDetails ? getDocumentsList(userDetails) : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Gestion des Utilisateurs</h1>
                    <p className="text-slate-500">Consultez et modérez tous les comptes de la plateforme.</p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Rechercher par nom, email..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                    />
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <select
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none bg-slate-50"
                        value={filters.role}
                        onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}
                    >
                        <option value="ALL">Tous les Rôles</option>
                        <option value="WORKER">Travailleurs</option>
                        <option value="ESTABLISHMENT">Établissements</option>
                    </select>

                    <select
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none bg-slate-50"
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                    >
                        <option value="ALL">Tous les Status</option>
                        <option value="VALIDATED">Validés</option>
                        <option value="PENDING">En Attente</option>
                        <option value="SUSPENDED">Suspendus</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Utilisateur</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Rôle</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Abonnement</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">Chargement...</td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">Aucun utilisateur trouvé.</td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.user_id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                                                    {user.nom?.[0] || 'U'}{user.prenom?.[0] || ''}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{user.prenom} {user.nom}</p>
                                                    <p className="text-xs text-slate-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <RoleBadge role={user.role} />
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.subscription && user.subscription.length > 0 && user.subscription[0].status === 'ACTIVE' ? (
                                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                                    {user.subscription[0].plan?.name || 'Premium'}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-400">Gratuit</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={user.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleViewDetails(user)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                                    title="Détails complets"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {user.status === 'VALIDATED' && (
                                                    <button
                                                        onClick={() => handleStatusChange(user.user_id, 'SUSPENDED')}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                                        title="Suspendre"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {(user.status === 'SUSPENDED' || user.status === 'PENDING') && (
                                                    <button
                                                        onClick={() => handleStatusChange(user.user_id, 'VALIDATED')}
                                                        className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                                        title="Activer/Valider"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                        Page {filters.page} sur {pagination.pages}
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={filters.page <= 1}
                            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                            className="p-1 rounded border bg-white disabled:opacity-50"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            disabled={filters.page >= pagination.pages}
                            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                            className="p-1 rounded border bg-white disabled:opacity-50"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* DETAILS MODAL */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50 rounded-t-xl">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-xl font-bold text-slate-500 shadow-sm">
                                    {selectedUser.nom?.[0]}{selectedUser.prenom?.[0]}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">{selectedUser.prenom} {selectedUser.nom}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <RoleBadge role={selectedUser.role} />
                                        <StatusBadge status={selectedUser.status} />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">Inscrit le {new Date(selectedUser.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                <XCircle className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {loadingDetails ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                                </div>
                            ) : !userDetails ? (
                                <p className="text-center text-red-500">Erreur de chargement</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Column 1: Contact & Info */}
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900 uppercase mb-3 flex items-center gap-2">
                                                <User className="w-4 h-4" /> Contact
                                            </h3>
                                            <div className="bg-slate-50 p-4 rounded-xl space-y-3 text-sm">
                                                <div className="flex items-center gap-3">
                                                    <Mail className="w-4 h-4 text-slate-400" />
                                                    <span className="text-slate-700">{userDetails.email}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Phone className="w-4 h-4 text-slate-400" />
                                                    <span className="text-slate-700">{userDetails.phone || 'Non renseigné'}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <MapPin className="w-4 h-4 text-slate-400" />
                                                    <span className="text-slate-700">{userDetails.address || 'Adresse inconnue'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {userDetails.subscription && userDetails.subscription.length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900 uppercase mb-3 flex items-center gap-2">
                                                    <Award className="w-4 h-4" /> Abonnement
                                                </h3>
                                                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                                                    <p className="font-bold text-blue-900">{userDetails.subscription[0].plan?.name}</p>
                                                    <p className="text-xs text-blue-700 mt-1">Statut: {userDetails.subscription[0].status}</p>
                                                    <p className="text-xs text-blue-600 mt-1">Expire le: {userDetails.subscription[0].end_date ? new Date(userDetails.subscription[0].end_date).toLocaleDateString() : 'Jamais'}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Column 2: Specific Profile Data */}
                                    <div className="md:col-span-2 space-y-6">
                                        {userDetails.role === 'WORKER' && userDetails.workerProfile && (
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900 uppercase mb-3 text-blue-600">Profil Travailleur</h3>
                                                <div className="bg-white border rounded-xl p-4">
                                                    <p className="text-sm text-slate-600 mb-4">{userDetails.workerProfile.bio || "Aucune bio"}</p>

                                                    <h4 className="font-semibold text-sm mb-2">Compétences</h4>
                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        {userDetails.workerProfile.specialities && userDetails.workerProfile.specialities.length > 0 ? (
                                                            userDetails.workerProfile.specialities.map(s => (
                                                                <span key={s.speciality.speciality_id} className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600">{s.speciality.name}</span>
                                                            ))
                                                        ) : <span className="text-xs text-slate-400">Aucune compétence</span>}
                                                    </div>

                                                    <h4 className="font-semibold text-sm mb-2">Expériences</h4>
                                                    <div className="space-y-3">
                                                        {userDetails.workerProfile.experiences && userDetails.workerProfile.experiences.length > 0 ? (
                                                            userDetails.workerProfile.experiences.map(exp => (
                                                                <div key={exp.id} className="text-sm border-l-2 border-blue-200 pl-3">
                                                                    <p className="font-medium text-slate-900">{exp.position}</p>
                                                                    <p className="text-xs text-slate-500">{exp.company} • {new Date(exp.start_date).getFullYear()}-{exp.end_date ? new Date(exp.end_date).getFullYear() : 'Présent'}</p>
                                                                </div>
                                                            ))
                                                        ) : <span className="text-xs text-slate-400">Aucune expérience</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {userDetails.role === 'ESTABLISHMENT' && userDetails.establishmentProfile && (
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900 uppercase mb-3 text-purple-600">Profil Établissement</h3>
                                                <div className="bg-white border rounded-xl p-4">
                                                    <p className="font-bold text-lg text-slate-900 mb-1">{userDetails.nom_etablissement}</p>
                                                    <p className="text-sm text-slate-600 mb-4">{userDetails.establishmentProfile.description || "Aucune description"}</p>

                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <span className="block text-xs font-semibold text-slate-500">Secteur</span>
                                                            <span className="text-slate-800">{userDetails.establishmentProfile.industry || 'N/A'}</span>
                                                        </div>
                                                        <div>
                                                            <span className="block text-xs font-semibold text-slate-500">Site Web</span>
                                                            <a href={userDetails.establishmentProfile.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate block">
                                                                {userDetails.establishmentProfile.website || 'N/A'}
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Documents Section */}
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900 uppercase mb-3 flex items-center gap-2">
                                                <FileText className="w-4 h-4" /> Documents
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {documents.length > 0 ? (
                                                    documents.map(doc => (
                                                        <a
                                                            key={doc.id}
                                                            href={doc.file_url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-blue-300 transition-all group"
                                                        >
                                                            <div className="p-2 bg-slate-100 rounded text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600">
                                                                <FileText className="w-4 h-4" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-medium text-slate-700 truncate group-hover:text-blue-700">{doc.type}</p>
                                                                <p className="text-xs text-slate-400">Status: {doc.status}</p>
                                                            </div>
                                                        </a>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-slate-500 italic p-2">Aucun document disponible.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-end gap-3">
                            <button onClick={() => setSelectedUser(null)} className="px-4 py-2 border rounded-lg hover:bg-white transition-colors">Fermer</button>
                            {userDetails && userDetails.status !== 'SUSPENDED' && (
                                <button onClick={() => handleStatusChange(selectedUser.user_id, 'SUSPENDED')} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm">
                                    Suspendre le compte
                                </button>
                            )}
                            {userDetails && userDetails.status === 'SUSPENDED' && (
                                <button onClick={() => handleStatusChange(selectedUser.user_id, 'VALIDATED')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm">
                                    Réactiver le compte
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminUsers;
