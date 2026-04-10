import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../middleware/authenticate.js';
import { requireMembership } from '../middleware/requireMembership.js';
import { requireOwner } from '../middleware/requireOwner.js';
import * as ai from '../controllers/ai.controller.js';

const router = Router({ mergeParams: true });

// Rate limiter — 10 requests per minute per user on AI endpoints
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many AI requests. Please wait a moment.' },
  keyGenerator: (req) => `${req.user?._id}-${req.params.shopId}`,
});

// All AI routes require auth + membership
router.use('/:shopId/ai', authenticate, requireMembership, aiLimiter);

// Forecast
router.get('/:shopId/ai/forecast/:productId',          ai.forecast);
router.post('/:shopId/ai/forecast/:productId/refresh', ai.refreshForecastHandler);

// Alerts — read available to all members
router.get('/:shopId/ai/alerts',              ai.getAlerts);
router.put('/:shopId/ai/alerts/read-all',     ai.markAllRead);
router.put('/:shopId/ai/alerts/:id/read',     ai.markAlertRead);

// Alerts — generate requires owner
router.post('/:shopId/ai/alerts/generate',    requireOwner, ai.generateAlertsHandler);

// Chat — owner only
router.post('/:shopId/ai/chat',               requireOwner, ai.chat);
router.get('/:shopId/ai/chat/history',        requireOwner, ai.chatHistory);
router.delete('/:shopId/ai/chat/history',     requireOwner, ai.clearChat);

export default router;
