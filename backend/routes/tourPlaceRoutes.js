import express from 'express';
import TourPlace from '../models/TourPlace.js';
import TourCategory from '../models/TourCategory.js';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Validation rules
const tourPlaceValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('shortDescription').optional().trim().isLength({ max: 200 }).withMessage('Short description cannot exceed 200 characters'),
  body('categoryId').isMongoId().withMessage('Valid category ID is required'),
  body('displayOrder').optional().isInt({ min: 0 }).withMessage('Display order must be a non-negative integer')
];

// Get all tour places with category info
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', categoryId = '', active = '' } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (categoryId) {
      query.categoryId = categoryId;
    }
    if (active !== '') {
      query.isActive = active === 'true';
    }

    const places = await TourPlace.find(query)
      .populate('categoryId', 'name')
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await TourPlace.countDocuments(query);

    res.json({
      success: true,
      data: places,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching tour places:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tour places',
      error: error.message
    });
  }
});

// Get tour places by category (for frontend)
router.get('/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;

    const places = await TourPlace.find({
      categoryId,
      isActive: true
    })
      .sort({ displayOrder: 1, createdAt: -1 })
      .select('name shortDescription image displayOrder');

    res.json({
      success: true,
      data: places
    });
  } catch (error) {
    console.error('Error fetching tour places by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tour places',
      error: error.message
    });
  }
});

// Get single tour place
router.get('/:id', async (req, res) => {
  try {
    const place = await TourPlace.findById(req.params.id)
      .populate('categoryId', 'name description');

    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Tour place not found'
      });
    }

    res.json({
      success: true,
      data: place
    });
  } catch (error) {
    console.error('Error fetching tour place:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tour place',
      error: error.message
    });
  }
});

// Create tour place (Admin only)
router.post('/', authMiddleware, adminMiddleware, tourPlaceValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, description, shortDescription, image, categoryId, displayOrder, isActive } = req.body;

    // Verify category exists
    const category = await TourCategory.findById(categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    const place = new TourPlace({
      name,
      description,
      shortDescription,
      image,
      categoryId,
      displayOrder: displayOrder || 0,
      isActive: isActive !== undefined ? isActive : true
    });

    await place.save();
    await place.populate('categoryId', 'name');

    res.status(201).json({
      success: true,
      message: 'Tour place created successfully',
      data: place
    });
  } catch (error) {
    console.error('Error creating tour place:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create tour place',
      error: error.message
    });
  }
});

// Update tour place (Admin only)
router.put('/:id', authMiddleware, adminMiddleware, tourPlaceValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, description, shortDescription, image, categoryId, displayOrder, isActive } = req.body;

    // Verify category exists
    const category = await TourCategory.findById(categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    const place = await TourPlace.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        shortDescription,
        image,
        categoryId,
        displayOrder,
        isActive
      },
      { new: true, runValidators: true }
    ).populate('categoryId', 'name');

    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Tour place not found'
      });
    }

    res.json({
      success: true,
      message: 'Tour place updated successfully',
      data: place
    });
  } catch (error) {
    console.error('Error updating tour place:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tour place',
      error: error.message
    });
  }
});

// Delete tour place (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const place = await TourPlace.findByIdAndDelete(req.params.id);

    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Tour place not found'
      });
    }

    res.json({
      success: true,
      message: 'Tour place deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting tour place:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete tour place',
      error: error.message
    });
  }
});

// Toggle active status (Admin only)
router.patch('/:id/toggle-status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const place = await TourPlace.findById(req.params.id);

    if (!place) {
      return res.status(404).json({
        success: false,
        message: 'Tour place not found'
      });
    }

    place.isActive = !place.isActive;
    await place.save();

    res.json({
      success: true,
      message: `Tour place ${place.isActive ? 'activated' : 'deactivated'} successfully`,
      data: place
    });
  } catch (error) {
    console.error('Error toggling tour place status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle tour place status',
      error: error.message
    });
  }
});

export default router;