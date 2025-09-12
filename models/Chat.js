/**
 * Chat Model
 * Stores chat messages between riders and passengers
 */

const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    // Reference to Booking
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
        unique: true
    },
    
    // Participants (rider and passenger)
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    
    // Messages
    messages: [{
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true,
            maxlength: 1000
        },
        type: {
            type: String,
            enum: ['TEXT', 'LOCATION', 'QUICK_REPLY', 'SYSTEM'],
            default: 'TEXT'
        },
        // Location data (if type is LOCATION)
        location: {
            coordinates: [Number],
            address: String
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        // Read receipts
        readBy: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            readAt: Date
        }],
        // Soft delete
        deleted: {
            type: Boolean,
            default: false
        },
        deletedBy: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
    }],
    
    // Last message timestamp (for sorting)
    lastMessageAt: {
        type: Date,
        default: Date.now
    },
    
    // Typing indicator
    typing: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        timestamp: Date
    }],
    
    // Chat Status
    isActive: {
        type: Boolean,
        default: true
    },
    archivedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    
    // Moderation
    flagged: {
        type: Boolean,
        default: false
    },
    flaggedReason: String,
    flaggedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
    
}, {
    timestamps: true
});

// Indexes
chatSchema.index({ booking: 1 });
chatSchema.index({ participants: 1 });
chatSchema.index({ lastMessageAt: -1 });
chatSchema.index({ 'messages.timestamp': -1 });

// Method to add message
chatSchema.methods.addMessage = function(senderId, content, type = 'TEXT', locationData = null) {
    const message = {
        sender: senderId,
        content,
        type,
        timestamp: new Date()
    };
    
    if (type === 'LOCATION' && locationData) {
        message.location = locationData;
    }
    
    this.messages.push(message);
    this.lastMessageAt = new Date();
    
    return this.save();
};

// Method to mark messages as read
chatSchema.methods.markAsRead = function(userId) {
    this.messages.forEach(msg => {
        if (msg.sender.toString() !== userId.toString()) {
            const alreadyRead = msg.readBy.some(r => r.user.toString() === userId.toString());
            if (!alreadyRead) {
                msg.readBy.push({
                    user: userId,
                    readAt: new Date()
                });
            }
        }
    });
    
    return this.save();
};

// Method to get unread count for a user
chatSchema.methods.getUnreadCount = function(userId) {
    return this.messages.filter(msg => {
        return msg.sender.toString() !== userId.toString() &&
               !msg.readBy.some(r => r.user.toString() === userId.toString()) &&
               !msg.deleted;
    }).length;
};

// Virtual for last message
chatSchema.virtual('lastMessage').get(function() {
    if (this.messages.length === 0) return null;
    const activeMessages = this.messages.filter(m => !m.deleted);
    return activeMessages[activeMessages.length - 1];
});

module.exports = mongoose.model('Chat', chatSchema);
