import Membership from '../models/Membership.js';

export async function getStaff(shopId) {
  const memberships = await Membership.find({ shopId, role: 'staff' })
    .populate('userId', 'name email avatar createdAt')
    .sort({ joinedAt: 1 });

  return memberships.map((m) => ({
    membershipId: m._id,
    userId: m.userId._id,
    name: m.userId.name,
    email: m.userId.email,
    avatar: m.userId.avatar,
    joinedAt: m.joinedAt,
  }));
}

export async function removeStaff(shopId, userId) {
  const membership = await Membership.findOne({ shopId, userId, role: 'staff' });
  if (!membership) {
    const err = new Error('Staff member not found');
    err.status = 404;
    throw err;
  }
  await membership.deleteOne();
  return { success: true };
}
