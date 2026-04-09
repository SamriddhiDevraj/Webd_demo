import * as inviteService from '../services/invite.service.js';

export async function generateInvite(req, res, next) {
  try {
    const result = await inviteService.generateInvite(req.params.shopId);
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getPending(req, res, next) {
  try {
    const invites = await inviteService.getPendingInvites(req.params.shopId);
    res.status(200).json({ success: true, invites });
  } catch (err) {
    next(err);
  }
}

export async function revokeInvite(req, res, next) {
  try {
    await inviteService.revokeInvite(req.params.shopId, req.params.inviteId);
    res.status(200).json({ success: true, message: 'Invite revoked' });
  } catch (err) {
    next(err);
  }
}

export async function validateToken(req, res, next) {
  try {
    const result = await inviteService.validateToken(req.params.token);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function acceptInvite(req, res, next) {
  try {
    const result = await inviteService.acceptInvite(req.params.token, req.body);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}
