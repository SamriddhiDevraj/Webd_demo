import api from './axios.js';

export const validateToken = (token) => api.get(`/invite/${token}`);
export const acceptInvite = (token, data) => api.post(`/invite/${token}/accept`, data);
