import express from 'express';
import {
  getAllUsers,
  approveUser,
  toggleBlockUser,
  deleteUser,
  getUserActivity,
  getAllBookings,
  getAllTripRequests,
  getDashboardStats,
  updateAdminProfile
} from '../controllers/adminController.js';
import {
  createOrUpdateOwnerPortfolio,
  getOwnerPortfolio,
  disableOwnerPortfolio
} from '../controllers/ownerPortfolioController.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// User Management
router.get('/users', getAllUsers);
router.put('/users/:id/approve', approveUser);
router.put('/users/:id/toggle-block', toggleBlockUser);
router.delete('/users/:id', deleteUser); // Hard delete user
router.get('/users/:id/activity', getUserActivity); // View user activity

// Bookings & Trip Requests
router.get('/bookings', getAllBookings);
router.get('/trip-requests', getAllTripRequests);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Profile
router.put('/profile', updateAdminProfile);

// Owner Portfolio
router.post('/owner-portfolio', createOrUpdateOwnerPortfolio);
router.get('/owner-portfolio', getOwnerPortfolio);
router.delete('/owner-portfolio', disableOwnerPortfolio);

export default router;
