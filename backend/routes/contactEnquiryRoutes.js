import express from 'express';
import ContactEnquiry from '../models/ContactEnquiry.js';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Validation rules
const contactEnquiryValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').trim().isLength({ min: 10, max: 15 }).withMessage('Phone must be 10-15 characters'),
  body('subject').trim().isLength({ min: 2, max: 200 }).withMessage('Subject must be 2-200 characters'),
  body('message').trim().isLength({ min: 10, max: 1000 }).withMessage('Message must be 10-1000 characters')
];

// Create contact enquiry (Public - after booking)
router.post('/', contactEnquiryValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userId, bookingId, packageId, name, email, phone, subject, message } = req.body;

    const enquiry = new ContactEnquiry({
      userId,
      bookingId,
      packageId,
      name,
      email,
      phone,
      subject,
      message,
      status: 'pending',
      priority: 'medium'
    });

    await enquiry.save();

    res.status(201).json({
      success: true,
      message: 'Contact enquiry submitted successfully',
      data: enquiry
    });
  } catch (error) {
    console.error('Error creating contact enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact enquiry',
      error: error.message
    });
  }
});

// Get user's contact enquiries (Authenticated)
router.get('/user/my-enquiries', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const enquiries = await ContactEnquiry.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await ContactEnquiry.countDocuments({ userId: req.user.id });

    res.json({
      success: true,
      data: enquiries,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching user enquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enquiries',
      error: error.message
    });
  }
});

// Get all contact enquiries (Admin only)
router.get('/admin/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '', priority = '', search = '' } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const enquiries = await ContactEnquiry.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await ContactEnquiry.countDocuments(query);

    res.json({
      success: true,
      data: enquiries,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching admin enquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enquiries',
      error: error.message
    });
  }
});

// Update enquiry status (Admin only)
router.patch('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, priority, adminNotes } = req.body;

    const validStatuses = ['pending', 'contacted', 'closed'];
    const validPriorities = ['low', 'medium', 'high'];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid priority value'
      });
    }

    const enquiry = await ContactEnquiry.findByIdAndUpdate(
      req.params.id,
      {
        status,
        priority,
        adminNotes,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Contact enquiry not found'
      });
    }

    res.json({
      success: true,
      message: 'Enquiry status updated successfully',
      data: enquiry
    });
  } catch (error) {
    console.error('Error updating enquiry status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update enquiry status',
      error: error.message
    });
  }
});

// Delete enquiry (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const enquiry = await ContactEnquiry.findByIdAndDelete(req.params.id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Contact enquiry not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact enquiry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete enquiry',
      error: error.message
    });
  }
});

// Get enquiry statistics (Admin only)
router.get('/admin/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const stats = await ContactEnquiry.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await ContactEnquiry.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalEnquiries = await ContactEnquiry.countDocuments();
    const recentEnquiries = await ContactEnquiry.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    });

    res.json({
      success: true,
      data: {
        total: totalEnquiries,
        recent: recentEnquiries,
        byStatus: stats,
        byPriority: priorityStats
      }
    });
  } catch (error) {
    console.error('Error fetching enquiry stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enquiry statistics',
      error: error.message
    });
  }
});

export default router;