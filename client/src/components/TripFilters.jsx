import React, { useState } from 'react';
import './TripFilters.css';

const TripFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    dateRange: 'all',
    status: 'all',
    type: 'all',
    minAmount: '',
    maxAmount: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const defaultFilters = {
      dateRange: 'all',
      status: 'all',
      type: 'all',
      minAmount: '',
      maxAmount: '',
      sortBy: 'date',
      sortOrder: 'desc'
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="trip-filters">
      <div className="filters-header">
        <h3>
          <i className="fas fa-filter"></i>
          Filters
        </h3>
        <button className="btn-reset" onClick={resetFilters}>
          <i className="fas fa-redo"></i>
          Reset
        </button>
      </div>

      <div className="filter-group">
        <label>Date Range</label>
        <select
          value={filters.dateRange}
          onChange={(e) => handleFilterChange('dateRange', e.target.value)}
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="quarter">Last 3 Months</option>
          <option value="year">This Year</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Trip Status</label>
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Trip Type</label>
        <select
          value={filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="rider">As Rider</option>
          <option value="passenger">As Passenger</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Amount Range</label>
        <div className="amount-inputs">
          <input
            type="number"
            placeholder="Min"
            value={filters.minAmount}
            onChange={(e) => handleFilterChange('minAmount', e.target.value)}
          />
          <span>-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxAmount}
            onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
          />
        </div>
      </div>

      <div className="filter-group">
        <label>Sort By</label>
        <select
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
        >
          <option value="date">Date</option>
          <option value="amount">Amount</option>
          <option value="distance">Distance</option>
          <option value="rating">Rating</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Order</label>
        <div className="order-toggle">
          <button
            className={filters.sortOrder === 'asc' ? 'active' : ''}
            onClick={() => handleFilterChange('sortOrder', 'asc')}
          >
            <i className="fas fa-sort-amount-up"></i>
            Ascending
          </button>
          <button
            className={filters.sortOrder === 'desc' ? 'active' : ''}
            onClick={() => handleFilterChange('sortOrder', 'desc')}
          >
            <i className="fas fa-sort-amount-down"></i>
            Descending
          </button>
        </div>
      </div>

      <div className="active-filters">
        <p>Active Filters:</p>
        <div className="filter-tags">
          {filters.dateRange !== 'all' && (
            <span className="filter-tag">
              {filters.dateRange}
              <i className="fas fa-times" onClick={() => handleFilterChange('dateRange', 'all')}></i>
            </span>
          )}
          {filters.status !== 'all' && (
            <span className="filter-tag">
              {filters.status}
              <i className="fas fa-times" onClick={() => handleFilterChange('status', 'all')}></i>
            </span>
          )}
          {filters.type !== 'all' && (
            <span className="filter-tag">
              {filters.type}
              <i className="fas fa-times" onClick={() => handleFilterChange('type', 'all')}></i>
            </span>
          )}
          {(filters.minAmount || filters.maxAmount) && (
            <span className="filter-tag">
              ₹{filters.minAmount || '0'} - ₹{filters.maxAmount || '∞'}
              <i className="fas fa-times" onClick={() => {
                handleFilterChange('minAmount', '');
                handleFilterChange('maxAmount', '');
              }}></i>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripFilters;
