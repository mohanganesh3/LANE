/**
 * Review Controller
 * Handles two-way rating and review system
 */

const Review = require('../models/Review');
const User = require('../models/User');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * Show review page
 */
exports.showReviewPage = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
        .populate('passenger', 'profile profilePhoto')
        .populate({
            path: 'ride',
            populate: { path: 'rider', select: 'profile profilePhoto' }
        });

    if (!booking) {
        throw new AppError('Booking not found', 404);
    }

    // Check if ride is completed: status is COMPLETED OR (DROPPED_OFF/PICKED_UP and payment is PAID)
    const isPaymentPaid = booking.payment && booking.payment.status === 'PAID';
    const isDroppedOff = booking.status === 'DROPPED_OFF';
    const isPickedUp = booking.status === 'PICKED_UP';
    const isCompleted = booking.status === 'COMPLETED' || ((isDroppedOff || isPickedUp) && isPaymentPaid);

    if (!isCompleted) {
        throw new AppError('Can only review completed rides', 400);
    }

    // Check if user is part of this booking
    const isPassenger = booking.passenger._id.toString() === req.user._id.toString();
    const isRider = booking.ride.rider._id.toString() === req.user._id.toString();

    if (!isPassenger && !isRider) {
        throw new AppError('Not authorized', 403);
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({
        reviewer: req.user._id,
        reviewee: isPassenger ? booking.ride.rider._id : booking.passenger._id,
        booking: booking._id
    });

    if (existingReview) {
        throw new AppError('You have already reviewed this ride', 400);
    }

    const reviewee = isPassenger ? booking.ride.rider : booking.passenger;
    
    // Ensure name is available (compute from profile if virtual doesn't work)
    if (!reviewee.name && reviewee.profile) {
        reviewee.name = `${reviewee.profile.firstName} ${reviewee.profile.lastName}`.trim();
    }

    res.render('reviews/create', {
        title: `Review ${reviewee.name || 'User'} - LANE Carpool`,
        user: req.user,
        booking,
        reviewee,
        isPassenger
    });
});

/**
 * Submit review
 */
