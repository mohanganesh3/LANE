import React, { useState } from 'react';
import './MarkAsRead.css';

/**
 * MarkAsRead Component
 * Provides mark as read functionality for notifications
 */

// Hook for managing mark as read functionality
export const useMarkAsRead = (initialNotifications = []) => {
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification._id === notificationId
          ? { ...notification, isRead: true, readAt: new Date() }
          : notification
      )
    );
  };

  const markMultipleAsRead = (notificationIds) => {
    setNotifications(prev =>
      prev.map(notification =>
        notificationIds.includes(notification._id)
          ? { ...notification, isRead: true, readAt: new Date() }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({
        ...notification,
        isRead: true,
        readAt: new Date(),
      }))
    );
  };

  const getUnreadCount = () => {
    return notifications.filter(n => !n.isRead).length;
  };

  const getUnreadNotifications = () => {
    return notifications.filter(n => !n.isRead);
  };

  return {
    notifications,
    setNotifications,
    markAsRead,
    markMultipleAsRead,
    markAllAsRead,
    getUnreadCount,
    getUnreadNotifications,
  };
};

/**
 * MarkAsReadButton Component
 * Button to mark a single notification as read
 */
export const MarkAsReadButton = ({ notificationId, onMarkAsRead, isRead, compact = false }) => {
  const [isMarking, setIsMarking] = useState(false);

  const handleClick = async (e) => {
    e.stopPropagation();
    if (isRead) return;

    setIsMarking(true);
    try {
      await onMarkAsRead(notificationId);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    } finally {
      setIsMarking(false);
    }
  };

  if (isRead) {
    return compact ? null : (
      <span className="read-status-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Read
      </span>
    );
  }

  return (
    <button
      className={`mark-as-read-btn ${compact ? 'compact' : ''} ${isMarking ? 'marking' : ''}`}
      onClick={handleClick}
      disabled={isMarking}
      aria-label="Mark as read"
      title="Mark as read"
    >
      {isMarking ? (
        <span className="btn-spinner" />
      ) : compact ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Mark as read
        </>
      )}
    </button>
  );
};

/**
 * MarkAllAsReadButton Component
 * Button to mark all notifications as read
 */
export const MarkAllAsReadButton = ({ onMarkAllAsRead, unreadCount, disabled = false }) => {
  const [isMarking, setIsMarking] = useState(false);

  const handleClick = async () => {
    if (disabled || unreadCount === 0) return;

    setIsMarking(true);
    try {
      await onMarkAllAsRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    } finally {
      setIsMarking(false);
    }
  };

  if (unreadCount === 0) {
    return null;
  }

  return (
    <button
      className={`mark-all-read-btn ${isMarking ? 'marking' : ''}`}
      onClick={handleClick}
      disabled={disabled || isMarking}
    >
      {isMarking ? (
        <>
          <span className="btn-spinner" />
          Marking all as read...
        </>
      ) : (
        <>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="9 11 12 14 22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          Mark all as read ({unreadCount})
        </>
      )}
    </button>
  );
};

/**
 * UnreadBadge Component
 * Displays unread notification count
 */
export const UnreadBadge = ({ count, max = 99, showZero = false }) => {
  if (count === 0 && !showZero) {
    return null;
  }

  const displayCount = count > max ? `${max}+` : count;

  return (
    <span className={`unread-badge ${count > 0 ? 'has-unread' : ''}`}>
      {displayCount}
    </span>
  );
};

/**
 * UnreadIndicator Component
 * Visual indicator for unread notifications
 */
export const UnreadIndicator = ({ isRead, size = 'medium' }) => {
  if (isRead) return null;

  return (
    <div className={`unread-indicator ${size}`} aria-label="Unread notification">
      <span className="pulse-ring" />
      <span className="indicator-dot" />
    </div>
  );
};

/**
 * BatchMarkActions Component
 * Bulk actions for marking notifications
 */
export const BatchMarkActions = ({
  selectedCount,
  onMarkSelectedAsRead,
  onSelectAll,
  onClearSelection,
  totalUnread,
}) => {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="batch-mark-actions">
      <div className="selection-info">
        <span className="selected-count">{selectedCount} selected</span>
        <button className="clear-selection-btn" onClick={onClearSelection}>
          Clear
        </button>
      </div>
      <div className="batch-buttons">
        <button
          className="batch-action-btn mark-read"
          onClick={onMarkSelectedAsRead}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Mark as read
        </button>
        {selectedCount < totalUnread && (
          <button className="batch-action-btn select-all" onClick={onSelectAll}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="9 11 12 14 22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            Select all unread
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * ReadStatusFilter Component
 * Filter notifications by read status
 */
export const ReadStatusFilter = ({ filter, onChange }) => {
  return (
    <div className="read-status-filter">
      <button
        className={`filter-option ${filter === 'all' ? 'active' : ''}`}
        onClick={() => onChange('all')}
      >
        All
      </button>
      <button
        className={`filter-option ${filter === 'unread' ? 'active' : ''}`}
        onClick={() => onChange('unread')}
      >
        Unread
      </button>
      <button
        className={`filter-option ${filter === 'read' ? 'active' : ''}`}
        onClick={() => onChange('read')}
      >
        Read
      </button>
    </div>
  );
};

export default {
  useMarkAsRead,
  MarkAsReadButton,
  MarkAllAsReadButton,
  UnreadBadge,
  UnreadIndicator,
  BatchMarkActions,
  ReadStatusFilter,
};
