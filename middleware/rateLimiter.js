/**
 * Rate Limiting Middleware
 * Prevents abuse and brute force attacks
 */

const rateLimit = require('express-rate-limit');

// General API rate limiter
exports.apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Strict rate limiter for login attempts
exports.loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login requests per windowMs
    message: {
        success: false,
        message: 'Too many login attempts, please try again after 15 minutes.'
    },
    skipSuccessfulRequests: true, // Don't count successful logins
});

// Rate limiter for registration
exports.registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 registrations per hour
    message: {
        success: false,
        message: 'Too many accounts created from this IP, please try again after an hour.'
    }
});

// Rate limiter for OTP requests
exports.otpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 3, // Limit each IP to 3 OTP requests per 5 minutes
    message: {
        success: false,
        message: 'Too many OTP requests, please try again after 5 minutes.'
    }
});

// Rate limiter for SOS alerts
exports.sosLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Limit to 5 SOS alerts per minute (to prevent spam)
    message: {
        success: false,
        message: 'SOS alert rate limit exceeded. Please wait before triggering another alert.'
    }
});

// Rate limiter for file uploads
exports.uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit to 20 uploads per hour
    message: {
        success: false,
        message: 'Too many file uploads, please try again later.'
    }
});

// Rate limiter for search queries
exports.searchLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // Limit to 30 searches per minute
    message: {
        success: false,
        message: 'Too many search requests, please slow down.'
    }
});

// Rate limiter for chat messages
exports.chatLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // Limit to 20 messages per minute
    message: {
        success: false,
        message: 'You are sending messages too quickly. Please slow down.'
    }
});
