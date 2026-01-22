import express from 'express';
import {
  getAllGalleryImages,
  createGalleryImage,
  updateGalleryImage,
  deleteGalleryImage
} from '../controllers/galleryController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllGalleryImages);
router.post('/', authenticate, authorize('admin'), createGalleryImage);
router.put('/:id', authenticate, authorize('admin'), updateGalleryImage);
router.delete('/:id', authenticate, authorize('admin'), deleteGalleryImage);

export default router;
