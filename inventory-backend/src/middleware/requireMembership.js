import Membership from '../models/Membership.js';

export async function requireMembership(req, res, next) {
  try {
    const membership = await Membership.findOne({
      userId: req.user._id,
      shopId: req.params.shopId,
    });

    if (!membership) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    req.membership = { role: membership.role, shopId: membership.shopId };
    next();
  } catch (err) {
    next(err);
  }
}
