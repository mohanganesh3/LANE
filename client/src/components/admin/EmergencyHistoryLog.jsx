import React, { useState, useEffect } from 'react';
import './EmergencyHistoryLog.css';

const EmergencyHistoryLog = ({ emergency }) => {
  const [historyEvents, setHistoryEvents] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (emergency) {
      loadHistory();
    }
  }, [emergency]);

  const loadHistory = async () => {
    if (!emergency) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/emergencies/${emergency._id}/history`);
      const data = await response.json();
      setHistoryEvents(data.history || []);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType) => {
    const icons = {
      created: '🆕',
      status_change: '🔄',
      contacted: '📞',
      message_sent: '💬',
      help_dispatched: '🚨',
      escalated: '⚠️',
      resolved: '✅',
      note_added: '📝',
      responder_assigned: '👥',
      location_updated: '📍'
    };
    return icons[eventType] || '📋';
  };

  const getEventColor = (eventType) => {
    const colors = {
      created: '#3742fa',
      status_change: '#0abde3',
      contacted: '#26de81',
      message_sent: '#5f27cd',
      help_dispatched: '#ff4757',
      escalated: '#ffa502',
      resolved: '#26de81',
      note_added: '#95a5a6',
      responder_assigned: '#667eea',
      location_updated: '#ff6348'
    };
    return colors[eventType] || '#95a5a6';
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return d.toLocaleString();
  };

  const filterEvents = () => {
    if (filter === 'all') return historyEvents;
    return historyEvents.filter(event => event.type === filter);
  };

  const filteredEvents = filterEvents();

  if (!emergency) {
    return (
      <div className="emergency-history-log empty">
        <p>Select an emergency to view history</p>
      </div>
    );
  }

  return (
    <div className="emergency-history-log">
      <div className="history-header">
        <h3>Activity History</h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Events</option>
          <option value="status_change">Status Changes</option>
          <option value="contacted">Communications</option>
          <option value="help_dispatched">Dispatches</option>
          <option value="note_added">Notes</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading history...</p>
        </div>
      ) : (
        <div className="history-timeline">
          {filteredEvents.length === 0 ? (
            <div className="no-events">
              <span className="empty-icon">📋</span>
              <p>No history events found</p>
            </div>
          ) : (
            filteredEvents.map((event, index) => (
              <div
                key={index}
                className="history-event"
                style={{ '--event-color': getEventColor(event.type) }}
              >
                <div className="event-marker">
                  <span className="event-icon">{getEventIcon(event.type)}</span>
                </div>
                
                <div className="event-content">
                  <div className="event-header">
                    <h4 className="event-title">{event.action || event.description}</h4>
                    <span className="event-time">{formatTime(event.timestamp)}</span>
                  </div>
                  
                  {event.details && (
                    <p className="event-details">{event.details}</p>
                  )}
                  
                  {event.by && (
                    <div className="event-actor">
                      <div className="actor-avatar">
                        {event.by.profilePhoto ? (
                          <img src={event.by.profilePhoto} alt={event.by.name} />
                        ) : (
                          <span>{event.by.name?.[0] || 'A'}</span>
                        )}
                      </div>
                      <div className="actor-info">
                        <span className="actor-name">{event.by.name}</span>
                        <span className="actor-role">{event.by.role}</span>
                      </div>
                    </div>
                  )}

                  {event.metadata && (
                    <div className="event-metadata">
                      {Object.entries(event.metadata).map(([key, value]) => (
                        <div key={key} className="metadata-item">
                          <span className="metadata-key">{key}:</span>
                          <span className="metadata-value">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {filteredEvents.length > 0 && (
        <div className="history-footer">
          <p className="event-count">
            {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
            {filter !== 'all' && ` (filtered)`}
          </p>
          <button className="refresh-btn" onClick={loadHistory}>
            🔄 Refresh
          </button>
        </div>
      )}
    </div>
  );
};

export default EmergencyHistoryLog;
