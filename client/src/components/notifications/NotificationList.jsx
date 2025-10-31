import React from 'react';
import './NotificationList.css';

/**
 * NotificationList Component
 * Reusable list component for displaying notifications
 */
const NotificationList = ({
  notifications,
  onNotificationClick,
  onDeleteNotification,
  onMarkAsRead,
  loading,
  emptyMessage = 'No notifications',
}) => {
  // Format notification time
  const formatTime = (date) => {
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
        year: notificationDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        );
      case 'ride':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M5 17h14v-5H5v5z"/>
            <path d="M3 17h18v3H3z"/>
            <circle cx="7" cy="20" r="2"/>
            <circle cx="17" cy="20" r="2"/>
            <path d="M5 12V4h5l2 4h6l2 4"/>
          </svg>
        );
      case 'payment':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
        );
      case 'promotion':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
            <line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
        );
      case 'alert':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        );
      case 'system':
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4"/>
            <path d="M12 8h.01"/>
          </svg>
        );
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    if (!priority || priority === 'normal') return null;
    
    return (
      <span className={`priority-badge ${priority}`}>
        {priority === 'high' && '🔴'}
        {priority === 'urgent' && '⚡'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="notification-list-container">
        <div className="notification-loading">
          {[1, 2, 3].map(i => (
            <div key={i} className="notification-skeleton">
              <div className="skeleton-icon" />
              <div className="skeleton-content">
                <div className="skeleton-title" />
                <div className="skeleton-message" />
                <div className="skeleton-time" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="notification-list-empty">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  // Group notifications by date
  const groupedNotifications = notifications.reduce((groups, notification) => {
    const date = new Date(notification.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let groupKey;
    if (date.toDateString() === today.toDateString()) {
      groupKey = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = 'Yesterday';
    } else if (date > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
      groupKey = 'This Week';
    } else {
      groupKey = 'Older';
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(notification);
    return groups;
  }, {});

  const groupOrder = ['Today', 'Yesterday', 'This Week', 'Older'];

  return (
    <div className="notification-list-container">
      {groupOrder.map(groupKey => {
        const groupNotifications = groupedNotifications[groupKey];
        if (!groupNotifications || groupNotifications.length === 0) return null;

        return (
          <div key={groupKey} className="notification-group">
            <h3 className="group-header">{groupKey}</h3>
            <div className="notification-items">
              {groupNotifications.map(notification => (
                <div
                  key={notification._id}
                  className={`notification-item ${!notification.isRead ? 'unread' : ''} ${notification.priority || ''}`}
                  onClick={() => onNotificationClick(notification)}
                >
                  {/* Notification Icon */}
                  <div className={`notification-icon ${notification.type}`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Notification Content */}
                  <div className="notification-content">
                    <div className="notification-header-row">
                      <h4 className="notification-title">
                        {notification.title}
                        {getPriorityBadge(notification.priority)}
                      </h4>
                      <span className="notification-time">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className="notification-message">{notification.message}</p>
                    
                    {/* Action buttons if any */}
                    {notification.actions && notification.actions.length > 0 && (
                      <div className="notification-actions">
                        {notification.actions.map((action, index) => (
                          <button
                            key={index}
                            className="notification-action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (action.onClick) action.onClick();
                            }}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Unread indicator */}
                  {!notification.isRead && (
                    <div className="unread-indicator" />
                  )}

                  {/* Action buttons */}
                  <div className="notification-item-actions">
                    {!notification.isRead && onMarkAsRead && (
                      <button
                        className="mark-read-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkAsRead(notification._id);
                        }}
                        aria-label="Mark as read"
                        title="Mark as read"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </button>
                    )}
                    {onDeleteNotification && (
                      <button
                        className="delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteNotification(notification._id);
                        }}
                        aria-label="Delete notification"
                        title="Delete"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationList;
