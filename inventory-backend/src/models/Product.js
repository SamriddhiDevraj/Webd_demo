import mongoose from 'mongoose';

const { ObjectId } = mongoose.Schema.Types;

const productSchema = new mongoose.Schema({
  shopId: { type: ObjectId, ref: 'Shop', required: true },
  name: { type: String, required: true, trim: true },
  sku: { type: String, required: true, trim: true },
  category: { type: ObjectId, ref: 'Category', default: null },
  price: { type: Number, required: true, min: 0 },
  costPrice: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 0, default: 0 },
  reorderThreshold: { type: Number, required: true, min: 0, default: 0 },
  imageUrl: { type: String, default: null },
  createdBy: { type: ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

productSchema.index({ shopId: 1, sku: 1 }, { unique: true });
productSchema.index({ shopId: 1 });

export default mongoose.model('Product', productSchema);
