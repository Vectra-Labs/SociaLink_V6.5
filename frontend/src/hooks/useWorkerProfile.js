import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';

// Keys for cache invalidation
export const workerKeys = {
    all: ['worker'],
    profile: () => [...workerKeys.all, 'profile'],
    stats: () => [...workerKeys.all, 'stats'],
    calendar: () => [...workerKeys.all, 'calendar'],
    applications: () => [...workerKeys.all, 'applications'],
    languages: () => [...workerKeys.all, 'languages'],
};

// --- API FUNCTIONS ---

const getProfile = async () => {
    const { data } = await api.get('/worker/profile');
    return data.data;
};

const updateProfile = async (formData) => {
    const { data } = await api.put('/worker/profile/update', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data.data;
};

const getStats = async () => {
    const { data } = await api.get('/worker/stats');
    return data.data;
};

const getCalendar = async () => {
    const { data } = await api.get('/worker/calendar');
    return data.data;
};

const getApplications = async () => {
    const { data } = await api.get('/applications/my-applications');
    return data.data;
};

// --- HOOKS ---

export const useWorkerProfile = () => {
    return useQuery({
        queryKey: workerKeys.profile(),
        queryFn: getProfile,
        staleTime: 1000 * 60 * 10, // 10 mins (Profile rarely changes)
    });
};

export const useUpdateWorkerProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateProfile,
        onSuccess: (updatedProfile) => {
            // Update cache immediately without refetch
            queryClient.setQueryData(workerKeys.profile(), updatedProfile);
            // Optionally invalidate to ensure freshness
            queryClient.invalidateQueries({ queryKey: workerKeys.profile() });
        },
    });
};

export const useWorkerStats = () => {
    return useQuery({
        queryKey: workerKeys.stats(),
        queryFn: getStats,
    });
};

export const useWorkerCalendar = () => {
    return useQuery({
        queryKey: workerKeys.calendar(),
        queryFn: getCalendar,
    });
};

export const useWorkerApplications = () => {
    return useQuery({
        queryKey: workerKeys.applications(),
        queryFn: getApplications,
    });
};

// --- NEW HOOKS FOR RICH CV ---

const getExperiences = async () => {
    const { data } = await api.get('/worker/experiences');
    return data.data || [];
};

const getSpecialities = async () => {
    const { data } = await api.get('/worker/specialities');
    return data.data || [];
};

const getDocuments = async () => {
    const { data } = await api.get('/worker/documents');
    return data.data || [];
};

export const useWorkerExperiences = () => {
    return useQuery({
        queryKey: [...workerKeys.all, 'experiences'],
        queryFn: getExperiences,
    });
};

export const useWorkerSpecialities = () => {
    return useQuery({
        queryKey: [...workerKeys.all, 'specialities'],
        queryFn: getSpecialities,
    });
};

export const useWorkerDocuments = () => {
    return useQuery({
        queryKey: [...workerKeys.all, 'documents'],
        queryFn: getDocuments,
    });
};

// --- LANGUAGES HOOKS ---

const getLanguages = async () => {
    const { data } = await api.get('/worker/languages');
    return data.data || [];
};

const addLanguage = async (newLang) => {
    console.log("Adding language:", newLang); // Debug log
    const { data } = await api.post('/worker/language', newLang);
    return data.data;
};

const updateLanguage = async ({ id, ...updates }) => {
    const { data } = await api.put(`/worker/language/${id}`, updates);
    return data.data;
};

const deleteLanguage = async (id) => {
    const { data } = await api.delete(`/worker/language/${id}`);
    return data.data;
};

export const useWorkerLanguages = () => {
    return useQuery({
        queryKey: workerKeys.languages(),
        queryFn: getLanguages,
    });
};

export const useAddWorkerLanguage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addLanguage,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: workerKeys.languages() });
        },
    });
};

export const useUpdateWorkerLanguage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateLanguage,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: workerKeys.languages() });
        },
    });
};

export const useDeleteWorkerLanguage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteLanguage,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: workerKeys.languages() });
        },
    });
};

// --- AVAILABILITY HOOKS ---

const toggleAvailability = async () => {
    const { data } = await api.post('/worker/calendar/toggle-availability');
    return data;
};

export const useToggleAvailability = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: toggleAvailability,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: workerKeys.calendar() });
        },
    });
};
