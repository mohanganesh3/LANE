import React from 'react';
import './NotificationTypes.css';

/**
 * NotificationTypes Component
 * Defines notification type configurations and renderers
 */

// Notification type configurations
export const NOTIFICATION_TYPES = {
  // Booking notifications
  BOOKING_CONFIRMED: {
    type: 'booking',
    icon: '✅',
    color: '#10b981',
    priority: 'normal',
    title: 'Booking Confirmed',
    sound: true,
  },
  BOOKING_CANCELLED: {
    type: 'booking',
    icon: '❌',
    color: '#ef4444',
    priority: 'high',
    title: 'Booking Cancelled',
    sound: true,
  },
  BOOKING_MODIFIED: {
    type: 'booking',
    icon: '📝',
    color: '#f59e0b',
    priority: 'normal',
    title: 'Booking Modified',
    sound: false,
  },

  // Ride notifications
  DRIVER_ASSIGNED: {
    type: 'ride',
    icon: '🚗',
    color: '#3b82f6',
    priority: 'high',
    title: 'Driver Assigned',
    sound: true,
  },
  DRIVER_ARRIVED: {
    type: 'ride',
    icon: '📍',
    color: '#8b5cf6',
    priority: 'urgent',
    title: 'Driver Arrived',
    sound: true,
  },
  RIDE_STARTED: {
    type: 'ride',
    icon: '🏁',
    color: '#10b981',
    priority: 'normal',
    title: 'Ride Started',
    sound: true,
  },
  RIDE_COMPLETED: {
    type: 'ride',
    icon: '🎉',
    color: '#22c55e',
    priority: 'normal',
    title: 'Ride Completed',
    sound: true,
  },
  RIDE_DELAYED: {
    type: 'ride',
    icon: '⏰',
    color: '#f59e0b',
    priority: 'high',
    title: 'Ride Delayed',
    sound: true,
  },

  // Payment notifications
  PAYMENT_SUCCESSFUL: {
    type: 'payment',
    icon: '💳',
    color: '#10b981',
    priority: 'normal',
    title: 'Payment Successful',
    sound: false,
  },
  PAYMENT_FAILED: {
    type: 'payment',
    icon: '⚠️',
    color: '#ef4444',
    priority: 'high',
    title: 'Payment Failed',
    sound: true,
  },
  REFUND_INITIATED: {
    type: 'payment',
    icon: '💰',
    color: '#3b82f6',
    priority: 'normal',
    title: 'Refund Initiated',
    sound: false,
  },
  REFUND_COMPLETED: {
    type: 'payment',
    icon: '✅',
    color: '#10b981',
    priority: 'normal',
    title: 'Refund Completed',
    sound: true,
  },

  // Promotion notifications
  PROMO_CODE_AVAILABLE: {
    type: 'promotion',
    icon: '🎁',
    color: '#ec4899',
    priority: 'normal',
    title: 'New Promo Code',
    sound: false,
  },
  DISCOUNT_APPLIED: {
    type: 'promotion',
    icon: '🏷️',
    color: '#8b5cf6',
    priority: 'normal',
    title: 'Discount Applied',
    sound: false,
  },
  SPECIAL_OFFER: {
    type: 'promotion',
    icon: '⭐',
    color: '#f59e0b',
    priority: 'normal',
    title: 'Special Offer',
    sound: false,
  },

  // Alert notifications
  EMERGENCY_ALERT: {
    type: 'alert',
    icon: '🚨',
    color: '#dc2626',
    priority: 'urgent',
    title: 'Emergency Alert',
    sound: true,
  },
  SAFETY_ALERT: {
    type: 'alert',
    icon: '⚠️',
    color: '#f59e0b',
    priority: 'high',
    title: 'Safety Alert',
    sound: true,
  },
  ROUTE_DEVIATION: {
    type: 'alert',
    icon: '🗺️',
    color: '#ef4444',
    priority: 'high',
    title: 'Route Deviation Detected',
    sound: true,
  },

  // System notifications
  ACCOUNT_VERIFIED: {
    type: 'system',
    icon: '✅',
    color: '#10b981',
    priority: 'normal',
    title: 'Account Verified',
    sound: false,
  },
  PASSWORD_CHANGED: {
    type: 'system',
    icon: '🔒',
    color: '#3b82f6',
    priority: 'high',
    title: 'Password Changed',
    sound: true,
  },
  PROFILE_UPDATED: {
    type: 'system',
    icon: '👤',
    color: '#6b7280',
    priority: 'normal',
    title: 'Profile Updated',
    sound: false,
  },
  APP_UPDATE_AVAILABLE: {
    type: 'system',
    icon: '📱',
    color: '#3b82f6',
    priority: 'normal',
    title: 'App Update Available',
    sound: false,
  },
};

/**
 * NotificationTypeCard Component
 * Displays a notification type with icon and details
 */
