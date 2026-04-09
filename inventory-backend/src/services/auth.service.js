import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Shop from '../models/Shop.js';
import Membership from '../models/Membership.js';

function generateToken(userId, email) {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

export async function registerOwner({ name, email, password, shopName, businessName }) {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error('Email already in use');
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash });
  const shop = await Shop.create({ name: shopName, businessName, ownerId: user._id });
  await Membership.create({ userId: user._id, shopId: shop._id, role: 'owner' });

  const token = generateToken(user._id, user.email);
  return {
    token,
    user: { _id: user._id, name: user.name, email: user.email },
    memberships: [{ shopId: shop._id, shopName: shop.name, role: 'owner' }],
  };
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const memberships = await Membership.find({ userId: user._id }).populate('shopId', 'name');
  const token = generateToken(user._id, user.email);

  return {
    token,
    user: { _id: user._id, name: user.name, email: user.email },
    memberships: memberships.map((m) => ({
      shopId: m.shopId._id,
      shopName: m.shopId.name,
      role: m.role,
    })),
  };
}

export async function getMe(userId) {
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const memberships = await Membership.find({ userId }).populate('shopId', 'name businessName logo');

  return {
    user: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar },
    memberships: memberships.map((m) => ({
      shopId: m.shopId._id,
      shopName: m.shopId.name,
      shopLogo: m.shopId.logo,
      role: m.role,
    })),
  };
}
