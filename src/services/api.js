import axios from 'axios';

const getApiBase = () => {
  if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
    return '/api';
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

const API_BASE = getApiBase();

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor — attach auth token if present ────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cf_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — normalize errors ───────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.errors?.join(', ') ||
      error.message ||
      'Something went wrong';
    const err = new Error(message);
    err.status = error.response?.status;
    err.data = error.response?.data;
    return Promise.reject(err);
  }
);

// ── Task API ──────────────────────────────────────────────────────────────────
export const tasksAPI = {
  getAll: (studentId) =>
    api.get('/tasks', { params: studentId ? { studentId } : {} }).then((r) => r.data),

  getById: (id) =>
    api.get(`/tasks/${id}`).then((r) => r.data),

  create: (taskData) =>
    api.post('/tasks', taskData).then((r) => r.data),

  update: (id, updates) =>
    api.put(`/tasks/${id}`, updates).then((r) => r.data),

  delete: (id) =>
    api.delete(`/tasks/${id}`).then((r) => r.data),
};

// ── AI API ────────────────────────────────────────────────────────────────────
export const aiAPI = {
  /**
   * @param {'summary'|'flashcards'|'quiz'|'studyplan'|'notice'|'studybuddy'} type
   * @param {string} text
   */
  generate: (type, text) =>
    api.post('/ai', { type, text }).then((r) => r.data),
};

// ── Student API ───────────────────────────────────────────────────────────────
export const studentsAPI = {
  create: (studentData) =>
    api.post('/students', studentData).then((r) => r.data),

  getByEmail: (email) =>
    api.get(`/students/${encodeURIComponent(email)}`).then((r) => r.data),
};

export default api;
