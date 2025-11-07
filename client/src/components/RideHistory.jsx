import React, { useState, useEffect } from 'react';
import { useNotification } from './NotificationToast';
import './RideHistory.css';

const RideHistory = ({ userId }) => {
  const [rides, setRides] = useState([]);
  const [filteredRides, setFilteredRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { error } = useNotification();

  useEffect(() => {
    fetchRideHistory();
  }, [userId, page]);

  useEffect(() => {
    applyFilters();
  }, [rides, filter, searchTerm, sortBy]);

  const fetchRideHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/rides/history?userId=${userId}&page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRides(data.rides);
        setTotalPages(data.totalPages);
      } else {
        error('Failed to load ride history');
      }
    } catch (err) {
      error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...rides];

    if (filter !== 'all') {
      filtered = filtered.filter(ride => ride.status === filter);
    }

    if (searchTerm) {
      filtered = filtered.filter(ride =>
        ride.pickup?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ride.dropoff?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ride.driver?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'date-asc':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'fare-desc':
          return b.fare - a.fare;
        case 'fare-asc':
          return a.fare - b.fare;
        default:
          return 0;
      }
    });

    setFilteredRides(filtered);
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: { label: 'Completed', class: 'status-completed' },
      cancelled: { label: 'Cancelled', class: 'status-cancelled' },
      ongoing: { label: 'Ongoing', class: 'status-ongoing' }
    };
    const badge = badges[status] || { label: status, class: 'status-default' };
    return <span className={`status-badge ${badge.class}`}>{badge.label}</span>;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateStats = () => {
    const completed = rides.filter(r => r.status === 'completed');
    return {
      total: rides.length,
      completed: completed.length,
      totalSpent: completed.reduce((sum, r) => sum + (r.fare || 0), 0),
      totalDistance: completed.reduce((sum, r) => sum + (r.distance || 0), 0)
    };
  };

  const stats = calculateStats();

  if (loading && rides.length === 0) {
    return (
      <div className="history-loading">
        <div className="spinner"></div>
        <p>Loading ride history...</p>
      </div>
    );
  }

  return (
    <div className="ride-history-container">
      <div className="history-header">
        <h1>Ride History</h1>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Rides</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.completed}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">₹{stats.totalSpent.toFixed(0)}</span>
            <span className="stat-label">Total Spent</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.totalDistance.toFixed(0)} km</span>
            <span className="stat-label">Total Distance</span>
          </div>
        </div>
      </div>

      <div className="history-controls">
        <div className="search-bar">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            placeholder="Search by location or driver..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All Rides</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="ongoing">Ongoing</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date-desc">Latest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="fare-desc">Highest Fare</option>
            <option value="fare-asc">Lowest Fare</option>
          </select>
        </div>
      </div>

      {filteredRides.length === 0 ? (
        <div className="empty-state">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <p>No rides found</p>
          <span>Try adjusting your filters or search term</span>
        </div>
      ) : (
        <>
          <div className="rides-list">
            {filteredRides.map(ride => (
              <div key={ride._id} className="ride-card">
                <div className="ride-header">
                  <div className="ride-date">
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    {formatDate(ride.createdAt)}
                  </div>
                  {getStatusBadge(ride.status)}
                </div>

                <div className="ride-route">
                  <div className="route-point">
                    <div className="point-marker pickup"></div>
                    <div className="point-details">
                      <span className="point-label">Pickup</span>
                      <span className="point-address">{ride.pickup?.address || 'Unknown'}</span>
                    </div>
                  </div>
                  <div className="route-line"></div>
                  <div className="route-point">
                    <div className="point-marker dropoff"></div>
                    <div className="point-details">
                      <span className="point-label">Drop-off</span>
                      <span className="point-address">{ride.dropoff?.address || 'Unknown'}</span>
                    </div>
                  </div>
                </div>

                {ride.driver && (
                  <div className="ride-driver">
                    <img
                      src={ride.driver.profileImage || '/images/default-avatar.png'}
                      alt={ride.driver.name}
                    />
                    <div className="driver-info">
                      <span className="driver-name">{ride.driver.name}</span>
                      <span className="driver-vehicle">
                        {ride.driver.vehicleModel} • {ride.driver.vehicleNumber}
                      </span>
                    </div>
                  </div>
                )}

                <div className="ride-footer">
                  <div className="ride-stats">
                    <span>{ride.distance?.toFixed(1) || 0} km</span>
                    <span>•</span>
                    <span>{ride.duration || 'N/A'}</span>
                  </div>
                  <div className="ride-fare">₹{ride.fare || 0}</div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RideHistory;
