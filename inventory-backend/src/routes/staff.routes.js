import { Router } from 'express';
import { getStaff, removeStaff } from '../controllers/staff.controller.js';
import { generateInvite, getPending, revokeInvite } from '../controllers/invite.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireMembership } from '../middleware/requireMembership.js';
import { requireOwner } from '../middleware/requireOwner.js';

const router = Router({ mergeParams: true });

router.use(authenticate, requireMembership, requireOwner);

router.get('/staff', getStaff);
router.delete('/staff/:userId', removeStaff);
router.post('/invite', generateInvite);
// pending must come before /:inviteId to avoid conflict
router.get('/invite/pending', getPending);
router.delete('/invite/:inviteId', revokeInvite);

export default router;
