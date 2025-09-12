/**
 * Emergency Contacts Routes
 * Manage user's emergency contacts for SOS alerts
 */

const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const User = require('../models/User');
const otpService = require('../utils/otpService');
const smsService = require('../utils/smsService');

// Show emergency contacts management page
router.get('/', isAuthenticated, (req, res) => {
    res.render('user/emergency-contacts', {
        title: 'Emergency Contacts - LANE Carpool',
        user: req.user
    });
});

// Get user's emergency contacts list (API)
router.get('/list', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({
            success: true,
            contacts: user.emergencyContacts || []
        });
    } catch (error) {
        console.error('Error fetching emergency contacts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load emergency contacts'
        });
    }
});

// Add new emergency contact
router.post('/add', isAuthenticated, async (req, res) => {
    try {
        const { name, relationship, phone, email, isPrimary } = req.body;

        // Validation
        if (!name || !relationship || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Name, relationship, and phone are required'
            });
        }

        const user = await User.findById(req.user._id);

        // Check maximum limit
        if (user.emergencyContacts.length >= 5) {
            return res.status(400).json({
                success: false,
                message: 'Maximum 5 emergency contacts allowed'
            });
        }

        // If setting as primary, unset other primary contacts
        if (isPrimary) {
            user.emergencyContacts.forEach(contact => {
                contact.isPrimary = false;
            });
        }

        // Add new contact
        user.emergencyContacts.push({
            name: name.trim(),
            relationship: relationship.trim(),
            phone: phone.trim(),
            email: email?.trim() || '',
            isPrimary: isPrimary || false,
            verified: false
        });

        await user.save();

        const newContact = user.emergencyContacts[user.emergencyContacts.length - 1];

        res.json({
            success: true,
            message: 'Emergency contact added successfully',
            contact: newContact
        });
    } catch (error) {
        console.error('Error adding emergency contact:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add emergency contact'
        });
    }
});

// Delete emergency contact
router.delete('/:contactId', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        const initialLength = user.emergencyContacts.length;
        user.emergencyContacts = user.emergencyContacts.filter(
            c => c._id.toString() !== req.params.contactId
        );

        if (user.emergencyContacts.length === initialLength) {
            return res.status(404).json({
                success: false,
                message: 'Emergency contact not found'
            });
        }

        await user.save();

        res.json({
            success: true,
            message: 'Emergency contact deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting emergency contact:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete emergency contact'
        });
    }
});

// Send verification OTP to emergency contact
router.post('/:contactId/send-verification', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const contact = user.emergencyContacts.id(req.params.contactId);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Emergency contact not found'
            });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store OTP in contact (temporary)
        contact.verificationOTP = otp;
        contact.verificationOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        // Send OTP via SMS
        try {
            await smsService.sendEmergencyContactVerification(contact.phone, {
                name: contact.name,
                otp: otp,
                userName: user.profile?.firstName || user.name
            });
        } catch (smsError) {
            console.error('Failed to send SMS:', smsError);
            // Don't fail the request - OTP is still generated
        }

        res.json({
            success: true,
            message: `Verification code sent to ${contact.phone}`
        });
    } catch (error) {
        console.error('Error sending verification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send verification code'
        });
    }
});

// Verify emergency contact with OTP
router.post('/:contactId/verify', isAuthenticated, async (req, res) => {
    try {
        const { otp } = req.body;

        if (!otp || otp.length !== 6) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification code'
            });
        }

        const user = await User.findById(req.user._id);
        const contact = user.emergencyContacts.id(req.params.contactId);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Emergency contact not found'
            });
        }

        if (!contact.verificationOTP) {
            return res.status(400).json({
                success: false,
                message: 'No verification code sent. Please request a new code.'
            });
        }

        if (contact.verificationOTPExpires < Date.now()) {
            return res.status(400).json({
                success: false,
                message: 'Verification code expired. Please request a new code.'
            });
        }

        if (contact.verificationOTP !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification code. Please try again.'
            });
        }

        // Verification successful
        contact.verified = true;
        contact.verificationOTP = undefined;
        contact.verificationOTPExpires = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Emergency contact verified successfully'
        });
    } catch (error) {
        console.error('Error verifying contact:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify contact'
        });
    }
});

// Set contact as primary
router.post('/:contactId/set-primary', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        // Unset all primary contacts
        user.emergencyContacts.forEach(contact => {
            contact.isPrimary = false;
        });

        // Set new primary
        const contact = user.emergencyContacts.id(req.params.contactId);
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Emergency contact not found'
            });
        }

        contact.isPrimary = true;
        await user.save();

        res.json({
            success: true,
            message: `${contact.name} is now your primary emergency contact`
        });
    } catch (error) {
        console.error('Error setting primary contact:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update primary contact'
        });
    }
});

// Update emergency contact
router.put('/:contactId', isAuthenticated, async (req, res) => {
    try {
        const { name, relationship, phone, email } = req.body;
        const user = await User.findById(req.user._id);
        const contact = user.emergencyContacts.id(req.params.contactId);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Emergency contact not found'
            });
        }

        // Update fields if provided
        if (name) contact.name = name.trim();
        if (relationship) contact.relationship = relationship.trim();
        if (phone && phone !== contact.phone) {
            contact.phone = phone.trim();
            contact.verified = false; // Need to re-verify if phone changed
        }
        if (email !== undefined) contact.email = email.trim();

        await user.save();

        res.json({
            success: true,
            message: 'Emergency contact updated successfully',
            contact
        });
    } catch (error) {
        console.error('Error updating emergency contact:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update emergency contact'
        });
    }
});

module.exports = router;
