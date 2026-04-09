import { Router } from 'express';
import { getStats, getCharts, getActivity, getLowStock } from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireMembership } from '../middleware/requireMembership.js';

const router = Router({ mergeParams: true });

router.use(authenticate, requireMembership);

router.get('/dashboard/stats', getStats);
router.get('/dashboard/charts', getCharts);
router.get('/dashboard/activity', getActivity);
router.get('/dashboard/lowstock', getLowStock);

export default router;
