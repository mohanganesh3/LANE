import React from 'react';
import './TripDetailsModal.css';

const TripDetailsModal = ({ trip, onClose }) => {
  if (!trip) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content trip-details" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Trip Details</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="trip-details-body">
          <div className="detail-section">
            <h3><i className="fas fa-route"></i> Route Information</h3>
            <div className="route-display">
              <div className="route-point">
                <i className="fas fa-map-marker-alt start"></i>
                <div>
                  <strong>Pickup</strong>
                  <p>{trip.from?.address}</p>
                  <span className="time">{new Date(trip.pickupTime).toLocaleString()}</span>
                </div>
              </div>
              <div className="route-line"></div>
              <div className="route-point">
                <i className="fas fa-map-marker-alt end"></i>
                <div>
                  <strong>Dropoff</strong>
                  <p>{trip.to?.address}</p>
                  <span className="time">{new Date(trip.dropoffTime).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3><i className="fas fa-user"></i> Rider Information</h3>
            <div className="rider-card">
              <img src={trip.rider?.profilePhoto || '/images/default-avatar.png'} alt={trip.rider?.name} />
              <div>
                <strong>{trip.rider?.name}</strong>
                <div className="rating">
                  <i className="fas fa-star"></i>
                  <span>{trip.rider?.rating?.toFixed(1) || '5.0'}</span>
                </div>
                <p>{trip.vehicle?.model}</p>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3><i className="fas fa-rupee-sign"></i> Payment Details</h3>
            <div className="payment-breakdown">
              <div className="breakdown-item">
                <span>Base Fare</span>
                <span>₹{trip.baseFare || 0}</span>
              </div>
              <div className="breakdown-item">
                <span>Distance ({trip.distance?.toFixed(1)} km)</span>
                <span>₹{trip.distanceFare || 0}</span>
              </div>
              {trip.timeFare > 0 && (
                <div className="breakdown-item">
                  <span>Time Charges</span>
                  <span>₹{trip.timeFare}</span>
                </div>
              )}
              {trip.discount > 0 && (
                <div className="breakdown-item discount">
                  <span>Discount</span>
                  <span>-₹{trip.discount}</span>
                </div>
              )}
              <div className="breakdown-item total">
                <span>Total Amount</span>
                <span>₹{trip.totalAmount}</span>
              </div>
            </div>
            <div className="payment-method">
              <i className={`fas fa-${trip.paymentMethod === 'cash' ? 'money-bill' : 'credit-card'}`}></i>
              <span>{trip.paymentMethod}</span>
            </div>
          </div>

          <div className="detail-section">
            <h3><i className="fas fa-chart-line"></i> Trip Statistics</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <i className="fas fa-road"></i>
                <div>
                  <strong>{trip.distance?.toFixed(1)} km</strong>
                  <span>Distance</span>
                </div>
              </div>
              <div className="stat-item">
                <i className="fas fa-clock"></i>
                <div>
                  <strong>{trip.duration} min</strong>
                  <span>Duration</span>
                </div>
              </div>
              <div className="stat-item">
                <i className="fas fa-users"></i>
                <div>
                  <strong>{trip.seatsBooked}</strong>
                  <span>Passengers</span>
                </div>
              </div>
              {trip.carbonSaved > 0 && (
                <div className="stat-item">
                  <i className="fas fa-leaf"></i>
                  <div>
                    <strong>{trip.carbonSaved.toFixed(1)} kg</strong>
                    <span>CO₂ Saved</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {trip.rating && (
            <div className="detail-section">
              <h3><i className="fas fa-star"></i> Your Rating</h3>
              <div className="rating-display">
                <div className="stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i
                      key={star}
                      className={star <= trip.rating ? 'fas fa-star' : 'far fa-star'}
                    ></i>
                  ))}
                </div>
                {trip.review && <p className="review-text">{trip.review}</p>}
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Close</button>
          <button className="btn-primary">
            <i className="fas fa-download"></i>
            Download Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripDetailsModal;
