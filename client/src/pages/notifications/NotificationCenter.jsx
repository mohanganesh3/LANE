import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/apiService';
import './NotificationCenter.css';

/**
 * NotificationCenter Component
 * Central hub for all user notifications
 */
const NotificationCenter = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { type: filter } : {};
      const response = await apiService.get('/notifications', { params });
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await apiService.patch(`/notifications/${notificationId}/read`);
      setNotifications(notifications.map(n =>
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiService.patch('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }

    // Navigate based on notification type
    if (notification.link) {
      navigate(notification.link);
    } else if (notification.type === 'booking') {
      navigate(`/bookings/${notification.relatedId}`);
    } else if (notification.type === 'ride') {
      navigate(`/rides/${notification.relatedId}`);
    } else if (notification.type === 'payment') {
      navigate(`/payments/${notification.relatedId}`);
    }
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    try {
      await apiService.delete(`/notifications/${notificationId}`);
      setNotifications(notifications.filter(n => n._id !== notificationId));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const filteredNotifications = notifications;

  if (loading && notifications.length === 0) {
    return (
      <div className="notification-center-page">
        <div className="loading-notifications">
          <div className="spinner" />
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-center-page">
      <div className="notification-container">
        {/* Header */}
        <div className="notification-header">
          <div className="header-top">
            <h1>Notifications</h1>
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount} new</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              className="mark-all-read-btn"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="notification-filters">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-tab ${filter === 'booking' ? 'active' : ''}`}
            onClick={() => setFilter('booking')}
          >
            Bookings
          </button>
          <button
            className={`filter-tab ${filter === 'ride' ? 'active' : ''}`}
            onClick={() => setFilter('ride')}
          >
            Rides
          </button>
          <button
            className={`filter-tab ${filter === 'payment' ? 'active' : ''}`}
            onClick={() => setFilter('payment')}
          >
            Payments
          </button>
          <button
            className={`filter-tab ${filter === 'system' ? 'active' : ''}`}
            onClick={() => setFilter('system')}
          >
            System
          </button>
        </div>

        {/* Notifications List */}
        <div className="notifications-list">
          {error && (
            <div className="error-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p>{error}</p>
              <button onClick={fetchNotifications} className="btn-retry">
                Try Again
              </button>
            </div>
          )}

          {!error && filteredNotifications.length === 0 && (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <h2>No notifications</h2>
              <p>You're all caught up! Check back later for updates.</p>
            </div>
          )}

          {!error && filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-content">
                <div className={`notification-icon ${notification.type}`}>
                  {notification.type === 'booking' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  )}
                  {notification.type === 'ride' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M5 17h14v-5H5v5z"/>
                      <path d="M3 17h18v3H3z"/>
                      <circle cx="7" cy="20" r="2"/>
                      <circle cx="17" cy="20" r="2"/>
                      <path d="M5 12V4h5l2 4h6l2 4"/>
                    </svg>
                  )}
                  {notification.type === 'payment' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                      <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                  )}
                  {notification.type === 'system' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 16v-4"/>
                      <path d="M12 8h.01"/>
                    </svg>
                  )}
                </div>

                <div className="notification-details">
                  <h3>{notification.title}</h3>
                  <p>{notification.message}</p>
                  <span className="notification-time">
                    {formatNotificationTime(notification.createdAt)}
                  </span>
                </div>

                {!notification.isRead && (
                  <div className="unread-indicator" />
                )}
              </div>

              <button
                className="delete-notification-btn"
                onClick={(e) => handleDeleteNotification(e, notification._id)}
                aria-label="Delete notification"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper function to format notification time
const formatNotificationTime = (date) => {
  const now = new Date();
  const notificationDate = new Date(date);
  const diffInMs = now - notificationDate;
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else {
    return notificationDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  }
};

export default NotificationCenter;
