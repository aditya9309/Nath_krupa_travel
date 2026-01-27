import HeroSection from '../models/HeroSection.js';

// Get hero section
export const getHeroSection = async (req, res) => {
  try {
    let heroSection = await HeroSection.findOne();
    
    if (!heroSection) {
      // Create default if doesn't exist
      heroSection = new HeroSection();
      await heroSection.save();
    }

    res.status(200).json({
      success: true,
      data: heroSection
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update hero section
export const updateHeroSection = async (req, res) => {
  try {
    const { title, subtitle, primaryButtonText, primaryButtonURL, secondaryButtonText, secondaryButtonURL, backgroundImage, isPrimaryButtonActive, isSecondaryButtonActive } = req.body;

    let heroSection = await HeroSection.findOne();
    
    if (!heroSection) {
      heroSection = new HeroSection();
    }

    if (title) heroSection.title = title;
    if (subtitle) heroSection.subtitle = subtitle;
    if (primaryButtonText) heroSection.primaryButtonText = primaryButtonText;
    if (primaryButtonURL) heroSection.primaryButtonURL = primaryButtonURL;
    if (secondaryButtonText) heroSection.secondaryButtonText = secondaryButtonText;
    if (secondaryButtonURL) heroSection.secondaryButtonURL = secondaryButtonURL;
    if (backgroundImage) heroSection.backgroundImage = backgroundImage;
    if (isPrimaryButtonActive !== undefined) heroSection.isPrimaryButtonActive = isPrimaryButtonActive;
    if (isSecondaryButtonActive !== undefined) heroSection.isSecondaryButtonActive = isSecondaryButtonActive;

    heroSection.createdBy = req.user._id;
    await heroSection.save();

    res.status(200).json({
      success: true,
      message: 'Hero section updated successfully',
      data: heroSection
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
