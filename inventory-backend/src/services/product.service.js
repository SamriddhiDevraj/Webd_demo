import { Readable } from 'stream';
import csvParser from 'csv-parser';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import cloudinary from '../config/cloudinary.js';

function extractPublicId(imageUrl) {
  // e.g. https://res.cloudinary.com/demo/image/upload/v123/inventory-products/abc.jpg
  const match = imageUrl.match(/inventory-products\/([^.]+)/);
  return match ? `inventory-products/${match[1]}` : null;
}

export async function getProducts(shopId, filters = {}) {
  const { search, category, lowStock, page = 1, limit = 20 } = filters;
  const query = { shopId };

  if (search) query.name = { $regex: search, $options: 'i' };
  if (category) query.category = category;
  if (lowStock === 'true' || lowStock === true) {
    query.$expr = { $lte: ['$quantity', '$reorderThreshold'] };
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Product.countDocuments(query),
  ]);

  return {
    products,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
  };
}

export async function getProductById(shopId, productId) {
  const product = await Product.findOne({ _id: productId, shopId }).populate('category', 'name');
  if (!product) {
    const err = new Error('Product not found');
    err.status = 404;
    throw err;
  }
  return product;
}

export async function createProduct(shopId, userId, data, imageUrl = null) {
  const { name, sku, category, price, costPrice, quantity, reorderThreshold } = data;

  const existing = await Product.findOne({ shopId, sku });
  if (existing) {
    const err = new Error(`SKU "${sku}" already exists in this shop`);
    err.status = 409;
    throw err;
  }

  const product = await Product.create({
    shopId,
    name,
    sku,
    category: category || null,
    price: Number(price),
    costPrice: Number(costPrice),
    quantity: Number(quantity),
    reorderThreshold: Number(reorderThreshold),
    imageUrl,
    createdBy: userId,
  });

  return product.populate('category', 'name');
}

export async function updateProduct(shopId, productId, data, imageUrl = null) {
  const product = await Product.findOne({ _id: productId, shopId });
  if (!product) {
    const err = new Error('Product not found');
    err.status = 404;
    throw err;
  }

  if (data.sku && data.sku !== product.sku) {
    const duplicate = await Product.findOne({ shopId, sku: data.sku, _id: { $ne: productId } });
    if (duplicate) {
      const err = new Error(`SKU "${data.sku}" already exists in this shop`);
      err.status = 409;
      throw err;
    }
  }

  if (imageUrl && product.imageUrl) {
    const publicId = extractPublicId(product.imageUrl);
    if (publicId) cloudinary.uploader.destroy(publicId).catch(console.error);
  }

  const fields = ['name', 'sku', 'category', 'price', 'costPrice', 'quantity', 'reorderThreshold'];
  for (const field of fields) {
    if (data[field] !== undefined) {
      product[field] = ['price', 'costPrice', 'quantity', 'reorderThreshold'].includes(field)
        ? Number(data[field])
        : data[field] || null;
    }
  }
  if (imageUrl) product.imageUrl = imageUrl;
  product.updatedAt = new Date();

  await product.save();
  return product.populate('category', 'name');
}

export async function deleteProduct(shopId, productId) {
  const product = await Product.findOne({ _id: productId, shopId });
  if (!product) {
    const err = new Error('Product not found');
    err.status = 404;
    throw err;
  }
  if (product.imageUrl) {
    const publicId = extractPublicId(product.imageUrl);
    if (publicId) cloudinary.uploader.destroy(publicId).catch(console.error);
  }
  await product.deleteOne();
  return product;
}

export async function importProductsFromCSV(shopId, userId, fileBuffer) {
  const results = { imported: 0, skipped: [], errors: [] };
  const rows = [];

  await new Promise((resolve, reject) => {
    const stream = Readable.from(fileBuffer.toString());
    stream
      .pipe(csvParser())
      .on('data', (row) => rows.push(row))
      .on('end', resolve)
      .on('error', reject);
  });

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const lineNum = i + 2; // 1-indexed + header row

    const { name, sku, price, costPrice, quantity, reorderThreshold, category: catName } = row;

    if (!name || !sku || price === undefined || costPrice === undefined ||
        quantity === undefined || reorderThreshold === undefined) {
      results.errors.push(`Row ${lineNum}: missing required fields (name, sku, price, costPrice, quantity, reorderThreshold)`);
      continue;
    }

    const existing = await Product.findOne({ shopId, sku: sku.trim() });
    if (existing) {
      results.skipped.push(`Row ${lineNum}: SKU "${sku}" already exists`);
      continue;
    }

    let categoryId = null;
    if (catName && catName.trim()) {
      let cat = await Category.findOne({
        shopId,
        name: { $regex: `^${catName.trim()}$`, $options: 'i' },
      });
      if (!cat) cat = await Category.create({ shopId, name: catName.trim() });
      categoryId = cat._id;
    }

    try {
      await Product.create({
        shopId,
        name: name.trim(),
        sku: sku.trim(),
        category: categoryId,
        price: Number(price),
        costPrice: Number(costPrice),
        quantity: Number(quantity),
        reorderThreshold: Number(reorderThreshold),
        createdBy: userId,
      });
      results.imported++;
    } catch (err) {
      results.errors.push(`Row ${lineNum}: ${err.message}`);
    }
  }

  return results;
}
