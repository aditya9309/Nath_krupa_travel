import Gallery from '../models/Gallery.js';

// Get all gallery images
export const getAllGalleryImages = async (req, res, next) => {
  try {
    const { category, isActive } = req.query;
    const query = {};

    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const images = await Gallery.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: images.length,
      images
    });
  } catch (error) {
    next(error);
  }
};

// Create gallery image (Admin only)
export const createGalleryImage = async (req, res, next) => {
  try {
    const { title, image, category, description } = req.body;

    if (!title || !image) {
      return res.status(400).json({
        success: false,
        message: 'Title and image are required'
      });
    }

    const galleryImage = await Gallery.create({
      title,
      image,
      category: category || 'destination',
      description,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Gallery image added successfully',
      image: galleryImage
    });
  } catch (error) {
    next(error);
  }
};

// Update gallery image (Admin only)
export const updateGalleryImage = async (req, res, next) => {
  try {
    const galleryImage = await Gallery.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!galleryImage) {
      return res.status(404).json({
        success: false,
        message: 'Gallery image not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Gallery image updated successfully',
      image: galleryImage
    });
  } catch (error) {
    next(error);
  }
};

// Delete gallery image (Admin only)
export const deleteGalleryImage = async (req, res, next) => {
  try {
    const galleryImage = await Gallery.findByIdAndDelete(req.params.id);

    if (!galleryImage) {
      return res.status(404).json({
        success: false,
        message: 'Gallery image not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Gallery image deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
