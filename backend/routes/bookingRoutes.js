import express from 'express';
import {
  createBooking,
  getMyBookings,
  getBooking,
  updateBookingStatus,
  deleteBooking
} from '../controllers/bookingController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticate, createBooking);
router.get('/my-bookings', authenticate, getMyBookings);
router.get('/:id', authenticate, getBooking);
router.put('/:id/status', authenticate, authorize('admin'), updateBookingStatus);
router.delete('/:id', authenticate, deleteBooking); // Both user and admin can delete

export default router;
