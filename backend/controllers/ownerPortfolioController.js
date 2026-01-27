import OwnerPortfolio from '../models/OwnerPortfolio.js';

// Get owner portfolio
export const getOwnerPortfolio = async (req, res) => {
  try {
    let portfolio = await OwnerPortfolio.findOne().populate('createdBy', 'name email');
    
    if (!portfolio) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'Portfolio not created yet'
      });
    }

    res.status(200).json({
      success: true,
      data: portfolio
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create or update owner portfolio
export const createOrUpdateOwnerPortfolio = async (req, res) => {
  try {
    const { profileImage, ownerName, designation, bio, socialLinks, isActive } = req.body;

    if (!profileImage || !ownerName || !designation || !bio) {
      return res.status(400).json({
        success: false,
        message: 'Profile image, owner name, designation, and bio are required'
      });
    }

    let portfolio = await OwnerPortfolio.findOne();
    
    if (!portfolio) {
      portfolio = new OwnerPortfolio();
    }

    portfolio.profileImage = profileImage;
    portfolio.ownerName = ownerName;
    portfolio.designation = designation;
    portfolio.bio = bio;
    if (socialLinks) portfolio.socialLinks = socialLinks;
    if (isActive !== undefined) portfolio.isActive = isActive;
    portfolio.createdBy = req.user._id;

    await portfolio.save();

    res.status(200).json({
      success: true,
      message: 'Owner portfolio updated successfully',
      data: portfolio
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete portfolio
export const disableOwnerPortfolio = async (req, res) => {
  try {
    let portfolio = await OwnerPortfolio.findOne();
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    await OwnerPortfolio.deleteOne({ _id: portfolio._id });

    res.status(200).json({
      success: true,
      message: 'Portfolio deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
