import Banner from '../models/Banner.js';

// Get all banners
export const getAllBanners = async (req, res, next) => {
  try {
    const { isActive } = req.query;
    const query = {};

    if (isActive !== undefined) query.isActive = isActive === 'true';

    const banners = await Banner.find(query).sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: banners.length,
      banners
    });
  } catch (error) {
    next(error);
  }
};

// Create banner (Admin only)
export const createBanner = async (req, res, next) => {
  try {
    const { title, subtitle, image, link, isActive, order } = req.body;

    if (!title || !image) {
      return res.status(400).json({
        success: false,
        message: 'Title and image are required'
      });
    }

    const banner = await Banner.create({
      title,
      subtitle,
      image,
      link,
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0
    });

    res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      banner
    });
  } catch (error) {
    next(error);
  }
};

// Update banner (Admin only)
export const updateBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Banner updated successfully',
      banner
    });
  } catch (error) {
    next(error);
  }
};

// Delete banner (Admin only)
export const deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Banner deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
