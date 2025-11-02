import React, { useState } from 'react';
import './ActiveEmergenciesList.css';

const ActiveEmergenciesList = ({ emergencies, onSelectEmergency, selectedId }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('time');

  const getTimeSince = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const getPriorityLevel = (emergency) => {
    const timeElapsed = Date.now() - new Date(emergency.createdAt).getTime();
    const minutes = Math.floor(timeElapsed / 60000);
    
    if (emergency.type === 'ACCIDENT' || emergency.type === 'HARASSMENT') {
      return { level: 'critical', score: 4 };
    } else if (minutes > 10) {
      return { level: 'high', score: 3 };
    } else if (minutes > 5) {
      return { level: 'medium', score: 2 };
    }
    return { level: 'low', score: 1 };
  };

  const filterEmergencies = () => {
    let filtered = [...emergencies];
    
    // Apply filter
    if (filter !== 'all') {
      filtered = filtered.filter(e => getPriorityLevel(e).level === filter);
    }
    
    // Apply sort
    if (sortBy === 'time') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'priority') {
      filtered.sort((a, b) => getPriorityLevel(b).score - getPriorityLevel(a).score);
    }
    
    return filtered;
  };

  const filteredEmergencies = filterEmergencies();

  const getEmergencyTypeIcon = (type) => {
    const icons = {
      ACCIDENT: '🚨',
      BREAKDOWN: '🔧',
      HARASSMENT: '⚠️',
      MEDICAL: '🏥',
      OTHER: '❗'
    };
    return icons[type] || '📍';
  };

  return (
    <div className="active-emergencies-list">
      <div className="list-header">
        <h3>Active Emergencies ({emergencies.length})</h3>
        
        <div className="list-controls">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="time">Sort by Time</option>
            <option value="priority">Sort by Priority</option>
          </select>
        </div>
      </div>

      <div className="emergencies-scroll">
        {filteredEmergencies.length === 0 ? (
          <div className="no-results">
            <p>No emergencies found</p>
          </div>
        ) : (
          filteredEmergencies.map(emergency => {
            const priority = getPriorityLevel(emergency);
            const isSelected = selectedId === emergency._id;
            
            return (
              <div
                key={emergency._id}
                className={`emergency-item ${priority.level} ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectEmergency(emergency)}
              >
                <div className="emergency-item-header">
                  <span className="emergency-icon">
                    {getEmergencyTypeIcon(emergency.type)}
                  </span>
                  <div className="emergency-type-info">
                    <span className="type-label">{emergency.type}</span>
                    <span className={`priority-indicator ${priority.level}`}>
                      {priority.level}
                    </span>
                  </div>
                  <span className="time-since">{getTimeSince(emergency.createdAt)}</span>
                </div>

                <div className="emergency-item-body">
                  <div className="user-info">
                    <div className="user-avatar">
                      {emergency.user?.profilePhoto ? (
                        <img src={emergency.user.profilePhoto} alt={emergency.user.name} />
                      ) : (
                        <span>{emergency.user?.name?.[0] || 'U'}</span>
                      )}
                    </div>
                    <div className="user-details">
                      <p className="user-name">{emergency.user?.name || 'Unknown User'}</p>
                      <p className="user-phone">{emergency.user?.phone || 'No phone'}</p>
                    </div>
                  </div>

                  {emergency.location && (
                    <div className="location-info">
                      <span className="location-icon">📍</span>
                      <span className="location-text">
                        {emergency.location.address || 
                         `${emergency.location.coordinates[1].toFixed(4)}, ${emergency.location.coordinates[0].toFixed(4)}`}
                      </span>
                    </div>
                  )}

                  {emergency.ride && (
                    <div className="ride-info">
                      <span className="ride-label">Ride ID:</span>
                      <span className="ride-id">{emergency.ride._id?.slice(-6)}</span>
                    </div>
                  )}
                </div>

                <div className="emergency-item-footer">
                  <span className={`status-indicator ${emergency.status}`}>
                    {emergency.status}
                  </span>
                  {emergency.responders && emergency.responders.length > 0 && (
                    <span className="responders-count">
                      👥 {emergency.responders.length} responding
                    </span>
                  )}
                </div>

                {isSelected && (
                  <div className="selected-indicator">
                    <span>→</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {filteredEmergencies.length > 0 && (
        <div className="list-footer">
          <p className="result-count">
            Showing {filteredEmergencies.length} of {emergencies.length} emergencies
          </p>
        </div>
      )}
    </div>
  );
};

export default ActiveEmergenciesList;
