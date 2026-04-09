import { Router } from 'express';
import { validateToken, acceptInvite } from '../controllers/invite.controller.js';

const router = Router();

// Fully public — no auth middleware
router.get('/:token', validateToken);
router.post('/:token/accept', acceptInvite);

export default router;
