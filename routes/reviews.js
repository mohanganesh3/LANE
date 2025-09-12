/**
 * Review Routes
 */

const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { isAuthenticated } = require('../middleware/auth');
const {
    validateReview,
    handleValidationErrors
} = require('../middleware/validation');

// Show Review Page
router.get('/booking/:bookingId',
    isAuthenticated,
    reviewController.showReviewPage
);

// Submit Review
router.post('/booking/:bookingId',
    isAuthenticated,
    validateReview,
    handleValidationErrors,
    reviewController.submitReview
);

// Get User Reviews
router.get('/user/:userId', reviewController.getUserReviews);

// Get User Review Statistics
router.get('/user/:userId/stats', reviewController.getUserReviewStats);

// Report Review
router.post('/:reviewId/report',
    isAuthenticated,
    reviewController.reportReview
);

// Delete Review
router.delete('/:reviewId',
    isAuthenticated,
    reviewController.deleteReview
);

module.exports = router;
