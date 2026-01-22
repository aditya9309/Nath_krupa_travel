import express from 'express';
import {
  getHeroSection,
  updateHeroSection
} from '../controllers/heroSectionController.js';
import {
  getTopDestinations,
  createTopDestination,
  updateTopDestination,
  deleteTopDestination,
  reorderDestinations
} from '../controllers/topDestinationController.js';
import {
  getCategoryCards,
  createCategoryCard,
  updateCategoryCard,
  deleteCategoryCard,
  reorderCategoryCards
} from '../controllers/categoryCardController.js';
import {
  getOwnerPortfolio,
  createOrUpdateOwnerPortfolio,
  disableOwnerPortfolio
} from '../controllers/ownerPortfolioController.js';
import {
  getAllGalleryItems,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  reorderGalleryItems
} from '../controllers/advancedGalleryController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

// ============================================
// HERO SECTION MANAGEMENT
// ============================================
router.get('/hero-section', getHeroSection);
router.put('/hero-section', updateHeroSection);

// ============================================
// TOP DESTINATIONS MANAGEMENT
// ============================================
router.get('/top-destinations', getTopDestinations);
router.post('/top-destinations', createTopDestination);
router.put('/top-destinations/:id', updateTopDestination);
router.delete('/top-destinations/:id', deleteTopDestination);
router.post('/top-destinations/reorder', reorderDestinations);

// ============================================
// CATEGORY CARDS MANAGEMENT
// ============================================
router.get('/category-cards', getCategoryCards);
router.post('/category-cards', createCategoryCard);
router.put('/category-cards/:id', updateCategoryCard);
router.delete('/category-cards/:id', deleteCategoryCard);
router.post('/category-cards/reorder', reorderCategoryCards);

// ============================================
// OWNER PORTFOLIO MANAGEMENT
// ============================================
router.get('/owner-portfolio', getOwnerPortfolio);
router.post('/owner-portfolio', createOrUpdateOwnerPortfolio);
router.put('/owner-portfolio/disable', disableOwnerPortfolio);

// ============================================
// GALLERY MANAGEMENT (Advanced)
// ============================================
router.get('/gallery/items', getAllGalleryItems);
router.post('/gallery/items', createGalleryItem);
router.put('/gallery/items/:id', updateGalleryItem);
router.delete('/gallery/items/:id', deleteGalleryItem);
router.post('/gallery/items/reorder', reorderGalleryItems);

export default router;
