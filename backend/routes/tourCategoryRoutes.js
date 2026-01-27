import express from 'express';
import TourCategory from '../models/TourCategory.js';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Validation rules
const tourCategoryValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('displayOrder').optional().isInt({ min: 0 }).withMessage('Display order must be a non-negative integer')
];

// Get all tour categories
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', active = '' } = req.query;

    const query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (active !== '') {
      query.isActive = active === 'true';
    }

    const categories = await TourCategory.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await TourCategory.countDocuments(query);

    res.json({
      success: true,
      data: categories,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching tour categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tour categories',
      error: error.message
    });
  }
});

// Get single tour category
router.get('/:id', async (req, res) => {
  try {
    const category = await TourCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Tour category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error fetching tour category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tour category',
      error: error.message
    });
  }
});

// Create tour category (Admin only)
router.post('/', authMiddleware, adminMiddleware, tourCategoryValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, description, image, displayOrder, isActive } = req.body;

    const category = new TourCategory({
      name,
      description,
      image,
      displayOrder: displayOrder || 0,
      isActive: isActive !== undefined ? isActive : true
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: 'Tour category created successfully',
      data: category
    });
  } catch (error) {
    console.error('Error creating tour category:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Tour category with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create tour category',
      error: error.message
    });
  }
});

// Update tour category (Admin only)
router.put('/:id', authMiddleware, adminMiddleware, tourCategoryValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, description, image, displayOrder, isActive } = req.body;

    const category = await TourCategory.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        image,
        displayOrder,
        isActive
      },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Tour category not found'
      });
    }

    res.json({
      success: true,
      message: 'Tour category updated successfully',
      data: category
    });
  } catch (error) {
    console.error('Error updating tour category:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Tour category with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update tour category',
      error: error.message
    });
  }
});

// Delete tour category (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const category = await TourCategory.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Tour category not found'
      });
    }

    res.json({
      success: true,
      message: 'Tour category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting tour category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete tour category',
      error: error.message
    });
  }
});

// Toggle active status (Admin only)
router.patch('/:id/toggle-status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const category = await TourCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Tour category not found'
      });
    }

    category.isActive = !category.isActive;
    await category.save();

    res.json({
      success: true,
      message: `Tour category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
      data: category
    });
  } catch (error) {
    console.error('Error toggling tour category status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle tour category status',
      error: error.message
    });
  }
});

export default router;