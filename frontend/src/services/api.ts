
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api';

// Debug: Log the API base URL to console
console.log('API_BASE_URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Global response interceptor: if token is invalid/expired, force logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      try {
        localStorage.removeItem('token');
      } catch {}
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Authentication Endpoints
export const registerUser = (userData: any) => api.post('/auth/register', userData);
export const loginUser = (formData: any) => api.post('/auth/token', formData, {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

// Todo Endpoints
export const createTodo = (todoData: any) => api.post('/todos', todoData);
export const getTodos = (params?: any) => api.get('/todos', { params });
export const getTodoById = (id: number) => api.get(`/todos/${id}`);
export const updateTodo = (id: number, todoData: any) => api.patch(`/todos/${id}`, todoData);
export const deleteTodo = (id: number) => api.delete(`/todos/${id}`);

export default api;
