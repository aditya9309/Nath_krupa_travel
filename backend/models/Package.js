import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  // BASIC DETAILS
  title: {
    type: String,
    required: [true, 'Package title is required'],
    trim: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  overview: {
    type: String,
    trim: true
  },
  duration: {
    days: {
      type: Number,
      required: true
    },
    nights: {
      type: Number,
      required: true
    }
  },
  tourType: {
    type: String,
    enum: ['group', 'personal', 'couple'],
    default: 'group'
  },
  destinations: [{
    type: String,
    trim: true
  }],
  pickupLocation: {
    type: String,
    trim: true
  },
  minAge: {
    type: Number,
    default: 0
  },
  maxGroupSize: {
    type: Number,
    required: true
  },

  // PACKAGE TYPE (new field for tab-based UI)
  packageType: {
    type: String,
    enum: ['domestic', 'religious', 'student', 'honeymoon'],
    required: true,
    default: 'domestic'
  },

  // CATEGORY (Auto-assigned from tab)
  category: {
    type: String,
    enum: ['domestic', 'group', 'religious', 'student', 'summer-special', 'honeymoon'],
    required: true
  },

  // PRICING (Enhanced)
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Price cannot be negative']
  },
  discountPrice: {
    type: Number,
    min: [0, 'Discount price cannot be negative']
  },
  discountPercentage: {
    type: Number,
    min: [0, 'Discount percentage cannot be negative'],
    max: [100, 'Discount percentage cannot exceed 100']
  },
  roomTypePricing: {
    single: Number,
    double: Number,
    triple: Number,
    sharing: Number,
    infant: Number
  },

  // DEPARTURES
  departures: [{
    date: {
      type: Date,
      required: true
    },
    seatsAvailable: {
      type: Number,
      required: true
    },
    seatsSold: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],

  // INCLUSIONS (Icon-based)
  inclusions: {
    hotel: { type: Boolean, default: false },
    transport: { type: Boolean, default: false },
    meals: { type: Boolean, default: false },
    sightseeing: { type: Boolean, default: false },
    guide: { type: Boolean, default: false },
    insurance: { type: Boolean, default: false }
  },

  // ROUTES (Day-wise, linked with itinerary)
  routes: [{
    day: Number,
    fromCity: String,
    toCity: String,
    travelMode: {
      type: String,
      enum: ['train', 'bus', 'flight', 'car'],
      default: 'bus'
    }
  }],

  // ITINERARY (Day-wise - VERY IMPORTANT)
  itinerary: [{
    day: {
      type: Number,
      required: true
    },
    title: String,
    route: String, // "City → City"
    description: String,
    meals: [{
      type: String,
      enum: ['breakfast', 'lunch', 'dinner']
    }],
    activities: [String],
    accommodation: String,
    travelMode: String
  }],

  // MEDIA
  bannerImage: {
    type: String,
    required: [true, 'Banner image is required']
  },
  galleryImages: [{
    type: String
  }],
  highlights: [{
    type: String
  }],
  exclusions: [{
    type: String
  }],
  terms: String,

  // BACKWARD COMPATIBILITY (Old fields)
  originalPrice: Number,
  images: [String],
  priceTable: {
    twinSharing: Number,
    extraPerson: Number,
    child: Number,
    singleOccupancy: Number
  },
  destination: String,
  pickup: String,
  route: String,

  // STATUS & TRACKING
  isTripActive: {
    type: Boolean,
    default: false
  },
  currentDay: {
    type: Number,
    default: 0
  },
  tripStartDate: Date,
  
  // RELATED & DISPLAY
  relatedPackages: [{
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package'
    },
    priority: {
      type: Number,
      default: 0
    }
  }],
  isTrending: {
    type: Boolean,
    default: false
  },
  isBestSeller: {
    type: Boolean,
    default: false
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

packageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();

  // Calculate discount percentage if discount price is set
  if (this.discountPrice && this.discountPrice < this.originalPrice) {
    this.discountPercentage = Math.round(((this.originalPrice - this.discountPrice) / this.originalPrice) * 100);
  }

  next();
});

// Virtual for current price (returns discount price if available, otherwise original)
packageSchema.virtual('currentPrice').get(function() {
  return this.discountPrice || this.originalPrice;
});

// Ensure virtual fields are serialized
packageSchema.set('toJSON', { virtuals: true });
packageSchema.set('toObject', { virtuals: true });

export default mongoose.model('Package', packageSchema);
