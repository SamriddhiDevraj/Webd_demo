import { getForecast, refreshForecast } from '../services/ai/forecast.service.js';
import { generateAlerts } from '../services/ai/alert.ai.service.js';
import { sendChatMessage, getChatHistory, clearChatHistory } from '../services/ai/chat.service.js';
import Alert from '../models/Alert.js';

// ---- Forecast ----
export const forecast = async (req, res, next) => {
  try {
    const { shopId, productId } = req.params;
    const data = await getForecast(shopId, productId);
    res.json({ success: true, forecast: data });
  } catch (err) { next(err); }
};

export const refreshForecastHandler = async (req, res, next) => {
  try {
    const { shopId, productId } = req.params;
    const data = await refreshForecast(shopId, productId);
    res.json({ success: true, forecast: data });
  } catch (err) { next(err); }
};

// ---- Alerts ----
export const getAlerts = async (req, res, next) => {
  try {
    const { shopId } = req.params;
    const { type, unreadOnly } = req.query;

    const query = { shopId };
    if (type) query.type = type;
    if (unreadOnly === 'true') query.isRead = false;

    const alerts = await Alert.find(query)
      .populate('productId', 'name sku imageUrl')
      .sort({ isRead: 1, createdAt: -1 });

    const unreadCount = await Alert.countDocuments({ shopId, isRead: false });

    res.json({ success: true, alerts, unreadCount });
  } catch (err) { next(err); }
};

export const generateAlertsHandler = async (req, res, next) => {
  try {
    const { shopId } = req.params;
    const newAlerts = await generateAlerts(shopId);
    const unreadCount = await Alert.countDocuments({ shopId, isRead: false });
    res.json({ success: true, generated: newAlerts.length, alerts: newAlerts, unreadCount });
  } catch (err) { next(err); }
};

export const markAlertRead = async (req, res, next) => {
  try {
    const { shopId, id } = req.params;
    await Alert.findOneAndUpdate({ _id: id, shopId }, { isRead: true });
    const unreadCount = await Alert.countDocuments({ shopId, isRead: false });
    res.json({ success: true, unreadCount });
  } catch (err) { next(err); }
};

export const markAllRead = async (req, res, next) => {
  try {
    const { shopId } = req.params;
    await Alert.updateMany({ shopId, isRead: false }, { isRead: true });
    res.json({ success: true, unreadCount: 0 });
  } catch (err) { next(err); }
};

// ---- Chat ----
export const chat = async (req, res, next) => {
  try {
    const { shopId } = req.params;
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ success: false, message: 'Message is required' });

    const result = await sendChatMessage(shopId, req.user._id, message);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

export const chatHistory = async (req, res, next) => {
  try {
    const { shopId } = req.params;
    const messages = await getChatHistory(shopId, req.user._id);
    res.json({ success: true, messages });
  } catch (err) { next(err); }
};

export const clearChat = async (req, res, next) => {
  try {
    const { shopId } = req.params;
    await clearChatHistory(shopId, req.user._id);
    res.json({ success: true, message: 'Chat history cleared' });
  } catch (err) { next(err); }
};
