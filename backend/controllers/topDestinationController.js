import TopDestination from '../models/TopDestination.js';

// Get all top destinations
export const getTopDestinations = async (req, res) => {
  try {
    const destinations = await TopDestination.find()
      .sort({ order: 1 })
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      data: destinations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create top destination
export const createTopDestination = async (req, res) => {
  try {
    const { name, description, image, customersCount } = req.body;

    if (!name || !image) {
      return res.status(400).json({
        success: false,
        message: 'Name and image are required'
      });
    }

    const destination = new TopDestination({
      name,
      description,
      image,
      customersCount,
      createdBy: req.user._id
    });

    await destination.save();

    res.status(201).json({
      success: true,
      message: 'Destination created successfully',
      data: destination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update top destination
export const updateTopDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image, customersCount, isActive, order } = req.body;

    const destination = await TopDestination.findById(id);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    if (name) destination.name = name;
    if (description) destination.description = description;
    if (image) destination.image = image;
    if (customersCount !== undefined) destination.customersCount = customersCount;
    if (isActive !== undefined) destination.isActive = isActive;
    if (order !== undefined) destination.order = order;

    await destination.save();

    res.status(200).json({
      success: true,
      message: 'Destination updated successfully',
      data: destination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete top destination
export const deleteTopDestination = async (req, res) => {
  try {
    const { id } = req.params;

    const destination = await TopDestination.findByIdAndDelete(id);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Destination deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Reorder destinations
export const reorderDestinations = async (req, res) => {
  try {
    const { destinations } = req.body;

    if (!Array.isArray(destinations)) {
      return res.status(400).json({
        success: false,
        message: 'Destinations array is required'
      });
    }

    for (const item of destinations) {
      await TopDestination.findByIdAndUpdate(item.id, { order: item.order });
    }

    res.status(200).json({
      success: true,
      message: 'Destinations reordered successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
