import React, { useState, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext';
import './EmergencyNotifications.css';

const EmergencyNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const socket = useSocket();

  useEffect(() => {
    fetchNotifications();
    requestNotificationPermission();

    // Listen for real-time emergency notifications
    if (socket) {
      socket.on('emergency-notification', handleNewNotification);
      socket.on('emergency-alert', handleEmergencyAlert);
    }

    return () => {
      if (socket) {
        socket.off('emergency-notification', handleNewNotification);
        socket.off('emergency-alert', handleEmergencyAlert);
      }
    };
  }, [socket]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/admin/notifications/emergency');
      const data = await response.json();
      setNotifications(data.notifications || []);
      updateUnreadCount(data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleNewNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    updateUnreadCount([notification, ...notifications]);
    
    // Show browser notification
    showBrowserNotification(notification);
    
    // Play alert sound
    playAlertSound();
  };

  const handleEmergencyAlert = (alert) => {
    // Critical emergency alert
    showBrowserNotification({
      title: '🚨 CRITICAL EMERGENCY',
      message: alert.message,
      priority: 'critical'
    });
    
    playAlertSound(true); // Play urgent sound
  };

  const showBrowserNotification = (notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notif = new Notification(notification.title || 'Emergency Alert', {
        body: notification.message,
        icon: '/icons/emergency.png',
        badge: '/icons/badge.png',
        tag: notification._id,
        requireInteraction: notification.priority === 'critical',
        vibrate: notification.priority === 'critical' ? [200, 100, 200] : [100]
      });

      notif.onclick = () => {
        window.focus();
        if (notification.emergencyId) {
          // Navigate to emergency
          window.location.href = `/admin/sos/${notification.emergencyId}`;
        }
        notif.close();
      };
    }
  };

  const playAlertSound = (urgent = false) => {
    const audio = new Audio(urgent ? '/sounds/urgent-alert.mp3' : '/sounds/notification.mp3');
    audio.play().catch(err => console.log('Could not play sound:', err));
  };

  const updateUnreadCount = (notifs) => {
    const unread = notifs.filter(n => !n.read).length;
    setUnreadCount(unread);
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`/api/admin/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
      
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      updateUnreadCount(notifications.map(n => 
        n._id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/admin/notifications/read-all', {
        method: 'PUT'
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const clearNotifications = () => {
    if (confirm('Clear all notifications?')) {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const getPriorityClass = (priority) => {
    const classes = {
      critical: 'critical',
      high: 'high',
      medium: 'medium',
      low: 'low'
    };
    return classes[priority] || 'medium';
  };

  const getNotificationIcon = (type) => {
    const icons = {
      new_emergency: '🆕',
      status_change: '🔄',
      escalated: '⚠️',
      resolved: '✅',
      critical: '🚨'
    };
    return icons[type] || '🔔';
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return d.toLocaleString();
  };

  return (
    <>
      {/* Notification Bell Icon */}
      <div className="emergency-notifications-trigger">
        <button
          className="notification-bell"
          onClick={() => setShowPanel(!showPanel)}
          aria-label="Emergency Notifications"
        >
          🔔
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </button>
      </div>

      {/* Notification Panel */}
      {showPanel && (
        <>
          <div
            className="notification-overlay"
            onClick={() => setShowPanel(false)}
          />
          <div className="emergency-notifications-panel">
            <div className="panel-header">
              <h3>Emergency Notifications</h3>
              <div className="header-actions">
                {unreadCount > 0 && (
                  <button
                    className="mark-read-btn"
                    onClick={markAllAsRead}
                    title="Mark all as read"
                  >
                    ✓ All
                  </button>
                )}
                <button
                  className="clear-btn"
                  onClick={clearNotifications}
                  title="Clear all"
                >
                  🗑️
                </button>
                <button
                  className="close-btn"
                  onClick={() => setShowPanel(false)}
                  title="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="notifications-list">
              {notifications.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">🔔</span>
                  <p>No notifications</p>
                </div>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification._id}
                    className={`notification-item ${getPriorityClass(notification.priority)} ${
                      notification.read ? 'read' : 'unread'
                    }`}
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead(notification._id);
                      }
                      if (notification.emergencyId) {
                        window.location.href = `/admin/sos/${notification.emergencyId}`;
                      }
                    }}
                  >
                    <div className="notification-icon">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-content">
                      <h4 className="notification-title">{notification.title}</h4>
                      <p className="notification-message">{notification.message}</p>
                      <div className="notification-footer">
                        <span className="notification-time">
                          {formatTime(notification.createdAt)}
                        </span>
                        {notification.priority && (
                          <span className={`priority-badge ${notification.priority}`}>
                            {notification.priority}
                          </span>
                        )}
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="unread-indicator"></div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default EmergencyNotifications;
