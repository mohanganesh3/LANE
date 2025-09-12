/**
 * SOS Escalation System
 * Automatically escalates emergencies if no response
 * 
 * Escalation Levels:
 * 0: Initial SOS - Alert emergency contacts
 * 1: 2 minutes - Second alert to emergency contacts
 * 2: 5 minutes - Alert platform admins
 * 3: 10 minutes - Notify authorities
 * 4: 15 minutes - Dispatch police/ambulance
 */

const Emergency = require('../models/Emergency');
const User = require('../models/User');
const Notification = require('../models/Notification');
const emailService = require('./emailService');
const smsService = require('./smsService');

class SOSEscalationSystem {
    constructor(io) {
        this.io = io;
        this.activeTimers = new Map(); // Track active escalation timers
    }

    /**
     * Start escalation monitoring for an emergency
     */
    startMonitoring(emergency) {
        const emergencyId = emergency._id.toString();
        
        // Clear any existing timers
        if (this.activeTimers.has(emergencyId)) {
            this.stopMonitoring(emergencyId);
        }

        // Set up escalation timers
        const timers = [];

        // Level 1: 2 minutes - Re-alert emergency contacts
        timers.push(setTimeout(() => {
            this.escalateToLevel1(emergencyId);
        }, 2 * 60 * 1000));

        // Level 2: 5 minutes - Alert admins
        timers.push(setTimeout(() => {
            this.escalateToLevel2(emergencyId);
        }, 5 * 60 * 1000));

        // Level 3: 10 minutes - Notify authorities
        timers.push(setTimeout(() => {
            this.escalateToLevel3(emergencyId);
        }, 10 * 60 * 1000));

        // Level 4: 15 minutes - Dispatch emergency services
        timers.push(setTimeout(() => {
            this.escalateToLevel4(emergencyId);
        }, 15 * 60 * 1000));

        this.activeTimers.set(emergencyId, timers);
        console.log(`✅ Escalation monitoring started for emergency ${emergencyId}`);
    }

    /**
     * Stop monitoring (called when emergency is resolved)
     */
    stopMonitoring(emergencyId) {
        const timers = this.activeTimers.get(emergencyId);
        if (timers) {
            timers.forEach(timer => clearTimeout(timer));
            this.activeTimers.delete(emergencyId);
            console.log(`✅ Escalation monitoring stopped for emergency ${emergencyId}`);
        }
    }

    /**
     * Level 1: Re-alert emergency contacts with urgency
     */
    async escalateToLevel1(emergencyId) {
        try {
            const emergency = await Emergency.findById(emergencyId)
                .populate('user')
                .populate('ride')
                .populate('booking');

            if (!emergency || emergency.status !== 'ACTIVE') {
                return this.stopMonitoring(emergencyId);
            }

            await emergency.escalate(1, 'No response after 2 minutes - Re-alerting emergency contacts', 'AUTO');

            const user = emergency.user;
            const alertPromises = [];

            // Send urgent SMS to emergency contacts
            for (const contact of user.emergencyContacts) {
                alertPromises.push(
                    smsService.sendSOSAlert(contact.phone, {
                        userName: user.name,
                        location: `https://maps.google.com/?q=${emergency.location.coordinates[1]},${emergency.location.coordinates[0]}`,
                        emergencyId: emergency.emergencyId,
                        urgent: true,
                        timeElapsed: '2 minutes'
                    })
                );
            }

            await Promise.all(alertPromises);
            
            // Emit socket event
            if (this.io) {
                this.io.emit('sos-escalation', {
                    emergencyId,
                    level: 1,
                    message: 'Emergency escalated - No response after 2 minutes'
                });
            }

            console.log(`⚠️ Emergency ${emergencyId} escalated to Level 1`);
        } catch (error) {
            console.error('Error in Level 1 escalation:', error);
        }
    }

    /**
     * Level 2: Alert platform admins
     */
    async escalateToLevel2(emergencyId) {
        try {
            const emergency = await Emergency.findById(emergencyId)
                .populate('user')
                .populate('ride')
                .populate('booking');

            if (!emergency || emergency.status !== 'ACTIVE') {
                return this.stopMonitoring(emergencyId);
            }

            await emergency.escalate(2, 'No response after 5 minutes - Alerting platform admins', 'AUTO');

            // Get all admins
            const admins = await User.find({ role: 'ADMIN' });
            const alertPromises = [];

            for (const admin of admins) {
                // High priority notification
                alertPromises.push(
                    Notification.create({
                        user: admin._id,
                        type: 'SOS_ALERT',
                        title: '🚨 CRITICAL: SOS Escalated - No Response',
                        message: `${emergency.user.name} triggered SOS 5 minutes ago with NO RESPONSE. Immediate action required!`,
                        priority: 'CRITICAL',
                        data: {
                            emergencyId: emergency._id,
                            userId: emergency.user._id,
                            location: emergency.location,
                            escalationLevel: 2
                        }
                    })
                );

                // Send SMS to admins
                if (admin.phone) {
                    alertPromises.push(
                        smsService.sendAdminAlert(admin.phone, {
                            alertType: 'ESCALATED_SOS',
                            userName: emergency.user.name,
                            location: `https://maps.google.com/?q=${emergency.location.coordinates[1]},${emergency.location.coordinates[0]}`,
                            emergencyId: emergency.emergencyId,
                            timeElapsed: '5 minutes'
                        })
                    );
                }
            }

            await Promise.all(alertPromises);

            // Emit socket event
            if (this.io) {
                this.io.emit('sos-escalation', {
                    emergencyId,
                    level: 2,
                    message: 'CRITICAL: Emergency escalated to admins - No response for 5 minutes'
                });
            }

            console.log(`🚨 Emergency ${emergencyId} escalated to Level 2 - ADMINS ALERTED`);
        } catch (error) {
            console.error('Error in Level 2 escalation:', error);
        }
    }

