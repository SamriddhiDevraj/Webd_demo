import { Router } from 'express';
import { recordSale, getSales, getSummary } from '../controllers/sale.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireMembership } from '../middleware/requireMembership.js';

const router = Router({ mergeParams: true });

router.use(authenticate, requireMembership);

// summary must come before any potential :id route
router.get('/:shopId/sales/summary', getSummary);
router.get('/:shopId/sales', getSales);
router.post('/:shopId/sales', recordSale);

export default router;
