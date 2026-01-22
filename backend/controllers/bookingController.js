import Booking from '../models/Booking.js';
import Package from '../models/Package.js';
import { bookingSchema } from '../utils/validation.js';
import { sendBookingConfirmation } from '../utils/emailService.js';

// Create booking with idempotency
export const createBooking = async (req, res, next) => {
  try {
    const { error, value } = bookingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Generate idempotency key if not provided
    const idempotencyKey = value.idempotencyKey || `booking_${req.user._id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Check for existing booking with same idempotency key
    const existingBooking = await Booking.findOne({ idempotencyKey });
    if (existingBooking) {
      return res.status(200).json({
        success: true,
        message: 'Booking already exists',
        booking: existingBooking,
        idempotent: true
      });
    }

    const booking = await Booking.create({
      ...value,
      idempotencyKey,
      userId: req.user._id,
      status: 'pending'
    });

    // Populate user and package details for email
    await booking.populate('userId', 'name email phone');
    if (booking.packageId) {
      await booking.populate('packageId', 'title');
    }

    // Get package name
    let packageName = 'Custom Trip';
    if (booking.packageId && booking.packageId.title) {
      packageName = booking.packageId.title;
    } else if (value.packageId) {
      const packageData = await Package.findById(value.packageId).select('title');
      if (packageData) {
        packageName = packageData.title;
      }
    }

    // Send booking confirmation email AFTER successful booking creation
    try {
      await sendBookingConfirmation(
        booking.userId.email,
        booking.userId.name,
        {
          bookingId: booking._id.toString(),
          packageName: packageName,
          source: booking.source,
          destination: booking.destination,
          journeyDate: booking.journeyDate,
          passengers: booking.passengers,
          totalAmount: booking.totalAmount,
          contactInfo: booking.userId.phone || 'N/A'
        }
      );
      console.log(`✅ Booking confirmation email sent to ${booking.userId.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send booking confirmation email:', emailError);
      // Don't fail the booking if email fails, but log it
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    next(error);
  }
};

// Get user's bookings
export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

// Get single booking
export const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns the booking or is admin
    if (booking.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    next(error);
  }
};

// Update booking status (Admin only)
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking status updated',
      booking
    });
  } catch (error) {
    next(error);
  }
};

// Delete booking
export const deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns the booking or is admin
    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Booking.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
