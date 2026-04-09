import mongoose from 'mongoose';

const { ObjectId } = mongoose.Schema.Types;

const alertSchema = new mongoose.Schema({
  shopId: { type: ObjectId, ref: 'Shop', required: true },
  productId: { type: ObjectId, ref: 'Product', default: null },
  type: {
    type: String,
    enum: ['restock', 'slow_mover', 'trending', 'weekly_summary'],
    required: true,
  },
  message: { type: String, required: true },
  severity: { type: String, enum: ['high', 'medium', 'low'], required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

alertSchema.index({ shopId: 1, isRead: 1 });
alertSchema.index({ shopId: 1, createdAt: -1 });

export default mongoose.model('Alert', alertSchema);
