import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://feedhub-89d0.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = (data) => api.post('/api/register', data);
export const login = (data) => api.post('/api/login', data);
export const getFeedbacks = () => api.get('/api/feedback');
export const createFeedback = (data) => api.post('/api/feedback', data);
export const upvoteFeedback = (id) => api.post(`/api/feedback/${id}/upvote`);
export const getComments = (feedbackId) => api.get(`/api/comments/${feedbackId}`);
export const createComment = (feedbackId, data) => api.post(`/api/comments/${feedbackId}`, data);

export default api;
