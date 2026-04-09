import * as categoryService from '../services/category.service.js';

export async function getAll(req, res, next) {
  try {
    const categories = await categoryService.getCategories(req.params.shopId);
    res.status(200).json({ success: true, categories });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const category = await categoryService.createCategory(req.params.shopId, req.body);
    res.status(201).json({ success: true, category });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const category = await categoryService.updateCategory(req.params.shopId, req.params.id, req.body);
    res.status(200).json({ success: true, category });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    await categoryService.deleteCategory(req.params.shopId, req.params.id);
    res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
}
