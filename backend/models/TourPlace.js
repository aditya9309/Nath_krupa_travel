import mongoose from 'mongoose';

const tourPlaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tour place name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  image: {
    type: String,
    trim: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TourCategory',
    required: [true, 'Tour category is required']
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

tourPlaceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
tourPlaceSchema.index({ categoryId: 1, displayOrder: 1, isActive: 1 });

export default mongoose.model('TourPlace', tourPlaceSchema);