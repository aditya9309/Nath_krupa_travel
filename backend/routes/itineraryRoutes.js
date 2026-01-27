import express from 'express';
import Itinerary from '../models/Itinerary.js';
import Package from '../models/Package.js';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Validation rules
const itineraryValidation = [
  body('packageId').isMongoId().withMessage('Valid package ID is required'),
  body('dayNumber').isInt({ min: 1 }).withMessage('Day number must be at least 1'),
  body('title').trim().isLength({ min: 2, max: 200 }).withMessage('Title must be 2-200 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('lineColor').optional().isIn(['red', 'green', 'blue', 'orange']).withMessage('Invalid line color')
];

// Get itineraries for a package
router.get('/package/:packageId', async (req, res) => {
  try {
    const { packageId } = req.params;

    // Verify package exists
    const packageExists = await Package.findById(packageId);
    if (!packageExists) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    const itineraries = await Itinerary.find({
      packageId,
      isActive: true
    })
      .sort({ dayNumber: 1 })
      .select('-__v');

    res.json({
      success: true,
      data: itineraries
    });
  } catch (error) {
    console.error('Error fetching itineraries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch itineraries',
      error: error.message
    });
  }
});

// Get single itinerary
router.get('/:id', async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }

    res.json({
      success: true,
      data: itinerary
    });
  } catch (error) {
    console.error('Error fetching itinerary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch itinerary',
      error: error.message
    });
  }
});

// Create itinerary (Admin only)
router.post('/', authMiddleware, adminMiddleware, itineraryValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      packageId,
      dayNumber,
      title,
      description,
      activities,
      meals,
      accommodation,
      transportation,
      lineColor,
      isActive
    } = req.body;

    // Verify package exists
    const packageExists = await Package.findById(packageId);
    if (!packageExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid package ID'
      });
    }

    // Check if day number already exists for this package
    const existingItinerary = await Itinerary.findOne({ packageId, dayNumber });
    if (existingItinerary) {
      return res.status(400).json({
        success: false,
        message: `Day ${dayNumber} already exists for this package`
      });
    }

    const itinerary = new Itinerary({
      packageId,
      dayNumber,
      title,
      description,
      activities: activities || [],
      meals: meals || {},
      accommodation,
      transportation,
      lineColor: lineColor || 'green',
      isActive: isActive !== undefined ? isActive : true
    });

    await itinerary.save();

    res.status(201).json({
      success: true,
      message: 'Itinerary created successfully',
      data: itinerary
    });
  } catch (error) {
    console.error('Error creating itinerary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create itinerary',
      error: error.message
    });
  }
});

// Update itinerary (Admin only)
router.put('/:id', authMiddleware, adminMiddleware, itineraryValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      packageId,
      dayNumber,
      title,
      description,
      activities,
      meals,
      accommodation,
      transportation,
      lineColor,
      isActive
    } = req.body;

    // Verify package exists
    const packageExists = await Package.findById(packageId);
    if (!packageExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid package ID'
      });
    }

    // Check if day number conflicts with another itinerary for this package
    const existingItinerary = await Itinerary.findOne({
      packageId,
      dayNumber,
      _id: { $ne: req.params.id }
    });
    if (existingItinerary) {
      return res.status(400).json({
        success: false,
        message: `Day ${dayNumber} already exists for this package`
      });
    }

    const itinerary = await Itinerary.findByIdAndUpdate(
      req.params.id,
      {
        packageId,
        dayNumber,
        title,
        description,
        activities,
        meals,
        accommodation,
        transportation,
        lineColor,
        isActive
      },
      { new: true, runValidators: true }
    );

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }

    res.json({
      success: true,
      message: 'Itinerary updated successfully',
      data: itinerary
    });
  } catch (error) {
    console.error('Error updating itinerary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update itinerary',
      error: error.message
    });
  }
});

// Delete itinerary (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const itinerary = await Itinerary.findByIdAndDelete(req.params.id);

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }

    res.json({
      success: true,
      message: 'Itinerary deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting itinerary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete itinerary',
      error: error.message
    });
  }
});

// Toggle active status (Admin only)
router.patch('/:id/toggle-status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }

    itinerary.isActive = !itinerary.isActive;
    await itinerary.save();

    res.json({
      success: true,
      message: `Itinerary ${itinerary.isActive ? 'activated' : 'deactivated'} successfully`,
      data: itinerary
    });
  } catch (error) {
    console.error('Error toggling itinerary status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle itinerary status',
      error: error.message
    });
  }
});

// Bulk create/update itineraries for a package (Admin only)
router.post('/bulk/:packageId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { packageId } = req.params;
    const { itineraries } = req.body;

    if (!Array.isArray(itineraries)) {
      return res.status(400).json({
        success: false,
        message: 'Itineraries must be an array'
      });
    }

    // Verify package exists
    const packageExists = await Package.findById(packageId);
    if (!packageExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid package ID'
      });
    }

    // Delete existing itineraries for this package
    await Itinerary.deleteMany({ packageId });

    // Create new itineraries
    const createdItineraries = [];
    for (const itineraryData of itineraries) {
      const itinerary = new Itinerary({
        packageId,
        ...itineraryData,
        isActive: true
      });
      await itinerary.save();
      createdItineraries.push(itinerary);
    }

    res.json({
      success: true,
      message: `${createdItineraries.length} itineraries created successfully`,
      data: createdItineraries
    });
  } catch (error) {
    console.error('Error bulk creating itineraries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk create itineraries',
      error: error.message
    });
  }
});

export default router;