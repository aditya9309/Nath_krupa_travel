import express from 'express';
import {
  register,
  verifyOTP,
  resendOTP,
  login,
  logout,
  getCurrentUser,
  requestPasswordChangeOTP,
  verifyPasswordChangeOTP,
  changePassword,
  resendPasswordChangeOTP
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authenticate, getCurrentUser);

// Password change routes
router.post('/request-password-change-otp', requestPasswordChangeOTP);
router.post('/verify-password-change-otp', verifyPasswordChangeOTP);
router.post('/change-password', authenticate, changePassword);
router.post('/resend-password-change-otp', resendPasswordChangeOTP);

export default router;
