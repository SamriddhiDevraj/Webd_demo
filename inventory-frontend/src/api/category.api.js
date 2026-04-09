import api from './axios.js';

export const getCategories = (shopId) => api.get(`/shop/${shopId}/categories`);
export const createCategory = (shopId, data) => api.post(`/shop/${shopId}/categories`, data);
export const updateCategory = (shopId, id, data) => api.put(`/shop/${shopId}/categories/${id}`, data);
export const deleteCategory = (shopId, id) => api.delete(`/shop/${shopId}/categories/${id}`);
