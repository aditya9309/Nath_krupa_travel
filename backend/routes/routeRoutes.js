import express from 'express';
import {
  getAllRoutes,
  getRoute,
  createRoute,
  updateRoute,
  deleteRoute
} from '../controllers/routeController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllRoutes);
router.get('/:id', getRoute);
router.post('/', authenticate, authorize('admin'), createRoute);
router.put('/:id', authenticate, authorize('admin'), updateRoute);
router.delete('/:id', authenticate, authorize('admin'), deleteRoute);

export default router;
