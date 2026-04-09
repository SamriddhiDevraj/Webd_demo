import { Router } from 'express';
import { getSalesReport, getInventoryReport, exportCSV } from '../controllers/report.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireMembership } from '../middleware/requireMembership.js';
import { requireOwner } from '../middleware/requireOwner.js';

const router = Router({ mergeParams: true });

router.use(authenticate, requireMembership);

router.get('/reports/sales', getSalesReport);
router.get('/reports/inventory', getInventoryReport);
router.get('/reports/export', requireOwner, exportCSV);

export default router;
