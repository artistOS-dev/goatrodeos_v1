import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Rodeo endpoints
export const rodeoAPI = {
  create: (data: any) => api.post('/rodeos', data),
  getAll: () => api.get('/rodeos'),
  getById: (id: string) => api.get(`/rodeos/${id}`),
  getByLink: (link: string) => api.get(`/rodeos/link/${link}`),
  update: (id: string, data: any) => api.put(`/rodeos/${id}`, data),
  delete: (id: string) => api.delete(`/rodeos/${id}`),
};

// Song endpoints
export const songAPI = {
  add: (data: any) => api.post('/songs', data),
  getByRodeo: (rodeoId: string) => api.get(`/songs/rodeo/${rodeoId}`),
  update: (id: string, data: any) => api.put(`/songs/${id}`, data),
  delete: (id: string) => api.delete(`/songs/${id}`),
};

// Rating endpoints
export const ratingAPI = {
  submit: (data: any) => api.post('/ratings', data),
  getForSong: (songId: string) => api.get(`/ratings/song/${songId}`),
  getUserRatings: (rodeoId: string, sessionId: string) => 
    api.get(`/ratings/rodeo/${rodeoId}/user/${sessionId}`),
  getStats: (rodeoId: string) => api.get(`/ratings/rodeo/${rodeoId}/stats`),
};
