import GalleryItem from '../models/GalleryItem.js';

// Get gallery items (with filters)
export const getGalleryItems = async (req, res) => {
  try {
    const { type, relatedId } = req.query;
    let filter = { isActive: true };

    if (type) filter.type = type;
    if (relatedId) filter.relatedId = relatedId;

    const items = await GalleryItem.find(filter)
      .sort({ order: 1 })
      .populate('createdBy', 'name email')
      .populate('relatedId');

    res.status(200).json({
      success: true,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all gallery items (admin)
export const getAllGalleryItems = async (req, res) => {
  try {
    const items = await GalleryItem.find()
      .sort({ order: 1 })
      .populate('createdBy', 'name email')
      .populate('relatedId');

    res.status(200).json({
      success: true,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create gallery item
export const createGalleryItem = async (req, res) => {
  try {
    const { image, title, description, type, relatedId, relatedModel } = req.body;

    if (!image || !type || !relatedId || !relatedModel) {
      return res.status(400).json({
        success: false,
        message: 'Image, type, relatedId, and relatedModel are required'
      });
    }

    const item = new GalleryItem({
      image,
      title,
      description,
      type,
      relatedId,
      relatedModel,
      createdBy: req.user._id
    });

    await item.save();

    res.status(201).json({
      success: true,
      message: 'Gallery item created successfully',
      data: item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update gallery item
export const updateGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { image, title, description, isActive, order } = req.body;

    const item = await GalleryItem.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    if (image) item.image = image;
    if (title) item.title = title;
    if (description) item.description = description;
    if (isActive !== undefined) item.isActive = isActive;
    if (order !== undefined) item.order = order;

    await item.save();

    res.status(200).json({
      success: true,
      message: 'Gallery item updated successfully',
      data: item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete gallery item
export const deleteGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await GalleryItem.findByIdAndDelete(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Gallery item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Reorder gallery items
export const reorderGalleryItems = async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required'
      });
    }

    for (const item of items) {
      await GalleryItem.findByIdAndUpdate(item.id, { order: item.order });
    }

    res.status(200).json({
      success: true,
      message: 'Gallery items reordered successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
