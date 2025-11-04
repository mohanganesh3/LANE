import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './NotificationCenter.css';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications?filter=${filter}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification._id);
    
    // Navigate based on notification type
    if (notification.data?.bookingId) {
      navigate(`/bookings/${notification.data.bookingId}`);
    } else if (notification.data?.rideId) {
      navigate(`/rides/${notification.data.rideId}`);
    } else if (notification.data?.userId) {
      navigate(`/user/profile/${notification.data.userId}`);
    }
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      BOOKING_REQUEST: 'fa-calendar-plus',
      BOOKING_CONFIRMED: 'fa-check-circle',
      BOOKING_ACCEPTED: 'fa-check-circle',
      BOOKING_REJECTED: 'fa-times-circle',
      BOOKING_CANCELLED: 'fa-ban',
      RIDE_STARTING: 'fa-car',
      RIDE_STARTED: 'fa-route',
      RIDE_COMPLETED: 'fa-flag-checkered',
      PICKUP_CONFIRMED: 'fa-location-arrow',
      DROPOFF_CONFIRMED: 'fa-map-marker-alt',
      JOURNEY_COMPLETED: 'fa-check-double',
      PAYMENT_RECEIVED: 'fa-money-bill-wave',
      PAYMENT_PENDING: 'fa-clock',
      REVIEW_RECEIVED: 'fa-star',
      REVIEW_REMINDER: 'fa-star-half-alt',
      MESSAGE_RECEIVED: 'fa-comment',
      DOCUMENT_APPROVED: 'fa-file-check',
      DOCUMENT_REJECTED: 'fa-file-times',
      SOS_ALERT: 'fa-exclamation-triangle',
      ROUTE_DEVIATION: 'fa-route',
      VERIFICATION_REQUEST: 'fa-id-card',
      VERIFICATION_COMPLETE: 'fa-user-check',
      VERIFICATION_APPROVED: 'fa-thumbs-up',
      VERIFICATION_REJECTED: 'fa-thumbs-down',
      ACCOUNT_SUSPENDED: 'fa-user-slash',
      ACCOUNT_ACTIVATED: 'fa-user-check',
      ACCOUNT_BANNED: 'fa-ban',
      WARNING: 'fa-exclamation',
      RIDE_CANCELLED: 'fa-times',
      NEW_REPORT: 'fa-flag',
      REPORT_RESOLVED: 'fa-check',
      PAYMENT_REFUNDED: 'fa-undo',
      SYSTEM_ALERT: 'fa-bell',
      PRICE_DROP: 'fa-tag',
      SYSTEM_UPDATE: 'fa-sync',
      ADMIN_MESSAGE: 'fa-user-shield'
    };
    return iconMap[type] || 'fa-bell';
  };

  const getNotificationColor = (type) => {
    if (type.includes('SOS') || type.includes('ALERT') || type.includes('WARNING')) return 'red';
    if (type.includes('CONFIRMED') || type.includes('APPROVED') || type.includes('COMPLETED')) return 'green';
    if (type.includes('REJECTED') || type.includes('CANCELLED') || type.includes('BANNED')) return 'red';
    if (type.includes('PAYMENT')) return 'blue';
    if (type.includes('REVIEW')) return 'yellow';
    return 'gray';
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="notification-loading">
        <div className="spinner"></div>
        <p>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="notification-center">
      <div className="notification-header">
        <div className="header-content">
          <h1>
            <i className="fas fa-bell"></i>
            Notifications
            {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
          </h1>
          <p>Stay updated with your ride activities</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn-mark-all" onClick={markAllAsRead}>
            <i className="fas fa-check-double"></i>
            Mark all as read
          </button>
        )}
      </div>

      <div className="notification-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          Unread {unreadCount > 0 && `(${unreadCount})`}
        </button>
        <button
          className={`filter-btn ${filter === 'rides' ? 'active' : ''}`}
          onClick={() => setFilter('rides')}
        >
          Rides
        </button>
        <button
          className={`filter-btn ${filter === 'bookings' ? 'active' : ''}`}
          onClick={() => setFilter('bookings')}
        >
          Bookings
        </button>
        <button
          className={`filter-btn ${filter === 'payments' ? 'active' : ''}`}
          onClick={() => setFilter('payments')}
        >
          Payments
        </button>
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-bell-slash"></i>
            <h3>No notifications</h3>
            <p>You're all caught up!</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-item ${!notification.read ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className={`notification-icon ${getNotificationColor(notification.type)}`}>
                <i className={`fas ${getNotificationIcon(notification.type)}`}></i>
              </div>
              
              <div className="notification-content">
                <div className="notification-header-row">
                  <h4>{notification.title}</h4>
                  <span className="notification-time">
                    {formatTimeAgo(notification.createdAt)}
                  </span>
                </div>
                <p className="notification-message">{notification.message}</p>
                
                {notification.data?.amount && (
                  <div className="notification-meta">
                    <span className="amount">₹{notification.data.amount}</span>
                  </div>
                )}
              </div>

              <div className="notification-actions">
                {!notification.read && (
                  <button
                    className="action-btn read"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification._id);
                    }}
                    title="Mark as read"
                  >
                    <i className="fas fa-check"></i>
                  </button>
                )}
                <button
                  className="action-btn delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification._id);
                  }}
                  title="Delete"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
