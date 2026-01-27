import express from 'express';
import {
  createTripRequest,
  getMyTripRequests,
  getTripRequest,
  updateTripRequestStatus,
  deleteTripRequest
} from '../controllers/tripRequestController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticate, createTripRequest);
router.get('/my-requests', authenticate, getMyTripRequests);
router.get('/:id', authenticate, getTripRequest);
router.put('/:id/status', authenticate, authorize('admin'), updateTripRequestStatus);
router.delete('/:id', authenticate, deleteTripRequest);

export default router;
