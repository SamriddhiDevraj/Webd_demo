import mongoose from 'mongoose';
import Sale from '../../models/Sale.js';
import Product from '../../models/Product.js';
import Alert from '../../models/Alert.js';
import callClaude, { callClaudeJSON } from './claude.js';

const alertExistsToday = async (shopId, productId, type) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const existing = await Alert.findOne({
    shopId,
    productId: productId || null,
    type,
    createdAt: { $gte: todayStart },
  });
  return !!existing;
};

export const generateAlerts = async (shopId) => {
  const products = await Product.find({ shopId }).populate('category', 'name');

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const salesData = await Sale.aggregate([
    {
      $match: {
        shopId: new mongoose.Types.ObjectId(shopId),
        soldAt: { $gte: thirtyDaysAgo },
      },
    },
    {
      $group: {
        _id: '$productId',
        totalQty: { $sum: '$quantity' },
        totalRevenue: { $sum: '$totalRevenue' },
        lastSoldAt: { $max: '$soldAt' },
      },
    },
  ]);

  const salesMap = {};
  salesData.forEach((s) => { salesMap[s._id.toString()] = s; });

  const inventorySummary = products.map((p) => ({
    productId: p._id.toString(),
    name: p.name,
    category: p.category?.name || 'Uncategorized',
    currentStock: p.quantity,
    reorderThreshold: p.reorderThreshold,
    price: p.price,
    last30DaysSales: salesMap[p._id.toString()]?.totalQty || 0,
    last30DaysRevenue: salesMap[p._id.toString()]?.totalRevenue || 0,
    lastSoldAt: salesMap[p._id.toString()]?.lastSoldAt || null,
    daysWithoutSale: salesMap[p._id.toString()]?.lastSoldAt
      ? Math.floor((Date.now() - new Date(salesMap[p._id.toString()].lastSoldAt)) / 86400000)
      : 90,
  }));

  const systemPrompt = `You are an inventory management advisor for a small business.
Analyze the provided inventory and sales data and generate actionable alerts.
Return a JSON array of alert objects only — no explanation, no markdown, no code blocks.
Only generate alerts for products that genuinely need attention.
Do not generate alerts for healthy products.`;

  const userMessage = `Inventory data for the last 30 days:
${JSON.stringify(inventorySummary, null, 2)}

Return a JSON array of alerts. Each alert must have this exact shape:
[
  {
    "productId": "<product _id string>",
    "type": "restock" | "slow_mover" | "trending",
    "message": "<specific, actionable message mentioning the product name and numbers>",
    "severity": "high" | "medium" | "low"
  }
]

Alert rules:
- restock high: currentStock === 0
- restock medium: currentStock > 0 AND currentStock <= reorderThreshold
- slow_mover low: daysWithoutSale >= 30 AND currentStock > 0
- trending low: last30DaysSales is significantly above average for this product type

Return empty array [] if no alerts are needed. Return ONLY the JSON array.`;

  const alerts = await callClaudeJSON(systemPrompt, userMessage, 2048);

  if (!Array.isArray(alerts)) {
    throw new Error('Claude did not return an array of alerts');
  }

  const savedAlerts = [];
  for (const alert of alerts) {
    if (!alert.productId || !alert.type || !alert.message || !alert.severity) continue;

    const alreadyExists = await alertExistsToday(shopId, alert.productId, alert.type);
    if (alreadyExists) continue;

    const saved = await Alert.create({
      shopId,
      productId: new mongoose.Types.ObjectId(alert.productId),
      type: alert.type,
      message: alert.message,
      severity: alert.severity,
      isRead: false,
    });
    savedAlerts.push(saved);
  }

  return savedAlerts;
};

export const generateWeeklySummary = async (shopId) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const weeklySales = await Sale.aggregate([
    {
      $match: {
        shopId: new mongoose.Types.ObjectId(shopId),
        soldAt: { $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalRevenue' },
        totalUnits: { $sum: '$quantity' },
        count: { $sum: 1 },
      },
    },
  ]);

  const topProducts = await Sale.aggregate([
    {
      $match: {
        shopId: new mongoose.Types.ObjectId(shopId),
        soldAt: { $gte: sevenDaysAgo },
      },
    },
    { $group: { _id: '$productId', revenue: { $sum: '$totalRevenue' } } },
    { $sort: { revenue: -1 } },
    { $limit: 3 },
    { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
    { $unwind: '$product' },
    { $project: { name: '$product.name', revenue: 1 } },
  ]);

  const lowStockCount = await Product.countDocuments({
    shopId,
    $expr: { $lte: ['$quantity', '$reorderThreshold'] },
  });

  const systemPrompt = `You are a friendly inventory health advisor for a small business owner.
Write a concise weekly summary in 2-3 sentences.
Be specific with numbers. Be encouraging but honest about issues.
Do not use markdown formatting — plain text only.`;

  const userMessage = `Weekly inventory summary data:
- Total revenue this week: $${weeklySales[0]?.totalRevenue?.toFixed(2) || '0.00'}
- Total units sold: ${weeklySales[0]?.totalUnits || 0}
- Number of transactions: ${weeklySales[0]?.count || 0}
- Top performing products: ${topProducts.map((p) => `${p.name} ($${p.revenue.toFixed(2)})`).join(', ') || 'None'}
- Products with low/no stock: ${lowStockCount}

Write a 2-3 sentence weekly health summary for the shop owner.`;

  const summary = await callClaude(systemPrompt, userMessage, 300);

  await Alert.create({
    shopId,
    productId: null,
    type: 'weekly_summary',
    message: summary,
    severity: 'low',
    isRead: false,
  });
};
