import mongoose from 'mongoose';

const { ObjectId } = mongoose.Schema.Types;

const membershipSchema = new mongoose.Schema({
  userId: { type: ObjectId, ref: 'User', required: true },
  shopId: { type: ObjectId, ref: 'Shop', required: true },
  role: { type: String, enum: ['owner', 'staff'], required: true },
  joinedAt: { type: Date, default: Date.now },
});

membershipSchema.index({ userId: 1, shopId: 1 }, { unique: true });

export default mongoose.model('Membership', membershipSchema);
