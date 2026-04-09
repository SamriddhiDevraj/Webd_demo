import { createRequire } from 'module';
import mongoose from 'mongoose';
import Sale from '../models/Sale.js';
import Product from '../models/Product.js';

const require = createRequire(import.meta.url);
const { createObjectCsvStringifier } = require('csv-writer');

export async function getSalesReport(shopId, { startDate, endDate, categoryId, productId } = {}) {
  const match = { shopId: new mongoose.Types.ObjectId(shopId) };

  if (startDate || endDate) {
    match.soldAt = {};
    if (startDate) match.soldAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      match.soldAt.$lte = end;
    }
  }
  if (productId) match.productId = new mongoose.Types.ObjectId(productId);

  const sales = await Sale.find(match)
    .populate({
      path: 'productId',
      select: 'name sku category',
      populate: { path: 'category', select: 'name' },
    })
    .populate('soldBy', 'name')
    .sort({ soldAt: -1 });

  const filtered = categoryId
    ? sales.filter((s) => s.productId?.category?._id?.toString() === categoryId)
    : sales;

  return filtered.map((s) => ({
    date: s.soldAt,
    product: s.productId?.name ?? 'Deleted Product',
    sku: s.productId?.sku ?? '—',
    category: s.productId?.category?.name ?? 'Uncategorized',
    quantity: s.quantity,
    unitPrice: s.unitPrice,
    revenue: s.totalRevenue,
    soldBy: s.soldBy?.name ?? 'Unknown',
  }));
}

export async function getInventorySnapshot(shopId) {
  const products = await Product.find({ shopId })
    .populate('category', 'name')
    .sort({ name: 1 });

  return products.map((p) => ({
    name: p.name,
    sku: p.sku,
    category: p.category?.name ?? 'Uncategorized',
    quantity: p.quantity,
    reorderThreshold: p.reorderThreshold,
    costPrice: p.costPrice,
    sellingPrice: p.price,
    stockValue: p.quantity * p.costPrice,
    status:
      p.quantity === 0
        ? 'Out of Stock'
        : p.quantity <= p.reorderThreshold
        ? 'Low Stock'
        : 'In Stock',
  }));
}

export async function exportCSV(shopId, type, filters) {
  if (type === 'inventory') {
    const records = await getInventorySnapshot(shopId);
    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'name', title: 'Product' },
        { id: 'sku', title: 'SKU' },
        { id: 'category', title: 'Category' },
        { id: 'quantity', title: 'Quantity' },
        { id: 'reorderThreshold', title: 'Reorder At' },
        { id: 'costPrice', title: 'Cost Price' },
        { id: 'sellingPrice', title: 'Selling Price' },
        { id: 'stockValue', title: 'Stock Value' },
        { id: 'status', title: 'Status' },
      ],
    });
    return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);
  }

  // Default: sales
  const records = await getSalesReport(shopId, filters);
  const formatted = records.map((r) => ({
    ...r,
    date: new Date(r.date).toISOString().replace('T', ' ').slice(0, 19),
    unitPrice: r.unitPrice.toFixed(2),
    revenue: r.revenue.toFixed(2),
  }));

  const csvStringifier = createObjectCsvStringifier({
    header: [
      { id: 'date', title: 'Date' },
      { id: 'product', title: 'Product' },
      { id: 'sku', title: 'SKU' },
      { id: 'category', title: 'Category' },
      { id: 'quantity', title: 'Quantity' },
      { id: 'unitPrice', title: 'Unit Price' },
      { id: 'revenue', title: 'Revenue' },
      { id: 'soldBy', title: 'Sold By' },
    ],
  });
  return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(formatted);
}
