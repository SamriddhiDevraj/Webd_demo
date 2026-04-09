import * as authService from '../services/auth.service.js';

export async function register(req, res, next) {
  try {
    const result = await authService.registerOwner(req.body);
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const result = await authService.loginUser(req.body);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export function logout(req, res) {
  res.status(200).json({ success: true, message: 'Logged out' });
}

export async function me(req, res, next) {
  try {
    const result = await authService.getMe(req.user._id);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}
