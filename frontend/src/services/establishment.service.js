import api from '../api/client';

export const establishmentService = {
    /**
     * Get establishment dashboard stats
     * @returns {Promise<Object>} Stats data
     */
    getStats: async () => {
        try {
            const response = await api.get('/establishment/stats');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching establishment stats:', error);
            return {
                activeMissions: 0,
                pendingApplications: 0,
                suggestions: 0
            };
        }
    },

    /**
     * Get recent candidates/applications
     * @param {number} limit 
     * @returns {Promise<Array>}
     */
    getRecentCandidates: async (limit = 5) => {
        try {
            const response = await api.get(`/establishment/candidates?limit=${limit}`);
            return response.data.data || [];
        } catch (error) {
            console.error('Error fetching recent candidates:', error);
            return [];
        }
    }
};
