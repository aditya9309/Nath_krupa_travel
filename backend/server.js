import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import tripRequestRoutes from './routes/tripRequestRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import adminManagementRoutes from './routes/adminManagementRoutes.js';
import homeSectionsRoutes from './routes/homeSectionsRoutes.js';
import packageRoutes from './routes/packageRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import routeRoutes from './routes/routeRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import todoRoutes from './routes/todoRoutes.js';
import tourCategoryRoutes from './routes/tourCategoryRoutes.js';
import tourPlaceRoutes from './routes/tourPlaceRoutes.js';
import itineraryRoutes from './routes/itineraryRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import contactEnquiryRoutes from './routes/contactEnquiryRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
// CORS configuration - Allow requests from frontend
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like Postman, mobile apps, or server-to-server)
    if (!origin) return callback(null, true);
    
    // Allow the configured client URL
    if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) {
      return callback(null, true);
    }
    
    // Allow any localhost origin during development (for flexibility)
    if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }
    
    // In production, only allow configured CLIENT_URL
    if (process.env.NODE_ENV === 'production') {
      return callback(new Error('Not allowed by CORS'));
    }
    
    // Default: allow in development
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/trip-requests', tripRequestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/manage', adminManagementRoutes);
app.use('/api/home', homeSectionsRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin/expenses', expenseRoutes);
app.use('/api/admin/todos', todoRoutes);
app.use('/api/admin/tour-categories', tourCategoryRoutes);
app.use('/api/admin/tour-places', tourPlaceRoutes);
app.use('/api/admin/itineraries', itineraryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/contact-enquiries', contactEnquiryRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'OK', 
    message: 'Nath Krupa Travels API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Don't exit in production, just log
  if (process.env.NODE_ENV === 'production') {
    // Could send to error tracking service here
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API Health: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

export default app;
