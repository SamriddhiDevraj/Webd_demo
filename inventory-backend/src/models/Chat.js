import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  role:      { type: String, enum: ['user', 'assistant'], required: true },
  content:   { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const ChatSchema = new mongoose.Schema({
  shopId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messages:  [MessageSchema],
  updatedAt: { type: Date, default: Date.now },
});

ChatSchema.index({ shopId: 1, userId: 1 }, { unique: true });

export default mongoose.model('Chat', ChatSchema);
