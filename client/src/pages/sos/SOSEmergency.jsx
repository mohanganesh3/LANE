import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/apiService';
import './SOSEmergency.css';

/**
 * SOSEmergency Component
 * Emergency SOS page for riders to quickly request help
 */
const SOSEmergency = ({ rideId }) => {
  const navigate = useNavigate();
  const [activeRide, setActiveRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [emergencyId, setEmergencyId] = useState(null);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    fetchActiveRide();
    getCurrentLocation();
  }, []);

  const fetchActiveRide = async () => {
    try {
      const response = await apiService.get('/rides/active');
      setActiveRide(response.data.ride);
    } catch (err) {
      console.error('Failed to fetch active ride:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          console.error('Location error:', error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  };

  const handleEmergencyTrigger = async (emergencyType) => {
    try {
      setLoading(true);
      
      const emergencyData = {
        rideId: activeRide?._id || rideId,
        type: emergencyType,
        location: location || { latitude: 0, longitude: 0 },
        timestamp: new Date().toISOString(),
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
        },
      };

      const response = await apiService.post('/sos/trigger', emergencyData);
      
      setEmergencyActive(true);
      setEmergencyId(response.data.emergencyId);
      
      // Start location tracking
      startLocationTracking();
      
      // Notify emergency contacts
      notifyEmergencyContacts();
      
    } catch (err) {
      console.error('Failed to trigger emergency:', err);
      alert('Failed to send emergency alert. Please call emergency services directly.');
    } finally {
      setLoading(false);
    }
  };

  const startLocationTracking = () => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString(),
          };
          
          setLocation(newLocation);
          
          // Send location update to server
          apiService.post(`/sos/${emergencyId}/location`, newLocation).catch(err => {
            console.error('Failed to update location:', err);
          });
        },
        (error) => {
          console.error('Location tracking error:', error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
      
      // Store watchId to clear later
      window.sosLocationWatchId = watchId;
    }
  };

  const notifyEmergencyContacts = async () => {
    try {
      await apiService.post(`/sos/${emergencyId}/notify-contacts`);
    } catch (err) {
      console.error('Failed to notify emergency contacts:', err);
    }
  };

  const handleCancelEmergency = async () => {
    try {
      await apiService.post(`/sos/${emergencyId}/cancel`);
      setEmergencyActive(false);
      setEmergencyId(null);
      
      // Stop location tracking
      if (window.sosLocationWatchId) {
        navigator.geolocation.clearWatch(window.sosLocationWatchId);
        window.sosLocationWatchId = null;
      }
      
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to cancel emergency:', err);
    }
  };

  const emergencyTypes = [
    {
      id: 'accident',
      title: 'Accident',
      description: 'Vehicle accident or collision',
      icon: '🚨',
      color: '#ef4444',
      urgent: true,
    },
    {
      id: 'medical',
      title: 'Medical Emergency',
      description: 'Health issue requiring immediate attention',
      icon: '🏥',
      color: '#dc2626',
      urgent: true,
    },
    {
      id: 'harassment',
      title: 'Harassment',
      description: 'Feeling unsafe or threatened',
      icon: '⚠️',
      color: '#f59e0b',
      urgent: true,
    },
    {
      id: 'breakdown',
      title: 'Vehicle Breakdown',
      description: 'Vehicle stopped or malfunctioning',
      icon: '🔧',
      color: '#8b5cf6',
      urgent: false,
    },
    {
      id: 'route_deviation',
      title: 'Route Deviation',
      description: 'Driver taking unexpected route',
      icon: '🗺️',
      color: '#f97316',
      urgent: false,
    },
    {
      id: 'other',
      title: 'Other Emergency',
      description: 'Other safety concern',
      icon: '🆘',
      color: '#ec4899',
      urgent: false,
    },
  ];

  if (loading && !emergencyActive) {
    return (
      <div className="sos-emergency-page">
        <div className="sos-loading">
          <div className="spinner" />
          <p>Loading emergency services...</p>
        </div>
      </div>
    );
  }

  if (emergencyActive) {
    return (
      <div className="sos-emergency-page emergency-active">
        <div className="emergency-active-container">
          <div className="emergency-header">
            <div className="emergency-icon pulsing">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h1>Emergency Alert Active</h1>
            <p>Help is on the way. Stay calm and safe.</p>
          </div>

          <div className="emergency-status">
            <div className="status-item">
              <span className="status-label">Emergency ID</span>
              <span className="status-value">#{emergencyId?.slice(-8) || 'XXXXXXXX'}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Status</span>
              <span className="status-value active">Active</span>
            </div>
            <div className="status-item">
              <span className="status-label">Location Tracking</span>
              <span className="status-value tracking">
                <span className="tracking-dot" />
                Enabled
              </span>
            </div>
          </div>

          <div className="emergency-actions">
            <div className="emergency-contacts">
              <h3>Emergency Services Notified</h3>
              <div className="contact-list">
                <div className="contact-item">
                  <div className="contact-icon">📞</div>
                  <div className="contact-details">
                    <span className="contact-name">Local Police</span>
                    <span className="contact-number">100</span>
                  </div>
                  <button className="btn-call-contact" onClick={() => window.location.href = 'tel:100'}>
                    Call
                  </button>
                </div>
                <div className="contact-item">
                  <div className="contact-icon">🚑</div>
                  <div className="contact-details">
                    <span className="contact-name">Ambulance</span>
                    <span className="contact-number">108</span>
                  </div>
                  <button className="btn-call-contact" onClick={() => window.location.href = 'tel:108'}>
                    Call
                  </button>
                </div>
                <div className="contact-item">
                  <div className="contact-icon">👤</div>
                  <div className="contact-details">
                    <span className="contact-name">Support Team</span>
                    <span className="contact-number">Available 24/7</span>
                  </div>
                  <button className="btn-call-contact" onClick={() => window.location.href = 'tel:+911234567890'}>
                    Call
                  </button>
                </div>
              </div>
            </div>

            <div className="emergency-info">
              <h4>What happens next:</h4>
              <ul>
                <li>✓ Your location is being tracked in real-time</li>
                <li>✓ Emergency contacts have been notified</li>
                <li>✓ Support team is monitoring your situation</li>
                <li>✓ Help is being dispatched to your location</li>
              </ul>
            </div>

            <button
              className="btn-cancel-emergency"
              onClick={handleCancelEmergency}
            >
              I'm Safe - Cancel Emergency
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sos-emergency-page">
      <div className="sos-container">
        <div className="sos-header">
          <div className="header-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <h1>Emergency SOS</h1>
          <p>Select the type of emergency you're experiencing</p>
        </div>

        {activeRide && (
          <div className="active-ride-info">
            <h3>Current Ride Information</h3>
            <div className="ride-details">
              <div className="detail-item">
                <span className="detail-label">Driver:</span>
                <span className="detail-value">{activeRide.driver?.name || 'Unknown'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Vehicle:</span>
                <span className="detail-value">{activeRide.vehicle?.number || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}

        <div className="emergency-types">
          {emergencyTypes.map((emergency) => (
            <button
              key={emergency.id}
              className={`emergency-type-card ${emergency.urgent ? 'urgent' : ''}`}
              onClick={() => handleEmergencyTrigger(emergency.id)}
              style={{ borderColor: emergency.color }}
            >
              <div className="emergency-icon" style={{ color: emergency.color }}>
                <span className="icon-emoji">{emergency.icon}</span>
              </div>
              <div className="emergency-details">
                <h3>{emergency.title}</h3>
                <p>{emergency.description}</p>
                {emergency.urgent && (
                  <span className="urgent-badge">Urgent Response</span>
                )}
              </div>
              <div className="emergency-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </div>
            </button>
          ))}
        </div>

        <div className="sos-footer">
          <div className="emergency-numbers">
            <h4>Emergency Helpline Numbers</h4>
            <div className="helpline-grid">
              <div className="helpline-item">
                <span className="helpline-icon">👮</span>
                <span className="helpline-label">Police</span>
                <a href="tel:100" className="helpline-number">100</a>
              </div>
              <div className="helpline-item">
                <span className="helpline-icon">🚑</span>
                <span className="helpline-label">Ambulance</span>
                <a href="tel:108" className="helpline-number">108</a>
              </div>
              <div className="helpline-item">
                <span className="helpline-icon">🚒</span>
                <span className="helpline-label">Fire</span>
                <a href="tel:101" className="helpline-number">101</a>
              </div>
              <div className="helpline-item">
                <span className="helpline-icon">👩</span>
                <span className="helpline-label">Women Helpline</span>
                <a href="tel:1091" className="helpline-number">1091</a>
              </div>
            </div>
          </div>

          <div className="safety-tips">
            <p>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4"/>
                <path d="M12 8h.01"/>
              </svg>
              Your safety is our priority. In case of immediate danger, call emergency services directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SOSEmergency;
