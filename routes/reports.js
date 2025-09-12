/**
 * Report Routes
 */

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { isAuthenticated } = require('../middleware/auth');
const {
    validateReport,
    handleValidationErrors
} = require('../middleware/validation');

// Show Report Page
router.get('/create', isAuthenticated, reportController.showReportPage);

// Submit Report
router.post('/create',
    isAuthenticated,
    validateReport,
    handleValidationErrors,
    reportController.submitReport
);

// My Reports (specific routes MUST come before parameterized routes)
router.get('/my-reports', isAuthenticated, reportController.showMyReports);
router.get('/my/reports', isAuthenticated, reportController.getMyReports);

// Report Details (parameterized route comes LAST)
router.get('/:reportId', isAuthenticated, reportController.getReportDetails);

module.exports = router;
