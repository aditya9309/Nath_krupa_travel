import express from 'express';
import {
  getAllPackages,
  getPackage,
  createPackage,
  updatePackage,
  deletePackage
} from '../controllers/packageController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllPackages);
router.get('/:id', getPackage);
router.post('/', authenticate, authorize('admin'), createPackage);
router.put('/:id', authenticate, authorize('admin'), updatePackage);
router.delete('/:id', authenticate, authorize('admin'), deletePackage);

export default router;
