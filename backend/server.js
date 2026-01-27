import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler.js';

// ROUTES
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

/* TRUST PROXY (RENDER) */
app.set('trust proxy', 1);

/* CORS (COOKIE SAFE) */
const FRONTEND_URL = 'https://nathkrupatravel.netlify.app';

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.options('*', cors({ origin: FRONTEND_URL, credentials: true }));

/* MIDDLEWARES */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ROUTES */
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/trip-requests', tripRequestRoutes);

app.use('/api/admin', adminRoutes);
app.use('/api/admin/manage', adminManagementRoutes);
app.use('/api/admin/expenses', expenseRoutes);
app.use('/api/admin/todos', todoRoutes);
app.use('/api/admin/tour-categories', tourCategoryRoutes);
app.use('/api/admin/tour-places', tourPlaceRoutes);
app.use('/api/admin/itineraries', itineraryRoutes);

app.use('/api/home', homeSectionsRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/contact-enquiries', contactEnquiryRoutes);

/* HEALTH */
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API running 🚀' });
});

/* ERROR HANDLER */
app.use(errorHandler);

/* DB */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () =>
      console.log(`🚀 Server running on ${PORT}`)
    );
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

export default app;
