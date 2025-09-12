/**
 * Report Model
 * Stores reports filed by users against other users
 */

const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    // Reporter and Reported User
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reportedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Related Booking
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    },
    
    // Report Category
    category: {
        type: String,
        required: true,
        enum: [
            'RECKLESS_DRIVING',
            'HARASSMENT',
            'INAPPROPRIATE_BEHAVIOR',
            'VEHICLE_MISMATCH',
            'SMOKING',
            'UNSAFE_VEHICLE',
            'ROUTE_DEVIATION',
            'OVERCHARGING',
            'FAKE_PROFILE',
            'NO_SHOW',
            'RUDE_BEHAVIOR',
            'VEHICLE_DAMAGE',
            'PAYMENT_DISPUTE',
            'OTHER'
        ]
    },
    
    // Severity
    severity: {
        type: String,
        required: true,
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        default: 'MEDIUM'
    },
    
    // Description
    description: {
        type: String,
        required: true,
        minlength: 50,
        maxlength: 1000
    },
    
    // Evidence (photos, screenshots)
    evidence: [String],
    
    // Status
    status: {
        type: String,
        enum: ['PENDING', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED', 'ESCALATED'],
        default: 'PENDING'
    },
    
    // Admin Review
    adminReview: {
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reviewedAt: Date,
        notes: String,
        action: {
            type: String,
            enum: [
                'NO_ACTION',
                'WARNING_ISSUED',
                'TEMPORARY_SUSPENSION',
                'PERMANENT_BAN',
                'REFUND_ISSUED',
                'FURTHER_INVESTIGATION'
            ]
        },
        actionDate: Date,
        actionDetails: String
    },
    
    // Refund Request
    refundRequested: {
        type: Boolean,
        default: false
    },
    refundAmount: Number,
    refundStatus: {
        type: String,
        enum: ['NOT_REQUESTED', 'PENDING', 'APPROVED', 'REJECTED', 'PROCESSED']
    },
    
    // Communication
    messages: [{
        from: {
            type: String,
            enum: ['REPORTER', 'ADMIN']
        },
        message: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    
    // Resolution
    resolution: {
        resolved: { type: Boolean, default: false },
        resolvedAt: Date,
        outcome: String
    }
    
}, {
    timestamps: true
});

// Indexes
reportSchema.index({ reporter: 1, createdAt: -1 });
reportSchema.index({ reportedUser: 1 });
reportSchema.index({ status: 1, severity: -1 });
reportSchema.index({ 'adminReview.reviewedBy': 1 });

// Static method to get pending reports count
reportSchema.statics.getPendingCount = function() {
    return this.countDocuments({ status: 'PENDING' });
};

// Static method to get reports by user
reportSchema.statics.getUserReportHistory = function(userId) {
    return this.find({ reportedUser: userId })
        .populate('reporter', 'profile')
        .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Report', reportSchema);
