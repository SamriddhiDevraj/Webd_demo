export function requireOwner(req, res, next) {
  if (req.membership?.role !== 'owner') {
    return res.status(403).json({ success: false, message: 'Owner access required' });
  }
  next();
}
