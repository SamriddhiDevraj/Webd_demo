import { Router } from 'express';
import { getAll, create, update, remove } from '../controllers/category.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireMembership } from '../middleware/requireMembership.js';
import { requireOwner } from '../middleware/requireOwner.js';

const router = Router({ mergeParams: true });

router.use(authenticate, requireMembership);

router.get('/:shopId/categories', getAll);
router.post('/:shopId/categories', requireOwner, create);
router.put('/:shopId/categories/:id', requireOwner, update);
router.delete('/:shopId/categories/:id', requireOwner, remove);

export default router;
