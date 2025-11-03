import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TripHistory.css';

const TripHistory = () => {
  const [trips, setTrips] = useState([]);
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalAmount: 0,
    avgRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('PASSENGER');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTripHistory();
  }, []);

  const fetchTripHistory = async () => {
    try {
      const response = await fetch('/api/trips/history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      setTrips(data.trips);
      setUserRole(data.userRole);
      calculateStats(data.trips, data.userRole);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching trip history:', error);
      setLoading(false);
    }
  };

  const calculateStats = (trips, role) => {
    const totalTrips = trips.length;
    const totalAmount = trips.reduce((sum, trip) => {
      return sum + (role === 'RIDER' ? trip.totalEarnings : trip.totalAmount);
    }, 0);
    const avgRating = trips.reduce((sum, trip) => sum + (trip.rating || 0), 0) / totalTrips;

    setStats({
      totalTrips,
      totalAmount,
      avgRating: avgRating || 0
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i key={i} className={i < Math.floor(rating) ? 'fas fa-star' : 'far fa-star'}></i>
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="trip-history-loading">
        <div className="spinner"></div>
        <p>Loading your trip history...</p>
      </div>
    );
  }

  return (
    <div className="trip-history-container">
      <div className="trip-history-header">
        <div className="header-content">
          <div className="header-text">
            <h1>
              <i className="fas fa-history"></i>
              Trip History
            </h1>
            <p>
              {userRole === 'RIDER'
                ? 'Review your completed rides and passenger feedback'
                : 'Review your completed bookings and travel history'}
            </p>
          </div>
          <div className="header-stats-badge">
            <div className="total-trips">{stats.totalTrips}</div>
            <p>Completed Trips</p>
          </div>
        </div>
      </div>

      <div className="stats-cards-grid">
        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p className="stat-label">Total Trips</p>
              <p className="stat-value">{stats.totalTrips}</p>
            </div>
            <div className="stat-icon purple">
              <i className="fas fa-route"></i>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p className="stat-label">
                {userRole === 'RIDER' ? 'Total Earnings' : 'Total Spent'}
              </p>
              <p className="stat-value">₹{stats.totalAmount.toLocaleString()}</p>
            </div>
            <div className="stat-icon green">
              <i className="fas fa-rupee-sign"></i>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <div className="stat-info">
              <p className="stat-label">Average Rating</p>
              <div className="rating-display">
                <p className="stat-value">{stats.avgRating.toFixed(1)}</p>
                <div className="stars-small">
                  {renderStars(stats.avgRating)}
                </div>
              </div>
            </div>
            <div className="stat-icon yellow">
              <i className="fas fa-star"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="trips-list">
        {trips.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-clipboard-list"></i>
            <h3>No completed trips yet</h3>
            <p>
              {userRole === 'RIDER'
                ? 'Post your first ride to start earning'
                : 'Book your first ride to start traveling'}
            </p>
            <button
              className="btn-primary"
              onClick={() => navigate(userRole === 'RIDER' ? '/rides/post' : '/rides/search')}
            >
              <i className={`fas fa-${userRole === 'RIDER' ? 'plus-circle' : 'search'}`}></i>
              {userRole === 'RIDER' ? 'Post a Ride' : 'Find Rides'}
            </button>
          </div>
        ) : (
          trips.map((trip) => (
            <div key={trip._id} className="trip-card">
              {userRole === 'RIDER' ? (
                <>
                  <div className="trip-header">
                    <div className="trip-info">
                      <div className="trip-icon">
                        <i className="fas fa-car"></i>
                      </div>
                      <div>
                        <h3>Your Ride</h3>
                        <p className="trip-date">{formatDate(trip.departureTime)}</p>
                      </div>
                    </div>
                    <div className="trip-amount">
                      <div className="amount">₹{trip.totalEarnings || 0}</div>
                      <p>{trip.completedBookings || 0} passengers</p>
                    </div>
                  </div>

                  <div className="trip-route">
                    <div className="route-points">
                      <div className="route-point">
                        <i className="fas fa-map-marker-alt start"></i>
                        <span>{trip.from?.address}</span>
                      </div>
                      <div className="route-line">
                        <i className="fas fa-ellipsis-v"></i>
                        <span className="distance">{trip.distance?.toFixed(1)} km</span>
                      </div>
                      <div className="route-point">
                        <i className="fas fa-map-marker-alt end"></i>
                        <span>{trip.to?.address}</span>
                      </div>
                    </div>

                    {trip.carbonSaved > 0 && (
                      <div className="carbon-badge">
                        <div className="carbon-info">
                          <i className="fas fa-leaf"></i>
                          <div>
                            <p className="carbon-label">Carbon Impact</p>
                            <p className="carbon-value">{trip.carbonSaved.toFixed(1)} kg CO₂ saved</p>
                          </div>
                        </div>
                        <div className="carbon-trees">
                          <p>Equivalent to</p>
                          <p className="trees-count">🌳 {(trip.carbonSaved / 21).toFixed(1)} trees</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {trip.passengers && trip.passengers.length > 0 && (
                    <div className="passengers-section">
                      <h4>Passengers on this ride:</h4>
                      <div className="passengers-list">
                        {trip.passengers.map((passenger) => (
                          <div key={passenger._id} className="passenger-item">
                            <div className="passenger-info">
                              <img src={passenger.profilePhoto || '/images/default-avatar.png'} alt={passenger.name} />
                              <div>
                                <p className="passenger-name">{passenger.name}</p>
                                <div className="passenger-rating">
                                  <div className="stars-small">
                                    {renderStars(passenger.rating || 0)}
                                  </div>
                                  <span>{(passenger.rating || 0).toFixed(1)}</span>
                                </div>
                              </div>
                            </div>
                            <span className="passenger-amount">₹{passenger.amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="trip-header">
                    <div className="trip-info">
                      <img
                        src={trip.rider?.profilePhoto || '/images/default-avatar.png'}
                        alt={trip.rider?.name}
                        className="rider-photo"
                      />
                      <div>
                        <h3>{trip.rider?.name}</h3>
                        <div className="rider-rating">
                          <div className="stars-small">
                            {renderStars(trip.rider?.rating || 0)}
                          </div>
                          <span>{(trip.rider?.rating || 0).toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="trip-amount">
                      <div className="amount">₹{trip.totalAmount || 0}</div>
                      <p>{trip.seatsBooked} seat(s)</p>
                    </div>
                  </div>

                  <div className="trip-route">
                    <div className="route-points">
                      <div className="route-point">
                        <i className="fas fa-map-marker-alt start"></i>
                        <span>{trip.from?.address}</span>
                      </div>
                      <div className="route-line">
                        <i className="fas fa-ellipsis-v"></i>
                        <span className="distance">{trip.distance?.toFixed(1)} km</span>
                      </div>
                      <div className="route-point">
                        <i className="fas fa-map-marker-alt end"></i>
                        <span>{trip.to?.address}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="trip-actions">
                <button className="btn-secondary" onClick={() => navigate(`/trips/${trip._id}`)}>
                  View Details
                </button>
                {!trip.reviewed && (
                  <button className="btn-primary" onClick={() => navigate(`/reviews/create/${trip._id}`)}>
                    <i className="fas fa-star"></i>
                    Leave Review
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TripHistory;
