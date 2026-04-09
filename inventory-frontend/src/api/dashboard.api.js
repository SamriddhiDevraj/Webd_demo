import api from './axios.js';

export const getDashboardStats = (shopId) => api.get(`/shop/${shopId}/dashboard/stats`);
export const getDashboardCharts = (shopId) => api.get(`/shop/${shopId}/dashboard/charts`);
export const getDashboardActivity = (shopId) => api.get(`/shop/${shopId}/dashboard/activity`);
export const getLowStock = (shopId) => api.get(`/shop/${shopId}/dashboard/lowstock`);
