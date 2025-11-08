import React, { useState, useEffect } from 'react';
import { useNotification } from './NotificationToast';
import './DriverDashboard.css';

const DriverDashboard = ({ driverId }) => {
  const [stats, setStats] = useState(null);
  const [activeRides, setActiveRides] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [availability, setAvailability] = useState(false);
  const [loading, setLoading] = useState(true);
  const { success, error } = useNotification();

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [driverId]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ridesRes, earningsRes] = await Promise.all([
        fetch(`/api/drivers/${driverId}/stats`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`/api/drivers/${driverId}/active-rides`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`/api/drivers/${driverId}/earnings`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (statsRes.ok && ridesRes.ok && earningsRes.ok) {
        const [statsData, ridesData, earningsData] = await Promise.all([
          statsRes.json(),
          ridesRes.json(),
          earningsRes.json()
        ]);
        setStats(statsData);
        setActiveRides(ridesData.rides || []);
        setEarnings(earningsData);
        setAvailability(statsData.isAvailable || false);
      }
    } catch (err) {
      error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    try {
      const response = await fetch(`/api/drivers/${driverId}/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isAvailable: !availability })
      });

      if (response.ok) {
        setAvailability(!availability);
        success(availability ? 'You are now offline' : 'You are now online');
      } else {
        error('Failed to update availability');
      }
    } catch (err) {
      error('Network error');
    }
  };

  const acceptRide = async (rideId) => {
    try {
      const response = await fetch(`/api/rides/${rideId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        success('Ride accepted!');
        fetchDashboardData();
      } else {
        error('Failed to accept ride');
      }
    } catch (err) {
      error('Network error');
    }
  };

  const rejectRide = async (rideId) => {
    try {
      const response = await fetch(`/api/rides/${rideId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        success('Ride rejected');
        fetchDashboardData();
      } else {
        error('Failed to reject ride');
      }
    } catch (err) {
      error('Network error');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="driver-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Driver Dashboard</h1>
          <p className="welcome-text">Welcome back, Driver!</p>
        </div>
        <div className="availability-toggle">
          <button
            className={`toggle-btn ${availability ? 'online' : 'offline'}`}
            onClick={toggleAvailability}
          >
            <span className="status-indicator"></span>
            {availability ? 'Online' : 'Offline'}
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card earnings">
          <div className="stat-icon">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Today's Earnings</span>
            <span className="stat-value">₹{earnings?.today || 0}</span>
          </div>
        </div>

        <div className="stat-card rides">
          <div className="stat-icon">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Rides Today</span>
            <span className="stat-value">{stats?.todayRides || 0}</span>
          </div>
        </div>

        <div className="stat-card rating">
          <div className="stat-icon">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Rating</span>
            <span className="stat-value">{stats?.rating || '5.0'}</span>
          </div>
        </div>

        <div className="stat-card distance">
          <div className="stat-icon">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Distance Today</span>
            <span className="stat-value">{stats?.todayDistance || 0} km</span>
          </div>
        </div>
      </div>

      <div className="active-rides-section">
        <h2>Active Rides</h2>
        {activeRides.length === 0 ? (
          <div className="no-rides">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
            </svg>
            <p>No active rides</p>
            <span>Turn on availability to receive ride requests</span>
          </div>
        ) : (
          <div className="rides-list">
            {activeRides.map(ride => (
              <div key={ride._id} className="ride-card">
                <div className="ride-header">
                  <span className="ride-id">#{ride._id.slice(-6)}</span>
                  <span className={`ride-status status-${ride.status}`}>
                    {ride.status}
                  </span>
                </div>

                <div className="ride-route">
                  <div className="route-point">
                    <div className="point-marker pickup"></div>
                    <div className="point-info">
                      <span className="point-label">Pickup</span>
                      <span className="point-address">{ride.pickup?.address}</span>
                    </div>
                  </div>
                  <div className="route-connector"></div>
                  <div className="route-point">
                    <div className="point-marker dropoff"></div>
                    <div className="point-info">
                      <span className="point-label">Drop-off</span>
                      <span className="point-address">{ride.dropoff?.address}</span>
                    </div>
                  </div>
                </div>

                <div className="ride-details">
                  <div className="detail-item">
                    <span className="detail-label">Distance</span>
                    <span className="detail-value">{ride.distance?.toFixed(1)} km</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Fare</span>
                    <span className="detail-value fare">₹{ride.fare}</span>
                  </div>
                </div>

                {ride.status === 'pending' && (
                  <div className="ride-actions">
                    <button 
                      className="action-btn accept"
                      onClick={() => acceptRide(ride._id)}
                    >
                      Accept
                    </button>
                    <button 
                      className="action-btn reject"
                      onClick={() => rejectRide(ride._id)}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="earnings-section">
        <h2>Earnings Summary</h2>
        <div className="earnings-grid">
          <div className="earnings-card">
            <span className="earnings-label">This Week</span>
            <span className="earnings-value">₹{earnings?.week || 0}</span>
          </div>
          <div className="earnings-card">
            <span className="earnings-label">This Month</span>
            <span className="earnings-value">₹{earnings?.month || 0}</span>
          </div>
          <div className="earnings-card">
            <span className="earnings-label">Total</span>
            <span className="earnings-value">₹{earnings?.total || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
