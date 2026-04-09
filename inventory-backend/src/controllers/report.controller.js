import * as reportService from '../services/report.service.js';

export async function getSalesReport(req, res, next) {
  try {
    const data = await reportService.getSalesReport(req.params.shopId, req.query);
    const total = data.reduce((sum, r) => sum + r.revenue, 0);
    res.status(200).json({ success: true, data, total });
  } catch (err) {
    next(err);
  }
}

export async function getInventoryReport(req, res, next) {
  try {
    const data = await reportService.getInventorySnapshot(req.params.shopId);
    const totalValue = data.reduce((sum, r) => sum + r.stockValue, 0);
    res.status(200).json({ success: true, data, totalValue });
  } catch (err) {
    next(err);
  }
}

export async function exportCSV(req, res, next) {
  try {
    const { type = 'sales', ...filters } = req.query;
    const csvContent = await reportService.exportCSV(req.params.shopId, type, filters);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-report-${Date.now()}.csv"`);
    res.send(csvContent);
  } catch (err) {
    next(err);
  }
}
