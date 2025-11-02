import React, { useState } from 'react';
import './RideComparison.css';

const RideComparison = ({ rides, onClose, onSelect }) => {
  const [selectedRides, setSelectedRides] = useState([]);

  const toggleRideSelection = (rideId) => {
    setSelectedRides(prev => {
      if (prev.includes(rideId)) {
        return prev.filter(id => id !== rideId);
      }
      if (prev.length < 3) {
        return [...prev, rideId];
      }
      return prev;
    });
  };

  const compareFeatures = [
    { key: 'price', label: 'Price', format: (val) => `₹${val}` },
    { key: 'duration', label: 'Duration', format: (val) => `${val} mins` },
    { key: 'distance', label: 'Distance', format: (val) => `${val} km` },
    { key: 'seatsAvailable', label: 'Seats', format: (val) => val },
    { key: 'rating', label: 'Rating', format: (val) => `${val}/5 ★` },
    { key: 'departureTime', label: 'Departure', format: (val) => new Date(val).toLocaleTimeString() }
  ];

  const getComparison = () => {
    return selectedRides.map(id => rides.find(r => r._id === id));
  };

  const getBestValue = (feature) => {
    const comparisons = getComparison();
    if (comparisons.length === 0) return null;

    if (feature === 'price' || feature === 'duration') {
      return Math.min(...comparisons.map(r => r[feature]));
    }
    return Math.max(...comparisons.map(r => r[feature]));
  };

  return (
    <div className="comparison-overlay">
      <div className="comparison-modal">
        <div className="comparison-header">
          <h2>
            <i className="fas fa-exchange-alt"></i>
            Compare Rides
          </h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {selectedRides.length === 0 ? (
          <div className="comparison-empty">
            <i className="fas fa-hand-pointer"></i>
            <p>Select up to 3 rides to compare</p>
          </div>
        ) : (
          <div className="comparison-table-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  {getComparison().map(ride => (
                    <th key={ride._id}>
                      <div className="ride-header">
                        <img
                          src={ride.rider?.profilePhoto || '/images/default-avatar.png'}
                          alt={ride.rider?.name}
                        />
                        <div>
                          <strong>{ride.rider?.name}</strong>
                          <p>{ride.vehicle?.model}</p>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {compareFeatures.map(feature => {
                  const bestValue = getBestValue(feature.key);
                  return (
                    <tr key={feature.key}>
                      <td className="feature-label">{feature.label}</td>
                      {getComparison().map(ride => {
                        const value = ride[feature.key];
                        const isBest = value === bestValue;
                        return (
                          <td key={ride._id} className={isBest ? 'best-value' : ''}>
                            {feature.format(value)}
                            {isBest && <i className="fas fa-star"></i>}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="rides-selector">
          <h3>Available Rides</h3>
          <div className="rides-grid">
            {rides.map(ride => (
              <div
                key={ride._id}
                className={`ride-card ${selectedRides.includes(ride._id) ? 'selected' : ''}`}
                onClick={() => toggleRideSelection(ride._id)}
              >
                <div className="ride-info">
                  <img src={ride.rider?.profilePhoto || '/images/default-avatar.png'} alt={ride.rider?.name} />
                  <div>
                    <strong>{ride.rider?.name}</strong>
                    <p>₹{ride.price}</p>
                  </div>
                </div>
                {selectedRides.includes(ride._id) && (
                  <i className="fas fa-check-circle"></i>
                )}
              </div>
            ))}
          </div>
        </div>

        {selectedRides.length > 0 && (
          <div className="comparison-actions">
            <button className="btn-secondary" onClick={() => setSelectedRides([])}>
              Clear Selection
            </button>
            <button
              className="btn-primary"
              onClick={() => onSelect(selectedRides[0])}
            >
              Select Best Ride
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RideComparison;
