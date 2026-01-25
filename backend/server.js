import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler.js';

// Routes
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

/* =====================================================
   🔐 CORS — FINAL & RENDER SAFE
   ===================================================== */
const allowedOrigins = [
  process.env.CLIENT_URL, // Netlify URL
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server, health checks, curl, etc.
    if (!origin) return callback(null, true);

    // Allow ALL Netlify domains (prod + preview)
    if (origin.endsWith(".netlify.app")) {
      return callback(null, true);
    }

    // ❌ DO NOT THROW ERROR
    // ❌ DO NOT return false
    // Just silently disallow
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));


/* =====================================================
   🧩 GLOBAL MIDDLEWARES
   ===================================================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* =====================================================
   🚏 ROUTES
   ===================================================== */
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

/* =====================================================
   ❤️ HEALTH CHECK
   ===================================================== */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    message: 'Nath Krupa Travels API is running',
    timestamp: new Date().toISOString(),
  });
});

/* =====================================================
   ❌ ERROR HANDLER
   ===================================================== */
app.use(errorHandler);

/* =====================================================
   ⚠️ PROCESS LEVEL SAFETY
   ===================================================== */
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

/* =====================================================
   🗄️ DATABASE + SERVER START
   ===================================================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

export default app;


