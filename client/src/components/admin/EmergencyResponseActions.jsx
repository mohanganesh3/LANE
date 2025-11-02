import React, { useState } from 'react';
import './EmergencyResponseActions.css';

const EmergencyResponseActions = ({ emergency, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolution, setResolution] = useState('');

  const handleUpdateStatus = async (newStatus) => {
    if (!emergency) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/emergencies/${emergency._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        alert(`Status updated to ${newStatus}`);
        onUpdate && onUpdate();
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status');
    } finally {
      setLoading(false);
    }
  };

  const handleContactUser = () => {
    if (!emergency || !emergency.user) return;
    window.location.href = `tel:${emergency.user.phone}`;
  };

  const handleContactDriver = () => {
    if (!emergency || !emergency.ride || !emergency.ride.driver) return;
    window.location.href = `tel:${emergency.ride.driver.phone}`;
  };

  const handleSendMessage = async () => {
    const message = prompt('Enter message to send to user:');
    if (!message) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/emergencies/${emergency._id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      if (response.ok) {
        alert('Message sent successfully');
      } else {
        alert('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message');
    } finally {
      setLoading(false);
    }
  };

  const handleDispatchHelp = async () => {
    if (!confirm('Dispatch emergency services to this location?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/emergencies/${emergency._id}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        alert('Emergency services dispatched');
        onUpdate && onUpdate();
      } else {
        alert('Failed to dispatch help');
      }
    } catch (error) {
      console.error('Error dispatching help:', error);
      alert('Error dispatching help');
    } finally {
      setLoading(false);
    }
  };

  const handleEscalate = async () => {
    if (!confirm('Escalate this emergency to higher authorities?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/emergencies/${emergency._id}/escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        alert('Emergency escalated');
        onUpdate && onUpdate();
      } else {
        alert('Failed to escalate');
      }
    } catch (error) {
      console.error('Error escalating:', error);
      alert('Error escalating');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!resolution.trim()) {
      alert('Please enter resolution details');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/emergencies/${emergency._id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution, status: 'resolved' })
      });

      if (response.ok) {
        alert('Emergency resolved successfully');
        setShowResolveModal(false);
        setResolution('');
        onUpdate && onUpdate();
      } else {
        alert('Failed to resolve emergency');
      }
    } catch (error) {
      console.error('Error resolving:', error);
      alert('Error resolving emergency');
    } finally {
      setLoading(false);
    }
  };

  const handleCallEmergencyService = (service) => {
    const numbers = {
      police: '100',
      ambulance: '108',
      fire: '101',
      women: '1091'
    };
    
    window.location.href = `tel:${numbers[service]}`;
  };

  if (!emergency) {
    return (
      <div className="emergency-response-actions empty">
        <p>Select an emergency to see available actions</p>
      </div>
    );
  }

  const isResolved = emergency.status === 'resolved';

  return (
    <div className="emergency-response-actions">
      <div className="actions-header">
        <h3>Quick Actions</h3>
        <span className={`emergency-status ${emergency.status}`}>
          {emergency.status.toUpperCase()}
        </span>
      </div>

      <div className="actions-grid">
        {/* Status Update Actions */}
        <div className="action-section">
          <h4>Status Updates</h4>
          <div className="action-buttons">
            {emergency.status === 'active' && (
              <button
                className="action-btn responding"
                onClick={() => handleUpdateStatus('responding')}
                disabled={loading}
              >
                <span className="btn-icon">👥</span>
                Mark as Responding
              </button>
            )}
            {emergency.status !== 'resolved' && (
              <button
                className="action-btn resolve"
                onClick={() => setShowResolveModal(true)}
                disabled={loading}
              >
                <span className="btn-icon">✅</span>
                Resolve Emergency
              </button>
            )}
          </div>
        </div>

        {/* Communication Actions */}
        <div className="action-section">
          <h4>Communication</h4>
          <div className="action-buttons">
            <button
              className="action-btn contact"
              onClick={handleContactUser}
              disabled={loading || !emergency.user?.phone}
            >
              <span className="btn-icon">📞</span>
              Call User
            </button>
            {emergency.ride && emergency.ride.driver && (
              <button
                className="action-btn contact"
                onClick={handleContactDriver}
                disabled={loading}
              >
                <span className="btn-icon">🚗</span>
                Call Driver
              </button>
            )}
            <button
              className="action-btn message"
              onClick={handleSendMessage}
              disabled={loading}
            >
              <span className="btn-icon">💬</span>
              Send Message
            </button>
          </div>
        </div>

        {/* Emergency Services */}
        <div className="action-section">
          <h4>Emergency Services</h4>
          <div className="action-buttons grid-2">
            <button
              className="action-btn emergency-service police"
              onClick={() => handleCallEmergencyService('police')}
            >
              <span className="btn-icon">🚔</span>
              Police (100)
            </button>
            <button
              className="action-btn emergency-service ambulance"
              onClick={() => handleCallEmergencyService('ambulance')}
            >
              <span className="btn-icon">🚑</span>
              Ambulance (108)
            </button>
            <button
              className="action-btn emergency-service fire"
              onClick={() => handleCallEmergencyService('fire')}
            >
              <span className="btn-icon">🚒</span>
              Fire (101)
            </button>
            <button
              className="action-btn emergency-service women"
              onClick={() => handleCallEmergencyService('women')}
            >
              <span className="btn-icon">👮‍♀️</span>
              Women Helpline
            </button>
          </div>
        </div>

        {/* Critical Actions */}
        {!isResolved && (
          <div className="action-section">
            <h4>Critical Actions</h4>
            <div className="action-buttons">
              <button
                className="action-btn dispatch"
                onClick={handleDispatchHelp}
                disabled={loading}
              >
                <span className="btn-icon">🚨</span>
                Dispatch Help
              </button>
              <button
                className="action-btn escalate"
                onClick={handleEscalate}
                disabled={loading}
              >
                <span className="btn-icon">⚠️</span>
                Escalate Emergency
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Emergency Contact Cards */}
      {emergency.user?.emergencyContacts && emergency.user.emergencyContacts.length > 0 && (
        <div className="emergency-contacts-section">
          <h4>Emergency Contacts</h4>
          <div className="contacts-quick-access">
            {emergency.user.emergencyContacts.slice(0, 2).map((contact, index) => (
              <div key={index} className="quick-contact-card">
                <div className="contact-details">
                  <span className="contact-name">{contact.name}</span>
                  <span className="contact-relation">{contact.relationship}</span>
                </div>
                <a href={`tel:${contact.phone}`} className="quick-call-btn">
                  📞
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="modal-overlay" onClick={() => setShowResolveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Resolve Emergency</h3>
              <button className="modal-close" onClick={() => setShowResolveModal(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <label>Resolution Details:</label>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Describe how the emergency was resolved..."
                rows={5}
              />
            </div>
            <div className="modal-footer">
              <button
                className="modal-btn cancel"
                onClick={() => setShowResolveModal(false)}
              >
                Cancel
              </button>
              <button
                className="modal-btn confirm"
                onClick={handleResolve}
                disabled={loading || !resolution.trim()}
              >
                {loading ? 'Resolving...' : 'Resolve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
};

export default EmergencyResponseActions;
