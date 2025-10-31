import React, { useState } from 'react';
import './NotificationFilters.css';

/**
 * NotificationFilters Component
 * Advanced filtering options for notifications
 */
const NotificationFilters = ({ onFilterChange, activeFilters = {} }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    type: activeFilters.type || 'all',
    status: activeFilters.status || 'all',
    priority: activeFilters.priority || 'all',
    dateRange: activeFilters.dateRange || 'all',
    ...activeFilters,
  });

  // Notification types
  const notificationTypes = [
    { id: 'all', label: 'All', icon: '📬', color: '#6b7280' },
    { id: 'booking', label: 'Bookings', icon: '📅', color: '#3b82f6' },
    { id: 'ride', label: 'Rides', icon: '🚗', color: '#10b981' },
    { id: 'payment', label: 'Payments', icon: '💳', color: '#8b5cf6' },
    { id: 'promotion', label: 'Promotions', icon: '🎁', color: '#ec4899' },
    { id: 'alert', label: 'Alerts', icon: '⚠️', color: '#ef4444' },
    { id: 'system', label: 'System', icon: 'ℹ️', color: '#6b7280' },
  ];

  // Priority levels
  const priorityLevels = [
    { id: 'all', label: 'All Priorities' },
    { id: 'urgent', label: 'Urgent', badge: '🔴' },
    { id: 'high', label: 'High', badge: '🟠' },
    { id: 'normal', label: 'Normal', badge: '🟢' },
    { id: 'low', label: 'Low', badge: '🔵' },
  ];

  // Date ranges
  const dateRanges = [
    { id: 'all', label: 'All Time' },
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'custom', label: 'Custom Range' },
  ];

  // Read status options
  const statusOptions = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'read', label: 'Read' },
  ];

  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...filters, [filterKey]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      type: 'all',
      status: 'all',
      priority: 'all',
      dateRange: 'all',
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
    setShowAdvanced(false);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.type !== 'all') count++;
    if (filters.status !== 'all') count++;
    if (filters.priority !== 'all') count++;
    if (filters.dateRange !== 'all') count++;
    return count;
  };

  const activeCount = getActiveFilterCount();

  return (
    <div className="notification-filters-container">
      {/* Primary Filters - Type Tabs */}
      <div className="primary-filters">
        <div className="filter-tabs">
          {notificationTypes.map(type => (
            <button
              key={type.id}
              className={`filter-tab ${filters.type === type.id ? 'active' : ''}`}
              onClick={() => handleFilterChange('type', type.id)}
              style={filters.type === type.id ? { borderBottomColor: type.color } : {}}
            >
              <span className="tab-icon">{type.icon}</span>
              <span className="tab-label">{type.label}</span>
            </button>
          ))}
        </div>

        <div className="filter-actions">
          <button
            className={`advanced-filter-btn ${showAdvanced ? 'active' : ''}`}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="4" y1="21" x2="4" y2="14"/>
              <line x1="4" y1="10" x2="4" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12" y2="3"/>
              <line x1="20" y1="21" x2="20" y2="16"/>
              <line x1="20" y1="12" x2="20" y2="3"/>
              <line x1="1" y1="14" x2="7" y2="14"/>
              <line x1="9" y1="8" x2="15" y2="8"/>
              <line x1="17" y1="16" x2="23" y2="16"/>
            </svg>
            Filters
            {activeCount > 0 && (
              <span className="filter-count-badge">{activeCount}</span>
            )}
          </button>

          {activeCount > 0 && (
            <button
              className="reset-filters-btn"
              onClick={handleResetFilters}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="advanced-filters">
          {/* Read Status Filter */}
          <div className="filter-group">
            <label className="filter-label">Status</label>
            <div className="filter-options horizontal">
              {statusOptions.map(option => (
                <button
                  key={option.id}
                  className={`filter-option ${filters.status === option.id ? 'active' : ''}`}
                  onClick={() => handleFilterChange('status', option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div className="filter-group">
            <label className="filter-label">Priority</label>
            <div className="filter-options horizontal">
              {priorityLevels.map(level => (
                <button
                  key={level.id}
                  className={`filter-option ${filters.priority === level.id ? 'active' : ''}`}
                  onClick={() => handleFilterChange('priority', level.id)}
                >
                  {level.badge && <span className="option-badge">{level.badge}</span>}
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="filter-group">
            <label className="filter-label">Time Period</label>
            <div className="filter-options horizontal">
              {dateRanges.map(range => (
                <button
                  key={range.id}
                  className={`filter-option ${filters.dateRange === range.id ? 'active' : ''}`}
                  onClick={() => handleFilterChange('dateRange', range.id)}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Range */}
          {filters.dateRange === 'custom' && (
            <div className="filter-group custom-date-range">
              <div className="date-inputs">
                <div className="date-input-group">
                  <label htmlFor="start-date">From</label>
                  <input
                    type="date"
                    id="start-date"
                    value={filters.startDate || ''}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  />
                </div>
                <div className="date-input-group">
                  <label htmlFor="end-date">To</label>
                  <input
                    type="date"
                    id="end-date"
                    value={filters.endDate || ''}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Sort Options */}
          <div className="filter-group">
            <label className="filter-label">Sort By</label>
            <select
              className="sort-select"
              value={filters.sortBy || 'newest'}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Priority</option>
              <option value="type">Type</option>
              <option value="unread">Unread First</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * QuickFilters Component
 * Quick filter buttons for common scenarios
 */
export const QuickFilters = ({ onQuickFilter, activeQuickFilter }) => {
  const quickFilters = [
    {
      id: 'unread-urgent',
      label: 'Urgent Unread',
      icon: '🔴',
      filters: { status: 'unread', priority: 'urgent' },
    },
    {
      id: 'today-rides',
      label: 'Today\'s Rides',
      icon: '🚗',
      filters: { type: 'ride', dateRange: 'today' },
    },
    {
      id: 'pending-payments',
      label: 'Payment Alerts',
      icon: '💳',
      filters: { type: 'payment', status: 'unread' },
    },
    {
      id: 'promotions',
      label: 'Offers & Promos',
      icon: '🎁',
      filters: { type: 'promotion' },
    },
  ];

  return (
    <div className="quick-filters">
      <span className="quick-filters-label">Quick filters:</span>
      <div className="quick-filter-buttons">
        {quickFilters.map(filter => (
          <button
            key={filter.id}
            className={`quick-filter-btn ${activeQuickFilter === filter.id ? 'active' : ''}`}
            onClick={() => onQuickFilter(filter.id, filter.filters)}
          >
            <span className="quick-filter-icon">{filter.icon}</span>
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * FilterSummary Component
 * Shows active filters summary
 */
export const FilterSummary = ({ filters, onRemoveFilter }) => {
  const activeFilters = Object.entries(filters)
    .filter(([key, value]) => value !== 'all' && value !== undefined && value !== '')
    .map(([key, value]) => ({ key, value }));

  if (activeFilters.length === 0) {
    return null;
  }

  const getFilterLabel = (key, value) => {
    const labels = {
      type: 'Type',
      status: 'Status',
      priority: 'Priority',
      dateRange: 'Period',
    };
    return `${labels[key] || key}: ${value}`;
  };

  return (
    <div className="filter-summary">
      <span className="summary-label">Active filters:</span>
      <div className="summary-tags">
        {activeFilters.map(({ key, value }) => (
          <span key={key} className="filter-tag">
            {getFilterLabel(key, value)}
            <button
              className="remove-filter-btn"
              onClick={() => onRemoveFilter(key)}
              aria-label={`Remove ${key} filter`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default NotificationFilters;
