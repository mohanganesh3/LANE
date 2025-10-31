import React from 'react';
import './TripSummary.css';

/**
 * TripSummary Component
 * Displays detailed trip summary with timeline and key metrics
 */
const TripSummary = ({ trip }) => {
  // Format time to 12-hour format
  const formatTime = (date) => {
    if (!date) return '--:--';
    const d = new Date(date);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  // Format duration from minutes
  const formatDuration = (minutes) => {
    if (!minutes) return '--';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Calculate trip metrics
  const tripMetrics = {
    distance: trip.distance || 0,
    duration: trip.actualDuration || trip.estimatedDuration || 0,
    averageSpeed: trip.distance && trip.actualDuration 
      ? ((trip.distance / (trip.actualDuration / 60)).toFixed(1))
      : 0,
    co2Saved: trip.carbonSaved || (trip.distance * 0.12).toFixed(2), // 120g CO2 per km saved
  };

  return (
    <div className="trip-summary-container">
      {/* Trip Timeline */}
      <div className="trip-timeline">
        <h3>Trip Timeline</h3>
        
        <div className="timeline-events">
          {/* Booking Created */}
          <div className="timeline-event">
            <div className="event-marker created">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
              </svg>
            </div>
            <div className="event-content">
              <div className="event-header">
                <span className="event-label">Booking Created</span>
                <span className="event-time">{formatTime(trip.createdAt)}</span>
              </div>
              <p className="event-description">Your ride was successfully booked</p>
            </div>
          </div>

          {/* Driver Assigned */}
          {trip.driverAssignedAt && (
            <div className="timeline-event">
              <div className="event-marker assigned">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div className="event-content">
                <div className="event-header">
                  <span className="event-label">Driver Assigned</span>
                  <span className="event-time">{formatTime(trip.driverAssignedAt)}</span>
                </div>
                <p className="event-description">{trip.driver?.name} accepted your ride</p>
              </div>
            </div>
          )}

          {/* Driver Arrived */}
          {trip.arrivedAt && (
            <div className="timeline-event">
              <div className="event-marker arrived">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="16 12 12 8 8 12"/>
                  <line x1="12" y1="16" x2="12" y2="8"/>
                </svg>
              </div>
              <div className="event-content">
                <div className="event-header">
                  <span className="event-label">Driver Arrived</span>
                  <span className="event-time">{formatTime(trip.arrivedAt)}</span>
                </div>
                <p className="event-description">Driver reached pickup location</p>
              </div>
            </div>
          )}

          {/* Trip Started */}
          {trip.startedAt && (
            <div className="timeline-event">
              <div className="event-marker started">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                  <polygon points="10 8 16 12 10 16 10 8"/>
                </svg>
              </div>
              <div className="event-content">
                <div className="event-header">
                  <span className="event-label">Trip Started</span>
                  <span className="event-time">{formatTime(trip.startedAt)}</span>
                </div>
                <p className="event-description">Journey to destination began</p>
              </div>
            </div>
          )}

          {/* Trip Completed */}
          <div className="timeline-event">
            <div className="event-marker completed">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div className="event-content">
              <div className="event-header">
                <span className="event-label">Trip Completed</span>
                <span className="event-time">{formatTime(trip.completedAt)}</span>
              </div>
              <p className="event-description">You reached your destination safely</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trip Metrics */}
      <div className="trip-metrics">
        <h3>Trip Metrics</h3>
        
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon distance">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
            </div>
            <div className="metric-content">
              <span className="metric-value">{tripMetrics.distance.toFixed(2)} km</span>
              <span className="metric-label">Distance Traveled</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon duration">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="metric-content">
              <span className="metric-value">{formatDuration(tripMetrics.duration)}</span>
              <span className="metric-label">Trip Duration</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon speed">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
              </svg>
            </div>
            <div className="metric-content">
              <span className="metric-value">{tripMetrics.averageSpeed} km/h</span>
              <span className="metric-label">Average Speed</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon eco">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
                <path d="M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
              </svg>
            </div>
            <div className="metric-content">
              <span className="metric-value">{tripMetrics.co2Saved} kg CO₂</span>
              <span className="metric-label">Carbon Saved</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trip Details */}
      <div className="trip-details-summary">
        <h3>Trip Details</h3>
        
        <div className="detail-row">
          <span className="detail-label">Trip ID</span>
          <span className="detail-value">#{trip.tripNumber || trip._id?.slice(-8)}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Vehicle Type</span>
          <span className="detail-value">{trip.vehicleType || 'Sedan'}</span>
        </div>

        {trip.paymentMethod && (
          <div className="detail-row">
            <span className="detail-label">Payment Method</span>
            <span className="detail-value">
              {trip.paymentMethod === 'cash' ? '💵 Cash' : 
               trip.paymentMethod === 'card' ? '💳 Card' : 
               trip.paymentMethod === 'wallet' ? '👛 Wallet' : 
               trip.paymentMethod === 'upi' ? '📱 UPI' : 
               trip.paymentMethod}
            </span>
          </div>
        )}

        <div className="detail-row">
          <span className="detail-label">Ride Type</span>
          <span className="detail-value">
            {trip.isShared ? '👥 Shared Ride' : '🚗 Private Ride'}
          </span>
        </div>

        {trip.stops && trip.stops.length > 0 && (
          <div className="detail-row">
            <span className="detail-label">Stops</span>
            <span className="detail-value">{trip.stops.length} stop(s)</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripSummary;
