import express from 'express';
import HeroSection from '../models/HeroSection.js';
import TopDestination from '../models/TopDestination.js';
import CategoryCard from '../models/CategoryCard.js';
import OwnerPortfolio from '../models/OwnerPortfolio.js';
import GalleryItem from '../models/GalleryItem.js';

const router = express.Router();

// Get hero section for public view
router.get('/hero-section', async (req, res) => {
  try {
    const heroSection = await HeroSection.findOne({ isActive: true });
    
    res.status(200).json({
      success: true,
      data: heroSection || {
        title: 'Explore The World',
        subtitle: 'Discover amazing destinations with us',
        primaryButtonText: 'Explore Packages',
        primaryButtonURL: '/packages',
        secondaryButtonText: 'Contact Us',
        secondaryButtonURL: '/contact'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get top destinations for public view
router.get('/top-destinations', async (req, res) => {
  try {
    const destinations = await TopDestination.find({ isActive: true })
      .sort({ order: 1 });

    res.status(200).json({
      success: true,
      data: destinations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get category cards for public view
router.get('/category-cards', async (req, res) => {
  try {
    const cards = await CategoryCard.find({ isActive: true })
      .sort({ order: 1 });

    res.status(200).json({
      success: true,
      data: cards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get owner portfolio for about page
router.get('/owner-portfolio', async (req, res) => {
  try {
    const portfolio = await OwnerPortfolio.findOne({ isActive: true });

    res.status(200).json({
      success: true,
      data: portfolio
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get gallery by type and optional related ID
router.get('/gallery', async (req, res) => {
  try {
    const { type, relatedId } = req.query;
    let filter = { isActive: true };

    if (type) filter.type = type;
    if (relatedId) filter.relatedId = relatedId;

    const items = await GalleryItem.find(filter)
      .sort({ order: 1 })
      .populate('relatedId');

    res.status(200).json({
      success: true,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
