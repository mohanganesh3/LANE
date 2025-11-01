import React, { useState } from 'react';
import './EmergencyCallButton.css';

/**
 * EmergencyCallButton Component
 * Quick dial button for emergency services
 */
const EmergencyCallButton = ({ number, label, icon, color = '#ef4444', description }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCall = () => {
    window.location.href = `tel:${number}`;
  };

  return (
    <div className={`emergency-call-button ${isExpanded ? 'expanded' : ''}`}>
      <button
        className="call-button"
        style={{ background: color }}
        onClick={handleCall}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className="button-icon">{icon}</div>
        <div className="button-content">
          <span className="button-label">{label}</span>
          <span className="button-number">{number}</span>
        </div>
        <div className="button-action">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        </div>
      </button>
      {description && isExpanded && (
        <div className="button-description">
          <p>{description}</p>
        </div>
      )}
    </div>
  );
};

/**
 * EmergencyCallPanel Component
 * Panel with all emergency contact numbers
 */
export const EmergencyCallPanel = () => {
  const emergencyNumbers = [
    {
      number: '100',
      label: 'Police',
      icon: '👮',
      color: '#3b82f6',
      description: 'For crimes, accidents, and general emergencies',
    },
    {
      number: '108',
      label: 'Ambulance',
      icon: '🚑',
      color: '#ef4444',
      description: 'For medical emergencies and health issues',
    },
    {
      number: '101',
      label: 'Fire Brigade',
      icon: '🚒',
      color: '#f59e0b',
      description: 'For fire emergencies and rescue operations',
    },
    {
      number: '1091',
      label: 'Women Helpline',
      icon: '👩',
      color: '#ec4899',
      description: 'For women in distress and safety issues',
    },
    {
      number: '1098',
      label: 'Child Helpline',
      icon: '👶',
      color: '#8b5cf6',
      description: 'For child abuse and protection',
    },
    {
      number: '1800-11-4000',
      label: 'Road Accident',
      icon: '🚗',
      color: '#14b8a6',
      description: 'For road accidents and highway emergencies',
    },
  ];

  return (
    <div className="emergency-call-panel">
      <div className="panel-header">
        <h3>Emergency Helpline Numbers</h3>
        <p>Tap any number to call immediately</p>
      </div>
      
      <div className="call-buttons-grid">
        {emergencyNumbers.map((emergency) => (
          <EmergencyCallButton key={emergency.number} {...emergency} />
        ))}
      </div>

      <div className="panel-footer">
        <div className="footer-warning">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>For immediate danger, call emergency services directly from your phone.</p>
        </div>
      </div>
    </div>
  );
};

/**
 * FloatingEmergencyCallButton Component
 * Floating action button for quick access to emergency calling
 */
export const FloatingEmergencyCallButton = ({ onClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  const quickDialNumbers = [
    { number: '100', label: 'Police', icon: '👮', color: '#3b82f6' },
    { number: '108', label: 'Ambulance', icon: '🚑', color: '#ef4444' },
    { number: '101', label: 'Fire', icon: '🚒', color: '#f59e0b' },
  ];

  return (
    <div className={`floating-emergency-button ${isOpen ? 'open' : ''}`}>
      {isOpen && (
        <div className="quick-dial-menu">
          {quickDialNumbers.map((num) => (
            <button
              key={num.number}
              className="quick-dial-button"
              style={{ background: num.color }}
              onClick={() => window.location.href = `tel:${num.number}`}
              title={`Call ${num.label}: ${num.number}`}
            >
              <span className="quick-dial-icon">{num.icon}</span>
              <span className="quick-dial-label">{num.label}</span>
            </button>
          ))}
        </div>
      )}

      <button
        className="floating-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Emergency Call"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className={isOpen ? 'rotated' : ''}
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
      </button>
    </div>
  );
};

export default EmergencyCallButton;
