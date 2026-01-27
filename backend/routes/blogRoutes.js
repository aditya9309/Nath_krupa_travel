import express from 'express';
import Blog from '../models/Blog.js';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Validation rules
const blogValidation = [
  body('title').trim().isLength({ min: 2, max: 200 }).withMessage('Title must be 2-200 characters'),
  body('content').trim().isLength({ min: 50 }).withMessage('Content must be at least 50 characters'),
  body('excerpt').optional().trim().isLength({ max: 300 }).withMessage('Excerpt cannot exceed 300 characters'),
  body('category').optional().isIn(['travel-tips', 'destination-guide', 'booking-guide', 'news', 'general']).withMessage('Invalid category'),
  body('metaTitle').optional().trim().isLength({ max: 60 }).withMessage('Meta title cannot exceed 60 characters'),
  body('metaDescription').optional().trim().isLength({ max: 160 }).withMessage('Meta description cannot exceed 160 characters')
];

// Get published blogs (Public)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category = '', search = '' } = req.query;

    const query = { isPublished: true, isActive: true };
    if (category) {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const blogs = await Blog.find(query)
      .populate('author', 'name profilePhoto')
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await Blog.countDocuments(query);

    res.json({
      success: true,
      data: blogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blogs',
      error: error.message
    });
  }
});

// Get blog by slug (Public)
router.get('/slug/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({
      slug: req.params.slug,
      isPublished: true,
      isActive: true
    })
      .populate('author', 'name profilePhoto');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Increment view count
    blog.viewCount += 1;
    await blog.save();

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Error fetching blog by slug:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog',
      error: error.message
    });
  }
});

// Get single blog by ID (Public)
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findOne({
      _id: req.params.id,
      isPublished: true,
      isActive: true
    })
      .populate('author', 'name profilePhoto');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Increment view count
    blog.viewCount += 1;
    await blog.save();

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog',
      error: error.message
    });
  }
});

// Create blog (Admin only)
router.post('/', authMiddleware, adminMiddleware, blogValidation, async (req, res) => {
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
      title,
      content,
      excerpt,
      coverImage,
      category,
      tags,
      metaTitle,
      metaDescription,
      isPublished
    } = req.body;

    const blog = new Blog({
      title,
      content,
      excerpt,
      coverImage,
      author: req.user.id,
      category: category || 'general',
      tags: tags || [],
      metaTitle,
      metaDescription,
      isPublished: isPublished || false,
      isActive: true
    });

    await blog.save();
    await blog.populate('author', 'name profilePhoto');

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: blog
    });
  } catch (error) {
    console.error('Error creating blog:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Blog slug already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create blog',
      error: error.message
    });
  }
});

// Update blog (Admin only)
router.put('/:id', authMiddleware, adminMiddleware, blogValidation, async (req, res) => {
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
      title,
      content,
      excerpt,
      coverImage,
      category,
      tags,
      metaTitle,
      metaDescription,
      isPublished
    } = req.body;

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        excerpt,
        coverImage,
        category,
        tags,
        metaTitle,
        metaDescription,
        isPublished
      },
      { new: true, runValidators: true }
    ).populate('author', 'name profilePhoto');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.json({
      success: true,
      message: 'Blog updated successfully',
      data: blog
    });
  } catch (error) {
    console.error('Error updating blog:', error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Blog slug already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update blog',
      error: error.message
    });
  }
});

// Delete blog (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete blog',
      error: error.message
    });
  }
});

// Toggle publish status (Admin only)
router.patch('/:id/toggle-publish', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    blog.isPublished = !blog.isPublished;
    if (blog.isPublished && !blog.publishedAt) {
      blog.publishedAt = new Date();
    }
    await blog.save();

    res.json({
      success: true,
      message: `Blog ${blog.isPublished ? 'published' : 'unpublished'} successfully`,
      data: blog
    });
  } catch (error) {
    console.error('Error toggling blog publish status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle blog publish status',
      error: error.message
    });
  }
});

// Toggle active status (Admin only)
router.patch('/:id/toggle-status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    blog.isActive = !blog.isActive;
    await blog.save();

    res.json({
      success: true,
      message: `Blog ${blog.isActive ? 'activated' : 'deactivated'} successfully`,
      data: blog
    });
  } catch (error) {
    console.error('Error toggling blog status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle blog status',
      error: error.message
    });
  }
});

// Get all blogs for admin (Admin only)
router.get('/admin/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '', search = '' } = req.query;

    const query = {};
    if (status === 'published') {
      query.isPublished = true;
    } else if (status === 'draft') {
      query.isPublished = false;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const blogs = await Blog.find(query)
      .populate('author', 'name profilePhoto')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await Blog.countDocuments(query);

    res.json({
      success: true,
      data: blogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching admin blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blogs',
      error: error.message
    });
  }
});

export default router;