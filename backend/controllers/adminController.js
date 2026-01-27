import User from '../models/User.js';
import Booking from '../models/Booking.js';
import TripRequest from '../models/TripRequest.js';
import Package from '../models/Package.js';
import UserBlockList from '../models/UserBlockList.js';
import { sendAccountApprovalEmail } from '../utils/emailService.js';
import { updateProfileSchema } from '../utils/validation.js';

// Get all users
export const getAllUsers = async (req, res, next) => {
  try {
    const { status, role, search } = req.query;
    const query = {};

    if (status === 'approved') query.isApproved = true;
    if (status === 'pending') query.isApproved = false;
    if (status === 'blocked') query.isBlocked = true;
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password -otp')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// Approve user
export const approveUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isApproved = true;
    await user.save();

    // Send approval email
    try {
      await sendAccountApprovalEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'User approved successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    next(error);
  }
};

// Block/Unblock user
export const toggleBlockUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent blocking admin
    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot block admin user'
      });
    }

    if (!user.isBlocked) {
      // Block user
      user.isBlocked = true;
      await user.save();

      // Add to block list
      await UserBlockList.create({
        userId: id,
        reason: reason || 'Account blocked by admin',
        blockedBy: req.user._id
      });

      return res.status(200).json({
        success: true,
        message: 'User blocked successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isBlocked: user.isBlocked
        }
      });
    } else {
      // Unblock user
      user.isBlocked = false;
      await user.save();

      // Remove from block list
      await UserBlockList.deleteOne({ userId: id });

      return res.status(200).json({
        success: true,
        message: 'User unblocked successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isBlocked: user.isBlocked
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

// DELETE user (hard delete)
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent deleting admin
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete admin user'
      });
    }

    // Delete user and all related data
    await User.findByIdAndDelete(id);
    await Booking.deleteMany({ userId: id });
    await TripRequest.deleteMany({ userId: id });
    await UserBlockList.deleteOne({ userId: id });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully along with all related data'
    });
  } catch (error) {
    next(error);
  }
};

// Get user activity  
export const getUserActivity = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('name email createdAt lastLoginAt lastActivity isBlocked');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const bookings = await Booking.countDocuments({ userId: id });
    const tripRequests = await TripRequest.countDocuments({ userId: id });

    res.status(200).json({
      success: true,
      data: {
        user: {
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
          lastActivity: user.lastActivity,
          isBlocked: user.isBlocked
        },
        activity: {
          bookings,
          tripRequests
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all bookings
export const getAllBookings = async (req, res, next) => {
  try {
    const { status, userId } = req.query;
    const query = {};

    if (status) query.status = status;
    if (userId) query.userId = userId;

    const bookings = await Booking.find(query)
      .populate('userId', 'name email phone')
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

// Get all trip requests
export const getAllTripRequests = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};

    if (status) query.status = status;

    const tripRequests = await TripRequest.find(query)
      .populate('userId', 'name email phone')
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

// Dashboard statistics
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const activeUsers = await User.countDocuments({ role: 'user', isApproved: true, isBlocked: false });
    const blockedUsers = await User.countDocuments({ isBlocked: true });

    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

    const totalTripRequests = await TripRequest.countDocuments();
    const pendingTripRequests = await TripRequest.countDocuments({ status: 'pending' });
    const approvedTripRequests = await TripRequest.countDocuments({ status: 'approved' });
    const rejectedTripRequests = await TripRequest.countDocuments({ status: 'rejected' });

    // Total Revenue (sum of confirmed bookings)
    const revenueData = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Daily Revenue (today's confirmed bookings)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dailyRevenueData = await Booking.aggregate([
      { 
        $match: { 
          status: 'confirmed',
          createdAt: { $gte: today, $lt: tomorrow }
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const dailyRevenue = dailyRevenueData.length > 0 ? dailyRevenueData[0].total : 0;

    // Popular Trips (packages with most bookings)
    const popularTripsData = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: '$packageId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const popularTrips = await Promise.all(
      popularTripsData.map(async (trip) => {
        if (trip._id) {
          const packageData = await Package.findById(trip._id).select('title');
          return {
            packageId: trip._id,
            title: packageData?.title || 'Unknown',
            bookings: trip.count
          };
        }
        return null;
      })
    );

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          blocked: blockedUsers
        },
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          confirmed: confirmedBookings,
          cancelled: cancelledBookings
        },
        tripRequests: {
          total: totalTripRequests,
          pending: pendingTripRequests,
          approved: approvedTripRequests,
          rejected: rejectedTripRequests
        },
        revenue: {
          total: totalRevenue,
          daily: dailyRevenue
        },
        popularTrips: popularTrips.filter(t => t !== null)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update admin profile
export const updateAdminProfile = async (req, res, next) => {
  try {
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (value.name) user.name = value.name;
    if (value.phone) user.phone = value.phone;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePhoto: user.profilePhoto
      }
    });
  } catch (error) {
    next(error);
  }
};
