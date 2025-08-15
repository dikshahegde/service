const express = require('express');
const Rating = require('../models/Rating');
const Cafe = require('../models/Cafe');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Add or update a rating
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { cafe, rating, review, aspects } = req.body;

    // Check if cafe exists
    const cafeDoc = await Cafe.findById(cafe);
    if (!cafeDoc) {
      return res.status(404).json({ message: 'Cafe not found' });
    }

    // Check if user has already rated this cafe
    let existingRating = await Rating.findOne({ user: req.user._id, cafe });

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.review = review;
      existingRating.aspects = aspects || existingRating.aspects;
      await existingRating.save();

      await updateCafeRating(cafe);

      res.json({
        message: 'Rating updated successfully',
        rating: existingRating
      });
    } else {
      // Create new rating
      const newRating = new Rating({
        user: req.user._id,
        cafe,
        rating,
        review,
        aspects: aspects || {}
      });

      await newRating.save();
      await updateCafeRating(cafe);

      res.status(201).json({
        message: 'Rating added successfully',
        rating: newRating
      });
    }
  } catch (error) {
    console.error('Add/Update rating error:', error);
    res.status(500).json({ message: 'Server error while processing rating' });
  }
});

// Get ratings for a cafe
router.get('/cafe/:cafeId', async (req, res) => {
  try {
    const { cafeId } = req.params;
    const { page = 1, limit = 10, sortBy = 'newest' } = req.query;

    // Check if cafe exists
    const cafe = await Cafe.findById(cafeId);
    if (!cafe) {
      return res.status(404).json({ message: 'Cafe not found' });
    }

    // Build sort
    let sort = {};
    switch (sortBy) {
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'highest':
        sort = { rating: -1 };
        break;
      case 'lowest':
        sort = { rating: 1 };
        break;
      case 'helpful':
        sort = { helpfulCount: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const ratings = await Rating.find({ cafe: cafeId })
      .populate('user', 'name avatar')
      .sort(sort)
      .skip(skip)
      .limit(limitNumber);

    const total = await Rating.countDocuments({ cafe: cafeId });

    // Calculate rating distribution
    const distribution = await Rating.aggregate([
      { $match: { cafe: cafe._id } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
      const found = distribution.find(d => d._id === rating);
      return {
        rating,
        count: found ? found.count : 0,
        percentage: total > 0 ? Math.round((found ? found.count : 0) / total * 100) : 0
      };
    });

    res.json({
      ratings,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(total / limitNumber),
        totalRatings: total,
        hasNext: pageNumber < Math.ceil(total / limitNumber),
        hasPrev: pageNumber > 1
      },
      summary: {
        averageRating: cafe.ratings.average,
        totalRatings: cafe.ratings.count,
        distribution: ratingDistribution
      }
    });
  } catch (error) {
    console.error('Get ratings error:', error);
    res.status(500).json({ message: 'Server error while fetching ratings' });
  }
});

// Get user's rating for a specific cafe
router.get('/user/:cafeId', authMiddleware, async (req, res) => {
  try {
    const { cafeId } = req.params;

    const rating = await Rating.findOne({ user: req.user._id, cafe: cafeId })
      .populate('cafe', 'name');

    if (!rating) {
      return res.status(404).json({ message: 'No rating found for this cafe' });
    }

    res.json(rating);
  } catch (error) {
    console.error('Get user rating error:', error);
    res.status(500).json({ message: 'Server error while fetching user rating' });
  }
});

// Get all ratings by a user
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const ratings = await Rating.find({ user: req.user._id })
      .populate('cafe', 'name images location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    const total = await Rating.countDocuments({ user: req.user._id });

    res.json({
      ratings,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(total / limitNumber),
        totalRatings: total,
        hasNext: pageNumber < Math.ceil(total / limitNumber),
        hasPrev: pageNumber > 1
      }
    });
  } catch (error) {
    console.error('Get user ratings error:', error);
    res.status(500).json({ message: 'Server error while fetching user ratings' });
  }
});

// Delete a rating
router.delete('/:ratingId', authMiddleware, async (req, res) => {
  try {
    const { ratingId } = req.params;

    const rating = await Rating.findById(ratingId);
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    // Check if the user owns this rating
    if (rating.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this rating' });
    }

    const cafeId = rating.cafe;
    await Rating.findByIdAndDelete(ratingId);
    await updateCafeRating(cafeId);

    res.json({ message: 'Rating deleted successfully' });
  } catch (error) {
    console.error('Delete rating error:', error);
    res.status(500).json({ message: 'Server error while deleting rating' });
  }
});

// Mark rating as helpful
router.post('/:ratingId/helpful', authMiddleware, async (req, res) => {
  try {
    const { ratingId } = req.params;

    const rating = await Rating.findById(ratingId);
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    // Check if user already marked this as helpful
    const alreadyHelpful = rating.helpful.some(
      h => h.user.toString() === req.user._id.toString()
    );

    if (alreadyHelpful) {
      // Remove helpful mark
      rating.helpful = rating.helpful.filter(
        h => h.user.toString() !== req.user._id.toString()
      );
    } else {
      // Add helpful mark
      rating.helpful.push({ user: req.user._id });
    }

    await rating.save();

    res.json({
      message: alreadyHelpful ? 'Helpful mark removed' : 'Marked as helpful',
      helpfulCount: rating.helpfulCount,
      isHelpful: !alreadyHelpful
    });
  } catch (error) {
    console.error('Toggle helpful error:', error);
    res.status(500).json({ message: 'Server error while toggling helpful' });
  }
});

// Helper function to update cafe rating
async function updateCafeRating(cafeId) {
  try {
    const ratings = await Rating.find({ cafe: cafeId });
    
    if (ratings.length === 0) {
      await Cafe.findByIdAndUpdate(cafeId, {
        'ratings.average': 0,
        'ratings.count': 0
      });
      return;
    }

    const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
    const averageRating = Math.round((totalRating / ratings.length) * 10) / 10;

    await Cafe.findByIdAndUpdate(cafeId, {
      'ratings.average': averageRating,
      'ratings.count': ratings.length
    });
  } catch (error) {
    console.error('Update cafe rating error:', error);
  }
}

module.exports = router;