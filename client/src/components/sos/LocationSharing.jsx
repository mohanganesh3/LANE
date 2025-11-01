import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/apiService';
import LiveTrackingMap from '../map/LiveTrackingMap';

/**
 * LocationSharing Component
 * Share live location with emergency contacts during active SOS
 */
const LocationSharing = ({ emergencyId, onLocationUpdate }) => {
  const [location, setLocation] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [accuracy, setAccuracy] = useState(null);
  const [error, setError] = useState(null);
  const [watchId, setWatchId] = useState(null);

  useEffect(() => {
    if (emergencyId) {
      startLocationSharing();
    }

    return () => {
      stopLocationSharing();
    };
  }, [emergencyId]);

  const startLocationSharing = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };

    const handleSuccess = (position) => {
      const newLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: new Date(position.timestamp).toISOString(),
      };

      setLocation(newLocation);
      setAccuracy(position.coords.accuracy);
      setIsSharing(true);
      setError(null);

      // Share location with emergency contacts via API
      shareLocationWithContacts(newLocation);

      // Callback to parent component
      if (onLocationUpdate) {
        onLocationUpdate(newLocation);
      }
    };

    const handleError = (error) => {
      let errorMessage = 'Failed to get location';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location permission denied. Please enable location access.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable.';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out.';
          break;
      }
      
      setError(errorMessage);
      setIsSharing(false);
    };

    // Get initial position
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);

    // Watch position for continuous updates
    const id = navigator.geolocation.watchPosition(handleSuccess, handleError, options);
    setWatchId(id);
  };

  const stopLocationSharing = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setIsSharing(false);
    }
  };

  const shareLocationWithContacts = async (locationData) => {
    if (!emergencyId) return;

    try {
      await apiService.post(`/sos/${emergencyId}/share-location`, {
        location: locationData,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to share location:', err);
    }
  };

  const getAccuracyColor = () => {
    if (!accuracy) return '#9ca3af';
    if (accuracy < 10) return '#10b981';
    if (accuracy < 50) return '#f59e0b';
    return '#ef4444';
  };

  const getAccuracyLabel = () => {
    if (!accuracy) return 'Unknown';
    if (accuracy < 10) return 'Excellent';
    if (accuracy < 50) return 'Good';
    return 'Fair';
  };

  return (
    <div className="location-sharing-container">
      {error && (
        <div className="location-error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>{error}</p>
          <button onClick={startLocationSharing} className="btn-retry">
            Retry
          </button>
        </div>
      )}

      {isSharing && location && (
        <div className="location-status">
          <div className="status-header">
            <div className="status-indicator">
              <span className="indicator-dot pulsing"></span>
              <span className="status-text">Live Location Sharing Active</span>
            </div>
            <div className="accuracy-badge" style={{ color: getAccuracyColor() }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
              {getAccuracyLabel()} ({Math.round(accuracy)}m)
            </div>
          </div>

          <div className="location-details">
            <div className="detail-row">
              <span className="detail-label">Coordinates:</span>
              <span className="detail-value">
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </span>
            </div>
            {location.speed !== null && location.speed > 0 && (
              <div className="detail-row">
                <span className="detail-label">Speed:</span>
                <span className="detail-value">
                  {(location.speed * 3.6).toFixed(1)} km/h
                </span>
              </div>
            )}
            {location.altitude !== null && (
              <div className="detail-row">
                <span className="detail-label">Altitude:</span>
                <span className="detail-value">
                  {Math.round(location.altitude)}m
                </span>
              </div>
            )}
            <div className="detail-row">
              <span className="detail-label">Last Updated:</span>
              <span className="detail-value">
                {new Date(location.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Live Map Display */}
          <div className="location-map">
            <LiveTrackingMap
              center={[location.latitude, location.longitude]}
              markers={[{
                position: [location.latitude, location.longitude],
                type: 'user',
                label: 'Your Location',
              }]}
              zoom={16}
            />
            
            {/* Accuracy Circle Overlay */}
            <div className="accuracy-circle-info">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4"/>
                <path d="M12 8h.01"/>
              </svg>
              <span>Blue circle shows location accuracy (±{Math.round(accuracy)}m)</span>
            </div>
          </div>

          <div className="sharing-actions">
            <button
              className="btn-copy-location"
              onClick={() => {
                const locationText = `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
                navigator.clipboard.writeText(locationText);
                alert('Location link copied to clipboard!');
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              Copy Location Link
            </button>
            
            <button
              className="btn-open-maps"
              onClick={() => {
                window.open(`https://maps.google.com/?q=${location.latitude},${location.longitude}`, '_blank');
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              Open in Google Maps
            </button>
          </div>
        </div>
      )}

      {!isSharing && !error && (
        <div className="location-loading">
          <div className="spinner"></div>
          <p>Obtaining your location...</p>
        </div>
      )}

      <style jsx>{`
        .location-sharing-container {
          margin-top: 1.5rem;
        }

        .location-error {
          background: #fee2e2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          text-align: center;
        }

        .location-error svg {
          color: #dc2626;
        }

        .location-error p {
          color: #991b1b;
          margin: 0;
        }

        .btn-retry {
          padding: 0.625rem 1.25rem;
          background: #dc2626;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-retry:hover {
          background: #b91c1c;
        }

        .location-status {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .status-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }

        .indicator-dot {
          width: 10px;
          height: 10px;
          background: #10b981;
          border-radius: 50%;
        }

        .indicator-dot.pulsing {
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
          }
        }

        .status-text {
          font-weight: 600;
          color: #111827;
        }

        .accuracy-badge {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .location-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
          margin-bottom: 1.25rem;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
        }

        .detail-label {
          color: #6b7280;
          font-weight: 500;
        }

        .detail-value {
          color: #111827;
          font-weight: 600;
        }

        .location-map {
          margin-bottom: 1.25rem;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
        }

        .accuracy-circle-info {
          position: absolute;
          bottom: 1rem;
          left: 1rem;
          right: 1rem;
          background: rgba(255, 255, 255, 0.95);
          padding: 0.75rem;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #374151;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .accuracy-circle-info svg {
          flex-shrink: 0;
          color: #3b82f6;
        }

        .sharing-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.75rem;
        }

        .btn-copy-location,
        .btn-open-maps {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: #f3f4f6;
          color: #374151;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-copy-location:hover,
        .btn-open-maps:hover {
          background: #e5e7eb;
          transform: translateY(-1px);
        }

        .location-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 2rem;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e5e7eb;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .location-loading p {
          color: #6b7280;
        }

        @media (max-width: 640px) {
          .status-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .sharing-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default LocationSharing;
