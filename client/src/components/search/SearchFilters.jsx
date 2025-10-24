import { useState, useEffect } from 'react';
import './SearchFilters.css';

const VEHICLE_TYPES = [
  { value: 'all', label: 'All Vehicles' },
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'luxury', label: 'Luxury' }
];

const TIME_PERIODS = [
  { value: 'all', label: 'Any Time', icon: '🕐' },
  { value: 'morning', label: 'Morning', time: '6 AM - 12 PM', icon: '🌅' },
  { value: 'afternoon', label: 'Afternoon', time: '12 PM - 5 PM', icon: '☀️' },
  { value: 'evening', label: 'Evening', time: '5 PM - 9 PM', icon: '🌆' },
  { value: 'night', label: 'Night', time: '9 PM - 6 AM', icon: '🌙' }
];

const RATING_OPTIONS = [
  { value: 0, label: 'Any Rating' },
  { value: 3, label: '3+ ⭐' },
  { value: 4, label: '4+ ⭐' },
  { value: 4.5, label: '4.5+ ⭐' },
  { value: 5, label: '5 ⭐' }
];

const SearchFilters = ({ filters, onFilterChange, isMobile, onClose }) => {
  const [localFilters, setLocalFilters] = useState(filters || {
    priceMin: '',
    priceMax: '',
    timePeriod: 'all',
    seats: 'any',
    vehicleType: 'all',
    minRating: 0,
    instantBook: false,
    verifiedDrivers: false
  });

  const [isExpanded, setIsExpanded] = useState(!isMobile);

  useEffect(() => {
    if (filters) {
      setLocalFilters(filters);
    }
  }, [filters]);

  const handleFilterChange = (key, value) => {
    const updatedFilters = {
      ...localFilters,
      [key]: value
    };
    setLocalFilters(updatedFilters);
    
    if (onFilterChange) {
      onFilterChange(updatedFilters);
    }
  };

  const handleResetFilters = () => {
    const resetFilters = {
      priceMin: '',
      priceMax: '',
      timePeriod: 'all',
      seats: 'any',
      vehicleType: 'all',
      minRating: 0,
      instantBook: false,
      verifiedDrivers: false
    };
    setLocalFilters(resetFilters);
    
    if (onFilterChange) {
      onFilterChange(resetFilters);
    }
  };

  const activeFilterCount = () => {
    let count = 0;
    if (localFilters.priceMin || localFilters.priceMax) count++;
    if (localFilters.timePeriod !== 'all') count++;
    if (localFilters.seats !== 'any') count++;
    if (localFilters.vehicleType !== 'all') count++;
    if (localFilters.minRating > 0) count++;
    if (localFilters.instantBook) count++;
    if (localFilters.verifiedDrivers) count++;
    return count;
  };

  const filterContent = (
    <div className="search-filters-content">
      {/* Price Range */}
      <div className="filter-group">
        <label className="filter-label">
          <span className="label-icon">💰</span>
          Price Range
        </label>
        <div className="price-range-inputs">
          <input
            type="number"
            placeholder="Min ₹"
            value={localFilters.priceMin}
            onChange={(e) => handleFilterChange('priceMin', e.target.value)}
            className="price-input"
            min="0"
          />
          <span className="price-separator">to</span>
          <input
            type="number"
            placeholder="Max ₹"
            value={localFilters.priceMax}
            onChange={(e) => handleFilterChange('priceMax', e.target.value)}
            className="price-input"
            min="0"
          />
        </div>
      </div>

      {/* Time Period */}
      <div className="filter-group">
        <label className="filter-label">
          <span className="label-icon">⏰</span>
          Time of Day
        </label>
        <div className="time-period-grid">
          {TIME_PERIODS.map((period) => (
            <button
              key={period.value}
              className={`time-period-btn ${localFilters.timePeriod === period.value ? 'active' : ''}`}
              onClick={() => handleFilterChange('timePeriod', period.value)}
            >
              <span className="time-icon">{period.icon}</span>
              <span className="time-label">{period.label}</span>
              {period.time && <span className="time-range">{period.time}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Seats */}
      <div className="filter-group">
        <label className="filter-label">
          <span className="label-icon">🪑</span>
          Available Seats
        </label>
        <div className="seats-selector">
          {['any', '1', '2', '3', '4+'].map((seat) => (
            <button
              key={seat}
              className={`seat-btn ${localFilters.seats === seat ? 'active' : ''}`}
              onClick={() => handleFilterChange('seats', seat)}
            >
              {seat === 'any' ? 'Any' : seat}
            </button>
          ))}
        </div>
      </div>

      {/* Vehicle Type */}
      <div className="filter-group">
        <label className="filter-label">
          <span className="label-icon">🚗</span>
          Vehicle Type
        </label>
        <select
          className="vehicle-select"
          value={localFilters.vehicleType}
          onChange={(e) => handleFilterChange('vehicleType', e.target.value)}
        >
          {VEHICLE_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Rating */}
      <div className="filter-group">
        <label className="filter-label">
          <span className="label-icon">⭐</span>
          Minimum Rating
        </label>
        <div className="rating-buttons">
          {RATING_OPTIONS.map((option) => (
            <button
              key={option.value}
              className={`rating-btn ${localFilters.minRating === option.value ? 'active' : ''}`}
              onClick={() => handleFilterChange('minRating', option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Filters */}
      <div className="filter-group">
        <label className="filter-label">
          <span className="label-icon">⚡</span>
          Quick Filters
        </label>
        <div className="quick-filters">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={localFilters.instantBook}
              onChange={(e) => handleFilterChange('instantBook', e.target.checked)}
            />
            <span className="checkbox-custom"></span>
            <span className="checkbox-text">Instant Book</span>
          </label>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={localFilters.verifiedDrivers}
              onChange={(e) => handleFilterChange('verifiedDrivers', e.target.checked)}
            />
            <span className="checkbox-custom"></span>
            <span className="checkbox-text">Verified Drivers Only</span>
          </label>
        </div>
      </div>

      {/* Reset Button */}
      {activeFilterCount() > 0 && (
        <button className="reset-filters-btn" onClick={handleResetFilters}>
          Reset All Filters ({activeFilterCount()})
        </button>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <div className={`search-filters-drawer ${isExpanded ? 'open' : ''}`}>
        <div className="drawer-overlay" onClick={onClose}></div>
        <div className="drawer-content">
          <div className="drawer-header">
            <h3>Filters</h3>
            <button className="drawer-close" onClick={onClose}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          {filterContent}
          <div className="drawer-footer">
            <button className="apply-filters-btn" onClick={onClose}>
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="search-filters-sidebar">
      <div className="filters-header">
        <h3>Filters</h3>
        {activeFilterCount() > 0 && (
          <span className="active-count">{activeFilterCount()}</span>
        )}
      </div>
      {filterContent}
    </div>
  );
};

export default SearchFilters;
