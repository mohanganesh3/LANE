/**
 * User Model
 * Stores user information for both Riders and Passengers
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    // Basic Information
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    role: {
        type: String,
        enum: ['PASSENGER', 'RIDER', 'ADMIN'],
        required: true
    },
    
    // Verification Status
    verificationStatus: {
        type: String,
        enum: ['PENDING', 'VERIFIED', 'REJECTED', 'UNDER_REVIEW'],
        default: 'PENDING'
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    phoneVerified: {
        type: Boolean,
        default: false
    },
    
    // Profile Information
    profile: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        photo: { type: String, default: '/images/default-avatar.png' },
        bio: { type: String, maxlength: 500 },
        dateOfBirth: Date,
        gender: {
            type: String,
            enum: ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']
        },
        address: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: { type: String, default: 'India' }
        }
    },
    
    // Documents (for Riders)
    documents: {
        driverLicense: {
            number: String,
            frontImage: String,
            backImage: String,
            expiryDate: Date,
            verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            verifiedAt: Date,
            status: {
                type: String,
                enum: ['PENDING', 'APPROVED', 'REJECTED'],
                default: 'PENDING'
            }
        },
        governmentId: {
            type: { type: String, enum: ['AADHAAR', 'PAN', 'PASSPORT'] },
            number: String,
            frontImage: String,
            backImage: String,
            verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            verifiedAt: Date,
            status: {
                type: String,
                enum: ['PENDING', 'APPROVED', 'REJECTED'],
                default: 'PENDING'
            }
        },
        insurance: {
            number: String,
            document: String,
            expiryDate: Date,
            verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            verifiedAt: Date,
            status: {
                type: String,
                enum: ['PENDING', 'APPROVED', 'REJECTED'],
                default: 'PENDING'
            }
        }
    },
    
    // Vehicles (for Riders - can have multiple)
    vehicles: [{
        make: String,
        model: String,
        year: Number,
        color: String,
        licensePlate: { type: String, unique: true, sparse: true },
        photos: [String],
        seats: Number,
        vehicleType: {
            type: String,
            enum: ['SEDAN', 'SUV', 'HATCHBACK', 'MPV', 'VAN', 'LUXURY', 'MOTORCYCLE', 'AUTO']
        },
        emissionFactor: { type: Number, default: 120 }, // g CO2/km
        isDefault: { type: Boolean, default: false },
        registrationDocument: String,
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        verifiedAt: Date,
        status: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'REJECTED'],
            default: 'PENDING'
        }
    }],
    
    // Emergency Contacts
    emergencyContacts: [{
        name: { type: String, required: true },
        relationship: String,
        phone: { type: String, required: true },
        email: String,
        isPrimary: { type: Boolean, default: false },
        verified: { type: Boolean, default: false }
    }],
    
    // Rating System
    rating: {
        overall: { type: Number, default: 0, min: 0, max: 5 },
        totalRatings: { type: Number, default: 0 },
        breakdown: {
            fiveStar: { type: Number, default: 0 },
            fourStar: { type: Number, default: 0 },
            threeStar: { type: Number, default: 0 },
            twoStar: { type: Number, default: 0 },
            oneStar: { type: Number, default: 0 }
        }
    },
    
    // Statistics
    statistics: {
        totalRidesPosted: { type: Number, default: 0 },
        totalRidesTaken: { type: Number, default: 0 },
        completedRides: { type: Number, default: 0 },
        cancelledRides: { type: Number, default: 0 },
        totalEarnings: { type: Number, default: 0 },
        totalSpent: { type: Number, default: 0 },
        carbonSaved: { type: Number, default: 0 }, // in kg
        totalDistance: { type: Number, default: 0 } // in km
    },
    
    // Preferences
    preferences: {
        notifications: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: true },
            push: { type: Boolean, default: true }
        },
        privacy: {
            showPhone: { type: Boolean, default: false },
            showEmail: { type: Boolean, default: false }
        },
        language: { type: String, default: 'en' },
        currency: { type: String, default: 'INR' }
    },
    
    // Security
    loginAttempts: { type: Number, default: 0 },
    lockoutUntil: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    otpCode: String,
    otpExpires: Date,
    resetPasswordOTP: String,
    resetPasswordOTPExpires: Date,
    
    // Account Status
    accountStatus: {
        type: String,
        enum: ['ACTIVE', 'SUSPENDED', 'DELETED', 'INACTIVE'],
        default: 'ACTIVE'
    },
    isActive: { type: Boolean, default: true },
    isSuspended: { type: Boolean, default: false },
    suspensionReason: String,
    suspendedAt: Date,
    suspendedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastLogin: Date,
    
    // Reactivation tracking (after appeal)
    reactivatedAt: Date,
    reactivatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    appealNotes: String, // Admin notes about appeal decision
    
    // Deletion tracking
    deletedAt: Date,
    deletionReason: String,
    
    // Account status history (for audit trail)
    accountStatusHistory: [{
        status: String,
        reason: String,
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        changedAt: { type: Date, default: Date.now }
    }]

}, {
    timestamps: true // Adds createdAt and updatedAt
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ verificationStatus: 1 });
userSchema.index({ 'rating.overall': -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
userSchema.methods.toPublicJSON = function() {
    return {
        id: this._id,
        name: `${this.profile.firstName} ${this.profile.lastName}`,
        photo: this.profile.photo,
        role: this.role,
        rating: this.rating.overall,
        totalRatings: this.rating.totalRatings,
        verified: this.verificationStatus === 'VERIFIED',
        memberSince: this.createdAt
    };
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
    return `${this.profile.firstName} ${this.profile.lastName}`;
});

// Virtual for name (alias for fullName)
userSchema.virtual('name').get(function() {
    return `${this.profile.firstName} ${this.profile.lastName}`.trim();
});

// Static method to safely get user name from any user object (even plain objects from .lean())
userSchema.statics.getUserName = function(userObj) {
    const sanitize = (s) => (s || '').toString().trim();
    const looksInvalid = (s) => {
        const v = sanitize(s);
        // Treat empty, whitespace, and strings containing 'undefined'/'null' as invalid
        return !v || /undefined|null/i.test(v);
    };

    if (!userObj) {
        console.log('⚠️  [getUserName] User object is null/undefined');
        return 'Unknown User';
    }

    // Prefer explicit profile fields when present
    if (userObj.profile) {
        const firstName = sanitize(userObj.profile.firstName);
        const lastName = sanitize(userObj.profile.lastName);
        const full = `${firstName} ${lastName}`.trim();
        if (!looksInvalid(full)) return full;
    }

    // If it's a Mongoose document with the virtual
    if (typeof userObj.name === 'string' && !looksInvalid(userObj.name)) {
        return sanitize(userObj.name);
    }

    // Some objects might have fullName instead
    if (typeof userObj.fullName === 'string' && !looksInvalid(userObj.fullName)) {
        return sanitize(userObj.fullName);
    }

    // Fallbacks: derive from email/phone if available
    if (userObj.email && typeof userObj.email === 'string') {
        const local = userObj.email.split('@')[0].replace(/[._-]+/g, ' ').trim();
        if (local) return local.charAt(0).toUpperCase() + local.slice(1);
    }
    if (userObj.phone && typeof userObj.phone === 'string') {
        const last4 = userObj.phone.slice(-4);
        return `User • ${last4}`;
    }

    // If only _id is populated (not fully populated)
    if (userObj._id && !userObj.profile) {
        console.log('⚠️  [getUserName] User not fully populated - only ID:', userObj._id);
    } else {
        console.log('⚠️  [getUserName] Fallback reached - userObj:', JSON.stringify(userObj));
    }
    return 'Unknown User';
};

// Instance method to get name safely
userSchema.methods.getName = function() {
    return `${this.profile.firstName || ''} ${this.profile.lastName || ''}`.trim() || 'Unknown User';
};

// Ensure virtuals are included in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
