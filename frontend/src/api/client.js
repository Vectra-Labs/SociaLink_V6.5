import axios from 'axios';

// Create an axios instance
const api = axios.create({
    baseURL: '/api', // Vite proxy will forward this to http://localhost:5001/api
    withCredentials: true, // Important: Send cookies with requests
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle unauthorized access (e.g., token expired)
            // We might want to redirect to login or clear state here later
            console.warn('Unauthorized access. User might need to login.');
        }
        return Promise.reject(error);
    }
);

export default api;
