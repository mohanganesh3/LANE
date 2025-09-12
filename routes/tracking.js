/**
 * Tracking Routes
 * Real-time ride tracking functionality
 */

const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');
const { isAuthenticated } = require('../middleware/auth');

// All tracking routes require authentication
router.use(isAuthenticated);

/**
 * Show live tracking page
 * GET /tracking/:bookingId
 */
router.get('/:bookingId', trackingController.showTrackingPage);

/**
 * Get current tracking data (API)
 * GET /api/tracking/:bookingId
 */
router.get('/api/:bookingId', trackingController.getTrackingData);

/**
 * Update driver location (API)
 * POST /api/tracking/:rideId/location
 */
router.post('/api/:rideId/location', trackingController.updateLocation);

module.exports = router;
