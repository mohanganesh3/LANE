import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/apiService';
import './TripCompletion.css';

/**
 * TripCompletion Component
 * Displays trip completion details and summary
 */
const TripCompletion = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTripDetails();
  }, [tripId]);

  const fetchTripDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/trips/${tripId}`);
      setTrip(response.data);
    } catch (err) {
      console.error('Failed to fetch trip details:', err);
      setError('Failed to load trip details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="trip-completion-page">
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading trip details...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="trip-completion-page">
        <div className="error-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <h2>Trip Not Found</h2>
          <p>{error || 'The requested trip could not be found'}</p>
          <button onClick={() => navigate('/trips')} className="btn-primary">
            View All Trips
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="trip-completion-page">
      <div className="completion-container">
        {/* Success Header */}
        <div className="completion-header">
          <div className="success-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h1>Trip Completed!</h1>
          <p>Thank you for riding with us</p>
        </div>

        {/* Trip Info Card */}
        <div className="trip-info-card">
          <div className="trip-route">
            <div className="location-point pickup">
              <div className="location-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="10" r="3"/>
                  <path d="M12 2a8 8 0 0 0-8 8c0 5.4 8 14 8 14s8-8.6 8-14a8 8 0 0 0-8-8z"/>
                </svg>
              </div>
              <div className="location-details">
                <span className="location-label">Pickup</span>
                <p className="location-address">{trip.pickupLocation?.address || 'Pickup Location'}</p>
              </div>
            </div>

            <div className="route-line">
              <div className="route-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>

            <div className="location-point dropoff">
              <div className="location-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="10" r="3"/>
                  <path d="M12 2a8 8 0 0 0-8 8c0 5.4 8 14 8 14s8-8.6 8-14a8 8 0 0 0-8-8z"/>
                </svg>
              </div>
              <div className="location-details">
                <span className="location-label">Drop-off</span>
                <p className="location-address">{trip.dropoffLocation?.address || 'Dropoff Location'}</p>
              </div>
            </div>
          </div>

          <div className="trip-stats">
            <div className="stat-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <div>
                <span className="stat-label">Duration</span>
                <span className="stat-value">{trip.duration || '45 min'}</span>
              </div>
            </div>

            <div className="stat-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <div>
                <span className="stat-label">Distance</span>
                <span className="stat-value">{trip.distance || '12.5 km'}</span>
              </div>
            </div>

            <div className="stat-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <div>
                <span className="stat-label">Date</span>
                <span className="stat-value">{new Date(trip.completedAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Driver Info */}
        {trip.driver && (
          <div className="driver-card">
            <div className="driver-avatar">
              {trip.driver.profilePhoto ? (
                <img src={trip.driver.profilePhoto} alt={trip.driver.name} />
              ) : (
                <div className="avatar-placeholder">
                  {trip.driver.name?.charAt(0) || 'D'}
                </div>
              )}
            </div>
            <div className="driver-info">
              <h3>{trip.driver.name || 'Driver'}</h3>
              <div className="driver-rating">
                {'★'.repeat(Math.floor(trip.driver.rating || 5))}
                {'☆'.repeat(5 - Math.floor(trip.driver.rating || 5))}
                <span>({trip.driver.rating || '5.0'})</span>
              </div>
              <p className="vehicle-info">
                {trip.vehicle?.make} {trip.vehicle?.model} • {trip.vehicle?.number}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="completion-actions">
          <button
            className="btn-primary"
            onClick={() => navigate(`/trips/${tripId}/rate`)}
          >
            Rate Your Trip
          </button>
          <button
            className="btn-secondary"
            onClick={() => navigate('/trips')}
          >
            View All Trips
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripCompletion;
