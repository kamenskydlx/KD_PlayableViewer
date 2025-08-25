import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  
  checkAuth: async () => {
    const response = await api.get('/auth/check');
    return response.data;
  },
};

// Playables API
export const playablesAPI = {
  getAll: async () => {
    const response = await api.get('/playables');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/playables/${id}`);
    return response.data;
  },
  
  upload: async (formData) => {
    const response = await api.post('/playables/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds for uploads
    });
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/playables/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/playables/${id}`);
    return response.data;
  },
  
  getFolders: async () => {
    const response = await api.get('/playables/folders/list');
    return response.data;
  },
};

// Public API (no auth required)
export const publicAPI = {
  getPlayable: async (id) => {
    const response = await axios.get(
      process.env.NODE_ENV === 'production' 
        ? `/api/public/playable/${id}` 
        : `http://localhost:3001/api/public/playable/${id}`
    );
    return response.data;
  },
  
  getPlayableContent: async (id) => {
    const response = await axios.get(
      process.env.NODE_ENV === 'production' 
        ? `/api/public/playable/${id}/content` 
        : `http://localhost:3001/api/public/playable/${id}/content`
    );
    return response.data;
  },
};

export default api;