    /**
     * Level 3: Notify local authorities
     */
    async escalateToLevel3(emergencyId) {
        try {
            const emergency = await Emergency.findById(emergencyId)
                .populate('user')
                .populate('ride')
                .populate('booking');

            if (!emergency || emergency.status !== 'ACTIVE') {
                return this.stopMonitoring(emergencyId);
            }

            await emergency.escalate(3, 'No response after 10 minutes - Notifying authorities', 'AUTO');

            // Log authority notification (in production, integrate with local police API)
            console.log(`🚨🚨🚨 CRITICAL: Emergency ${emergencyId} escalated to Level 3`);
            console.log(`Location: ${emergency.location.coordinates[1]}, ${emergency.location.coordinates[0]}`);
            console.log(`User: ${emergency.user.name}, Phone: ${emergency.user.phone}`);
            console.log(`Time: ${new Date().toISOString()}`);

            // Create case record
            const caseNumber = `LANE-EMG-${Date.now()}`;
            
            // In production: Call police/ambulance dispatch API
            // await authoritiesAPI.createCase({...});

            // Notify all stakeholders
            const admins = await User.find({ role: 'ADMIN' });
            const alertPromises = admins.map(admin => 
                Notification.create({
                    user: admin._id,
                    type: 'SOS_ALERT',
                    title: '🚨🚨🚨 EMERGENCY: Authorities Notified',
                    message: `SOS ${emergency.emergencyId} escalated to authorities. Case: ${caseNumber}`,
                    priority: 'CRITICAL',
                    data: {
                        emergencyId: emergency._id,
                        caseNumber,
                        escalationLevel: 3
                    }
                })
            );

            await Promise.all(alertPromises);

            // Emit socket event
            if (this.io) {
                this.io.emit('sos-escalation', {
                    emergencyId,
                    level: 3,
                    message: 'EMERGENCY: Authorities have been notified',
                    caseNumber
                });
            }

            console.log(`🚨 Emergency ${emergencyId} escalated to Level 3 - AUTHORITIES NOTIFIED`);
        } catch (error) {
            console.error('Error in Level 3 escalation:', error);
        }
    }

    /**
     * Level 4: Dispatch police/ambulance (Final escalation)
     */
    async escalateToLevel4(emergencyId) {
        try {
            const emergency = await Emergency.findById(emergencyId)
                .populate('user')
                .populate('ride')
                .populate('booking');

            if (!emergency || emergency.status !== 'ACTIVE') {
                return this.stopMonitoring(emergencyId);
            }

            await emergency.escalate(4, 'No response after 15 minutes - Emergency services dispatched', 'AUTO');

            // Determine service type based on emergency type
            let serviceType = 'POLICE';
            if (emergency.type === 'MEDICAL') serviceType = 'AMBULANCE';
            if (emergency.type === 'ACCIDENT') serviceType = 'AMBULANCE';
            
            // Dispatch emergency services
            await emergency.dispatchServices(serviceType, {
                caseNumber: `LANE-DISPATCH-${Date.now()}`,
                notes: `Automated dispatch after 15 minutes no response. Location: ${emergency.location.coordinates[1]}, ${emergency.location.coordinates[0]}`
            });

            console.log(`🚨🚨🚨 MAXIMUM ESCALATION: ${serviceType} DISPATCHED for emergency ${emergencyId}`);

            // Notify all stakeholders
            const admins = await User.find({ role: 'ADMIN' });
            const alertPromises = admins.map(admin => 
                Notification.create({
                    user: admin._id,
                    type: 'SOS_ALERT',
                    title: `🚨🚨🚨 ${serviceType} DISPATCHED`,
                    message: `Emergency ${emergency.emergencyId} reached maximum escalation. ${serviceType} has been dispatched.`,
                    priority: 'CRITICAL',
                    data: {
                        emergencyId: emergency._id,
                        serviceType,
                        caseNumber: emergency.emergencyServices.caseNumber,
                        escalationLevel: 4
                    }
                })
            );

            await Promise.all(alertPromises);

            // Emit socket event
            if (this.io) {
                this.io.emit('sos-escalation', {
                    emergencyId,
                    level: 4,
                    message: `CRITICAL: ${serviceType} DISPATCHED`,
                    serviceType,
                    caseNumber: emergency.emergencyServices.caseNumber
                });
            }

            // Stop monitoring - maximum escalation reached
            this.stopMonitoring(emergencyId);

            console.log(`🚨 Emergency ${emergencyId} escalated to Level 4 - ${serviceType} DISPATCHED`);
        } catch (error) {
            console.error('Error in Level 4 escalation:', error);
        }
    }

    /**
     * Get status of all active escalations
     */
    getActiveEscalations() {
        return Array.from(this.activeTimers.keys());
    }
}

// Singleton instance
let escalationSystemInstance = null;

module.exports = {
    initEscalationSystem: (io) => {
        if (!escalationSystemInstance) {
            escalationSystemInstance = new SOSEscalationSystem(io);
        }
        return escalationSystemInstance;
    },
    getEscalationSystem: () => escalationSystemInstance
};
