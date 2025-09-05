import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Children API
export const childrenAPI = {
  getAll: () => api.get('/children'),
  getById: (id) => api.get(`/children/${id}`),
  create: (data) => api.post('/children', data),
  update: (id, data) => api.put(`/children/${id}`, data),
  delete: (id) => api.delete(`/children/${id}`),
};

// Behaviors API
export const behaviorsAPI = {
  getAll: () => api.get('/behaviors'),
  getById: (id) => api.get(`/behaviors/${id}`),
  create: (data) => api.post('/behaviors', data),
  update: (id, data) => api.put(`/behaviors/${id}`, data),
  delete: (id) => api.delete(`/behaviors/${id}`),
};

// Rewards API
export const rewardsAPI = {
  getAll: () => api.get('/rewards'),
  getById: (id) => api.get(`/rewards/${id}`),
  create: (data) => api.post('/rewards', data),
  update: (id, data) => api.put(`/rewards/${id}`, data),
  delete: (id) => api.delete(`/rewards/${id}`),
};

// Daily Activity API
export const dailyActivityAPI = {
  getAll: () => api.get('/daily-activity'),
  getByDate: (date) => api.get(`/daily-activity/date/${date}`),
  getByChild: (childId) => api.get(`/daily-activity/child/${childId}`),
  create: (data) => api.post('/daily-activity', data),
  update: (id, data) => api.put(`/daily-activity/${id}`, data),
  delete: (id) => api.delete(`/daily-activity/${id}`),
  getDailySummary: (childId, date) => api.get(`/daily-activity/summary/${childId}/${date}`),
};

export default api;
