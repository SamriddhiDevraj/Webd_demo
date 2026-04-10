import mongoose from 'mongoose';

const ForecastCacheSchema = new mongoose.Schema({
  shopId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  productId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  forecast:   { type: mongoose.Schema.Types.Mixed, required: true },
  expiresAt:  { type: Date, required: true },
}, { timestamps: true });

ForecastCacheSchema.index({ shopId: 1, productId: 1 }, { unique: true });
ForecastCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('ForecastCache', ForecastCacheSchema);
