import Package from '../models/Package.js';
import { packageSchema } from '../utils/validation.js';

// Get all packages
export const getAllPackages = async (req, res, next) => {
  try {
    const { category, search, isActive } = req.query;
    const query = {};

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const packages = await Package.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: packages.length,
      packages
    });
  } catch (error) {
    next(error);
  }
};

// Get single package
export const getPackage = async (req, res, next) => {
  try {
    const packageData = await Package.findById(req.params.id);

    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    res.status(200).json({
      success: true,
      package: packageData
    });
  } catch (error) {
    next(error);
  }
};

// Create package (Admin only) - with auto category and packageType assignment
export const createPackage = async (req, res, next) => {
  try {
    const { category, packageType } = req.query;
    
    // Validate category is provided
    const validCategories = ['domestic', 'group', 'religious', 'student', 'summer-special', 'honeymoon'];
    if (!category || !validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Valid category is required. Must be one of: ' + validCategories.join(', ')
      });
    }

    // Validate packageType if provided
    const validPackageTypes = ['domestic', 'religious', 'student', 'honeymoon'];
    const finalPackageType = packageType && validPackageTypes.includes(packageType) 
      ? packageType 
      : category.split('-')[0]; // fallback to first part of category

    // Prepare package data with auto-assigned category and packageType
    const packageData = {
      ...req.body,
      category: category,
      packageType: finalPackageType
    };

    // Validate duration fields
    if (!packageData.duration || !packageData.duration.days || !packageData.duration.nights) {
      return res.status(400).json({
        success: false,
        message: 'Duration with days and nights is required'
      });
    }

    // Validate required fields
    if (!packageData.title || !packageData.basePrice || !packageData.maxGroupSize || !packageData.bannerImage) {
      return res.status(400).json({
        success: false,
        message: 'Title, basePrice, maxGroupSize, and bannerImage are required'
      });
    }

    const newPackage = await Package.create(packageData);

    res.status(201).json({
      success: true,
      message: `Package created successfully in ${category} category`,
      package: newPackage
    });
  } catch (error) {
    next(error);
  }
};

// Update package (Admin only)
export const updatePackage = async (req, res, next) => {
  try {
    const { error, value } = packageSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const packageData = await Package.findByIdAndUpdate(
      req.params.id,
      value,
      { new: true, runValidators: true }
    );

    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Package updated successfully',
      package: packageData
    });
  } catch (error) {
    next(error);
  }
};

// Delete package (Admin only)
export const deletePackage = async (req, res, next) => {
  try {
    const packageData = await Package.findByIdAndDelete(req.params.id);

    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Package deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
