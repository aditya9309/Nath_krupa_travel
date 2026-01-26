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

/* ================= PUBLIC ROUTES ================= */
router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', login);

// Password reset (OTP based – NO login needed)
router.post('/request-password-change-otp', requestPasswordChangeOTP);
router.post('/verify-password-change-otp', verifyPasswordChangeOTP);
router.post('/change-password', changePassword);
router.post('/resend-password-change-otp', resendPasswordChangeOTP);

/* ================= PROTECTED ROUTES ================= */
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getCurrentUser);

export default router;
