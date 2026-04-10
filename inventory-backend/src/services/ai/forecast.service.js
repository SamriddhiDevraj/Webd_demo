import mongoose from 'mongoose';
import Sale from '../../models/Sale.js';
import Product from '../../models/Product.js';
import ForecastCache from '../../models/ForecastCache.js';
import { callClaudeJSON } from './claude.js';

export const getForecast = async (shopId, productId) => {
  // Step 1: Check cache first
  const cached = await ForecastCache.findOne({
    shopId,
    productId,
    expiresAt: { $gt: new Date() },
  });

  if (cached) {
    return { ...cached.forecast, fromCache: true, cachedAt: cached.forecast.generatedAt };
  }

  // Step 2: Fetch product details
  const product = await Product.findOne({ _id: productId, shopId })
    .populate('category', 'name');

  if (!product) throw new Error('Product not found');

  // Step 3: Fetch last 90 days of sales for this product
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  const salesHistory = await Sale.aggregate([
    {
      $match: {
        shopId: new mongoose.Types.ObjectId(shopId),
        productId: new mongoose.Types.ObjectId(productId),
        soldAt: { $gte: ninetyDaysAgo },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$soldAt' } },
        quantity: { $sum: '$quantity' },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: '$_id', quantity: 1 } },
  ]);

  // Step 4: Call Claude
  const systemPrompt = `You are an inventory demand forecasting assistant for a small business.
Analyze the provided sales history and return a JSON forecast.
Always respond with valid JSON only — no explanation, no markdown, no code blocks.`;

  const userMessage = `Product: ${product.name}
Category: ${product.category?.name || 'Uncategorized'}
Current stock: ${product.quantity}
Reorder threshold: ${product.reorderThreshold}

Sales history (last 90 days):
${JSON.stringify(salesHistory)}

Return this exact JSON structure with no extra text:
{
  "next7Days": <number — predicted units to sell in next 7 days>,
  "next30Days": <number — predicted units to sell in next 30 days>,
  "confidence": <"high" | "medium" | "low">,
  "seasonalPattern": <string describing any pattern, or null>,
  "trend": <"increasing" | "decreasing" | "stable">,
  "reasoning": <1-2 sentence explanation>
}

Confidence rules:
- high: 60+ days of data with consistent patterns
- medium: 30-59 days or irregular patterns
- low: less than 30 days of data`;

  const forecast = await callClaudeJSON(systemPrompt, userMessage);

  // Step 5: Validate response shape
  if (
    forecast.next7Days === undefined ||
    forecast.next30Days === undefined ||
    !forecast.confidence ||
    !forecast.trend
  ) {
    throw new Error('Claude returned incomplete forecast data');
  }

  // Step 6: Save to cache with 24hr TTL
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await ForecastCache.findOneAndUpdate(
    { shopId, productId },
    {
      shopId,
      productId,
      forecast: { ...forecast, generatedAt: new Date() },
      expiresAt,
    },
    { upsert: true, new: true }
  );

  return { ...forecast, fromCache: false, generatedAt: new Date() };
};

export const refreshForecast = async (shopId, productId) => {
  await ForecastCache.deleteOne({ shopId, productId });
  return getForecast(shopId, productId);
};
