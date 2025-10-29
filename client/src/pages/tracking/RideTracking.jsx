import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './RideTracking.css';

const RideTracking = () => {
  const { rideId } = useParams();
  const navigate = useNavigate();

  const [rideData, setRideData] = useState(null);
  const [rideStatus, setRideStatus] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRideDetails();
  }, [rideId]);

  const fetchRideDetails = async () => {
    try {
      const response = await fetch(`/api/rides/${rideId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch ride details');

      const data = await response.json();
      setRideData(data);
      setRideStatus(data.status);
    } catch (err) {
      console.error('Error fetching ride details:', err);
      setError('Unable to load ride details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#FFC107',
      'accepted': '#2196F3',
      'in-progress': '#4CAF50',
      'completed': '#4CAF50',
      'cancelled': '#F44336'
    };
    return colors[status] || '#999';
  };

  if (loading) {
    return (
      <div className="tracking-loading">
        <div className="spinner"></div>
        <p>Loading ride details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tracking-error">
        <div className="error-icon">⚠️</div>
        <h3>Unable to Load Ride</h3>
        <p>{error}</p>
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="ride-tracking-page">
      <div className="tracking-container">
        <div className="tracking-header">
          <button onClick={() => navigate('/dashboard')} className="btn-back-small">
            ← Back
          </button>
          <h1>Track Your Ride</h1>
          <div 
            className="status-badge" 
            style={{ backgroundColor: getStatusColor(rideStatus) }}
          >
            {rideStatus}
          </div>
        </div>

        {rideData && (
          <div className="ride-info-card">
            <h3>Ride Details</h3>
            <div className="ride-details">
              <div className="detail-row">
                <span className="label">From:</span>
                <span className="value">{rideData.pickup?.address}</span>
              </div>
              <div className="detail-row">
                <span className="label">To:</span>
                <span className="value">{rideData.dropoff?.address}</span>
              </div>
              <div className="detail-row">
                <span className="label">Driver:</span>
                <span className="value">{rideData.driver?.name}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RideTracking;
