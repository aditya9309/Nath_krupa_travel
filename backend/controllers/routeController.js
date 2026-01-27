import Route from '../models/Route.js';

// Get all routes
export const getAllRoutes = async (req, res, next) => {
  try {
    const { isActive, search } = req.query;
    const query = {};

    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { source: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } }
      ];
    }

    const routes = await Route.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: routes.length,
      routes
    });
  } catch (error) {
    next(error);
  }
};

// Get single route
export const getRoute = async (req, res, next) => {
  try {
    const route = await Route.findById(req.params.id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    res.status(200).json({
      success: true,
      route
    });
  } catch (error) {
    next(error);
  }
};

// Create route (Admin only)
export const createRoute = async (req, res, next) => {
  try {
    const { name, source, destination, distance, duration, highlights, image, description } = req.body;

    if (!name || !source || !destination) {
      return res.status(400).json({
        success: false,
        message: 'Name, source, and destination are required'
      });
    }

    const route = await Route.create({
      name,
      source,
      destination,
      distance,
      duration,
      highlights,
      image,
      description,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Route created successfully',
      route
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Route with this name already exists'
      });
    }
    next(error);
  }
};

// Update route (Admin only)
export const updateRoute = async (req, res, next) => {
  try {
    const route = await Route.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Route updated successfully',
      route
    });
  } catch (error) {
    next(error);
  }
};

// Delete route (Admin only)
export const deleteRoute = async (req, res, next) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Route deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
