import mongoose from 'mongoose';

const userBlockListSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  blockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  blockedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('UserBlockList', userBlockListSchema);