exports.submitReview = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const {
        revieweeId,
        rating,
        comment,
        punctuality,
        communication,
        cleanliness,
        driving,
        tags
    } = req.body;

    // ============================================
    // STEP 1: VALIDATE BOOKING EXISTS
    // ============================================
    const booking = await Booking.findById(bookingId).populate('ride');

    if (!booking) {
        throw new AppError(
            `❌ Booking Not Found: We couldn't find a booking with ID "${bookingId.substring(0, 8)}...". ` +
            `This booking may have been deleted or the ID is incorrect. Please go back to your bookings list and try again.`,
            404
        );
    }

    // ============================================
    // STEP 2: VERIFY BOOKING IS COMPLETED
    // ============================================
    const isPaymentPaid = booking.payment && booking.payment.status === 'PAID';
    const isDroppedOff = booking.status === 'DROPPED_OFF';
    const isPickedUp = booking.status === 'PICKED_UP';
    const isCompleted = booking.status === 'COMPLETED' || ((isDroppedOff || isPickedUp) && isPaymentPaid);

    if (!isCompleted) {
        const statusMessages = {
            'PENDING': 'The booking is still pending confirmation from the driver.',
            'CONFIRMED': 'The ride has been confirmed but not yet started.',
            'PICKUP_PENDING': 'The driver is on the way to pick you up.',
            'PICKED_UP': 'The ride is currently in progress. Payment needs to be completed first.',
            'DROPPED_OFF': 'You have been dropped off, but payment is still pending.',
            'CANCELLED': 'This booking was cancelled and cannot be reviewed.',
            'REJECTED': 'This booking was rejected and cannot be reviewed.'
        };
        
        const currentStatusMessage = statusMessages[booking.status] || `Current status: ${booking.status}`;
        
        throw new AppError(
            `⏳ Cannot Review Yet: You can only review rides that are fully completed. ${currentStatusMessage}\n\n` +
            `✅ To leave a review:\n` +
            `${!isCompleted && (booking.status === 'PICKED_UP' || booking.status === 'DROPPED_OFF') ? '• Complete the payment process\n' : ''}` +
            `${booking.status === 'CONFIRMED' || booking.status === 'PICKUP_PENDING' ? '• Wait for the ride to be completed\n' : ''}` +
            `${booking.status === 'PENDING' ? '• Wait for the driver to confirm the booking\n' : ''}` +
            `• The review option will appear once the ride is fully completed with payment confirmed.`,
            400
        );
    }

    // ============================================
    // STEP 3: VERIFY USER AUTHORIZATION
    // ============================================
    const isPassenger = booking.passenger.toString() === req.user._id.toString();
    const isRider = booking.ride.rider.toString() === req.user._id.toString();

    if (!isPassenger && !isRider) {
        throw new AppError(
            `🚫 Unauthorized: You cannot review this ride because you were not part of it. ` +
            `Only the passenger (${booking.passenger}) or the driver (${booking.ride.rider}) can leave a review. ` +
            `Your user ID: ${req.user._id}. If you believe this is an error, please contact support.`,
            403
        );
    }

    // ============================================
    // STEP 4: VERIFY REVIEWEE IS CORRECT
    // ============================================
    const expectedRevieweeId = isPassenger ? booking.ride.rider.toString() : booking.passenger.toString();
    
    if (revieweeId !== expectedRevieweeId) {
        const userRole = isPassenger ? 'passenger' : 'driver';
        const revieweeRole = isPassenger ? 'driver' : 'passenger';
        
        throw new AppError(
            `⚠️ Invalid Reviewee: There's a mismatch in who you're trying to review. ` +
            `You are the ${userRole} in this ride, so you should be reviewing the ${revieweeRole}. ` +
            `Expected reviewee ID: ${expectedRevieweeId.substring(0, 8)}..., but received: ${revieweeId.substring(0, 8)}... ` +
            `Please refresh the page and try again. If this persists, contact support.`,
            400
        );
    }

    // ============================================
    // STEP 5: CHECK FOR DUPLICATE REVIEW
    // ============================================
    const existingReview = await Review.findOne({
        reviewer: req.user._id,
        reviewee: revieweeId,
        booking: booking._id
    });

    if (existingReview) {
        const reviewDate = new Date(existingReview.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        throw new AppError(
            `✅ Already Reviewed: You have already submitted a review for this ride on ${reviewDate}. ` +
            `Each ride can only be reviewed once to ensure authenticity. ` +
            `Your review (${existingReview.ratings.overall}⭐) is already published and contributing to the ${isPassenger ? 'driver' : 'passenger'}'s rating. ` +
            `If you need to update or remove your review, please contact support.`,
            400
        );
    }

    // Determine review type
    const reviewType = isPassenger ? 'DRIVER_REVIEW' : 'PASSENGER_REVIEW';
    
    // ============================================
    // STEP 6: PARSE AND VALIDATE TAGS
    // ============================================
    let parsedTags = [];
    if (tags) {
        try {
            parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
            // Convert tags to uppercase with underscores (e.g., "Friendly" -> "FRIENDLY")
            parsedTags = Array.isArray(parsedTags) ? parsedTags.map(tag => 
                tag.toUpperCase().replace(/\s+/g, '_')
            ) : [];
        } catch (e) {
            parsedTags = [];
        }
    }
    
    // Create review with correct schema structure
    const review = await Review.create({
        reviewer: req.user._id,
        reviewee: revieweeId,
        booking: booking._id,
        type: reviewType, // ✅ Required field
        ratings: {
            overall: parseFloat(rating), // ✅ Nested under ratings
            categories: {
                punctuality: punctuality ? parseFloat(punctuality) : undefined,
                communication: communication ? parseFloat(communication) : undefined,
                cleanliness: cleanliness ? parseFloat(cleanliness) : undefined,
                driving: driving ? parseFloat(driving) : undefined,
                friendliness: undefined,
                respectfulness: undefined
            }
        },
        tags: parsedTags, // ✅ Must match enum values
        comment: comment || ''
    });

    // Update user's rating statistics
    const ratingStats = await Review.calculateUserRating(revieweeId);
    
    // Update the User document with new rating
    await User.findByIdAndUpdate(revieweeId, {
        'rating.overall': ratingStats.avgRating || 0,
        'rating.totalRatings': ratingStats.totalReviews || 0
    });

    // Mark booking as reviewed
    if (isPassenger) {
        booking.reviews.passengerReviewed = true;
    } else {
        booking.reviews.riderReviewed = true;
    }
    await booking.save();

    // Get reviewer name safely
    const reviewerName = User.getUserName(req.user);

    // Send notification
    await Notification.create({
        user: revieweeId,
        type: 'REVIEW_RECEIVED',
        title: 'New Review Received! ⭐',
        message: `${reviewerName} rated you ${rating} stars`,
        data: {
            reviewId: review._id,
            bookingId: booking._id
        }
    });

    // Send real-time notification
    const io = req.app.get('io');
    if (io) {
        io.to(`user-${revieweeId}`).emit('notification', {
            type: 'REVIEW_RECEIVED',
            title: 'New Review Received! ⭐',
            message: `${reviewerName} gave you ${rating} stars`,
            data: {
                reviewId: review._id,
                bookingId: booking._id
            },
            timestamp: new Date()
        });
    }

    res.status(201).json({
        success: true,
        message: 'Review submitted successfully! Thank you for your feedback.',
        review,
        redirectUrl: `/bookings/${bookingId}`
    });
});

