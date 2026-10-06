import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

// Attach Sanctum Bearer token if present
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('palayoffs_auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Global response handler
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('palayoffs_auth_token');
            localStorage.removeItem('palayoffs_user');
        }
        return Promise.reject(error);
    }
);

export default api;
