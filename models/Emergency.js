/**
 * Emergency Model
 * Stores SOS and emergency alert information
 */

const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema({
    // Unique Emergency ID (for easy reference)
    emergencyId: {
        type: String,
        unique: true,
        required: true
    },
    
    // User who triggered SOS
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Related Booking and Ride
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    },
    ride: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ride'
    },
    
    // Emergency Type
    type: {
        type: String,
        enum: ['SOS', 'ACCIDENT', 'MEDICAL', 'THREAT', 'BREAKDOWN', 'ROUTE_DEVIATION', 'AUTO_ALERT', 'MANUAL_REPORT', 'OTHER'],
        default: 'SOS'
    },
    
    // Status
    status: {
        type: String,
        enum: ['ACTIVE', 'ESCALATED', 'RESOLVED', 'FALSE_ALARM', 'CANCELLED'],
        default: 'ACTIVE'
    },
    
    // Escalation Level (0 = Initial, 1 = Emergency Contacts, 2 = Admins, 3 = Authorities, 4 = Police Dispatched)
    escalationLevel: {
        type: Number,
        default: 0,
        min: 0,
        max: 4
    },
    
    // Escalation Timeline
    escalationTimeline: [{
        level: Number,
        timestamp: Date,
        action: String,
        triggeredBy: {
            type: String,
            enum: ['AUTO', 'USER', 'ADMIN']
        }
    }],
    
    // False Alarm Detection
    falseAlarmIndicators: {
        quickResolution: Boolean, // Resolved within 1 minute
        noResponse: Boolean, // No response to admin calls
        repeatedTriggers: Boolean, // Multiple triggers in short time
        patternSuspicious: Boolean, // Suspicious usage pattern
        userReported: Boolean, // User marked as false alarm
        score: { type: Number, default: 0 }, // 0-100, higher = more likely false
        flagged: { type: Boolean, default: false }
    },
    
    // Silent Mode (for dangerous situations)
    silentMode: {
        type: Boolean,
        default: false
    },
    
    // Audio Recording
    audioRecording: {
        enabled: Boolean,
        startTime: Date,
        duration: Number, // in seconds
        fileUrl: String, // S3/Cloudinary URL
        transcription: String, // Auto-generated text
        analyzedForThreats: Boolean
    },
    
    // Police/Ambulance Dispatch
    emergencyServices: {
        dispatched: Boolean,
        serviceType: {
            type: String,
            enum: ['POLICE', 'AMBULANCE', 'FIRE', 'NONE'],
            default: 'NONE'
        },
        dispatchTime: Date,
        arrivalTime: Date,
        caseNumber: String,
        officerName: String,
        officerBadge: String,
        notes: String
    },
    
    // Location at time of trigger
    location: {
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        },
        address: String,
        accuracy: Number, // GPS accuracy in meters
        timestamp: {
            type: Date,
            default: Date.now
        }
    },
    
    // Location History (breadcrumb trail)
    locationHistory: [{
        coordinates: [Number],
        timestamp: Date,
        speed: Number,
        accuracy: Number
    }],
    
    // Device Information
    device: {
        userAgent: String,
        platform: String,
        battery: Number
    },
    
    // Notifications Sent
    notificationsSent: [{
        recipient: String, // Phone or email
        recipientName: String,
        type: {
            type: String,
            enum: ['SMS', 'EMAIL', 'CALL', 'IN_APP']
        },
        sentAt: Date,
        status: {
            type: String,
            enum: ['SENT', 'DELIVERED', 'FAILED']
        },
        messageId: String
    }],
    
    // Admin Response
    adminResponse: {
        respondedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        respondedAt: Date,
        action: {
            type: String,
            enum: ['CONTACTED_USER', 'CONTACTED_EMERGENCY', 'DISPATCHED_HELP', 'MONITORED', 'CLOSED']
        },
        notes: String
    },
    
    // Resolution
    resolution: {
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        resolvedAt: Date,
        resolution: String,
        outcome: {
            type: String,
            enum: ['SAFE', 'HELPED', 'FALSE_ALARM', 'NO_RESPONSE']
        }
    },
    
    // Route Deviation Details (if type is ROUTE_DEVIATION)
    deviation: {
        distance: Number, // km away from planned route
        duration: Number, // minutes of deviation
        detectedAt: Date
    },
    
    // Tracking Link
    trackingLink: String, // Public URL for live tracking
    
    // Screenshots or Evidence
    evidence: [String],
    
    // Priority Level
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
        default: 'HIGH'
    }
    
}, {
    timestamps: true
});

// Indexes
emergencySchema.index({ emergencyId: 1 });
emergencySchema.index({ user: 1, status: 1 });
emergencySchema.index({ status: 1, priority: -1 });
emergencySchema.index({ createdAt: -1 });
emergencySchema.index({ 'location.coordinates': '2dsphere' });

