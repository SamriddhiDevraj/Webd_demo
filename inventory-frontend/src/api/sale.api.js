import api from './axios.js';

export const getSales = (shopId, params) => api.get(`/shop/${shopId}/sales`, { params });
export const recordSale = (shopId, data) => api.post(`/shop/${shopId}/sales`, data);
export const getSalesSummary = (shopId) => api.get(`/shop/${shopId}/sales/summary`);
