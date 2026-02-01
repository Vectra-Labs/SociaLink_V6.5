import api from '../api/client';

export const superAdminService = {
    /**
     * Get system-wide financial and operational stats
     * @returns {Promise<Object>}
     */
    /**
     * Get system-wide financial and operational stats
     * @returns {Promise<Object>}
     */
    getRealtimeStats: async () => {
        try {
            const response = await api.get('/super-admin/realtime-monitor');
            return response.data;
        } catch (error) {
            console.error('Error fetching super admin stats:', error);
            throw error;
        }
    },

    getDashboardStats: async () => {
        const { data } = await api.get('/super-admin/stats');
        return data; // Expected: { users, missions, revenue, recentActivity }
    },

    getFinancialStats: async () => {
        const { data } = await api.get('/super-admin/finance/stats');
        return data; // Expected: { mrr, totalRevenue, activeSubscriptions, chartData }
    },

    getAdmins: async () => {
        const { data } = await api.get('/super-admin/admins');
        return data;
    }
};
