import express from 'express';
import { 
  getAllReviews, 
  getAllReviewsAdmin, 
  createReview, 
  approveReview, 
  deleteReview, 
  toggleReviewVisibility 
} from '../controllers/reviewController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllReviews);

// User routes (authenticated)
router.post('/', authenticate, createReview);

// Admin routes
router.get('/admin/all', authenticate, authorize('admin'), getAllReviewsAdmin);
router.put('/:id/approve', authenticate, authorize('admin'), approveReview);
router.put('/:id/toggle-visibility', authenticate, authorize('admin'), toggleReviewVisibility);
router.delete('/:id', authenticate, authorize('admin'), deleteReview);

export default router;