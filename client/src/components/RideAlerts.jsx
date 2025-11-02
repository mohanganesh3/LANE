import React, { useState, useEffect } from 'react';
import './RideAlerts.css';

const RideAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAlert, setNewAlert] = useState({
    route: { from: '', to: '' },
    maxPrice: '',
    departureTime: '',
    notifyMethods: ['push', 'email']
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/ride-alerts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setAlerts(data.alerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const createAlert = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/ride-alerts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAlert)
      });
      
      setShowCreateModal(false);
      setNewAlert({
        route: { from: '', to: '' },
        maxPrice: '',
        departureTime: '',
        notifyMethods: ['push', 'email']
      });
      fetchAlerts();
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  };

  const toggleAlert = async (alertId, isActive) => {
    try {
      await fetch(`/api/ride-alerts/${alertId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !isActive })
      });
      fetchAlerts();
    } catch (error) {
      console.error('Error toggling alert:', error);
    }
  };

  const deleteAlert = async (alertId) => {
    try {
      await fetch(`/api/ride-alerts/${alertId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      fetchAlerts();
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  return (
    <div className="alerts-container">
      <div className="alerts-header">
        <div>
          <h2>
            <i className="fas fa-bell"></i>
            Ride Alerts
          </h2>
          <p>Get notified when matching rides become available</p>
        </div>
        <button className="btn-create" onClick={() => setShowCreateModal(true)}>
          <i className="fas fa-plus"></i>
          Create Alert
        </button>
      </div>

      {alerts.length === 0 ? (
        <div className="alerts-empty">
          <i className="fas fa-bell-slash"></i>
          <h3>No alerts set up</h3>
          <p>Create your first alert to get notified about matching rides</p>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <i className="fas fa-plus-circle"></i>
            Create First Alert
          </button>
        </div>
      ) : (
        <div className="alerts-list">
          {alerts.map((alert) => (
            <div key={alert._id} className={`alert-card ${alert.isActive ? 'active' : 'inactive'}`}>
              <div className="alert-status">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={alert.isActive}
                    onChange={() => toggleAlert(alert._id, alert.isActive)}
                  />
                  <span className="slider"></span>
                </label>
                <span>{alert.isActive ? 'Active' : 'Paused'}</span>
              </div>

              <div className="alert-route">
                <div className="route-point">
                  <i className="fas fa-map-marker-alt start"></i>
                  <span>{alert.route.from}</span>
                </div>
                <i className="fas fa-arrow-down"></i>
                <div className="route-point">
                  <i className="fas fa-map-marker-alt end"></i>
                  <span>{alert.route.to}</span>
                </div>
              </div>

              <div className="alert-criteria">
                {alert.maxPrice && (
                  <div className="criteria-item">
                    <i className="fas fa-rupee-sign"></i>
                    <span>Max ₹{alert.maxPrice}</span>
                  </div>
                )}
                {alert.departureTime && (
                  <div className="criteria-item">
                    <i className="fas fa-clock"></i>
                    <span>{new Date(alert.departureTime).toLocaleTimeString()}</span>
                  </div>
                )}
                <div className="criteria-item">
                  <i className="fas fa-envelope"></i>
                  <span>{alert.notifyMethods.join(', ')}</span>
                </div>
              </div>

              {alert.matchCount > 0 && (
                <div className="alert-matches">
                  <i className="fas fa-check-circle"></i>
                  {alert.matchCount} matching rides found
                </div>
              )}

              <div className="alert-actions">
                <button className="action-btn edit">
                  <i className="fas fa-edit"></i>
                </button>
                <button className="action-btn delete" onClick={() => deleteAlert(alert._id)}>
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Ride Alert</h3>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={createAlert}>
              <div className="form-group">
                <label>From Location</label>
                <input
                  type="text"
                  required
                  value={newAlert.route.from}
                  onChange={(e) => setNewAlert({...newAlert, route: {...newAlert.route, from: e.target.value}})}
                  placeholder="Enter pickup location"
                />
              </div>

              <div className="form-group">
                <label>To Location</label>
                <input
                  type="text"
                  required
                  value={newAlert.route.to}
                  onChange={(e) => setNewAlert({...newAlert, route: {...newAlert.route, to: e.target.value}})}
                  placeholder="Enter destination"
                />
              </div>

              <div className="form-group">
                <label>Maximum Price (optional)</label>
                <input
                  type="number"
                  value={newAlert.maxPrice}
                  onChange={(e) => setNewAlert({...newAlert, maxPrice: e.target.value})}
                  placeholder="₹ 500"
                />
              </div>

              <div className="form-group">
                <label>Preferred Departure Time (optional)</label>
                <input
                  type="datetime-local"
                  value={newAlert.departureTime}
                  onChange={(e) => setNewAlert({...newAlert, departureTime: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Notification Methods</label>
                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={newAlert.notifyMethods.includes('push')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewAlert({...newAlert, notifyMethods: [...newAlert.notifyMethods, 'push']});
                        } else {
                          setNewAlert({...newAlert, notifyMethods: newAlert.notifyMethods.filter(m => m !== 'push')});
                        }
                      }}
                    />
                    Push Notification
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={newAlert.notifyMethods.includes('email')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewAlert({...newAlert, notifyMethods: [...newAlert.notifyMethods, 'email']});
                        } else {
                          setNewAlert({...newAlert, notifyMethods: newAlert.notifyMethods.filter(m => m !== 'email')});
                        }
                      }}
                    />
                    Email
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <i className="fas fa-bell"></i>
                  Create Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RideAlerts;
