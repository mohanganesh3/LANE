import PropTypes from 'prop-types';
import { formatCurrency, formatDate } from '../../utils/helpers';
import './RideCard.css';

const RideCard = ({ ride, onSelect }) => {
  const {
    driver,
    vehicle,
    departureTime,
    arrivalTime,
    from,
    to,
    price,
    availableSeats,
    totalSeats,
    rating,
    verified,
    amenities = []
  } = ride;

  const seatPercentage = ((totalSeats - availableSeats) / totalSeats) * 100;

  return (
    <div className="ride-card" onClick={() => onSelect && onSelect(ride)}>
      <div className="ride-card-header">
        <div className="driver-info">
          <div className="driver-avatar">
            {driver.photo ? (
              <img src={driver.photo} alt={driver.name} />
            ) : (
              <div className="avatar-placeholder">
                {driver.name.charAt(0).toUpperCase()}
              </div>
            )}
            {verified && <span className="verified-badge">✓</span>}
          </div>
          <div className="driver-details">
            <h4>{driver.name}</h4>
            <div className="rating">
              ⭐ {rating ? rating.toFixed(1) : 'New'} 
              {ride.reviewCount && <span className="review-count">({ride.reviewCount})</span>}
            </div>
          </div>
        </div>
        
        <div className="ride-price">
          <span className="currency-symbol">₹</span>
          <span className="price-value">{formatCurrency(price)}</span>
          <span className="price-label">per seat</span>
        </div>
      </div>

      <div className="ride-card-body">
        <div className="route-info">
          <div className="route-point">
            <span className="route-icon departure">📍</span>
            <div className="route-details">
              <div className="location">{from.name}</div>
              <div className="time">{formatDate(departureTime, 'time')}</div>
            </div>
          </div>

          <div className="route-line">
            <div className="line"></div>
            <div className="duration">{ride.duration || '2h 30m'}</div>
          </div>

          <div className="route-point">
            <span className="route-icon arrival">🎯</span>
            <div className="route-details">
              <div className="location">{to.name}</div>
              <div className="time">{formatDate(arrivalTime, 'time')}</div>
            </div>
          </div>
        </div>

        <div className="ride-meta">
          <div className="vehicle-info">
            <span className="vehicle-icon">🚗</span>
            <span>{vehicle.model} • {vehicle.number}</span>
          </div>

          <div className="seats-info">
            <span className="seats-icon">💺</span>
            <span className={availableSeats <= 1 ? 'low-seats' : ''}>
              {availableSeats} seat{availableSeats !== 1 ? 's' : ''} left
            </span>
            <div className="seats-bar">
              <div 
                className="seats-fill" 
                style={{ width: `${seatPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {amenities.length > 0 && (
          <div className="amenities">
            {amenities.map((amenity, index) => (
              <span key={index} className="amenity-badge">
                {amenity}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="ride-card-footer">
        <button className="btn-view-details">View Details</button>
        <button className="btn-book-now">Book Now</button>
      </div>
    </div>
  );
};

RideCard.propTypes = {
  ride: PropTypes.object.isRequired,
  onSelect: PropTypes.func
};

export default RideCard;