/**
 * Get reviews for a user
 */
exports.getUserReviews = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    const mongoose = require('mongoose');

    const totalReviews = await Review.countDocuments({ reviewee: userId, isPublished: true });
    const reviews = await Review.find({ reviewee: userId, isPublished: true })
        .populate('reviewer', 'profile profilePhoto rating')
        .populate('booking', 'bookingReference')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    // Calculate rating breakdown - Fixed ObjectId usage
    const ratingBreakdown = await Review.aggregate([
        { 
            $match: { 
                reviewee: new mongoose.Types.ObjectId(userId), // ✅ Fixed
                isPublished: true 
            } 
        },
        {
            $group: {
                _id: '$ratings.overall', // ✅ Fixed: Use ratings.overall
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: -1 } }
    ]);

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratingBreakdown.forEach(item => {
        breakdown[Math.floor(item._id)] = item.count;
    });

    res.status(200).json({
        success: true,
        totalReviews,
        reviews,
        ratingBreakdown: breakdown,
        currentPage: page,
        totalPages: Math.ceil(totalReviews / limit)
    });
});

/**
 * Report review
 */
exports.reportReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const { reason } = req.body;

    const review = await Review.findById(reviewId);

    if (!review) {
        throw new AppError('Review not found', 404);
    }

    // Only the reviewee can report
    if (review.reviewee.toString() !== req.user._id.toString()) {
        throw new AppError('Not authorized', 403);
    }

    // Add to reported list
    review.reportedBy.push({
        user: req.user._id,
        reason: reason || 'Inappropriate content',
        reportedAt: new Date()
    });
    review.reportedCount = (review.reportedCount || 0) + 1;
    
    // Auto-hide if multiple reports (e.g., 3 or more)
    if (review.reportedCount >= 3) {
        review.isPublished = false;
    }
    
    await review.save();

    // Create report in Report system
    const Report = require('../models/Report');
    await Report.create({
        reporter: req.user._id,
        reported: review.reviewer,
        category: 'INAPPROPRIATE_REVIEW',
        description: reason || 'Inappropriate content',
        relatedReview: review._id
    });

    res.status(200).json({
        success: true,
        message: 'Review reported successfully. Admin will review it.'
    });
});

/**
 * Delete review (by admin or review owner)
 */
exports.deleteReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
        throw new AppError('Review not found', 404);
    }

    // Check authorization
    const isReviewer = review.reviewer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isReviewer && !isAdmin) {
        throw new AppError('Not authorized', 403);
    }

    await review.deleteOne();

    // Recalculate user rating and update cache on User
    const updatedStats = await Review.calculateUserRating(review.reviewee);
    await User.findByIdAndUpdate(review.reviewee, {
        'rating.overall': updatedStats.avgRating || 0,
        'rating.totalRatings': updatedStats.totalReviews || 0,
        'rating.breakdown.fiveStar': updatedStats.fiveStar || 0,
        'rating.breakdown.fourStar': updatedStats.fourStar || 0,
        'rating.breakdown.threeStar': updatedStats.threeStar || 0,
        'rating.breakdown.twoStar': updatedStats.twoStar || 0,
        'rating.breakdown.oneStar': updatedStats.oneStar || 0
    });

    res.status(200).json({
        success: true,
        message: 'Review deleted successfully'
    });
});

/**
 * Get review statistics for a user
 */
exports.getUserReviewStats = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const mongoose = require('mongoose');

    const stats = await Review.aggregate([
        { 
            $match: { 
                reviewee: new mongoose.Types.ObjectId(userId), // ✅ Fixed
                isPublished: true 
            } 
        },
        {
            $group: {
                _id: null,
                totalReviews: { $sum: 1 },
                averageRating: { $avg: '$ratings.overall' }, // ✅ Fixed path
                avgPunctuality: { $avg: '$ratings.categories.punctuality' }, // ✅ Fixed path
                avgCommunication: { $avg: '$ratings.categories.communication' }, // ✅ Fixed path
                avgCleanliness: { $avg: '$ratings.categories.cleanliness' }, // ✅ Fixed path
                avgDriving: { $avg: '$ratings.categories.driving' } // ✅ Fixed path
            }
        }
    ]);

    // Get most common tags
    const commonTags = await Review.aggregate([
        { 
            $match: { 
                reviewee: new mongoose.Types.ObjectId(userId), // ✅ Fixed
                isPublished: true 
            } 
        },
        { $unwind: '$tags' },
        {
            $group: {
                _id: '$tags',
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ]);

    res.status(200).json({
        success: true,
        stats: stats[0] || {},
        commonTags: commonTags.map(t => ({ tag: t._id, count: t.count }))
    });
});
