import * as dashboardService from '../services/dashboard.service.js';

export async function getStats(req, res, next) {
  try {
    const stats = await dashboardService.getStats(req.params.shopId);
    res.status(200).json({ success: true, stats });
  } catch (err) {
    next(err);
  }
}

export async function getCharts(req, res, next) {
  try {
    const charts = await dashboardService.getCharts(req.params.shopId);
    res.status(200).json({ success: true, charts });
  } catch (err) {
    next(err);
  }
}

export async function getActivity(req, res, next) {
  try {
    const activity = await dashboardService.getActivity(req.params.shopId);
    res.status(200).json({ success: true, activity });
  } catch (err) {
    next(err);
  }
}

export async function getLowStock(req, res, next) {
  try {
    const lowStock = await dashboardService.getLowStock(req.params.shopId);
    res.status(200).json({ success: true, lowStock });
  } catch (err) {
    next(err);
  }
}
