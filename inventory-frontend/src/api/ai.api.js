import api from './axios.js';

// Forecast
export const getForecast = (shopId, productId) =>
  api.get(`/shop/${shopId}/ai/forecast/${productId}`);

export const refreshForecast = (shopId, productId) =>
  api.post(`/shop/${shopId}/ai/forecast/${productId}/refresh`);

// Alerts
export const getAlerts = (shopId, params) =>
  api.get(`/shop/${shopId}/ai/alerts`, { params });

export const markAlertRead = (shopId, alertId) =>
  api.put(`/shop/${shopId}/ai/alerts/${alertId}/read`);

export const markAllAlertsRead = (shopId) =>
  api.put(`/shop/${shopId}/ai/alerts/read-all`);

export const generateAlerts = (shopId) =>
  api.post(`/shop/${shopId}/ai/alerts/generate`);

// Chat
export const sendMessage = (shopId, message) =>
  api.post(`/shop/${shopId}/ai/chat`, { message });

export const getChatHistory = (shopId) =>
  api.get(`/shop/${shopId}/ai/chat/history`);

export const clearChatHistory = (shopId) =>
  api.delete(`/shop/${shopId}/ai/chat/history`);
