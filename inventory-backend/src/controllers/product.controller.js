import * as productService from '../services/product.service.js';

export async function getAll(req, res, next) {
  try {
    const result = await productService.getProducts(req.params.shopId, req.query);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const product = await productService.getProductById(req.params.shopId, req.params.id);
    res.status(200).json({ success: true, product });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const imageUrl = req.file?.path ?? null;
    const product = await productService.createProduct(
      req.params.shopId,
      req.user._id,
      req.body,
      imageUrl
    );
    res.status(201).json({ success: true, product });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const imageUrl = req.file?.path ?? null;
    const product = await productService.updateProduct(
      req.params.shopId,
      req.params.id,
      req.body,
      imageUrl
    );
    res.status(200).json({ success: true, product });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    await productService.deleteProduct(req.params.shopId, req.params.id);
    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
}

export async function importCSV(req, res, next) {
  try {
    if (!req.file) {
      const err = new Error('No CSV file uploaded');
      err.status = 400;
      throw err;
    }
    const result = await productService.importProductsFromCSV(
      req.params.shopId,
      req.user._id,
      req.file.buffer
    );
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}
