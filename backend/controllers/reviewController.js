import Review from '../models/Review.js';

// Get all reviews (public - all visible reviews, no approval needed)
export const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ isVisible: true })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

// Get all reviews (admin - all reviews)
export const getAllReviewsAdmin = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('userId', 'name email')
      .populate('packageId', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

// Create review
export const createReview = async (req, res, next) => {
  try {
    const { rating, comment, title } = req.body;
    const userId = req.user._id;

    // Validation
    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Rating and comment are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    if (comment.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Comment must be at least 10 characters'
      });
    }

    const review = new Review({
      userId,
      rating,
      title: title || `${rating}-star review`,
      comment,
      isApproved: true, // Auto-approve, no admin approval needed
      isVisible: true,
      bookingId: null,
      packageId: null
    });

    await review.save();

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully! Pending admin approval.',
      review
    });
  } catch (error) {
    next(error);
  }
};

// Approve review (admin only)
export const approveReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndUpdate(
      id,
      { isApproved: true },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Review approved',
      review
    });
  } catch (error) {
    next(error);
  }
};

// Delete review (admin only)
export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Toggle visibility (admin only)
export const toggleReviewVisibility = async (req, res, next) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.isVisible = !review.isVisible;
    await review.save();

    res.status(200).json({
      success: true,
      message: `Review ${review.isVisible ? 'shown' : 'hidden'}`,
      review
    });
  } catch (error) {
    next(error);
  }
};
