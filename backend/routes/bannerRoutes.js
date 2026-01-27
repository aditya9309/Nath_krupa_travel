import express from 'express';
import {
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner
} from '../controllers/bannerController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllBanners);
router.post('/', authenticate, authorize('admin'), createBanner);
router.put('/:id', authenticate, authorize('admin'), updateBanner);
router.delete('/:id', authenticate, authorize('admin'), deleteBanner);

export default router;
