import mongoose from 'mongoose';

const { ObjectId } = mongoose.Schema.Types;

const inviteSchema = new mongoose.Schema({
  shopId: { type: ObjectId, ref: 'Shop', required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Invite', inviteSchema);
