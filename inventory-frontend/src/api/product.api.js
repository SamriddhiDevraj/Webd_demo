import api from './axios.js';

export const getProducts = (shopId, params) => api.get(`/shop/${shopId}/products`, { params });
export const getProductById = (shopId, id) => api.get(`/shop/${shopId}/products/${id}`);
export const createProduct = (shopId, formData) =>
  api.post(`/shop/${shopId}/products`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateProduct = (shopId, id, formData) =>
  api.put(`/shop/${shopId}/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteProduct = (shopId, id) => api.delete(`/shop/${shopId}/products/${id}`);
export const importProducts = (shopId, formData) =>
  api.post(`/shop/${shopId}/products/import`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
