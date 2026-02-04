import { useState, useEffect } from 'react';
import {
    DollarSign, TrendingUp, CreditCard, Calendar, ArrowUpRight, ArrowDownRight, Download
} from 'lucide-react';
import api from '../../api/client';

const SuperAdminFinance = () => {
    const [stats, setStats] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, txRes] = await Promise.all([
                api.get('/admin/finance/stats'),
                api.get('/admin/finance/transactions?page=1')
            ]);
            setStats(statsRes.data);
            setTransactions(txRes.data.transactions);
        } catch (error) {
            console.error("Error fetching finance data", error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(val || 0);
    };

    // Export Finance Report as CSV
    const handleExportFinanceReport = () => {
        setExporting(true);
        try {
            const now = new Date().toLocaleDateString('fr-FR');
            const rows = [
                ['Rapport Financier SociaLink', ''],
                ['Date d\'export', now],
                ['', ''],
                ['INDICATEURS CLÉS', ''],
                ['MRR (Revenu Récurrent Mensuel)', `${stats?.mrr || 0} DH`],
                ['Total Revenus', `${stats?.totalRevenue || 0} DH`],
                ['Abonnements Actifs', stats?.activeSubscriptions || 0],
                ['', ''],
                ['ÉVOLUTION CA (6 derniers mois)', ''],
            ];

            // Add chart data
            if (stats?.chartData && stats.chartData.length > 0) {
                stats.chartData.forEach(item => {
                    rows.push([item.name, `${item.value} DH`]);
                });
            }

            // Add transactions section
            rows.push(['', '']);
            rows.push(['DERNIÈRES TRANSACTIONS', '']);
            rows.push(['Utilisateur', 'Type', 'Date', 'Montant', 'Statut']);
            transactions.forEach(tx => {
                rows.push([
                    `${tx.user?.prenom || ''} ${tx.user?.nom || ''}`,
                    tx.type || '',
                    new Date(tx.created_at).toLocaleDateString('fr-FR'),
                    `${tx.amount} DH`,
                    tx.status
                ]);
            });

            const csvContent = rows.map(row => row.join(',')).join('\n');
            const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `rapport_finance_socialink_${now.replace(/\//g, '-')}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setExporting(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Chargement des données financières...</div>;

    const maxChartValue = stats?.chartData?.length > 0
        ? Math.max(...stats.chartData.map(d => d.value)) * 1.1
        : 1000;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Revenus & Finance</h1>
                    <p className="text-slate-500">Suivi du chiffre d'affaires et des transactions.</p>
                </div>
                <button
                    onClick={handleExportFinanceReport}
                    disabled={exporting}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                >
                    <Download className="w-4 h-4" /> {exporting ? 'Export...' : 'Exporter Rapport'}
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">MRR (Revenu Récurrent)</p>
                            <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(stats?.mrr)}</h3>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-xs text-green-600 font-medium">
                        <ArrowUpRight className="w-3 h-3" /> +12% ce mois
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Total Revenu</p>
                            <h3 className="text-2xl font-bold text-slate-900">{formatCurrency(stats?.totalRevenue)}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Abonnements Actifs</p>
                            <h3 className="text-2xl font-bold text-slate-900">{stats?.activeSubscriptions}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart Section */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Évolution du CA (6 derniers mois)</h3>
                <div className="h-64 flex items-end gap-4 justify-between px-4 pb-4 border-b border-slate-100">
                    {stats?.chartData?.map((data, index) => (
                        <div key={index} className="flex flex-col items-center gap-2 flex-1 group">
                            <div className="relative w-full max-w-[60px] bg-slate-100 rounded-t-lg overflow-hidden flex items-end h-48 transition-all group-hover:bg-slate-200">
                                <div
                                    className="w-full bg-blue-600 opacity-90 hover:opacity-100 transition-all duration-500 rounded-t-lg"
                                    style={{ height: `${(data.value / maxChartValue) * 100}%` }}
                                ></div>
                                {/* Tooltip */}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    {formatCurrency(data.value)}
                                </div>
                            </div>
                            <span className="text-xs text-slate-500 font-medium">{data.name}</span>
                        </div>
                    ))}
                    {(!stats?.chartData || stats.chartData.length === 0) && (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                            Aucune donnée disponible pour le graphique
                        </div>
                    )}
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-lg text-slate-900">Dernières Transactions</h3>
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">Tout voir</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Utilisateur</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Type</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Montant</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">Aucune transaction récente.</td>
                                </tr>
                            ) : (
                                transactions.map((tx) => (
                                    <tr key={tx.payment_id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{tx.user?.prenom} {tx.user?.nom}</div>
                                            <div className="text-xs text-slate-500">{tx.user?.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded text-slate-600 uppercase">{tx.type}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {new Date(tx.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900">
                                            {formatCurrency(tx.amount)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${tx.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminFinance;
