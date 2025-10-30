import React, { useState, useEffect, useCallback } from 'react';
import MapContainer from '../../components/map/MapContainer';
import { 
  calculateDistance, 
  calculateBounds,
  formatDistance,
  MAP_CONFIG 
} from '../../utils/mapUtils';
import { useSocket } from '../../contexts/SocketContext';
import './LiveTrackingMap.css';

/**
 * LiveTrackingMap Component
 * Real-time ride tracking with driver and passenger locations
 */
const LiveTrackingMap = ({ 
  rideId,
  driverLocation,
  passengerLocation,
  pickupLocation,
  dropoffLocation,
  route,
  showControls = true
}) => {
  const socket = useSocket();
  const [mapCenter, setMapCenter] = useState(MAP_CONFIG.DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(MAP_CONFIG.TRACKING_ZOOM);
  const [liveDriverLocation, setLiveDriverLocation] = useState(driverLocation);
  const [livePassengerLocation, setLivePassengerLocation] = useState(passengerLocation);
  const [tracking, setTracking] = useState(true);
  const [eta, setEta] = useState(null);
  const [distanceRemaining, setDistanceRemaining] = useState(null);

  // Initialize map center based on locations
  useEffect(() => {
    if (driverLocation) {
      setMapCenter([driverLocation.lat, driverLocation.lng]);
      setLiveDriverLocation(driverLocation);
    } else if (pickupLocation) {
      setMapCenter([pickupLocation.lat, pickupLocation.lng]);
    }
  }, []);

  // Listen for real-time location updates via Socket.io
  useEffect(() => {
    if (!socket || !rideId) return;

    // Subscribe to driver location updates
    const handleDriverLocationUpdate = (data) => {
      if (data.rideId === rideId) {
        setLiveDriverLocation({
          lat: data.latitude,
          lng: data.longitude,
          heading: data.heading,
          speed: data.speed
        });

        // Update ETA and distance
        if (data.eta) setEta(data.eta);
        if (data.distanceRemaining) setDistanceRemaining(data.distanceRemaining);

        // Auto-center map if tracking is enabled
        if (tracking) {
          setMapCenter([data.latitude, data.longitude]);
        }
      }
    };

    // Subscribe to passenger location updates
    const handlePassengerLocationUpdate = (data) => {
      if (data.rideId === rideId) {
        setLivePassengerLocation({
          lat: data.latitude,
          lng: data.longitude
        });
      }
    };

    socket.on('driver:location:update', handleDriverLocationUpdate);
    socket.on('passenger:location:update', handlePassengerLocationUpdate);

    // Join ride room for updates
    socket.emit('ride:join', { rideId });

    // Cleanup
    return () => {
      socket.off('driver:location:update', handleDriverLocationUpdate);
      socket.off('passenger:location:update', handlePassengerLocationUpdate);
      socket.emit('ride:leave', { rideId });
    };
  }, [socket, rideId, tracking]);

  // Calculate distance from driver to destination
  useEffect(() => {
    if (liveDriverLocation && dropoffLocation) {
      const distance = calculateDistance(liveDriverLocation, dropoffLocation);
      setDistanceRemaining(distance);
    }
  }, [liveDriverLocation, dropoffLocation]);

  // Prepare markers for map
  const markers = [];

  // Add driver marker
  if (liveDriverLocation) {
    markers.push({
      id: 'driver',
      position: liveDriverLocation,
      icon: {
        iconUrl: '/icons/driver-marker.png',
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -38]
      },
      popup: `
        <div class="map-popup">
          <h4>Driver Location</h4>
          ${liveDriverLocation.speed ? `<p>Speed: ${Math.round(liveDriverLocation.speed)} km/h</p>` : ''}
        </div>
      `,
      tooltip: 'Driver'
    });
  }

  // Add passenger marker
  if (livePassengerLocation) {
    markers.push({
      id: 'passenger',
      position: livePassengerLocation,
      icon: {
        iconUrl: '/icons/passenger-marker.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      },
      popup: `
        <div class="map-popup">
          <h4>Your Location</h4>
        </div>
      `,
      tooltip: 'You'
    });
  }

  // Add pickup marker
  if (pickupLocation) {
    markers.push({
      id: 'pickup',
      position: pickupLocation,
      icon: {
        iconUrl: '/icons/pickup-marker.png',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28]
      },
      popup: `
        <div class="map-popup">
          <h4>Pickup Location</h4>
          <p>${pickupLocation.address || 'Pickup point'}</p>
        </div>
      `,
      tooltip: 'Pickup'
    });
  }

  // Add dropoff marker
  if (dropoffLocation) {
    markers.push({
      id: 'dropoff',
      position: dropoffLocation,
      icon: {
        iconUrl: '/icons/dropoff-marker.png',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28]
      },
      popup: `
        <div class="map-popup">
          <h4>Drop-off Location</h4>
          <p>${dropoffLocation.address || 'Destination'}</p>
        </div>
      `,
      tooltip: 'Destination'
    });
  }

  // Prepare route polyline
  const polylines = [];
  if (route && route.length > 0) {
    polylines.push({
      id: 'route',
      positions: route,
      color: '#3b82f6',
      weight: 5,
      opacity: 0.7
    });
  }

  // Handle center on driver
  const handleCenterOnDriver = useCallback(() => {
    if (liveDriverLocation) {
      setMapCenter([liveDriverLocation.lat, liveDriverLocation.lng]);
      setMapZoom(MAP_CONFIG.TRACKING_ZOOM);
      setTracking(true);
    }
  }, [liveDriverLocation]);

  // Handle fit to bounds
  const handleFitBounds = useCallback(() => {
    const allLocations = [
      liveDriverLocation,
      livePassengerLocation,
      pickupLocation,
      dropoffLocation
    ].filter(Boolean);

    if (allLocations.length > 0) {
      const bounds = calculateBounds(allLocations);
      if (bounds && window.mapInstance) {
        window.mapInstance.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 15
        });
      }
      setTracking(false);
    }
  }, [liveDriverLocation, livePassengerLocation, pickupLocation, dropoffLocation]);

  return (
    <div className="live-tracking-map">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        markers={markers}
        polylines={polylines}
        className="tracking-map-container"
      />

      {showControls && (
        <div className="map-controls">
          <button 
            onClick={handleCenterOnDriver}
            className={`map-control-btn ${tracking ? 'active' : ''}`}
            title="Center on driver"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="3" fill="currentColor"/>
            </svg>
          </button>

          <button 
            onClick={handleFitBounds}
            className="map-control-btn"
            title="Fit all markers"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M9 9L3 3M9 3L3 9M15 15l6 6M15 21l6-6"/>
            </svg>
          </button>
        </div>
      )}

      {(eta || distanceRemaining) && (
        <div className="tracking-info">
          {distanceRemaining && (
            <div className="info-item">
              <span className="info-label">Distance</span>
              <span className="info-value">{formatDistance(distanceRemaining)}</span>
            </div>
          )}
          {eta && (
            <div className="info-item">
              <span className="info-label">ETA</span>
              <span className="info-value">{eta} min</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveTrackingMap;
