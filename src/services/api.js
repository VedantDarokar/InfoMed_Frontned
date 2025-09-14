import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    
    // If token is invalid, remove it and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      window.location.href = '/login';
    }
    
    return Promise.reject({
      message,
      status: error.response?.status,
      errors: error.response?.data?.errors,
    });
  }
);

// Auth API
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Info Records API
export const infoAPI = {
  create: (data) => api.post('/info', data),
  getAll: (params) => api.get('/info', { params }),
  getByUniqueId: (uniqueId) => api.get(`/info/view/${uniqueId}`),
  update: (id, data) => api.put(`/info/${id}`, data),
  delete: (id) => api.delete(`/info/${id}`),
  toggle: (id) => api.patch(`/info/${id}/toggle`),
};

// Translation API
export const translationAPI = {
  translate: (data) => api.post('/translate', data),
  translateBatch: (data) => api.post('/translate/batch', data),
  getLanguages: () => api.get('/translate/languages'),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;
