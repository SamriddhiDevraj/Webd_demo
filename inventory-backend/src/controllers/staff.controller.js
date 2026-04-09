import * as staffService from '../services/staff.service.js';

export async function getStaff(req, res, next) {
  try {
    const staff = await staffService.getStaff(req.params.shopId);
    res.status(200).json({ success: true, staff });
  } catch (err) {
    next(err);
  }
}

export async function removeStaff(req, res, next) {
  try {
    await staffService.removeStaff(req.params.shopId, req.params.userId);
    res.status(200).json({ success: true, message: 'Staff member removed' });
  } catch (err) {
    next(err);
  }
}
