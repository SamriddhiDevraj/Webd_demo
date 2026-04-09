import api from './axios.js';

export const getStaff = (shopId) => api.get(`/shop/${shopId}/staff`);
export const removeStaff = (shopId, userId) => api.delete(`/shop/${shopId}/staff/${userId}`);
export const generateInvite = (shopId) => api.post(`/shop/${shopId}/invite`);
export const getPendingInvites = (shopId) => api.get(`/shop/${shopId}/invite/pending`);
export const revokeInvite = (shopId, inviteId) => api.delete(`/shop/${shopId}/invite/${inviteId}`);
