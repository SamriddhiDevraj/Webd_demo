import * as saleService from '../services/sale.service.js';

export async function recordSale(req, res, next) {
  try {
    const sale = await saleService.recordSale(req.params.shopId, req.user._id, req.body);
    res.status(201).json({ success: true, sale });
  } catch (err) {
    next(err);
  }
}

export async function getSales(req, res, next) {
  try {
    const result = await saleService.getSales(req.params.shopId, req.query);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getSummary(req, res, next) {
  try {
    const summary = await saleService.getSalesSummary(req.params.shopId);
    res.status(200).json({ success: true, summary });
  } catch (err) {
    next(err);
  }
}
