import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

/**
 * useRealtimeNotifications Hook
 * Manages real-time notification updates via Socket.IO
 */
export const useRealtimeNotifications = (userId, options = {}) => {
  const {
    autoConnect = true,
    onNewNotification,
    onNotificationUpdate,
    onNotificationDelete,
  } = options;

  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationSoundRef = useRef(null);

  useEffect(() => {
    if (!userId || !autoConnect) return;

    // Initialize Socket.IO connection
    const socketInstance = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      auth: { userId },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Connection events
    socketInstance.on('connect', () => {
      console.log('Real-time notifications connected');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Real-time notifications disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    // Notification events
    socketInstance.on('notification:new', (notification) => {
      console.log('New notification received:', notification);
      
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Play notification sound
      playNotificationSound(notification);

      // Show browser notification
      showBrowserNotification(notification);

      // Call callback
      if (onNewNotification) {
        onNewNotification(notification);
      }
    });

    socketInstance.on('notification:update', (updatedNotification) => {
      console.log('Notification updated:', updatedNotification);
      
      setNotifications(prev =>
        prev.map(n => n._id === updatedNotification._id ? updatedNotification : n)
      );

      if (onNotificationUpdate) {
        onNotificationUpdate(updatedNotification);
      }
    });

    socketInstance.on('notification:delete', (notificationId) => {
      console.log('Notification deleted:', notificationId);
      
      setNotifications(prev =>
        prev.filter(n => n._id !== notificationId)
      );

      if (onNotificationDelete) {
        onNotificationDelete(notificationId);
      }
    });

    socketInstance.on('notification:markAsRead', (notificationId) => {
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    });

    socketInstance.on('notification:markAllAsRead', () => {
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    });

    setSocket(socketInstance);

    // Cleanup
    return () => {
      socketInstance.disconnect();
    };
  }, [userId, autoConnect]);

  // Play notification sound
  const playNotificationSound = (notification) => {
    if (!notification.sound) return;

    try {
      if (!notificationSoundRef.current) {
        notificationSoundRef.current = new Audio('/sounds/notification.mp3');
      }
      notificationSoundRef.current.play().catch(err => {
        console.warn('Failed to play notification sound:', err);
      });
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  // Show browser notification
  const showBrowserNotification = (notification) => {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: notification._id,
        requireInteraction: notification.priority === 'urgent',
      });

      browserNotification.onclick = () => {
        window.focus();
        if (notification.link) {
          window.location.href = notification.link;
        }
      };
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  };

  // Emit events
  const markAsRead = (notificationId) => {
    if (socket) {
      socket.emit('notification:markAsRead', notificationId);
    }
  };

  const markAllAsRead = () => {
    if (socket) {
      socket.emit('notification:markAllAsRead');
    }
  };

  const deleteNotification = (notificationId) => {
    if (socket) {
      socket.emit('notification:delete', notificationId);
    }
  };

  return {
    socket,
    isConnected,
    notifications,
    setNotifications,
    unreadCount,
    setUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};

/**
 * useNotificationPermission Hook
 * Manages browser notification permissions
 */
export const useNotificationPermission = () => {
  const [permission, setPermission] = useState(
    'Notification' in window ? Notification.permission : 'denied'
  );

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications');
      return 'denied';
    }

    if (permission === 'granted') {
      return 'granted';
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return 'denied';
    }
  };

  return {
    permission,
    requestPermission,
    isSupported: 'Notification' in window,
    isGranted: permission === 'granted',
    isDenied: permission === 'denied',
  };
};

/**
 * useNotificationSound Hook
 * Manages notification sound preferences
 */
export const useNotificationSound = (defaultEnabled = true) => {
  const [enabled, setEnabled] = useState(() => {
    const saved = localStorage.getItem('notificationSoundEnabled');
    return saved !== null ? JSON.parse(saved) : defaultEnabled;
  });

  const audioRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('notificationSoundEnabled', JSON.stringify(enabled));
  }, [enabled]);

  const playSound = (soundFile = '/sounds/notification.mp3') => {
    if (!enabled) return;

    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(soundFile);
      } else {
        audioRef.current.src = soundFile;
      }
      audioRef.current.play().catch(err => {
        console.warn('Failed to play sound:', err);
      });
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const toggle = () => setEnabled(prev => !prev);

  return {
    enabled,
    setEnabled,
    toggle,
    playSound,
  };
};

/**
 * NotificationBadge Component
 * Displays unread notification count with real-time updates
 */
export const NotificationBadge = ({ userId, maxCount = 99, onClick }) => {
  const { unreadCount, isConnected } = useRealtimeNotifications(userId);

  const displayCount = unreadCount > maxCount ? `${maxCount}+` : unreadCount;

  return (
    <button
      className={`notification-badge-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
      onClick={onClick}
      aria-label={`${unreadCount} unread notifications`}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
      {unreadCount > 0 && (
        <span className="badge-count">{displayCount}</span>
      )}
      {!isConnected && (
        <span className="connection-indicator offline" title="Disconnected" />
      )}
    </button>
  );
};

/**
 * RealtimeNotificationToast Component
 * Shows toast notifications for new notifications
 */
export const RealtimeNotificationToast = ({ userId, position = 'top-right', duration = 5000 }) => {
  const [toasts, setToasts] = useState([]);

  useRealtimeNotifications(userId, {
    onNewNotification: (notification) => {
      const toast = {
        id: notification._id,
        ...notification,
        timestamp: Date.now(),
      };

      setToasts(prev => [toast, ...prev].slice(0, 3)); // Keep max 3 toasts

      // Auto-remove after duration
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, duration);
    },
  });

  const handleDismiss = (toastId) => {
    setToasts(prev => prev.filter(t => t.id !== toastId));
  };

  if (toasts.length === 0) return null;

  return (
    <div className={`notification-toast-container ${position}`}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`notification-toast ${toast.type} ${toast.priority}`}
        >
          <div className="toast-content">
            <h4>{toast.title}</h4>
            <p>{toast.message}</p>
          </div>
          <button
            className="toast-dismiss"
            onClick={() => handleDismiss(toast.id)}
            aria-label="Dismiss"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

export default {
  useRealtimeNotifications,
  useNotificationPermission,
  useNotificationSound,
  NotificationBadge,
  RealtimeNotificationToast,
};
