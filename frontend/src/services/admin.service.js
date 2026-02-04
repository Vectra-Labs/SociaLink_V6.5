import api from '../api/client';

export const adminService = {
    /**
     * Get global admin dashboard stats
     * @returns {Promise<Object>}
     */
    getDashboardStats: async () => {
        try {
            const [qualityRes, pendingRes, disputesRes] = await Promise.all([
                api.get('/admin/quality/stats'),
                api.get('/admin/quality/pending'),
                api.get('/admin/disputes?status=OPEN')
            ]);

            return {
                globalScore: qualityRes.data.globalScore || 85,
                pendingProfiles: qualityRes.data.pendingCount || 0,
                verifiedProfiles: qualityRes.data.verifiedCount || 0,
                rejectedProfiles: qualityRes.data.rejectedCount || 0,
                openDisputes: disputesRes.data?.length || 0,
                totalUsers: qualityRes.data.totalUsers || 0,
                pendingList: pendingRes.data?.slice(0, 5) || [],
                disputesList: disputesRes.data?.slice(0, 4) || []
            };
        } catch (error) {
            console.error('Error fetching admin stats:', error);
            return {
                globalScore: 0,
                pendingProfiles: 0,
                openDisputes: 0,
                verifiedProfiles: 0,
                pendingList: [],
                disputesList: []
            };
        }
    }
};
