import PropTypes from 'prop-types';
import { useState } from 'react';
import Modal from '../common/Modal';
import { formatCurrency, formatDate } from '../../utils/helpers';
import './RideDetailsModal.css';

const RideDetailsModal = ({ ride, isOpen, onClose, onBook }) => {
  const [selectedSeats, setSelectedSeats] = useState(1);

  if (!ride) return null;

  const {
    driver,
    vehicle,
    departureTime,
    arrivalTime,
    from,
    to,
    price,
    availableSeats,
    route,
    amenities = [],
    policies = {},
    rating,
    reviewCount
  } = ride;

  const totalPrice = price * selectedSeats;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="large" title="Ride Details">
      <div className="ride-details-modal">
        {/* Driver Profile Section */}
        <div className="driver-profile-section">
          <div className="driver-header">
            <div className="driver-avatar-large">
              {driver.photo ? (
                <img src={driver.photo} alt={driver.name} />
              ) : (
                <div className="avatar-placeholder-large">
                  {driver.name.charAt(0).toUpperCase()}
                </div>
              )}
              {driver.verified && <span className="verified-badge-large">✓</span>}
            </div>
            <div className="driver-info-large">
              <h3>{driver.name}</h3>
              <div className="driver-stats">
                <span className="stat">⭐ {rating?.toFixed(1) || 'New'}</span>
                <span className="stat">🚗 {driver.totalRides || 0} rides</span>
                <span className="stat">📅 Member since {driver.joinedYear || '2024'}</span>
              </div>
              {driver.bio && <p className="driver-bio">{driver.bio}</p>}
            </div>
          </div>

          {reviewCount > 0 && (
            <div className="reviews-preview">
              <h4>Recent Reviews ({reviewCount})</h4>
              <div className="rating-breakdown">
                <div className="rating-bar">
                  <span>5★</span>
                  <div className="bar"><div className="fill" style={{width: '80%'}}></div></div>
                  <span>80%</span>
                </div>
                <div className="rating-bar">
                  <span>4★</span>
                  <div className="bar"><div className="fill" style={{width: '15%'}}></div></div>
                  <span>15%</span>
                </div>
                <div className="rating-bar">
                  <span>3★</span>
                  <div className="bar"><div className="fill" style={{width: '5%'}}></div></div>
                  <span>5%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Vehicle Information */}
        <div className="vehicle-info-section">
          <h4>🚗 Vehicle Information</h4>
          <div className="vehicle-details-grid">
            <div className="vehicle-detail">
              <span className="label">Model:</span>
              <span className="value">{vehicle.model}</span>
            </div>
            <div className="vehicle-detail">
              <span className="label">Number:</span>
              <span className="value">{vehicle.number}</span>
            </div>
            <div className="vehicle-detail">
              <span className="label">Color:</span>
              <span className="value">{vehicle.color || 'White'}</span>
            </div>
            <div className="vehicle-detail">
              <span className="label">Type:</span>
              <span className="value">{vehicle.type || 'Sedan'}</span>
            </div>
          </div>
        </div>

        {/* Route Map Preview */}
        <div className="route-map-section">
          <h4>🗺️ Route Preview</h4>
          <div className="route-map-placeholder">
            <div className="map-points">
              <div className="map-point start">
                <span className="point-icon">📍</span>
                <div className="point-info">
                  <strong>{from.name}</strong>
                  <small>{formatDate(departureTime, 'datetime')}</small>
                </div>
              </div>
              
              {route?.waypoints?.map((waypoint, index) => (
                <div key={index} className="map-point waypoint">
                  <span className="point-icon">📌</span>
                  <div className="point-info">
                    <strong>{waypoint.name}</strong>
                  </div>
                </div>
              ))}

              <div className="map-point end">
                <span className="point-icon">🎯</span>
                <div className="point-info">
                  <strong>{to.name}</strong>
                  <small>{formatDate(arrivalTime, 'datetime')}</small>
                </div>
              </div>
            </div>
            <div className="map-overlay">Map will load here</div>
          </div>
          <div className="route-stats">
            <span>📏 {route?.distance || '150'} km</span>
            <span>⏱️ {route?.duration || '2h 30m'}</span>
          </div>
        </div>

        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="amenities-section">
            <h4>✨ Amenities</h4>
            <div className="amenities-grid">
              {amenities.map((amenity, index) => (
                <div key={index} className="amenity-item">
                  {amenity}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Policies */}
        {Object.keys(policies).length > 0 && (
          <div className="policies-section">
            <h4>📋 Ride Policies</h4>
            <ul className="policies-list">
              {policies.smoking !== undefined && (
                <li className={policies.smoking ? 'allowed' : 'not-allowed'}>
                  {policies.smoking ? '✓' : '✗'} Smoking {policies.smoking ? 'allowed' : 'not allowed'}
                </li>
              )}
              {policies.pets !== undefined && (
                <li className={policies.pets ? 'allowed' : 'not-allowed'}>
                  {policies.pets ? '✓' : '✗'} Pets {policies.pets ? 'allowed' : 'not allowed'}
                </li>
              )}
              {policies.luggage && (
                <li className="allowed">✓ {policies.luggage}</li>
              )}
              {policies.music !== undefined && (
                <li className={policies.music ? 'allowed' : 'not-allowed'}>
                  {policies.music ? '✓' : '✗'} Music {policies.music ? 'allowed' : 'not allowed'}
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Booking Summary */}
        <div className="booking-summary">
          <h4>Booking Summary</h4>
          <div className="seat-selector">
            <label>Number of seats:</label>
            <div className="seat-buttons">
              {[1, 2, 3, 4].map(num => (
                <button
                  key={num}
                  className={`seat-btn ${selectedSeats === num ? 'active' : ''} ${num > availableSeats ? 'disabled' : ''}`}
                  onClick={() => num <= availableSeats && setSelectedSeats(num)}
                  disabled={num > availableSeats}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div className="price-breakdown">
            <div className="price-row">
              <span>Price per seat:</span>
              <span>₹{formatCurrency(price)}</span>
            </div>
            <div className="price-row">
              <span>Number of seats:</span>
              <span>{selectedSeats}</span>
            </div>
            <div className="price-row total">
              <span>Total:</span>
              <span>₹{formatCurrency(totalPrice)}</span>
            </div>
          </div>

          <button 
            className="book-now-btn"
            onClick={() => onBook({ ride, seats: selectedSeats, totalPrice })}
          >
            Book {selectedSeats} Seat{selectedSeats > 1 ? 's' : ''} for ₹{formatCurrency(totalPrice)}
          </button>
        </div>
      </div>
    </Modal>
  );
};

RideDetailsModal.propTypes = {
  ride: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onBook: PropTypes.func.isRequired
};

export default RideDetailsModal;
