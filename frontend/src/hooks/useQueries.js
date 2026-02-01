import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';

// ============================================
// QUERY KEYS - Centralized key management
// ============================================
export const queryKeys = {
    // Worker
    workerProfile: ['worker', 'profile'],
    workerStats: ['worker', 'stats'],
    workerApplications: ['worker', 'applications'],

    // Establishment
    establishmentProfile: ['establishment', 'profile'],
    establishmentStats: ['establishment', 'stats'],
    establishmentMissions: ['establishment', 'missions'],

    // Missions
    missions: (filters) => ['missions', filters],
    missionDetail: (id) => ['missions', id],

    // Applications
    missionApplications: (missionId) => ['applications', 'mission', missionId],

    // Specialities & Cities
    specialities: ['specialities'],
    cities: ['cities'],

    // Subscriptions
    subscriptionPlans: ['subscriptions', 'plans'],
    currentSubscription: ['subscriptions', 'current'],

    // Messages
    conversations: ['conversations'],
    messages: (conversationId) => ['messages', conversationId],
};

// ============================================
// GENERIC HOOKS
// ============================================

// Specialities (cached globally)
export function useSpecialities() {
    return useQuery({
        queryKey: queryKeys.specialities,
        queryFn: async () => {
            const { data } = await api.get('/specialities');
            return data.data || [];
        },
        staleTime: 1000 * 60 * 60, // 1 hour - rarely changes
    });
}

// Cities (cached globally)
export function useCities() {
    return useQuery({
        queryKey: queryKeys.cities,
        queryFn: async () => {
            const { data } = await api.get('/general/cities');
            return data.data || [];
        },
        staleTime: 1000 * 60 * 60,
    });
}

// Subscription Plans
export function useSubscriptionPlans() {
    return useQuery({
        queryKey: queryKeys.subscriptionPlans,
        queryFn: async () => {
            const { data } = await api.get('/subscriptions/plans');
            return data.plans || [];
        },
        staleTime: 1000 * 60 * 30,
    });
}

// ============================================
// WORKER HOOKS
// ============================================

export function useWorkerProfile() {
    return useQuery({
        queryKey: queryKeys.workerProfile,
        queryFn: async () => {
            const { data } = await api.get('/worker/profile');
            return data.data;
        },
    });
}

export function useWorkerStats() {
    return useQuery({
        queryKey: queryKeys.workerStats,
        queryFn: async () => {
            const { data } = await api.get('/worker/stats');
            return data.data;
        },
    });
}

export function useWorkerApplications() {
    return useQuery({
        queryKey: queryKeys.workerApplications,
        queryFn: async () => {
            const { data } = await api.get('/applications/my-applications');
            return data.data || [];
        },
    });
}

// ============================================
// ESTABLISHMENT HOOKS
// ============================================

export function useEstablishmentProfile() {
    return useQuery({
        queryKey: queryKeys.establishmentProfile,
        queryFn: async () => {
            const { data } = await api.get('/establishment/profile');
            return data.data;
        },
    });
}

export function useEstablishmentStats() {
    return useQuery({
        queryKey: queryKeys.establishmentStats,
        queryFn: async () => {
            const { data } = await api.get('/establishment/stats');
            return data.data;
        },
    });
}

export function useEstablishmentMissions() {
    return useQuery({
        queryKey: queryKeys.establishmentMissions,
        queryFn: async () => {
            const { data } = await api.get('/establishment/my-missions');
            return data.data || [];
        },
    });
}

// ============================================
// MISSION HOOKS
// ============================================

export function useMissions(filters = {}) {
    return useQuery({
        queryKey: queryKeys.missions(filters),
        queryFn: async () => {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });
            const { data } = await api.get(`/missions?${params.toString()}`);
            return data;
        },
    });
}

export function useMissionDetail(missionId) {
    return useQuery({
        queryKey: queryKeys.missionDetail(missionId),
        queryFn: async () => {
            const { data } = await api.get(`/missions/${missionId}`);
            return data.data;
        },
        enabled: !!missionId,
    });
}

// ============================================
// MUTATION HOOKS
// ============================================

export function useApplyToMission() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ missionId, coverLetter }) => {
            const { data } = await api.post('/applications/apply', {
                mission_id: missionId,
                cover_letter: coverLetter
            });
            return data;
        },
        onSuccess: () => {
            // Invalidate applications cache
            queryClient.invalidateQueries({ queryKey: queryKeys.workerApplications });
        },
    });
}

export function useUpdateWorkerProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (formData) => {
            const { data } = await api.put('/worker/profile/update', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.workerProfile });
        },
    });
}

export function useUpdateEstablishmentProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (profileData) => {
            const { data } = await api.put('/establishment/profile/update', profileData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.establishmentProfile });
        },
    });
}

// ============================================
// MESSAGES HOOKS
// ============================================

export function useConversations() {
    return useQuery({
        queryKey: queryKeys.conversations,
        queryFn: async () => {
            const { data } = await api.get('/messages/conversations');
            return data.data || [];
        },
        refetchInterval: 30000, // Refetch every 30 seconds
    });
}

export function useMessages(conversationId) {
    return useQuery({
        queryKey: queryKeys.messages(conversationId),
        queryFn: async () => {
            const { data } = await api.get(`/messages/${conversationId}`);
            return data.data || [];
        },
        enabled: !!conversationId,
        refetchInterval: 10000, // Refetch every 10 seconds for active conversation
    });
}

export function useSendMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ conversationId, content }) => {
            const { data } = await api.post('/messages/send', {
                conversation_id: conversationId,
                content
            });
            return data;
        },
        onSuccess: (_, { conversationId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.messages(conversationId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
        },
    });
}
