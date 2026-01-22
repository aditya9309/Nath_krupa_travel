import TripRequest from '../models/TripRequest.js';
import { tripRequestSchema } from '../utils/validation.js';
import { sendTripRequestUpdate } from '../utils/emailService.js';

// Create trip request
export const createTripRequest = async (req, res, next) => {
  try {
    const { error, value } = tripRequestSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const tripRequest = await TripRequest.create({
      ...value,
      userId: req.user._id,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Trip request submitted successfully',
      tripRequest
    });
  } catch (error) {
    next(error);
  }
};

// Get user's trip requests
export const getMyTripRequests = async (req, res, next) => {
  try {
    const tripRequests = await TripRequest.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tripRequests.length,
      tripRequests
    });
  } catch (error) {
    next(error);
  }
};

// Get single trip request
export const getTripRequest = async (req, res, next) => {
  try {
    const tripRequest = await TripRequest.findById(req.params.id)
      .populate('userId', 'name email phone');

    if (!tripRequest) {
      return res.status(404).json({
        success: false,
        message: 'Trip request not found'
      });
    }

    // Check if user owns the request or is admin
    if (tripRequest.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      tripRequest
    });
  } catch (error) {
    next(error);
  }
};

// Update trip request status (Admin only)
export const updateTripRequestStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const tripRequest = await TripRequest.findById(req.params.id)
      .populate('userId', 'name email');

    if (!tripRequest) {
      return res.status(404).json({
        success: false,
        message: 'Trip request not found'
      });
    }

    tripRequest.status = status;
    if (adminNotes) {
      tripRequest.adminNotes = adminNotes;
    }
    await tripRequest.save();

    // Send email notification
    try {
      await sendTripRequestUpdate(
        tripRequest.userId.email,
        tripRequest.name,
        status,
        adminNotes
      );
    } catch (emailError) {
      console.error('Failed to send trip request update email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Trip request status updated',
      tripRequest
    });
  } catch (error) {
    next(error);
  }
};

// Delete trip request
export const deleteTripRequest = async (req, res, next) => {
  try {
    const tripRequest = await TripRequest.findById(req.params.id);

    if (!tripRequest) {
      return res.status(404).json({
        success: false,
        message: 'Trip request not found'
      });
    }

    // Check if user owns the request or is admin
    if (tripRequest.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await TripRequest.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Trip request deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
