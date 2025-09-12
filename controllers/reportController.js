/**
 * Report Controller
 * Handles user reports and dispute resolution
 */

const Report = require('../models/Report');
const User = require('../models/User');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * Show report page
 */
exports.showReportPage = asyncHandler(async (req, res) => {
    const { userId, rideId, bookingId } = req.query;

    let reportedUser = null;
    let ride = null;
    let booking = null;

    if (userId) {
        reportedUser = await User.findById(userId, 'profile profilePhoto');
    }

    if (rideId) {
        ride = await Ride.findById(rideId).populate('rider', 'profile profilePhoto');
    }

    if (bookingId) {
        booking = await Booking.findById(bookingId)
            .populate('passenger', 'profile profilePhoto')
            .populate({
                path: 'ride',
                populate: { path: 'rider', select: 'profile profilePhoto' }
            });
    }

    res.render('reports/create', {
        title: 'Report User - LANE Carpool',
        user: req.user,
        reportedUser,
        ride,
        booking
    });
});

/**
 * Submit report
 */
exports.submitReport = asyncHandler(async (req, res) => {
    const {
        reportedUserId,
        rideId,
        bookingId,
        category,
        description,
        severity,
        requestRefund
    } = req.body;

    // Verify reported user exists
    const reportedUser = await User.findById(reportedUserId);
    if (!reportedUser) {
        throw new AppError('Reported user not found', 404);
    }

    // Cannot report yourself
    if (reportedUserId === req.user._id.toString()) {
        throw new AppError('Cannot report yourself', 400);
    }

    // Verify relationship (must have booking/ride together)
    let hasRelationship = false;
    if (rideId) {
        const ride = await Ride.findById(rideId);
        if (ride) {
            hasRelationship = ride.rider.toString() === req.user._id.toString() ||
                              ride.rider.toString() === reportedUserId;
        }
    }

    if (bookingId) {
        const booking = await Booking.findById(bookingId).populate('ride');
        if (booking) {
            hasRelationship = booking.passenger.toString() === req.user._id.toString() ||
                             booking.ride.rider.toString() === req.user._id.toString();
        }
    }

    if (!hasRelationship) {
        throw new AppError('You can only report users you have interacted with', 403);
    }

    // Create report
    const report = await Report.create({
        reporter: req.user._id,
        reportedUser: reportedUserId,
        ride: rideId || undefined,
        booking: bookingId || undefined,
        category,
        description,
        severity: severity || 'MEDIUM',
        refundRequested: requestRefund === 'true'
    });

    // Get reporter and reported user names safely
    const reporterName = User.getUserName(req.user);
    const reportedName = User.getUserName(reportedUser);

    // Notify admins
    const admins = await User.find({ role: 'ADMIN' });
    for (const admin of admins) {
        await Notification.create({
            user: admin._id,
            type: 'NEW_REPORT',
            title: 'New Report Filed',
            message: `${reporterName} reported ${reportedName}`,
            priority: severity === 'HIGH' ? 'HIGH' : 'MEDIUM',
            data: {
                reportId: report._id,
                category
            }
        });
    }

    res.status(201).json({
        success: true,
        message: 'Report submitted successfully. Admin will review within 24 hours.',
        report,
        redirectUrl: '/user/dashboard'
    });
});

/**
 * Get user's reports
 */
exports.getMyReports = asyncHandler(async (req, res) => {
    const reports = await Report.find({
        reporter: req.user._id
    })
    .populate('reportedUser', 'profile profilePhoto')
    .populate('ride', 'route')
    .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: reports.length,
        reports
    });
});

/**
 * Show my reports page
 */
exports.showMyReports = asyncHandler(async (req, res) => {
    const reports = await Report.find({
        reporter: req.user._id
    })
    .populate('reportedUser', 'profile profilePhoto')
    .populate('ride', 'route')
    .sort({ createdAt: -1 });

    res.render('reports/my-reports', {
        title: 'My Reports - LANE Carpool',
        user: req.user,
        reports
    });
});

/**
 * Get report details
 */
exports.getReportDetails = asyncHandler(async (req, res) => {
    const { reportId } = req.params;

    const report = await Report.findById(reportId)
        .populate('reporter', 'profile email phone profilePhoto')
        .populate('reportedUser', 'profile email phone profilePhoto')
        .populate('ride')
        .populate('booking')
        .populate('adminReview.reviewedBy', 'profile');

    if (!report) {
        throw new AppError('Report not found', 404);
    }

    // Check authorization
    const isReporter = report.reporter._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isReporter && !isAdmin) {
        throw new AppError('Not authorized', 403);
    }

    res.status(200).json({
        success: true,
        report
    });
});

module.exports = exports;
