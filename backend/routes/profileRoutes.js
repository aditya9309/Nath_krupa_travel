import express from 'express';
import {
  updateProfile,
  uploadProfilePhoto,
  changePassword
} from '../controllers/profileController.js';
import { upload } from '../controllers/profileController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authenticate);

router.put('/update', updateProfile);
router.post('/upload-photo', upload.single('photo'), uploadProfilePhoto);
router.post('/change-password', changePassword);

export default router;
