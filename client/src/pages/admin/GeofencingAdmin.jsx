import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, FeatureGroup, Polygon, Circle, Marker, Popup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import './GeofencingAdmin.css';

const GeofencingAdmin = () => {
  const [geofences, setGeofences] = useState([]);
  const [selectedGeofence, setSelectedGeofence] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [violations, setViolations] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    violations: 0
  });
  const mapRef = useRef();
  const featureGroupRef = useRef();

  useEffect(() => {
    fetchGeofences();
    fetchViolations();
    fetchStats();
  }, []);

  const fetchGeofences = async () => {
    try {
      const response = await fetch('/api/admin/geofences', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setGeofences(data.geofences);
    } catch (error) {
      console.error('Error fetching geofences:', error);
    }
  };

  const fetchViolations = async () => {
    try {
      const response = await fetch('/api/admin/geofence-violations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setViolations(data.violations);
    } catch (error) {
      console.error('Error fetching violations:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/geofence-stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreated = async (e) => {
    const { layerType, layer } = e;
    let coordinates;

    if (layerType === 'polygon') {
      coordinates = layer.getLatLngs()[0].map(latlng => [latlng.lat, latlng.lng]);
    } else if (layerType === 'circle') {
      const center = layer.getLatLng();
      coordinates = {
        center: [center.lat, center.lng],
        radius: layer.getRadius()
      };
    }

    setSelectedGeofence({
      type: layerType,
      coordinates,
      layer
    });
    setShowCreateModal(true);
  };

  const createGeofence = async (formData) => {
    try {
      await fetch('/api/admin/geofences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          type: selectedGeofence.type,
          coordinates: selectedGeofence.coordinates
        })
      });

      setShowCreateModal(false);
      setSelectedGeofence(null);
      fetchGeofences();
      fetchStats();
    } catch (error) {
      console.error('Error creating geofence:', error);
    }
  };

  const toggleGeofence = async (geofenceId, isActive) => {
    try {
      await fetch(`/api/admin/geofences/${geofenceId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !isActive })
      });

      fetchGeofences();
      fetchStats();
    } catch (error) {
      console.error('Error toggling geofence:', error);
    }
  };

  const deleteGeofence = async (geofenceId) => {
    if (!confirm('Are you sure you want to delete this geofence?')) return;

    try {
      await fetch(`/api/admin/geofences/${geofenceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      fetchGeofences();
      fetchStats();
    } catch (error) {
      console.error('Error deleting geofence:', error);
    }
  };

  return (
    <div className="geofencing-admin">
      <div className="admin-header">
        <h1>
          <i className="fas fa-draw-polygon"></i>
          Geo-Fencing Management
        </h1>
        <p>Create and manage geographical boundaries for ride monitoring</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Geofences</div>
        </div>
        <div className="stat-card">
          <div className="stat-value green">{stats.active}</div>
          <div className="stat-label">Active Zones</div>
        </div>
        <div className="stat-card">
          <div className="stat-value red">{stats.violations}</div>
          <div className="stat-label">Violations Today</div>
        </div>
      </div>

      <div className="geofencing-content">
        <div className="map-section">
          <div className="map-controls">
            <button className="btn-primary">
              <i className="fas fa-plus"></i>
              Draw New Zone
            </button>
            <div className="map-legend">
              <span><span className="legend-color active"></span> Active</span>
              <span><span className="legend-color inactive"></span> Inactive</span>
            </div>
          </div>

          <div className="map-container">
            <MapContainer
              center={[12.9716, 77.5946]}
              zoom={12}
              style={{ height: '500px', width: '100%' }}
              ref={mapRef}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              
              <FeatureGroup ref={featureGroupRef}>
                <EditControl
                  position="topright"
                  onCreated={handleCreated}
                  draw={{
                    rectangle: false,
                    polyline: false,
                    marker: false,
                    circlemarker: false,
                    polygon: {
                      allowIntersection: false,
                      showArea: true
                    },
                    circle: true
                  }}
                />

                {geofences.map((geofence) => {
                  if (geofence.type === 'polygon') {
                    return (
                      <Polygon
                        key={geofence._id}
                        positions={geofence.coordinates}
                        pathOptions={{
                          color: geofence.isActive ? '#10b981' : '#9ca3af',
                          fillColor: geofence.isActive ? '#10b981' : '#9ca3af',
                          fillOpacity: 0.2
                        }}
                      >
                        <Popup>
                          <strong>{geofence.name}</strong>
                          <p>{geofence.description}</p>
                          <p>Status: {geofence.isActive ? 'Active' : 'Inactive'}</p>
                        </Popup>
                      </Polygon>
                    );
                  } else if (geofence.type === 'circle') {
                    return (
                      <Circle
                        key={geofence._id}
                        center={geofence.coordinates.center}
                        radius={geofence.coordinates.radius}
                        pathOptions={{
                          color: geofence.isActive ? '#10b981' : '#9ca3af',
                          fillColor: geofence.isActive ? '#10b981' : '#9ca3af',
                          fillOpacity: 0.2
                        }}
                      >
                        <Popup>
                          <strong>{geofence.name}</strong>
                          <p>{geofence.description}</p>
                          <p>Status: {geofence.isActive ? 'Active' : 'Inactive'}</p>
                        </Popup>
                      </Circle>
                    );
                  }
                  return null;
                })}
              </FeatureGroup>
            </MapContainer>
          </div>
        </div>

        <div className="sidebar">
          <div className="geofence-list">
            <h3>Geofences ({geofences.length})</h3>
            {geofences.map((geofence) => (
              <div key={geofence._id} className={`geofence-item ${geofence.isActive ? 'active' : 'inactive'}`}>
                <div className="geofence-header">
                  <h4>{geofence.name}</h4>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={geofence.isActive}
                      onChange={() => toggleGeofence(geofence._id, geofence.isActive)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <p className="geofence-desc">{geofence.description}</p>
                <div className="geofence-meta">
                  <span><i className="fas fa-layer-group"></i> {geofence.type}</span>
                  <span><i className="fas fa-exclamation-triangle"></i> {geofence.violationCount || 0}</span>
                </div>
                <div className="geofence-actions">
                  <button className="btn-icon edit">
                    <i className="fas fa-edit"></i>
                  </button>
                  <button className="btn-icon delete" onClick={() => deleteGeofence(geofence._id)}>
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="violations-list">
            <h3>Recent Violations</h3>
            {violations.slice(0, 5).map((violation) => (
              <div key={violation._id} className="violation-item">
                <div className="violation-header">
                  <span className="severity-badge">{violation.severity}</span>
                  <span className="time">{new Date(violation.timestamp).toLocaleTimeString()}</span>
                </div>
                <p><strong>{violation.rider?.name}</strong></p>
                <p className="violation-zone">{violation.geofence?.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <GeofenceFormModal
          onClose={() => {
            setShowCreateModal(false);
            setSelectedGeofence(null);
          }}
          onSubmit={createGeofence}
          geofenceType={selectedGeofence?.type}
        />
      )}
    </div>
  );
};

const GeofenceFormModal = ({ onClose, onSubmit, geofenceType }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    severity: 'medium',
    alertThreshold: 5,
    isActive: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create Geofence - {geofenceType}</h3>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Zone Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Airport Restricted Zone"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the purpose of this geofence"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Severity Level</label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="form-group">
            <label>Alert Threshold (violations)</label>
            <input
              type="number"
              value={formData.alertThreshold}
              onChange={(e) => setFormData({ ...formData, alertThreshold: e.target.value })}
              min="1"
            />
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              Activate immediately
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <i className="fas fa-check"></i>
              Create Geofence
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GeofencingAdmin;
