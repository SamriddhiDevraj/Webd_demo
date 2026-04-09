import mongoose from 'mongoose';
import Sale from '../models/Sale.js';
import Product from '../models/Product.js';

function toOid(id) {
  return new mongoose.Types.ObjectId(id);
}

async function getRevenue(shopId, startDate, endDate) {
  const result = await Sale.aggregate([
    { $match: { shopId: toOid(shopId), soldAt: { $gte: startDate, $lte: endDate } } },
    { $group: { _id: null, total: { $sum: '$totalRevenue' }, count: { $sum: 1 } } },
  ]);
  return { revenue: result[0]?.total ?? 0, count: result[0]?.count ?? 0 };
}

function calcChange(current, previous) {
  if (previous === 0) return { text: current > 0 ? '+100%' : '0%', isPositive: current >= 0 };
  const pct = ((current - previous) / previous * 100).toFixed(1);
  return { text: pct >= 0 ? `+${pct}%` : `${pct}%`, isPositive: Number(pct) >= 0 };
}

export async function getStats(shopId) {
  const now = new Date();

  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now); todayEnd.setHours(23, 59, 59, 999);

  const yesterdayStart = new Date(todayStart); yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const yesterdayEnd = new Date(todayEnd); yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

  // Monday-based week
  const dayOfWeek = now.getDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const thisWeekStart = new Date(now);
  thisWeekStart.setDate(now.getDate() - daysFromMonday);
  thisWeekStart.setHours(0, 0, 0, 0);

  const lastWeekStart = new Date(thisWeekStart); lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(now); lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);

  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const daysElapsed = now.getDate();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth() - 1, daysElapsed, 23, 59, 59, 999);

  const [todayData, yesterdayData, thisWeekData, lastWeekData, thisMonthData, lastMonthData] =
    await Promise.all([
      getRevenue(shopId, todayStart, todayEnd),
      getRevenue(shopId, yesterdayStart, yesterdayEnd),
      getRevenue(shopId, thisWeekStart, now),
      getRevenue(shopId, lastWeekStart, lastWeekEnd),
      getRevenue(shopId, thisMonthStart, now),
      getRevenue(shopId, lastMonthStart, lastMonthEnd),
    ]);

  const todayChange = calcChange(todayData.revenue, yesterdayData.revenue);
  const weekChange = calcChange(thisWeekData.revenue, lastWeekData.revenue);
  const monthChange = calcChange(thisMonthData.revenue, lastMonthData.revenue);

  return {
    today: { revenue: todayData.revenue, count: todayData.count, change: todayChange.text, isPositive: todayChange.isPositive },
    thisWeek: { revenue: thisWeekData.revenue, count: thisWeekData.count, change: weekChange.text, isPositive: weekChange.isPositive },
    thisMonth: { revenue: thisMonthData.revenue, count: thisMonthData.count, change: monthChange.text, isPositive: monthChange.isPositive },
  };
}

export async function getCharts(shopId) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const oid = toOid(shopId);

  const [rawTrend, topSellers, categoryData] = await Promise.all([
    // Daily revenue for last 30 days
    Sale.aggregate([
      { $match: { shopId: oid, soldAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$soldAt' } },
          revenue: { $sum: '$totalRevenue' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    // Top 5 sellers this month
    Sale.aggregate([
      { $match: { shopId: oid, soldAt: { $gte: thisMonthStart } } },
      { $group: { _id: '$productId', revenue: { $sum: '$totalRevenue' }, unitsSold: { $sum: '$quantity' } } },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: { name: '$product.name', revenue: 1, unitsSold: 1 } },
    ]),

    // Category breakdown this month
    Sale.aggregate([
      { $match: { shopId: oid, soldAt: { $gte: thisMonthStart } } },
      { $lookup: { from: 'products', localField: 'productId', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $lookup: { from: 'categories', localField: 'product.category', foreignField: '_id', as: 'category' } },
      {
        $group: {
          _id: { $ifNull: [{ $arrayElemAt: ['$category._id', 0] }, 'uncategorized'] },
          name: { $first: { $ifNull: [{ $arrayElemAt: ['$category.name', 0] }, 'Uncategorized'] } },
          revenue: { $sum: '$totalRevenue' },
        },
      },
      { $sort: { revenue: -1 } },
    ]),
  ]);

  // Fill missing days in trend data
  const trendMap = {};
  for (const row of rawTrend) trendMap[row._id] = row;

  const trend = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    trend.push({ date: key, revenue: trendMap[key]?.revenue ?? 0, count: trendMap[key]?.count ?? 0 });
  }

  return { trend, topSellers, categoryBreakdown: categoryData };
}

export async function getActivity(shopId) {
  const activity = await Sale.find({ shopId })
    .sort({ soldAt: -1 })
    .limit(10)
    .populate('productId', 'name imageUrl')
    .populate('soldBy', 'name');

  return activity.map((s) => ({
    _id: s._id,
    product: { name: s.productId?.name ?? 'Unknown', imageUrl: s.productId?.imageUrl ?? null },
    quantity: s.quantity,
    revenue: s.totalRevenue,
    soldBy: s.soldBy?.name ?? 'Unknown',
    soldAt: s.soldAt,
  }));
}

export async function getLowStock(shopId) {
  const products = await Product.find({
    shopId,
    $expr: { $lte: ['$quantity', '$reorderThreshold'] },
  })
    .populate('category', 'name')
    .sort({ quantity: 1 })
    .select('name sku quantity reorderThreshold imageUrl category');

  return products.map((p) => ({
    ...p.toObject(),
    urgency:
      p.quantity === 0
        ? 'critical'
        : p.quantity <= p.reorderThreshold * 0.5
        ? 'high'
        : 'medium',
  }));
}
