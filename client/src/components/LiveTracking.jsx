import React, { useState, useEffect, useRef } from 'react';
import { GoogleMap, Marker, Polyline, useJsApiLoader } from '@react-google-maps/api';
import io from 'socket.io-client';
import './LiveTracking.css';

const LiveTracking = ({ bookingId, userType }) => {
  const [socket, setSocket] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [route, setRoute] = useState([]);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [eta, setEta] = useState(null);
  const [distance, setDistance] = useState(null);
  const mapRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['geometry', 'places']
  });

  const mapContainerStyle = {
    width: '100%',
    height: '100%'
  };

  const defaultCenter = {
    lat: 12.9716,
    lng: 77.5946
  };

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to tracking server');
      newSocket.emit('join-booking', bookingId);
    });

    newSocket.on('location-update', (data) => {
      if (data.userType === 'driver') {
        setDriverLocation({
          lat: data.latitude,
          lng: data.longitude
        });
        setEta(data.eta);
        setDistance(data.distance);
      } else if (data.userType === 'user') {
        setUserLocation({
          lat: data.latitude,
          lng: data.longitude
        });
      }
    });

    newSocket.on('route-update', (data) => {
      setRoute(data.route.map(point => ({
        lat: point.latitude,
        lng: point.longitude
      })));
    });

    newSocket.on('booking-update', (data) => {
      setBookingDetails(data);
    });

    newSocket.on('tracking-error', (error) => {
      console.error('Tracking error:', error);
    });

    return () => {
      if (newSocket) {
        newSocket.emit('leave-booking', bookingId);
        newSocket.disconnect();
      }
    };
  }, [bookingId]);

  useEffect(() => {
    if (userType === 'driver' && socket) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            heading: position.coords.heading,
            speed: position.coords.speed
          };
          
          socket.emit('update-location', {
            bookingId,
            ...location,
            userType: 'driver'
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, [socket, bookingId, userType]);

  useEffect(() => {
    if (mapRef.current && driverLocation && userLocation) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(driverLocation);
      bounds.extend(userLocation);
      mapRef.current.fitBounds(bounds, 50);
    }
  }, [driverLocation, userLocation]);

  const onMapLoad = (map) => {
    mapRef.current = map;
  };

  const formatETA = (seconds) => {
    if (!seconds) return 'Calculating...';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatDistance = (meters) => {
    if (!meters) return 'Calculating...';
    const km = (meters / 1000).toFixed(1);
    return `${km} km`;
  };

  if (!isLoaded) {
    return (
      <div className="tracking-loading">
        <div className="spinner"></div>
        <p>Loading map...</p>
      </div>
    );
  }

  return (
    <div className="live-tracking-container">
      <div className="tracking-header">
        <div className="tracking-info">
          <h2>Live Tracking</h2>
          <div className="tracking-stats">
            <div className="stat-item">
              <span className="stat-label">ETA</span>
              <span className="stat-value">{formatETA(eta)}</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-label">Distance</span>
              <span className="stat-value">{formatDistance(distance)}</span>
            </div>
          </div>
        </div>
        
        {bookingDetails && (
          <div className="booking-status">
            <span className={`status-badge status-${bookingDetails.status}`}>
              {bookingDetails.status}
            </span>
          </div>
        )}
      </div>

      <div className="map-container">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={driverLocation || userLocation || defaultCenter}
          zoom={15}
          onLoad={onMapLoad}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true
          }}
        >
          {driverLocation && (
            <Marker
              position={driverLocation}
              icon={{
                url: '/images/car-marker.png',
                scaledSize: new window.google.maps.Size(40, 40),
                anchor: new window.google.maps.Point(20, 20)
              }}
              title="Driver"
            />
          )}

          {userLocation && (
            <Marker
              position={userLocation}
              icon={{
                url: '/images/user-marker.png',
                scaledSize: new window.google.maps.Size(30, 30),
                anchor: new window.google.maps.Point(15, 15)
              }}
              title="Pickup Location"
            />
          )}

          {route.length > 0 && (
            <Polyline
              path={route}
              options={{
                strokeColor: '#3b82f6',
                strokeOpacity: 0.8,
                strokeWeight: 4,
                geodesic: true
              }}
            />
          )}
        </GoogleMap>
      </div>

      {bookingDetails && (
        <div className="tracking-details">
          <div className="detail-section">
            <h3>Trip Details</h3>
            <div className="detail-row">
              <span className="detail-label">Pickup</span>
              <span className="detail-value">{bookingDetails.pickup?.address}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Drop-off</span>
              <span className="detail-value">{bookingDetails.dropoff?.address}</span>
            </div>
          </div>

          {bookingDetails.driver && (
            <div className="detail-section">
              <h3>Driver Information</h3>
              <div className="driver-info">
                <img 
                  src={bookingDetails.driver.profileImage || '/images/default-avatar.png'}
                  alt={bookingDetails.driver.name}
                  className="driver-avatar"
                />
                <div className="driver-details">
                  <p className="driver-name">{bookingDetails.driver.name}</p>
                  <p className="driver-vehicle">
                    {bookingDetails.driver.vehicleModel} • {bookingDetails.driver.vehicleNumber}
                  </p>
                  <p className="driver-rating">⭐ {bookingDetails.driver.rating || 4.5}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveTracking;
