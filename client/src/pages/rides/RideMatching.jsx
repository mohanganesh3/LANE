import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDebounce, useDebouncedCallback } from '../../hooks/useDebounce';
import searchAnalytics from '../../utils/searchAnalytics';
import './RideMatching.css';

const RideMatching = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = location.state || {};

  const [matchedRides, setMatchedRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    sortBy: 'price', // price, rating, departure, distance
    maxPrice: searchParams.maxPrice || 1000,
    minSeats: searchParams.seats || 1,
    vehicleType: searchParams.vehicleType || 'all',
    preferences: {
      smoking: false,
      pets: false,
      music: false,
      instantBook: false,
      verifiedOnly: false
    }
  });
  const [selectedRide, setSelectedRide] = useState(null);
  const [compareList, setCompareList] = useState([]);

  // Debounce search query (500ms delay)
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  
  // Debounce price filter (300ms delay for smoother slider)
  const debouncedMaxPrice = useDebounce(filters.maxPrice, 300);

  useEffect(() => {
    fetchMatchedRides();
  }, [filters.sortBy, debouncedSearchQuery, debouncedMaxPrice, filters.minSeats, filters.vehicleType]);

  // Debounced filter update
  const debouncedFilterUpdate = useDebouncedCallback((filterName, value) => {
    console.log(`Filter ${filterName} debounced to:`, value);
  }, 300);

  const fetchMatchedRides = async () => {
    const searchStartTime = performance.now();
    
    try {
      setSearching(true);
      setError(null);
      
      const response = await axios.get('/api/rides/search', {
        params: {
          pickup: searchParams.pickup,
          dropoff: searchParams.dropoff,
          date: searchParams.date,
          seats: filters.minSeats,
          query: debouncedSearchQuery,
          maxPrice: debouncedMaxPrice,
          vehicleType: filters.vehicleType !== 'all' ? filters.vehicleType : undefined,
          ...filters.preferences
        }
      });
      
      let rides = response.data.rides || generateMockRides();
      
      // Apply local search filter if query exists
      if (debouncedSearchQuery) {
        rides = rides.filter(ride =>
          ride.driver.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
          ride.route.pickup.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
          ride.route.dropoff.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
          ride.vehicle.model.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
        );
      }
      
      const sortedRides = sortRides(rides);
      setMatchedRides(sortedRides);
      setSearching(false);
      setLoading(false);
      setRetryCount(0);
      
      // Track successful search
      const searchEndTime = performance.now();
      searchAnalytics.trackSearch({
        query: debouncedSearchQuery,
        pickup: searchParams.pickup,
        dropoff: searchParams.dropoff,
        date: searchParams.date,
        seats: filters.minSeats,
        filters: filters,
        resultsCount: sortedRides.length
      });
      
      // Track performance
      searchAnalytics.trackPerformance({
        searchDuration: searchEndTime - searchStartTime,
        resultsRendered: sortedRides.length,
        debounceDelay: 500
      });
    } catch (err) {
      console.error('Fetch error:', err);
      
      // Track error
      searchAnalytics.trackError({
        type: err.response ? 'server' : err.request ? 'network' : 'unknown',
        message: err.message,
        context: 'fetchMatchedRides',
        retryAttempt: retryCount
      });
      
      // Set error with detailed information
      if (err.response) {
        // Server responded with error
        setError({
          type: 'server',
          message: err.response.data?.message || 'Server error occurred',
          status: err.response.status
        });
      } else if (err.request) {
        // Network error - no response received
        setError({
          type: 'network',
          message: 'Unable to connect to server. Please check your internet connection.',
          canRetry: true
        });
      } else {
        // Other errors
        setError({
          type: 'unknown',
          message: 'An unexpected error occurred',
          canRetry: true
        });
      }
      
      // Use mock data as fallback
      setMatchedRides(sortRides(generateMockRides()));
      setSearching(false);
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchMatchedRides();
  };

  const generateMockRides = () => {
    const vehicles = ['Sedan', 'SUV', 'Hatchback'];
    const drivers = [
      { name: 'Rajesh Kumar', rating: 4.8, trips: 342, verified: true, photo: '/images/driver1.jpg' },
      { name: 'Priya Sharma', rating: 4.9, trips: 256, verified: true, photo: '/images/driver2.jpg' },
      { name: 'Amit Patel', rating: 4.6, trips: 189, verified: true, photo: '/images/driver3.jpg' },
      { name: 'Sneha Reddy', rating: 4.7, trips: 421, verified: true, photo: '/images/driver4.jpg' },
      { name: 'Vikram Singh', rating: 4.5, trips: 167, verified: false, photo: '/images/driver5.jpg' },
      { name: 'Divya Nair', rating: 4.9, trips: 523, verified: true, photo: '/images/driver6.jpg' },
      { name: 'Karthik Rajan', rating: 4.4, trips: 98, verified: false, photo: '/images/driver7.jpg' },
      { name: 'Ananya Das', rating: 4.8, trips: 376, verified: true, photo: '/images/driver8.jpg' }
    ];

    return drivers.map((driver, index) => ({
      id: `ride-${index + 1}`,
      driver,
      vehicle: {
        type: vehicles[index % 3],
        model: ['Toyota Innova', 'Maruti Swift', 'Hyundai Creta', 'Honda City'][Math.floor(Math.random() * 4)],
        number: `KA-${Math.floor(Math.random() * 100)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${1000 + Math.floor(Math.random() * 9000)}`
      },
      route: {
        pickup: searchParams.pickup || 'Koramangala',
        dropoff: searchParams.dropoff || 'Whitefield',
        distance: (15 + Math.random() * 25).toFixed(1),
        duration: (45 + Math.random() * 45).toFixed(0)
      },
      departure: new Date(Date.now() + Math.random() * 7200000).toISOString(),
      price: Math.floor(200 + Math.random() * 600),
      seatsAvailable: Math.floor(1 + Math.random() * 4),
      preferences: {
        smoking: Math.random() > 0.7,
        pets: Math.random() > 0.8,
        music: Math.random() > 0.5,
        instantBook: Math.random() > 0.6
      },
      amenities: ['AC', 'Music', 'Charging Port'].filter(() => Math.random() > 0.4),
      matchScore: Math.floor(60 + Math.random() * 40)
    }));
  };

  const sortRides = (rides) => {
    const sorted = [...rides];
    switch (filters.sortBy) {
      case 'price':
        return sorted.sort((a, b) => a.price - b.price);
      case 'rating':
        return sorted.sort((a, b) => b.driver.rating - a.driver.rating);
      case 'departure':
        return sorted.sort((a, b) => new Date(a.departure) - new Date(b.departure));
      case 'distance':
        return sorted.sort((a, b) => parseFloat(a.route.distance) - parseFloat(b.route.distance));
      default:
        return sorted;
    }
  };

  const applyFilters = (rides) => {
    return rides.filter(ride => {
      if (ride.price > filters.maxPrice) return false;
      if (ride.seatsAvailable < filters.minSeats) return false;
      if (filters.vehicleType !== 'all' && ride.vehicle.type !== filters.vehicleType) return false;
      if (filters.preferences.instantBook && !ride.preferences.instantBook) return false;
      if (filters.preferences.verifiedOnly && !ride.driver.verified) return false;
      return true;
    });
  };

  const handleSortChange = (sortType) => {
    setFilters({ ...filters, sortBy: sortType });
    
    // Track filter change
    searchAnalytics.trackFilter({
      filterType: 'sort',
      value: sortType,
      allFilters: { ...filters, sortBy: sortType }
    });
  };

  const handleFilterChange = (filterName, value) => {
    setFilters({
      ...filters,
      [filterName]: value
    });
    
    // Track filter change
    searchAnalytics.trackFilter({
      filterType: filterName,
      value: value,
      allFilters: { ...filters, [filterName]: value }
    });
  };

  const handlePreferenceChange = (preference) => {
    const newPreferences = {
      ...filters.preferences,
      [preference]: !filters.preferences[preference]
    };
    
    setFilters({
      ...filters,
      preferences: newPreferences
    });
    
    // Track preference change
    searchAnalytics.trackFilter({
      filterType: 'preference',
      preference: preference,
      value: !filters.preferences[preference],
      allPreferences: newPreferences
    });
  };

  const toggleCompare = (ride) => {
    if (compareList.find(r => r.id === ride.id)) {
      setCompareList(compareList.filter(r => r.id !== ride.id));
    } else if (compareList.length < 3) {
      setCompareList([...compareList, ride]);
    }
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const handleBookRide = (ride) => {
    // Track ride click with position
    const position = filteredRides.findIndex(r => r.id === ride.id) + 1;
    searchAnalytics.trackRideClick({
      ...ride,
      position
    });
    
    // Track engagement
    searchAnalytics.trackEngagement('book_ride_clicked', {
      rideId: ride.id,
      price: ride.pricing?.total,
      position
    });
    
    navigate('/bookings/wizard', { 
      state: { 
        ride,
        searchParams 
      } 
    });
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const filteredRides = applyFilters(matchedRides);

  if (loading) {
    return (
      <div className="ride-matching">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Finding best rides for you...</p>
            <div className="loading-steps">
              <div className="step completed">
                <i className="fas fa-check"></i> Searching routes
              </div>
              <div className="step active">
                <div className="step-spinner"></div> Matching preferences
              </div>
              <div className="step">
                <i className="fas fa-circle"></i> Sorting results
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error && error.type === 'network' && matchedRides.length === 0) {
    return (
      <div className="ride-matching">
        <div className="error-container">
          <div className="error-content">
            <i className="fas fa-exclamation-triangle error-icon"></i>
            <h2>Connection Error</h2>
            <p>{error.message}</p>
            {error.canRetry && (
              <div className="error-actions">
                <button className="retry-btn" onClick={handleRetry}>
                  <i className="fas fa-redo"></i>
                  {retryCount > 0 ? `Retry (Attempt ${retryCount + 1})` : 'Try Again'}
                </button>
                <button className="back-btn" onClick={() => navigate(-1)}>
                  <i className="fas fa-arrow-left"></i>
                  Go Back
                </button>
              </div>
            )}
            <div className="error-tips">
              <h4>Troubleshooting Tips:</h4>
              <ul>
                <li>Check your internet connection</li>
                <li>Refresh the page</li>
                <li>Try searching again later</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ride-matching">
      <div className="matching-header">
        <div className="route-summary">
          <div className="route-info">
            <h1>{searchParams.pickup || 'Pickup'} → {searchParams.dropoff || 'Dropoff'}</h1>
            <p>{searchParams.date ? formatDate(searchParams.date) : 'Today'} • {filters.minSeats} seat{filters.minSeats > 1 ? 's' : ''}</p>
          </div>
          <button className="modify-search" onClick={() => navigate(-1)}>
            Modify Search
          </button>
        </div>

        {/* Debounced Search Input */}
        <div className="search-container">
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            className="search-input"
            placeholder="Search by driver, location, or vehicle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searching && <div className="search-spinner"></div>}
          {searchQuery && (
            <button 
              className="clear-search" 
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>

        {/* Error Banner for minor errors */}
        {error && error.type !== 'network' && (
          <div className="error-banner">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error.message}. Showing cached results.</span>
            <button onClick={() => setError(null)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        <div className="sort-filter-bar">
          <div className="sort-options">
            <span>Sort by:</span>
            <button 
              className={filters.sortBy === 'price' ? 'active' : ''}
              onClick={() => handleSortChange('price')}
            >
              Price
            </button>
            <button 
              className={filters.sortBy === 'rating' ? 'active' : ''}
              onClick={() => handleSortChange('rating')}
            >
              Rating
            </button>
            <button 
              className={filters.sortBy === 'departure' ? 'active' : ''}
              onClick={() => handleSortChange('departure')}
            >
              Departure
            </button>
            <button 
              className={filters.sortBy === 'distance' ? 'active' : ''}
              onClick={() => handleSortChange('distance')}
            >
              Distance
            </button>
          </div>

          <div className="quick-filters">
            <label className={filters.preferences.instantBook ? 'active' : ''}>
              <input
                type="checkbox"
                checked={filters.preferences.instantBook}
                onChange={() => handlePreferenceChange('instantBook')}
              />
              Instant Book
            </label>
            <label className={filters.preferences.verifiedOnly ? 'active' : ''}>
              <input
                type="checkbox"
                checked={filters.preferences.verifiedOnly}
                onChange={() => handlePreferenceChange('verifiedOnly')}
              />
              Verified Only
            </label>
          </div>
        </div>
      </div>

      <div className="matching-content">
        <aside className="filter-sidebar">
          <h3>Filters</h3>
          
          <div className="filter-group">
            <label>Max Price: ₹{filters.maxPrice}</label>
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value))}
            />
            <div className="range-labels">
              <span>₹100</span>
              <span>₹2000</span>
            </div>
          </div>

          <div className="filter-group">
            <label>Min Seats</label>
            <select 
              value={filters.minSeats}
              onChange={(e) => handleFilterChange('minSeats', parseInt(e.target.value))}
            >
              <option value="1">1 Seat</option>
              <option value="2">2 Seats</option>
              <option value="3">3 Seats</option>
              <option value="4">4 Seats</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Vehicle Type</label>
            <select 
              value={filters.vehicleType}
              onChange={(e) => handleFilterChange('vehicleType', e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="Hatchback">Hatchback</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Preferences</label>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={filters.preferences.smoking}
                  onChange={() => handlePreferenceChange('smoking')}
                />
                Smoking Allowed
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={filters.preferences.pets}
                  onChange={() => handlePreferenceChange('pets')}
                />
                Pets Allowed
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={filters.preferences.music}
                  onChange={() => handlePreferenceChange('music')}
                />
                Music Allowed
              </label>
            </div>
          </div>

          <button className="reset-filters" onClick={() => setFilters({
            sortBy: 'price',
            maxPrice: 1000,
            minSeats: 1,
            vehicleType: 'all',
            preferences: {
              smoking: false,
              pets: false,
              music: false,
              instantBook: false,
              verifiedOnly: false
            }
          })}>
            Reset Filters
          </button>
        </aside>

        <div className="rides-list">
          <div className="results-header">
            <h2>
              {searching ? 'Searching...' : `${filteredRides.length} Rides Found`}
            </h2>
            {compareList.length > 0 && (
              <div className="compare-info">
                {compareList.length} selected for comparison
                <button onClick={clearCompare}>Clear</button>
              </div>
            )}
          </div>

          {searching ? (
            // Skeleton Loaders
            <div className="skeleton-container">
              {[1, 2, 3].map((i) => (
                <div key={i} className="ride-card-skeleton">
                  <div className="skeleton-header">
                    <div className="skeleton-avatar"></div>
                    <div className="skeleton-text-group">
                      <div className="skeleton-text skeleton-name"></div>
                      <div className="skeleton-text skeleton-rating"></div>
                    </div>
                  </div>
                  <div className="skeleton-route">
                    <div className="skeleton-text skeleton-location"></div>
                    <div className="skeleton-text skeleton-location"></div>
                  </div>
                  <div className="skeleton-details">
                    <div className="skeleton-text skeleton-detail"></div>
                    <div className="skeleton-text skeleton-detail"></div>
                    <div className="skeleton-text skeleton-detail"></div>
                  </div>
                  <div className="skeleton-footer">
                    <div className="skeleton-text skeleton-price"></div>
                    <div className="skeleton-button"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredRides.length === 0 ? (
            <div className="no-rides">
              <i className="fas fa-car"></i>
              <p>No rides match your current search and filter criteria.</p>
              <button onClick={() => navigate(-1)}>Modify Search</button>
              
              <div className="no-rides-suggestions">
                <h3>Try These Suggestions:</h3>
                <div className="suggestions-list">
                  <div className="suggestion-item">
                    <i className="fas fa-sliders-h"></i>
                    <span>Adjust your price filter or date range</span>
                  </div>
                  <div className="suggestion-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>Try nearby pickup or dropoff locations</span>
                  </div>
                  <div className="suggestion-item">
                    <i className="fas fa-calendar-alt"></i>
                    <span>Search for a different date or time</span>
                  </div>
                  <div className="suggestion-item">
                    <i className="fas fa-redo"></i>
                    <span>Reset all filters and try again</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            filteredRides.map(ride => (
              <div 
                key={ride.id} 
                className={`ride-card ${selectedRide?.id === ride.id ? 'selected' : ''} ${compareList.find(r => r.id === ride.id) ? 'comparing' : ''}`}
                onClick={() => setSelectedRide(ride)}
              >
                <div className="ride-card-header">
                  <div className="driver-info">
                    <div className="driver-photo">
                      {ride.driver.photo ? (
                        <img src={ride.driver.photo} alt={ride.driver.name} />
                      ) : (
                        <div className="photo-placeholder">{ride.driver.name[0]}</div>
                      )}
                      {ride.driver.verified && <span className="verified-badge">✓</span>}
                    </div>
                    <div className="driver-details">
                      <h3>{ride.driver.name}</h3>
                      <div className="driver-stats">
                        <span className="rating">★ {ride.driver.rating}</span>
                        <span className="trips">{ride.driver.trips} trips</span>
                      </div>
                    </div>
                  </div>
                  <div className="match-score">
                    <div className="score-circle" style={{ '--score': ride.matchScore }}>
                      {ride.matchScore}%
                    </div>
                    <span>Match</span>
                  </div>
                </div>

                <div className="ride-details">
                  <div className="route-details">
                    <div className="time-location">
                      <span className="time">{formatTime(ride.departure)}</span>
                      <span className="location">{ride.route.pickup}</span>
                    </div>
                    <div className="route-line">
                      <div className="duration">{ride.route.duration} min • {ride.route.distance} km</div>
                    </div>
                    <div className="time-location">
                      <span className="time">{formatTime(new Date(new Date(ride.departure).getTime() + ride.route.duration * 60000))}</span>
                      <span className="location">{ride.route.dropoff}</span>
                    </div>
                  </div>

                  <div className="vehicle-info">
                    <span className="vehicle-type">{ride.vehicle.type}</span>
                    <span className="vehicle-model">{ride.vehicle.model}</span>
                    <span className="vehicle-number">{ride.vehicle.number}</span>
                  </div>

                  <div className="ride-amenities">
                    {ride.amenities.map(amenity => (
                      <span key={amenity} className="amenity">{amenity}</span>
                    ))}
                    {ride.preferences.instantBook && <span className="instant-book">⚡ Instant Book</span>}
                  </div>
                </div>

                <div className="ride-card-footer">
                  <div className="seats-price">
                    <span className="seats">{ride.seatsAvailable} seat{ride.seatsAvailable > 1 ? 's' : ''} available</span>
                    <span className="price">₹{ride.price}</span>
                  </div>
                  <div className="actions">
                    <button 
                      className={`compare-btn ${compareList.find(r => r.id === ride.id) ? 'active' : ''}`}
                      onClick={(e) => { e.stopPropagation(); toggleCompare(ride); }}
                      disabled={compareList.length >= 3 && !compareList.find(r => r.id === ride.id)}
                    >
                      {compareList.find(r => r.id === ride.id) ? 'Remove' : 'Compare'}
                    </button>
                    <button 
                      className="book-btn"
                      onClick={(e) => { e.stopPropagation(); handleBookRide(ride); }}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {compareList.length > 1 && (
        <div className="comparison-panel">
          <div className="comparison-header">
            <h3>Compare Rides ({compareList.length}/3)</h3>
            <button onClick={clearCompare}>Clear All</button>
          </div>
          <div className="comparison-grid">
            {compareList.map(ride => (
              <div key={ride.id} className="comparison-card">
                <button className="remove-compare" onClick={() => toggleCompare(ride)}>×</button>
                <h4>{ride.driver.name}</h4>
                <div className="comparison-row">
                  <span>Price:</span>
                  <strong>₹{ride.price}</strong>
                </div>
                <div className="comparison-row">
                  <span>Rating:</span>
                  <strong>★ {ride.driver.rating}</strong>
                </div>
                <div className="comparison-row">
                  <span>Departure:</span>
                  <strong>{formatTime(ride.departure)}</strong>
                </div>
                <div className="comparison-row">
                  <span>Duration:</span>
                  <strong>{ride.route.duration} min</strong>
                </div>
                <div className="comparison-row">
                  <span>Vehicle:</span>
                  <strong>{ride.vehicle.type}</strong>
                </div>
                <div className="comparison-row">
                  <span>Seats:</span>
                  <strong>{ride.seatsAvailable}</strong>
                </div>
                <button className="book-compare" onClick={() => handleBookRide(ride)}>
                  Book This Ride
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RideMatching;
