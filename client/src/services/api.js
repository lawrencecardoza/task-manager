import axios from 'axios';

const rawApiUrl = process.env.REACT_APP_API_URL?.trim();
const baseUrl = rawApiUrl ? rawApiUrl.replace(/\/$/, '') : '';
const API_URL = baseUrl ? (baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`) : '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: async (username, password) => {
    const { data } = await api.post('/auth/register', { username, password });
    if (data.token) localStorage.setItem('token', data.token);
    return data;
  },
  login: async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password });
    if (data.token) localStorage.setItem('token', data.token);
    return data;
  },
  logout: () => {
    localStorage.removeItem('token');
  },
  getProfile: async () => {
    const { data } = await api.get('/auth/profile');
    return data;
  },
  updateProfile: async (profileData) => {
    const { data } = await api.put('/auth/profile', profileData);
    return data;
  },
  updatePassword: async (passwordData) => {
    const { data } = await api.put('/auth/password', passwordData);
    return data;
  },
  deleteAccount: async () => {
    const { data } = await api.delete('/auth/account');
    return data;
  },
};

export const taskService = {
  getAll: async (projectId) => {
    const url = projectId ? `/tasks?projectId=${projectId}` : '/tasks';
    const { data } = await api.get(url);
    return data;
  },
  create: async (task) => {
    const { data } = await api.post('/tasks', task);
    return data;
  },
  update: async (id, task) => {
    const { data } = await api.put(`/tasks/${id}`, task);
    return data;
  },
  delete: async (id) => {
    const { data } = await api.delete(`/tasks/${id}`);
    return data;
  },
};

export const projectService = {
  getAll: async () => {
    const { data } = await api.get('/projects');
    return data;
  },
  create: async (project) => {
    const { data } = await api.post('/projects', project);
    return data;
  },
  update: async (id, project) => {
    const { data } = await api.put(`/projects/${id}`, project);
    return data;
  },
  delete: async (id) => {
    const { data } = await api.delete(`/projects/${id}`);
    return data;
  },
};

export default api;
