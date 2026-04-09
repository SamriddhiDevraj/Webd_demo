import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Invite from '../models/Invite.js';
import User from '../models/User.js';
import Membership from '../models/Membership.js';

export async function generateInvite(shopId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await Invite.create({ shopId, token, expiresAt, used: false });
  const inviteUrl = `${process.env.CLIENT_URL}/invite/${token}`;
  return { inviteUrl, token, expiresAt };
}

export async function getPendingInvites(shopId) {
  const invites = await Invite.find({
    shopId,
    used: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  return invites.map((inv) => ({
    _id: inv._id,
    token: inv.token,
    inviteUrl: `${process.env.CLIENT_URL}/invite/${inv.token}`,
    expiresAt: inv.expiresAt,
    hoursRemaining: Math.max(0, Math.floor((inv.expiresAt - Date.now()) / 3600000)),
    createdAt: inv.createdAt,
  }));
}

export async function revokeInvite(shopId, inviteId) {
  const invite = await Invite.findOne({ _id: inviteId, shopId });
  if (!invite) {
    const err = new Error('Invite not found');
    err.status = 404;
    throw err;
  }
  await invite.deleteOne();
  return { success: true };
}

export async function validateToken(token) {
  const invite = await Invite.findOne({ token }).populate('shopId', 'name businessName');
  if (!invite) return { valid: false, reason: 'not_found' };
  if (invite.used) return { valid: false, reason: 'used' };
  if (invite.expiresAt < new Date()) return { valid: false, reason: 'expired' };

  const hoursRemaining = Math.max(0, Math.floor((invite.expiresAt - Date.now()) / 3600000));
  return {
    valid: true,
    shopName: invite.shopId.name,
    shopId: invite.shopId._id,
    expiresAt: invite.expiresAt,
    hoursRemaining,
  };
}

export async function acceptInvite(token, body) {
  const { mode, name, email, password, userId } = body;

  const invite = await Invite.findOne({ token }).populate('shopId', 'name businessName logo');
  if (!invite) {
    const err = new Error('Invalid invite link'); err.status = 400; throw err;
  }
  if (invite.used) {
    const err = new Error('This invite link has already been used'); err.status = 400; throw err;
  }
  if (invite.expiresAt < new Date()) {
    const err = new Error('This invite link has expired'); err.status = 400; throw err;
  }

  const shopId = invite.shopId._id;
  let user;

  if (mode === 'register') {
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      const err = new Error('An account with this email already exists. Please use the login tab instead.');
      err.status = 409; throw err;
    }
    const passwordHash = await bcrypt.hash(password, 12);
    user = await User.create({ name, email: email.toLowerCase(), passwordHash });

  } else if (mode === 'login') {
    user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      const err = new Error('No account found with this email address'); err.status = 401; throw err;
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      const err = new Error('Incorrect password'); err.status = 401; throw err;
    }

  } else if (mode === 'existing') {
    user = await User.findById(userId);
    if (!user) {
      const err = new Error('User not found'); err.status = 404; throw err;
    }

  } else {
    const err = new Error('Invalid mode'); err.status = 400; throw err;
  }

  const existingMembership = await Membership.findOne({ userId: user._id, shopId });
  if (existingMembership) {
    const err = new Error('You are already a member of this shop'); err.status = 409; throw err;
  }

  await Membership.create({ userId: user._id, shopId, role: 'staff' });
  await Invite.findByIdAndUpdate(invite._id, { used: true });

  const allMemberships = await Membership.find({ userId: user._id })
    .populate('shopId', 'name businessName logo');

  const memberships = allMemberships.map((m) => ({
    shopId: m.shopId._id,
    shopName: m.shopId.name,
    shopLogo: m.shopId.logo ?? null,
    role: m.role,
  }));

  const jwtToken = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  return {
    token: jwtToken,
    user: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar ?? null },
    memberships,
  };
}
