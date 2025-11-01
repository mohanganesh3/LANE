import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/apiService';
import { socketService } from '../../services/socketService';

/**
 * useEmergencyNotifications Hook
 * Manages real-time emergency notifications via Socket.io
 */
export const useEmergencyNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Connect to Socket.IO
    socketService.connect();

    // Listen for emergency notifications
    socketService.on('emergency:triggered', handleEmergencyNotification);
    socketService.on('emergency:updated', handleEmergencyUpdate);
    socketService.on('emergency:resolved', handleEmergencyResolved);

    // Fetch initial notifications
    fetchNotifications();

    return () => {
      socketService.off('emergency:triggered');
      socketService.off('emergency:updated');
      socketService.off('emergency:resolved');
    };
  }, []);

  const handleEmergencyNotification = (data) => {
    setNotifications((prev) => [data, ...prev]);
    setUnreadCount((prev) => prev + 1);
    
    // Show browser notification if supported
    showBrowserNotification(data);
    
    // Play alert sound
    playAlertSound();
  };

  const handleEmergencyUpdate = (data) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === data.id ? { ...notif, ...data } : notif))
    );
  };

  const handleEmergencyResolved = (data) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === data.id ? { ...notif, status: 'resolved', resolvedAt: data.resolvedAt } : notif
      )
    );
  };

  const fetchNotifications = async () => {
    try {
      const response = await apiService.get('/notifications/emergency');
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (err) {
      console.error('Failed to fetch emergency notifications:', err);
    }
  };

  const showBrowserNotification = (data) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Emergency Alert', {
        body: `Emergency: ${data.type} - ${data.message}`,
        icon: '/images/emergency-icon.png',
        badge: '/images/badge.png',
        tag: `emergency-${data.id}`,
        requireInteraction: true,
      });
    }
  };

  const playAlertSound = () => {
    const audio = new Audio('/sounds/emergency-alert.mp3');
    audio.play().catch((err) => console.error('Failed to play alert sound:', err));
  };

  const markAsRead = async (notificationId) => {
    try {
      await apiService.put(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiService.put('/notifications/emergency/mark-all-read');
      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
};

/**
 * EmergencyNotificationBanner Component
 * Displays active emergency notification banner
 */
export const EmergencyNotificationBanner = ({ notification, onDismiss }) => {
  if (!notification || notification.status === 'resolved') return null;

  const getTypeIcon = (type) => {
    const icons = {
      accident: '🚨',
      medical: '🏥',
      harassment: '⚠️',
      breakdown: '🔧',
      route_deviation: '🗺️',
      other: '🆘',
    };
    return icons[type] || icons.other;
  };

  const getTypeColor = (type) => {
    const colors = {
      accident: '#ef4444',
      medical: '#dc2626',
      harassment: '#f59e0b',
      breakdown: '#8b5cf6',
      route_deviation: '#f97316',
      other: '#ec4899',
    };
    return colors[type] || colors.other;
  };

  return (
    <div
      className="emergency-notification-banner"
      style={{ borderLeftColor: getTypeColor(notification.type) }}
    >
      <div className="banner-icon">{getTypeIcon(notification.type)}</div>
      <div className="banner-content">
        <h4>Emergency Alert Active</h4>
        <p>{notification.message}</p>
        <span className="banner-time">
          {new Date(notification.timestamp).toLocaleTimeString()}
        </span>
      </div>
      <button className="banner-dismiss" onClick={onDismiss}>
        ✕
      </button>

      <style jsx>{`
        .emergency-notification-banner {
          position: fixed;
          top: 1rem;
          right: 1rem;
          left: 1rem;
          max-width: 500px;
          margin-left: auto;
          background: white;
          border-radius: 12px;
          border-left: 4px solid;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          padding: 1.25rem;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          z-index: 9998;
          animation: slideIn 0.4s ease-out;
        }

        @keyframes slideIn {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .banner-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .banner-content {
          flex: 1;
        }

        .banner-content h4 {
          font-size: 1rem;
          color: #111827;
          margin-bottom: 0.25rem;
          font-weight: 600;
        }

        .banner-content p {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0 0 0.375rem 0;
        }

        .banner-time {
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .banner-dismiss {
          flex-shrink: 0;
          background: none;
          border: none;
          font-size: 1.25rem;
          color: #9ca3af;
          cursor: pointer;
          padding: 0.25rem;
          line-height: 1;
          transition: color 0.2s;
        }

        .banner-dismiss:hover {
          color: #374151;
        }

        @media (max-width: 640px) {
          .emergency-notification-banner {
            top: 0.5rem;
            right: 0.5rem;
            left: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * EmergencyNotificationsList Component
 * Lists all emergency notifications
 */
export const EmergencyNotificationsList = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useEmergencyNotifications();
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'resolved'

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'resolved') return notif.status === 'resolved';
    return true;
  });

  const getTypeIcon = (type) => {
    const icons = {
      accident: '🚨',
      medical: '🏥',
      harassment: '⚠️',
      breakdown: '🔧',
      route_deviation: '🗺️',
      other: '🆘',
    };
    return icons[type] || icons.other;
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { label: 'Active', color: '#ef4444', bg: '#fee2e2' },
      acknowledged: { label: 'Acknowledged', color: '#f59e0b', bg: '#fef3c7' },
      resolved: { label: 'Resolved', color: '#10b981', bg: '#d1fae5' },
    };
    return badges[status] || badges.active;
  };

  return (
    <div className="emergency-notifications-list">
      <div className="list-header">
        <h3>
          Emergency Notifications
          {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
        </h3>
        {unreadCount > 0 && (
          <button className="btn-mark-all-read" onClick={markAllAsRead}>
            Mark All as Read
          </button>
        )}
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadCount})
        </button>
        <button
          className={`filter-tab ${filter === 'resolved' ? 'active' : ''}`}
          onClick={() => setFilter('resolved')}
        >
          Resolved
        </button>
      </div>

      <div className="notifications-container">
        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <p>No emergency notifications</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const statusBadge = getStatusBadge(notif.status);
            
            return (
              <div
                key={notif.id}
                className={`notification-item ${!notif.read ? 'unread' : ''}`}
                onClick={() => !notif.read && markAsRead(notif.id)}
              >
                <div className="notif-icon">{getTypeIcon(notif.type)}</div>
                <div className="notif-content">
                  <div className="notif-header">
                    <h4>{notif.title}</h4>
                    <span
                      className="status-badge"
                      style={{ background: statusBadge.bg, color: statusBadge.color }}
                    >
                      {statusBadge.label}
                    </span>
                  </div>
                  <p>{notif.message}</p>
                  <span className="notif-time">
                    {new Date(notif.timestamp).toLocaleString()}
                  </span>
                </div>
                {!notif.read && <div className="unread-dot" />}
              </div>
            );
          })
        )}
      </div>

      <style jsx>{`
        .emergency-notifications-list {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .list-header h3 {
          font-size: 1.25rem;
          color: #111827;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .unread-badge {
          background: #ef4444;
          color: white;
          padding: 0.25rem 0.625rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .btn-mark-all-read {
          padding: 0.5rem 1rem;
          background: #f3f4f6;
          color: #374151;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-mark-all-read:hover {
          background: #e5e7eb;
        }

        .filter-tabs {
          display: flex;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .filter-tab {
          padding: 0.5rem 1rem;
          background: none;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-tab.active {
          background: #3b82f6;
          color: white;
        }

        .filter-tab:hover:not(.active) {
          background: #f3f4f6;
        }

        .notifications-container {
          max-height: 500px;
          overflow-y: auto;
        }

        .empty-state {
          padding: 3rem 1.5rem;
          text-align: center;
          color: #9ca3af;
        }

        .notification-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #f3f4f6;
          cursor: pointer;
          transition: background 0.2s;
          position: relative;
        }

        .notification-item.unread {
          background: #eff6ff;
        }

        .notification-item:hover {
          background: #f9fafb;
        }

        .notif-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .notif-content {
          flex: 1;
        }

        .notif-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.375rem;
        }

        .notif-header h4 {
          font-size: 0.875rem;
          color: #111827;
          font-weight: 600;
        }

        .status-badge {
          padding: 0.25rem 0.625rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .notif-content p {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0 0 0.375rem 0;
        }

        .notif-time {
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .unread-dot {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          width: 8px;
          height: 8px;
          background: #3b82f6;
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
};

export default {
  useEmergencyNotifications,
  EmergencyNotificationBanner,
  EmergencyNotificationsList,
};
