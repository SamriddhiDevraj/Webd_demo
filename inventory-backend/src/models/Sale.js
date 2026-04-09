import mongoose from 'mongoose';

const { ObjectId } = mongoose.Schema.Types;

const saleSchema = new mongoose.Schema({
  shopId: { type: ObjectId, ref: 'Shop', required: true },
  productId: { type: ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  totalRevenue: { type: Number, required: true },
  soldBy: { type: ObjectId, ref: 'User', required: true },
  soldAt: { type: Date, default: Date.now },
});

saleSchema.index({ shopId: 1, soldAt: -1 });
saleSchema.index({ productId: 1, soldAt: -1 });

export default mongoose.model('Sale', saleSchema);
