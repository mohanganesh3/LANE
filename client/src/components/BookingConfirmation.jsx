import React, { useState, useEffect } from 'react';
import { useNotification } from './NotificationToast';
import './BookingConfirmation.css';

const BookingConfirmation = ({ booking, onClose, onModify, onCancel }) => {
  const { success, error, warning } = useNotification();
  const [showDetails, setShowDetails] = useState(false);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    if (booking && booking.status === 'pending') {
      const expiryTime = new Date(booking.expiryTime);
      const interval = setInterval(() => {
        const now = new Date();
        const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
        setCountdown(remaining);
        
        if (remaining === 0) {
          clearInterval(interval);
          warning('Booking expired', 'Please create a new booking');
          onClose();
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [booking, onClose, warning]);

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleConfirm = async () => {
    try {
      const response = await fetch(`/api/bookings/${booking._id}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        success('Booking confirmed successfully!');
        onClose();
      } else {
        const data = await response.json();
        error(data.message || 'Failed to confirm booking');
      }
    } catch (err) {
      error('Network error. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: 'Pending', class: 'status-pending' },
      confirmed: { label: 'Confirmed', class: 'status-confirmed' },
      ongoing: { label: 'Ongoing', class: 'status-ongoing' },
      completed: { label: 'Completed', class: 'status-completed' },
      cancelled: { label: 'Cancelled', class: 'status-cancelled' }
    };
    const badge = badges[status] || badges.pending;
    return <span className={`status-badge ${badge.class}`}>{badge.label}</span>;
  };

  if (!booking) return null;

  return (
    <div className="booking-confirmation-overlay" onClick={onClose}>
      <div className="booking-confirmation-card" onClick={(e) => e.stopPropagation()}>
        <div className="confirmation-header">
          <div>
            <h2>Booking Confirmation</h2>
            <p className="booking-id">ID: {booking._id}</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="confirmation-status">
          {getStatusBadge(booking.status)}
          {countdown !== null && countdown > 0 && (
            <div className="expiry-countdown">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span>Expires in {formatCountdown(countdown)}</span>
            </div>
          )}
        </div>

        <div className="confirmation-body">
          <div className="route-info">
            <div className="location-point pickup">
              <div className="point-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="point-details">
                <span className="point-label">Pickup</span>
                <span className="point-address">{booking.pickup?.address || 'Unknown'}</span>
              </div>
            </div>

            <div className="route-connector"></div>

            <div className="location-point dropoff">
              <div className="point-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="point-details">
                <span className="point-label">Drop-off</span>
                <span className="point-address">{booking.dropoff?.address || 'Unknown'}</span>
              </div>
            </div>
          </div>

          <div className="booking-info-grid">
            <div className="info-item">
              <span className="info-label">Date & Time</span>
              <span className="info-value">
                {new Date(booking.scheduledTime || booking.createdAt).toLocaleString()}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">Vehicle Type</span>
              <span className="info-value">{booking.vehicleType || 'Standard'}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Distance</span>
              <span className="info-value">{booking.distance ? `${booking.distance.toFixed(1)} km` : 'N/A'}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Fare</span>
              <span className="info-value price">₹{booking.fare || 0}</span>
            </div>
          </div>

          {booking.driver && (
            <div className="driver-info">
              <h3>Driver Information</h3>
              <div className="driver-card">
                <img 
                  src={booking.driver.profileImage || '/images/default-avatar.png'} 
                  alt={booking.driver.name}
                  className="driver-avatar"
                />
                <div className="driver-details">
                  <span className="driver-name">{booking.driver.name}</span>
                  <span className="driver-vehicle">
                    {booking.driver.vehicleModel} • {booking.driver.vehicleNumber}
                  </span>
                  <div className="driver-rating">
                    <span>⭐</span>
                    <span>{booking.driver.rating || 4.5}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showDetails && (
            <div className="additional-details">
              <h3>Additional Information</h3>
              <div className="detail-list">
                {booking.passengers && (
                  <p><strong>Passengers:</strong> {booking.passengers}</p>
                )}
                {booking.notes && (
                  <p><strong>Notes:</strong> {booking.notes}</p>
                )}
                {booking.paymentMethod && (
                  <p><strong>Payment:</strong> {booking.paymentMethod}</p>
                )}
              </div>
            </div>
          )}

          <button 
            className="toggle-details-btn"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide Details' : 'Show More Details'}
          </button>
        </div>

        <div className="confirmation-actions">
          {booking.status === 'pending' && (
            <button className="btn btn-primary" onClick={handleConfirm}>
              Confirm Booking
            </button>
          )}
          {(booking.status === 'pending' || booking.status === 'confirmed') && (
            <>
              <button className="btn btn-secondary" onClick={() => onModify(booking)}>
                Modify
              </button>
              <button className="btn btn-danger" onClick={() => onCancel(booking)}>
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