export const NotificationTypeCard = ({ notificationType, notification }) => {
  const config = NOTIFICATION_TYPES[notificationType] || {};

  return (
    <div className={`notification-type-card ${config.type}`}>
      <div className="type-icon" style={{ backgroundColor: config.color }}>
        <span className="type-emoji">{config.icon}</span>
      </div>
      <div className="type-details">
        <h4 className="type-title">{notification.title || config.title}</h4>
        <p className="type-message">{notification.message}</p>
        {config.priority === 'urgent' && (
          <span className="urgent-badge">Urgent</span>
        )}
        {config.priority === 'high' && (
          <span className="high-priority-badge">High Priority</span>
        )}
      </div>
    </div>
  );
};

/**
 * Get notification config by type
 */
export const getNotificationConfig = (notificationType) => {
  return NOTIFICATION_TYPES[notificationType] || {
    type: 'system',
    icon: 'ℹ️',
    color: '#6b7280',
    priority: 'normal',
    title: 'Notification',
    sound: false,
  };
};

/**
 * Generate notification message based on type and data
 */
export const generateNotificationMessage = (type, data = {}) => {
  const messages = {
    BOOKING_CONFIRMED: `Your booking #${data.bookingId || 'XXXX'} has been confirmed for ${data.date || 'your selected date'}.`,
    BOOKING_CANCELLED: `Your booking #${data.bookingId || 'XXXX'} has been cancelled. ${data.reason || ''}`,
    BOOKING_MODIFIED: `Your booking #${data.bookingId || 'XXXX'} has been updated successfully.`,
    
    DRIVER_ASSIGNED: `${data.driverName || 'A driver'} has been assigned to your ride. ETA: ${data.eta || '5 minutes'}.`,
    DRIVER_ARRIVED: `Your driver ${data.driverName || ''} has arrived at the pickup location.`,
    RIDE_STARTED: `Your ride has started. Enjoy your journey!`,
    RIDE_COMPLETED: `You have reached your destination. Thank you for riding with us!`,
    RIDE_DELAYED: `Your ride is delayed by ${data.delayMinutes || 'a few'} minutes. We apologize for the inconvenience.`,
    
    PAYMENT_SUCCESSFUL: `Payment of ₹${data.amount || '0'} was successful. Transaction ID: ${data.transactionId || 'XXXX'}`,
    PAYMENT_FAILED: `Payment of ₹${data.amount || '0'} failed. ${data.reason || 'Please try again.'}`,
    REFUND_INITIATED: `Refund of ₹${data.amount || '0'} has been initiated. It will be credited in 5-7 business days.`,
    REFUND_COMPLETED: `Refund of ₹${data.amount || '0'} has been completed successfully.`,
    
    PROMO_CODE_AVAILABLE: `Use promo code ${data.promoCode || 'XXXX'} to get ${data.discount || 'great'} discount on your next ride!`,
    DISCOUNT_APPLIED: `Discount of ₹${data.amount || '0'} applied to your booking.`,
    SPECIAL_OFFER: `${data.offerTitle || 'Special offer'} - ${data.description || 'Limited time only!'}`,
    
    EMERGENCY_ALERT: data.message || 'Emergency assistance has been requested. Help is on the way.',
    SAFETY_ALERT: data.message || 'Safety alert: Please ensure you are in a safe location.',
    ROUTE_DEVIATION: `Your driver has deviated from the planned route. ${data.reason || 'Tracking in progress.'}`,
    
    ACCOUNT_VERIFIED: 'Your account has been successfully verified.',
    PASSWORD_CHANGED: 'Your password has been changed successfully. If you didn\'t make this change, please contact support immediately.',
    PROFILE_UPDATED: 'Your profile information has been updated successfully.',
    APP_UPDATE_AVAILABLE: `Version ${data.version || 'X.X.X'} is now available. Update now to get the latest features!`,
  };

  return messages[type] || data.message || 'You have a new notification.';
};

/**
 * Notification priority levels
 */
export const PRIORITY_LEVELS = {
  URGENT: 'urgent',
  HIGH: 'high',
  NORMAL: 'normal',
  LOW: 'low',
};

/**
 * Notification filters
 */
export const NOTIFICATION_FILTERS = [
  { id: 'all', label: 'All', icon: '📬' },
  { id: 'booking', label: 'Bookings', icon: '📅' },
  { id: 'ride', label: 'Rides', icon: '🚗' },
  { id: 'payment', label: 'Payments', icon: '💳' },
  { id: 'promotion', label: 'Promotions', icon: '🎁' },
  { id: 'alert', label: 'Alerts', icon: '⚠️' },
  { id: 'system', label: 'System', icon: 'ℹ️' },
];

export default {
  NOTIFICATION_TYPES,
  NotificationTypeCard,
  getNotificationConfig,
  generateNotificationMessage,
  PRIORITY_LEVELS,
  NOTIFICATION_FILTERS,
};
