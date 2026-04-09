import api from './axios.js';

export const getSalesReport = (shopId, params) => api.get(`/shop/${shopId}/reports/sales`, { params });
export const getInventoryReport = (shopId) => api.get(`/shop/${shopId}/reports/inventory`);
export const exportCSV = (shopId, params) =>
  api.get(`/shop/${shopId}/reports/export`, { params, responseType: 'blob' });
