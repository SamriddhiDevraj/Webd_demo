import mongoose from 'mongoose';

const { ObjectId } = mongoose.Schema.Types;

const shopSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  businessName: { type: String, required: true, trim: true },
  ownerId: { type: ObjectId, ref: 'User', required: true },
  logo: { type: String, default: null },
  address: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Shop', shopSchema);
