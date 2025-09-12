/**
 * Authentication Routes
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { loginLimiter, registerLimiter, otpLimiter } = require('../middleware/rateLimiter');
const {
    validateRegistration,
    validateLogin,
    validateOTP,
    validatePasswordChange,
    validateForgotPassword,
    validateResetPassword,
    handleValidationErrors
} = require('../middleware/validation');
const { isAuthenticated } = require('../middleware/auth');

// Registration
router.get('/register', authController.showRegisterPage);
router.post('/register',
    registerLimiter,
    validateRegistration,
    handleValidationErrors,
    authController.register
);

// OTP Verification
router.get('/verify-otp', authController.showVerifyOTPPage);
router.post('/verify-otp',
    otpLimiter,
    validateOTP,
    handleValidationErrors,
    authController.verifyOTP
);
router.post('/resend-otp',
    otpLimiter,
    authController.resendOTP
);

// Login
router.get('/login', authController.showLoginPage);
router.post('/login',
    loginLimiter,
    validateLogin,
    handleValidationErrors,
    authController.login
);

// Logout
router.get('/logout', isAuthenticated, authController.logout);
router.post('/logout', isAuthenticated, authController.logout);

// Forgot Password
router.get('/forgot-password', authController.showForgotPasswordPage);
router.post('/forgot-password',
    otpLimiter,
    validateForgotPassword,
    handleValidationErrors,
    authController.forgotPassword
);

// Reset Password
router.get('/reset-password', authController.showResetPasswordPage);
router.post('/reset-password',
    validateResetPassword,
    handleValidationErrors,
    authController.resetPassword
);

// Change Password (for logged-in users)
router.get('/change-password',
    isAuthenticated,
    authController.showChangePasswordPage
);
router.post('/change-password',
    isAuthenticated,
    validatePasswordChange,
    handleValidationErrors,
    authController.changePassword
);

module.exports = router;
