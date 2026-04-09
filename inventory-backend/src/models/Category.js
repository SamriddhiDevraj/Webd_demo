import mongoose from 'mongoose';

const { ObjectId } = mongoose.Schema.Types;

const categorySchema = new mongoose.Schema({
  shopId: { type: ObjectId, ref: 'Shop', required: true },
  name: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

categorySchema.index({ shopId: 1 });

export default mongoose.model('Category', categorySchema);
