import mongoose from 'mongoose';

const heroSectionSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Explore The World',
    required: true
  },
  subtitle: {
    type: String,
    default: 'Discover amazing destinations with us',
    required: true
  },
  primaryButtonText: {
    type: String,
    default: 'Explore Packages'
  },
  primaryButtonURL: {
    type: String,
    default: '/packages'
  },
  secondaryButtonText: {
    type: String,
    default: 'Contact Us'
  },
  secondaryButtonURL: {
    type: String,
    default: '/contact'
  },
  backgroundImage: {
    type: String,
    default: '' // Can be updated to custom image
  },
  backgroundGradient: {
    type: String,
    default: 'from-blue-600 to-blue-800'
  },
  isPrimaryButtonActive: {
    type: Boolean,
    default: true
  },
  isSecondaryButtonActive: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('HeroSection', heroSectionSchema);
