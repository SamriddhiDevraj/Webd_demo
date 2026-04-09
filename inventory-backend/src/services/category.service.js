import Category from '../models/Category.js';
import Product from '../models/Product.js';

export async function getCategories(shopId) {
  return Category.find({ shopId }).sort({ name: 1 });
}

export async function createCategory(shopId, { name }) {
  const duplicate = await Category.findOne({
    shopId,
    name: { $regex: `^${name.trim()}$`, $options: 'i' },
  });
  if (duplicate) {
    const err = new Error('Category with this name already exists');
    err.status = 409;
    throw err;
  }
  return Category.create({ shopId, name });
}

export async function updateCategory(shopId, categoryId, { name }) {
  const category = await Category.findOne({ _id: categoryId, shopId });
  if (!category) {
    const err = new Error('Category not found');
    err.status = 404;
    throw err;
  }
  const duplicate = await Category.findOne({
    shopId,
    name: { $regex: `^${name.trim()}$`, $options: 'i' },
    _id: { $ne: categoryId },
  });
  if (duplicate) {
    const err = new Error('Category with this name already exists');
    err.status = 409;
    throw err;
  }
  category.name = name;
  return category.save();
}

export async function deleteCategory(shopId, categoryId) {
  const category = await Category.findOne({ _id: categoryId, shopId });
  if (!category) {
    const err = new Error('Category not found');
    err.status = 404;
    throw err;
  }
  const productCount = await Product.countDocuments({ shopId, category: categoryId });
  if (productCount > 0) {
    const err = new Error('Cannot delete category with existing products');
    err.status = 409;
    throw err;
  }
  await category.deleteOne();
  return category;
}
