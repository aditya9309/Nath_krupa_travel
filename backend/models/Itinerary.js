import mongoose from 'mongoose';

const itinerarySchema = new mongoose.Schema({
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: [true, 'Package ID is required']
  },
  dayNumber: {
    type: Number,
    required: [true, 'Day number is required'],
    min: [1, 'Day number must be at least 1']
  },
  title: {
    type: String,
    required: [true, 'Itinerary title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  activities: [{
    type: String,
    trim: true
  }],
  meals: {
    breakfast: {
      type: Boolean,
      default: false
    },
    lunch: {
      type: Boolean,
      default: false
    },
    dinner: {
      type: Boolean,
      default: false
    }
  },
  accommodation: {
    type: String,
    trim: true
  },
  transportation: {
    type: String,
    trim: true
  },
  lineColor: {
    type: String,
    enum: ['red', 'green', 'blue', 'orange'],
    default: 'green'
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

itinerarySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Compound index for efficient queries
// itinerarySchema.index({ packageId: 1, dayNumber: 1 });

// Ensure unique day numbers per package
itinerarySchema.index({ packageId: 1, dayNumber: 1 }, { unique: true });

export default mongoose.model('Itinerary', itinerarySchema);