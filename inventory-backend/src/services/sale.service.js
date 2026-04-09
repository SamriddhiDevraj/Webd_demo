import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Sale from '../models/Sale.js';
import Alert from '../models/Alert.js';

async function checkAndCreateAlerts(shopId, product) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  async function alertExistsToday(type, productId) {
    return Alert.exists({ shopId, productId, type, createdAt: { $gte: today, $lt: tomorrow } });
  }

  // Check 1: Restock alert
  if (product.quantity <= product.reorderThreshold) {
    if (!(await alertExistsToday('restock', product._id))) {
      const severity = product.quantity === 0 ? 'high' : 'medium';
      const message =
        product.quantity === 0
          ? `${product.name} is OUT OF STOCK. Restock immediately.`
          : `${product.name} is running low (${product.quantity} units left, threshold: ${product.reorderThreshold}).`;
      await Alert.create({ shopId, productId: product._id, type: 'restock', message, severity });
    }
  }

  // Check 2: Trending alert
  const now = new Date();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);

  const [thisWeekResult, lastWeekResult] = await Promise.all([
    Sale.aggregate([
      { $match: { productId: product._id, soldAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: null, total: { $sum: '$quantity' } } },
    ]),
    Sale.aggregate([
      { $match: { productId: product._id, soldAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo } } },
      { $group: { _id: null, total: { $sum: '$quantity' } } },
    ]),
  ]);

  const thisWeekSales = thisWeekResult[0]?.total ?? 0;
  const lastWeekSales = lastWeekResult[0]?.total ?? 0;

  if (lastWeekSales > 0 && thisWeekSales >= lastWeekSales * 1.3) {
    if (!(await alertExistsToday('trending', product._id))) {
      const pct = Math.round((thisWeekSales / lastWeekSales - 1) * 100);
      await Alert.create({
        shopId,
        productId: product._id,
        type: 'trending',
        severity: 'low',
        message: `${product.name} sales are up ${pct}% this week vs last week.`,
      });
    }
  }

  // Check 3: Slow mover alert
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
  const recentSales = await Sale.countDocuments({
    productId: product._id,
    soldAt: { $gte: thirtyDaysAgo },
  });

  if (recentSales === 0) {
    if (!(await alertExistsToday('slow_mover', product._id))) {
      await Alert.create({
        shopId,
        productId: product._id,
        type: 'slow_mover',
        severity: 'low',
        message: `${product.name} hasn't sold in 30+ days. Consider a discount or clearance.`,
      });
    }
  }
}

export async function recordSale(shopId, userId, { productId, quantity }) {
  const product = await Product.findOne({ _id: productId, shopId });
  if (!product) {
    const err = new Error('Product not found');
    err.status = 404;
    throw err;
  }
  if (product.quantity < quantity) {
    const err = new Error(`Insufficient stock. Only ${product.quantity} units available.`);
    err.status = 400;
    throw err;
  }

  const unitPrice = product.price;
  const totalRevenue = quantity * unitPrice;

  const sale = await Sale.create({ shopId, productId, quantity, unitPrice, totalRevenue, soldBy: userId });

  product.quantity -= quantity;
  product.updatedAt = new Date();
  await product.save();

  // Background threshold checks — do not await
  checkAndCreateAlerts(shopId, product).catch(console.error);

  return Sale.findById(sale._id)
    .populate('productId', 'name sku')
    .populate('soldBy', 'name');
}

export async function getSales(shopId, filters = {}) {
  const { startDate, endDate, productId, soldBy, page = 1, limit = 20 } = filters;
  const query = { shopId };

  if (startDate || endDate) {
    query.soldAt = {};
    if (startDate) query.soldAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.soldAt.$lte = end;
    }
  }
  if (productId) query.productId = productId;
  if (soldBy) query.soldBy = soldBy;

  const skip = (Number(page) - 1) * Number(limit);
  const [sales, total] = await Promise.all([
    Sale.find(query)
      .populate('productId', 'name sku')
      .populate('soldBy', 'name')
      .sort({ soldAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Sale.countDocuments(query),
  ]);

  return { sales, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) };
}

export async function getSalesSummary(shopId) {
  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  const shopObjectId = new mongoose.Types.ObjectId(shopId);
  async function sumRevenue(gte, lte) {
    const result = await Sale.aggregate([
      { $match: { shopId: shopObjectId, soldAt: { $gte: gte, ...(lte ? { $lte: lte } : {}) } } },
      { $group: { _id: null, total: { $sum: '$totalRevenue' } } },
    ]);
    return result[0]?.total ?? 0;
  }

  const [todayRev, yesterdayRev, weekRev, lastWeekRev, monthRev, lastMonthRev, totalSalesCount] =
    await Promise.all([
      sumRevenue(startOfToday, now),
      sumRevenue(startOfYesterday, new Date(startOfToday - 1)),
      sumRevenue(startOfWeek, now),
      sumRevenue(startOfLastWeek, new Date(startOfWeek - 1)),
      sumRevenue(startOfMonth, now),
      sumRevenue(startOfLastMonth, endOfLastMonth),
      Sale.countDocuments({ shopId }),
    ]);

  function pctChange(current, previous) {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const diff = ((current - previous) / previous) * 100;
    return `${diff >= 0 ? '+' : ''}${Math.round(diff)}%`;
  }

  return {
    today: { revenue: todayRev, change: pctChange(todayRev, yesterdayRev) },
    thisWeek: { revenue: weekRev, change: pctChange(weekRev, lastWeekRev) },
    thisMonth: { revenue: monthRev, change: pctChange(monthRev, lastMonthRev) },
    totalSalesCount,
  };
}
