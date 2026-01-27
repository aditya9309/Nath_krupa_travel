import CategoryCard from '../models/CategoryCard.js';

// Get all category cards
export const getCategoryCards = async (req, res) => {
  try {
    const cards = await CategoryCard.find()
      .sort({ order: 1 })
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      data: cards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create category card
export const createCategoryCard = async (req, res) => {
  try {
    const { name, description, image, packageCategory } = req.body;

    if (!name || !image || !packageCategory) {
      return res.status(400).json({
        success: false,
        message: 'Name, image, and package category are required'
      });
    }

    const card = new CategoryCard({
      name,
      description,
      image,
      packageCategory,
      createdBy: req.user._id
    });

    await card.save();

    res.status(201).json({
      success: true,
      message: 'Category card created successfully',
      data: card
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update category card
export const updateCategoryCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image, packageCategory, isActive, order } = req.body;

    const card = await CategoryCard.findById(id);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Category card not found'
      });
    }

    if (name) card.name = name;
    if (description) card.description = description;
    if (image) card.image = image;
    if (packageCategory) card.packageCategory = packageCategory;
    if (isActive !== undefined) card.isActive = isActive;
    if (order !== undefined) card.order = order;

    await card.save();

    res.status(200).json({
      success: true,
      message: 'Category card updated successfully',
      data: card
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete category card
export const deleteCategoryCard = async (req, res) => {
  try {
    const { id } = req.params;

    const card = await CategoryCard.findByIdAndDelete(id);

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Category card not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category card deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Reorder category cards
export const reorderCategoryCards = async (req, res) => {
  try {
    const { cards } = req.body;

    if (!Array.isArray(cards)) {
      return res.status(400).json({
        success: false,
        message: 'Cards array is required'
      });
    }

    for (const item of cards) {
      await CategoryCard.findByIdAndUpdate(item.id, { order: item.order });
    }

    res.status(200).json({
      success: true,
      message: 'Cards reordered successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
