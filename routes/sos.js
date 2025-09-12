/**
 * SOS Emergency Routes
 */

const express = require('express');
const router = express.Router();
const sosController = require('../controllers/sosController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const { sosLimiter } = require('../middleware/rateLimiter');

// Show SOS Page
router.get('/trigger', isAuthenticated, sosController.showSOSPage);

// Trigger SOS Alert
router.post('/trigger',
    isAuthenticated,
    sosLimiter,
    sosController.triggerSOS
);

// Update SOS Location
router.post('/:emergencyId/location',
    isAuthenticated,
    sosController.updateSOSLocation
);

// Resolve Emergency
router.post('/:emergencyId/resolve',
    isAuthenticated,
    sosController.resolveEmergency
);

// Get Emergency Details
router.get('/:emergencyId',
    isAuthenticated,
    sosController.getEmergencyDetails
);

// Get Emergency History
router.get('/my/history',
    isAuthenticated,
    sosController.getEmergencyHistory
);

module.exports = router;
