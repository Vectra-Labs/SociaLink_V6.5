import api from '../api/client';

export const workerService = {
    /**
     * Get worker dashboard statistics
     * @returns {Promise<Object>} Stats object
     */
    getStats: async () => {
        try {
            const response = await api.get('/worker/stats');
            return response.data.data;
        } catch (error) {
            console.error('Error fetching worker stats:', error);
            // Return default zero-state to prevent UI crashes
            return {
                activeApplications: 0,
                acceptedMissions: 0,
                pendingReviews: 0,
                unreadMessages: 0
            };
        }
    },

    /**
     * Get recent applications for the dashboard
     * @param {number} limit Number of applications to fetch
     * @returns {Promise<Array>} List of applications
     */
    getRecentApplications: async (limit = 5) => {
        try {
            const response = await api.get(`/applications/my-applications?limit=${limit}`);
            return response.data.data || [];
        } catch (error) {
            console.error('Error fetching recent applications:', error);
            return [];
        }
    },

    getProfile: async () => {
        const { data } = await api.get('/worker/profile');
        return data.data;
    },

    updateProfile: async (formData) => {
        const { data } = await api.put('/worker/profile/update', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return data;
    },

    /**
     * Get recommended missions based on worker's specialities
     * @param {number} limit Number of missions to fetch
     * @returns {Promise<Array>} List of recommended missions
     */
    getRecommendedMissions: async (limit = 3) => {
        try {
            const response = await api.get(`/worker/recommended-missions?limit=${limit}`);
            return response.data.data || [];
        } catch (error) {
            console.error('Error fetching recommended missions:', error);
            return [];
        }
    },

    /**
     * Calculate profile completion percentage
     * @param {Object} profile Worker profile object
     * @param {Object} user User object
     * @returns {Object} Completion percentage and missing items
     */
    getProfileCompletion: (profile, user) => {
        const checks = [
            { key: 'photo', label: 'Photo de profil', completed: !!profile?.profile_pic_url },
            { key: 'bio', label: 'Bio/Description', completed: !!profile?.bio && profile.bio.length > 10 },
            { key: 'phone', label: 'Téléphone', completed: !!profile?.phone },
            { key: 'address', label: 'Adresse', completed: !!profile?.city_id || !!profile?.address },
            { key: 'experiences', label: 'Expériences', completed: profile?.experiences && profile.experiences.length > 0 },
            { key: 'specialities', label: 'Spécialités', completed: profile?.specialities && profile.specialities.length > 0 },
            { key: 'languages', label: 'Langues', completed: profile?.languages && profile.languages.length > 0 },
            // Check for CV in documents array if cv_url is not directly on profile
            { key: 'cv', label: 'CV', completed: !!(profile?.cv_url || profile?.documents?.some(d => d.type === 'CV' || d.type === 'RESUME')) },
        ];

        const completed = checks.filter(c => c.completed).length;
        const percentage = Math.round((completed / checks.length) * 100);
        const missing = checks.filter(c => !c.completed);

        return { percentage, completed, total: checks.length, missing, checks };
    },

    /**
     * Get worker's availability calendar data
     * @returns {Promise<Array>} List of availability entries
     */
    getAvailability: async () => {
        try {
            const response = await api.get('/worker/availability');
            return response.data.data || [];
        } catch (error) {
            console.error('Error fetching availability:', error);
            return [];
        }
    }
};
