import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './EmergencyMapView.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const EmergencyMapView = ({ emergency, emergencies = [] }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [mapReady, setMapReady] = useState(false);
  const [viewMode, setViewMode] = useState('single'); // 'single' or 'all'

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([20.5937, 78.9629], 5); // India center

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;
    setMapReady(true);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers based on view mode
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    if (viewMode === 'single' && emergency && emergency.location) {
      // Show single emergency
      const coords = emergency.location.coordinates;
      const lat = coords[1];
      const lng = coords[0];

      const emergencyIcon = L.divIcon({
        className: 'custom-emergency-icon',
        html: `<div class="emergency-marker ${getPriorityClass(emergency)}">
                 <span class="marker-icon">${getEmergencyIcon(emergency.type)}</span>
               </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      const marker = L.marker([lat, lng], { icon: emergencyIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div class="emergency-popup">
            <h4>${emergency.type}</h4>
            <p><strong>${emergency.user?.name || 'Unknown'}</strong></p>
            <p>${emergency.user?.phone || 'No phone'}</p>
            <p class="time">${new Date(emergency.createdAt).toLocaleString()}</p>
          </div>
        `);

      markersRef.current.push(marker);
      mapInstanceRef.current.setView([lat, lng], 15);

      // Add radius circle
      const circle = L.circle([lat, lng], {
        color: '#ff4757',
        fillColor: '#ff4757',
        fillOpacity: 0.1,
        radius: 500
      }).addTo(mapInstanceRef.current);
      markersRef.current.push(circle);

    } else if (viewMode === 'all' && emergencies.length > 0) {
      // Show all emergencies
      const bounds = [];

      emergencies.forEach(emerg => {
        if (!emerg.location || !emerg.location.coordinates) return;

        const coords = emerg.location.coordinates;
        const lat = coords[1];
        const lng = coords[0];
        bounds.push([lat, lng]);

        const emergencyIcon = L.divIcon({
          className: 'custom-emergency-icon',
          html: `<div class="emergency-marker ${getPriorityClass(emerg)} small">
                   <span class="marker-icon">${getEmergencyIcon(emerg.type)}</span>
                 </div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 30],
        });

        const marker = L.marker([lat, lng], { icon: emergencyIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div class="emergency-popup">
              <h4>${emerg.type}</h4>
              <p><strong>${emerg.user?.name || 'Unknown'}</strong></p>
              <p class="time">${new Date(emerg.createdAt).toLocaleString()}</p>
            </div>
          `);

        markersRef.current.push(marker);
      });

      // Fit map to show all markers
      if (bounds.length > 0) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [emergency, emergencies, viewMode, mapReady]);

  const getPriorityClass = (emerg) => {
    const timeElapsed = Date.now() - new Date(emerg.createdAt).getTime();
    const minutes = Math.floor(timeElapsed / 60000);
    
    if (emerg.type === 'ACCIDENT' || emerg.type === 'HARASSMENT') {
      return 'critical';
    } else if (minutes > 10) {
      return 'high';
    } else if (minutes > 5) {
      return 'medium';
    }
    return 'low';
  };

  const getEmergencyIcon = (type) => {
    const icons = {
      ACCIDENT: '🚨',
      BREAKDOWN: '🔧',
      HARASSMENT: '⚠️',
      MEDICAL: '🏥',
      OTHER: '❗'
    };
    return icons[type] || '📍';
  };

  const handleRecenterMap = () => {
    if (!mapInstanceRef.current || !emergency || !emergency.location) return;
    
    const coords = emergency.location.coordinates;
    mapInstanceRef.current.setView([coords[1], coords[0]], 15);
  };

  const handleGetDirections = () => {
    if (!emergency || !emergency.location) return;
    
    const coords = emergency.location.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${coords[1]},${coords[0]}`;
    window.open(url, '_blank');
  };

  return (
    <div className="emergency-map-view">
      <div className="map-header">
        <h3>Location Map</h3>
        <div className="map-controls">
          <div className="view-toggle">
            <button
              className={viewMode === 'single' ? 'active' : ''}
              onClick={() => setViewMode('single')}
              disabled={!emergency}
            >
              Single
            </button>
            <button
              className={viewMode === 'all' ? 'active' : ''}
              onClick={() => setViewMode('all')}
              disabled={emergencies.length === 0}
            >
              All ({emergencies.length})
            </button>
          </div>
          {viewMode === 'single' && emergency && (
            <>
              <button className="map-action-btn" onClick={handleRecenterMap}>
                📍 Recenter
              </button>
              <button className="map-action-btn primary" onClick={handleGetDirections}>
                🗺️ Get Directions
              </button>
            </>
          )}
        </div>
      </div>

      <div ref={mapRef} className="map-container" />

      {emergency && emergency.location && (
        <div className="map-footer">
          <div className="coordinates-display">
            <span className="coord-label">Lat:</span>
            <span className="coord-value">{emergency.location.coordinates[1].toFixed(6)}</span>
            <span className="coord-separator">|</span>
            <span className="coord-label">Lng:</span>
            <span className="coord-value">{emergency.location.coordinates[0].toFixed(6)}</span>
          </div>
          {emergency.location.address && (
            <div className="address-display">
              <span className="address-icon">📍</span>
              <span>{emergency.location.address}</span>
            </div>
          )}
        </div>
      )}

      {!emergency && viewMode === 'single' && (
        <div className="map-overlay">
          <p>Select an emergency to view location</p>
        </div>
      )}
    </div>
  );
};

export default EmergencyMapView;
