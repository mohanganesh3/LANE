import React, { useState, useEffect } from 'react';
import './EmergencyDetailsPanel.css';

const EmergencyDetailsPanel = ({ emergency, onClose, onUpdate }) => {
  const [notes, setNotes] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    if (emergency) {
      setNotes(emergency.adminNotes || '');
    }
  }, [emergency]);

  if (!emergency) {
    return (
      <div className="emergency-details-panel empty">
        <div className="empty-state">
          <span className="empty-icon">📋</span>
          <p>Select an emergency to view details</p>
        </div>
      </div>
    );
  }

  const getTimeSince = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const handleSaveNotes = async () => {
    try {
      const response = await fetch(`/api/admin/emergencies/${emergency._id}/notes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });
      
      if (response.ok) {
        alert('Notes saved successfully');
        onUpdate && onUpdate();
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Failed to save notes');
    }
  };

  const handleCallEmergencyContact = (contact) => {
    window.location.href = `tel:${contact.phone}`;
  };

  return (
    <div className="emergency-details-panel">
      <div className="panel-header">
        <div className="header-title">
          <h2>Emergency Details</h2>
          <span className={`status-badge ${emergency.status}`}>
            {emergency.status}
          </span>
        </div>
        {onClose && (
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        )}
      </div>

      <div className="panel-content">
        {/* Emergency Type & Priority */}
        <section className="details-section">
          <h3>Emergency Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Type</label>
              <div className="info-value emergency-type">
                <span className="type-icon">
                  {emergency.type === 'ACCIDENT' ? '🚨' :
                   emergency.type === 'BREAKDOWN' ? '🔧' :
                   emergency.type === 'HARASSMENT' ? '⚠️' :
                   emergency.type === 'MEDICAL' ? '🏥' : '📍'}
                </span>
                <span>{emergency.type}</span>
              </div>
            </div>
            <div className="info-item">
              <label>Reported</label>
              <div className="info-value">{getTimeSince(emergency.createdAt)}</div>
            </div>
            <div className="info-item">
              <label>Emergency ID</label>
              <div className="info-value monospace">{emergency._id}</div>
            </div>
          </div>
        </section>

        {/* User Information */}
        <section className="details-section">
          <h3>User Information</h3>
          <div className="user-card">
            <div className="user-avatar-large">
              {emergency.user?.profilePhoto ? (
                <img src={emergency.user.profilePhoto} alt={emergency.user.name} />
              ) : (
                <span>{emergency.user?.name?.[0] || 'U'}</span>
              )}
            </div>
            <div className="user-info-details">
              <h4>{emergency.user?.name || 'Unknown User'}</h4>
              <p className="user-email">{emergency.user?.email || 'No email'}</p>
              <p className="user-phone">
                📞 <a href={`tel:${emergency.user?.phone}`}>{emergency.user?.phone || 'No phone'}</a>
              </p>
              {emergency.user?.role && (
                <span className={`role-badge ${emergency.user.role}`}>
                  {emergency.user.role}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Location Information */}
        {emergency.location && (
          <section className="details-section">
            <h3>Location</h3>
            <div className="location-details">
              <div className="location-coords">
                <span className="coord-label">Coordinates:</span>
                <span className="coord-value">
                  {emergency.location.coordinates[1].toFixed(6)}, {emergency.location.coordinates[0].toFixed(6)}
                </span>
              </div>
              {emergency.location.address && (
                <div className="location-address">
                  <span className="address-icon">📍</span>
                  <span>{emergency.location.address}</span>
                </div>
              )}
              <button className="view-map-btn">
                View on Map 🗺️
              </button>
            </div>
          </section>
        )}

        {/* Ride Information */}
        {emergency.ride && (
          <section className="details-section">
            <h3>Associated Ride</h3>
            <div className="ride-details">
              <div className="ride-info-item">
                <label>Ride ID:</label>
                <span className="monospace">{emergency.ride._id}</span>
              </div>
              {emergency.ride.from && (
                <div className="ride-info-item">
                  <label>From:</label>
                  <span>{emergency.ride.from}</span>
                </div>
              )}
              {emergency.ride.to && (
                <div className="ride-info-item">
                  <label>To:</label>
                  <span>{emergency.ride.to}</span>
                </div>
              )}
              {emergency.ride.driver && (
                <div className="ride-info-item">
                  <label>Driver:</label>
                  <span>{emergency.ride.driver.name}</span>
                  <a href={`tel:${emergency.ride.driver.phone}`} className="call-btn-small">
                    📞 Call
                  </a>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Emergency Contacts */}
        {emergency.user?.emergencyContacts && emergency.user.emergencyContacts.length > 0 && (
          <section className="details-section">
            <h3>Emergency Contacts</h3>
            <div className="emergency-contacts-list">
              {emergency.user.emergencyContacts.map((contact, index) => (
                <div key={index} className="contact-card">
                  <div className="contact-info">
                    <p className="contact-name">
                      {contact.name}
                      {contact.isPrimary && <span className="primary-badge">Primary</span>}
                    </p>
                    <p className="contact-relation">{contact.relationship}</p>
                    <p className="contact-phone">{contact.phone}</p>
                  </div>
                  <button 
                    className="call-contact-btn"
                    onClick={() => handleCallEmergencyContact(contact)}
                  >
                    📞 Call
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Description */}
        {emergency.description && (
          <section className="details-section">
            <h3>Description</h3>
            <div className="description-box">
              <p>{emergency.description}</p>
            </div>
          </section>
        )}

        {/* Admin Notes */}
        <section className="details-section">
          <h3>Admin Notes</h3>
          <textarea
            className="admin-notes-textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this emergency..."
            rows={4}
          />
          <button className="save-notes-btn" onClick={handleSaveNotes}>
            Save Notes
          </button>
        </section>

        {/* Timeline */}
        {emergency.timeline && emergency.timeline.length > 0 && (
          <section className="details-section">
            <h3>Timeline</h3>
            <div className="timeline">
              {emergency.timeline.map((event, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <p className="timeline-action">{event.action}</p>
                    <p className="timeline-time">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                    {event.by && (
                      <p className="timeline-by">by {event.by.name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Responders */}
        {emergency.responders && emergency.responders.length > 0 && (
          <section className="details-section">
            <h3>Responders</h3>
            <div className="responders-list">
              {emergency.responders.map((responder, index) => (
                <div key={index} className="responder-card">
                  <div className="responder-avatar">
                    {responder.profilePhoto ? (
                      <img src={responder.profilePhoto} alt={responder.name} />
                    ) : (
                      <span>{responder.name?.[0]}</span>
                    )}
                  </div>
                  <div className="responder-info">
                    <p className="responder-name">{responder.name}</p>
                    <p className="responder-role">{responder.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default EmergencyDetailsPanel;
