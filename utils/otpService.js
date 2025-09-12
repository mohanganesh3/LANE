/**
 * OTP Service
 * Generates and verifies One-Time Passwords for pickup/dropoff verification
 */

const crypto = require('crypto');

/**
 * Generate a random 4-digit OTP
 * @returns {string} 4-digit OTP
 */
const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

/**
 * Generate OTP without expiry (valid indefinitely)
 * @param {number} validityMinutes - DEPRECATED: No longer used, kept for backward compatibility
 * @returns {Object} { code, expiresAt, verified }
 */
const generateOTPWithExpiry = (validityMinutes = 15) => {
    const code = generateOTP();
    // Set expiry to far future (100 years) - effectively no expiry
    const expiresAt = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000);
    
    return {
        code,
        expiresAt,
        verified: false
    };
};

/**
 * Verify OTP (without expiry check)
 * @param {string} inputOTP - OTP entered by user
 * @param {Object} storedOTP - Stored OTP object { code, expiresAt, verified }
 * @returns {Object} { valid: boolean, reason: string }
 */
const verifyOTP = (inputOTP, storedOTP) => {
    // Check if OTP exists
    if (!storedOTP || !storedOTP.code) {
        return {
            valid: false,
            reason: 'NO_OTP_GENERATED'
        };
    }
    
    // Check if already verified
    if (storedOTP.verified) {
        return {
            valid: false,
            reason: 'ALREADY_VERIFIED'
        };
    }
    
    // ⚠️ EXPIRY CHECK REMOVED - OTPs are now valid indefinitely
    // if (new Date() > new Date(storedOTP.expiresAt)) {
    //     return {
    //         valid: false,
    //         reason: 'EXPIRED'
    //     };
    // }
    
    // Check if OTP matches
    if (inputOTP !== storedOTP.code) {
        return {
            valid: false,
            reason: 'INVALID_OTP'
        };
    }
    
    // All checks passed
    return {
        valid: true,
        reason: 'VERIFIED'
    };
};

/**
 * Check if OTP is expired (always returns false now - OTPs never expire)
 * @param {Object} otp - OTP object
 * @returns {boolean}
 */
const isOTPExpired = (otp) => {
    // OTPs no longer expire
    return false;
};

/**
 * Format OTP for display (e.g., 1234 -> "1 2 3 4")
 * @param {string} otp - OTP code
 * @returns {string}
 */
const formatOTP = (otp) => {
    return otp.split('').join(' ');
};

/**
 * Mask OTP for security (e.g., 1234 -> "12**")
 * @param {string} otp - OTP code
 * @returns {string}
 */
const maskOTP = (otp) => {
    if (!otp || otp.length < 4) return '****';
    return otp.substring(0, 2) + '**';
};

/**
 * Generate secure OTP for sensitive operations (6-digit)
 * @returns {string}
 */
const generateSecureOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Get user-friendly error message for OTP verification failure
 * @param {string} reason - Reason code
 * @returns {string}
 */
const getOTPErrorMessage = (reason) => {
    const messages = {
        'NO_OTP_GENERATED': 'No OTP has been generated yet. Please wait for the driver to arrive.',
        'ALREADY_VERIFIED': 'This OTP has already been used.',
        'EXPIRED': 'This OTP has expired. Please request a new one.',
        'INVALID_OTP': 'Invalid OTP. Please check and try again.'
    };
    
    return messages[reason] || 'OTP verification failed. Please try again.';
};

/**
 * Regenerate expired OTP
 * @param {Object} oldOTP - Old OTP object
 * @param {number} validityMinutes - New validity in minutes
 * @returns {Object} New OTP object
 */
const regenerateOTP = (oldOTP, validityMinutes = 15) => {
    console.log('🔄 [OTP] Regenerating expired OTP');
    return generateOTPWithExpiry(validityMinutes);
};

module.exports = {
    generateOTP,
    generateOTPWithExpiry,
    verifyOTP,
    isOTPExpired,
    formatOTP,
    maskOTP,
    generateSecureOTP,
    getOTPErrorMessage,
    regenerateOTP
};