// Pre-save middleware to generate emergency ID
emergencySchema.pre('save', function(next) {
    if (this.isNew && !this.emergencyId) {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 7);
        this.emergencyId = `SOS-${timestamp}-${random}`.toUpperCase();
    }
    next();
});

// Method to add location update
emergencySchema.methods.addLocationUpdate = function(coords, speed, accuracy) {
    this.locationHistory.push({
        coordinates: coords,
        timestamp: new Date(),
        speed: speed || 0,
        accuracy: accuracy || 0
    });
    
    // Update current location
    this.location.coordinates = coords;
    this.location.timestamp = new Date();
    
    return this.save();
};

// Method to log notification
emergencySchema.methods.logNotification = function(recipient, type, status, recipientName) {
    this.notificationsSent.push({
        recipient,
        recipientName,
        type,
        sentAt: new Date(),
        status
    });
    return this.save();
};

// Method to escalate emergency
emergencySchema.methods.escalate = function(newLevel, action, triggeredBy = 'AUTO') {
    this.escalationLevel = newLevel;
    this.escalationTimeline.push({
        level: newLevel,
        timestamp: new Date(),
        action,
        triggeredBy
    });
    
    if (newLevel >= 3) {
        this.status = 'ESCALATED';
    }
    
    return this.save();
};

// Method to calculate false alarm score
emergencySchema.methods.calculateFalseAlarmScore = function() {
    let score = 0;
    
    // Check resolution time
    if (this.status === 'RESOLVED' && this.resolvedAt) {
        const resolutionTime = (this.resolvedAt - this.createdAt) / 1000 / 60; // minutes
        if (resolutionTime < 1) {
            score += 30;
            this.falseAlarmIndicators.quickResolution = true;
        }
    }
    
    // Check if user responded
    if (this.notificationsSent.length > 0 && !this.adminResponse.respondedBy) {
        score += 20;
        this.falseAlarmIndicators.noResponse = true;
    }
    
    // Check for pattern (would need user's history - simplified here)
    if (this.falseAlarmIndicators.repeatedTriggers) {
        score += 25;
    }
    
    // Check if manually reported as false
    if (this.falseAlarmIndicators.userReported) {
        score += 25;
    }
    
    this.falseAlarmIndicators.score = score;
    this.falseAlarmIndicators.flagged = score >= 50;
    
    return this.save();
};

// Method to start audio recording
emergencySchema.methods.startAudioRecording = function() {
    this.audioRecording = {
        enabled: true,
        startTime: new Date()
    };
    return this.save();
};

// Method to dispatch emergency services
emergencySchema.methods.dispatchServices = function(serviceType, details = {}) {
    this.emergencyServices = {
        dispatched: true,
        serviceType,
        dispatchTime: new Date(),
        caseNumber: details.caseNumber || `LANE-${Date.now()}`,
        officerName: details.officerName,
        officerBadge: details.officerBadge,
        notes: details.notes
    };
    return this.save();
};

// Static method to get active emergencies
emergencySchema.statics.getActiveEmergencies = function() {
    return this.find({ status: { $in: ['ACTIVE', 'ESCALATED'] } })
        .populate('user', 'profile email phone')
        .populate('booking')
        .sort({ priority: -1, escalationLevel: -1, createdAt: -1 });
};

// Static method to find suspicious patterns
emergencySchema.statics.findSuspiciousPatterns = async function(userId, timeWindowHours = 24) {
    const cutoffTime = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000);
    
    const recentEmergencies = await this.find({
        user: userId,
        createdAt: { $gte: cutoffTime }
    });
    
    return {
        count: recentEmergencies.length,
        falseAlarms: recentEmergencies.filter(e => e.status === 'FALSE_ALARM').length,
        suspicious: recentEmergencies.length >= 3 || 
                   recentEmergencies.filter(e => e.status === 'FALSE_ALARM').length >= 2
    };
};

// Static method to get escalation statistics
emergencySchema.statics.getEscalationStats = async function(days = 30) {
    const cutoffTime = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const emergencies = await this.find({
        createdAt: { $gte: cutoffTime }
    });
    
    return {
        total: emergencies.length,
        escalated: emergencies.filter(e => e.escalationLevel >= 3).length,
        falseAlarms: emergencies.filter(e => e.status === 'FALSE_ALARM').length,
        avgResolutionTime: emergencies
            .filter(e => e.resolvedAt)
            .reduce((sum, e) => sum + (e.resolvedAt - e.createdAt), 0) / 
            emergencies.filter(e => e.resolvedAt).length / 1000 / 60, // minutes
        servicesDispatched: emergencies.filter(e => e.emergencyServices.dispatched).length
    };
};

module.exports = mongoose.model('Emergency', emergencySchema);
