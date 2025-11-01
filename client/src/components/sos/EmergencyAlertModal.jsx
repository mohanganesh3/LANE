import React from 'react';
import './EmergencyAlertModal.css';

/**
 * EmergencyAlertModal Component
 * Modal displayed when emergency is triggered
 */
const EmergencyAlertModal = ({ 
  isOpen, 
  emergencyType, 
  onConfirm, 
  onCancel,
  countdown = 10,
}) => {
  const [timeLeft, setTimeLeft] = React.useState(countdown);
  const [confirmed, setConfirmed] = React.useState(false);

  React.useEffect(() => {
    if (!isOpen) {
      setTimeLeft(countdown);
      setConfirmed(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!confirmed) {
            onConfirm();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, confirmed, countdown]);

  const handleConfirm = () => {
    setConfirmed(true);
    onConfirm();
  };

  const handleCancel = () => {
    setConfirmed(true);
    onCancel();
  };

  if (!isOpen) return null;

  const emergencyTypes = {
    accident: {
      title: 'Accident Emergency',
      description: 'Vehicle accident or collision detected',
      icon: '🚨',
      color: '#ef4444',
    },
    medical: {
      title: 'Medical Emergency',
      description: 'Health issue requiring immediate attention',
      icon: '🏥',
      color: '#dc2626',
    },
    harassment: {
      title: 'Harassment Alert',
      description: 'Safety concern or threat detected',
      icon: '⚠️',
      color: '#f59e0b',
    },
    breakdown: {
      title: 'Vehicle Breakdown',
      description: 'Vehicle stopped or malfunctioning',
      icon: '🔧',
      color: '#8b5cf6',
    },
    route_deviation: {
      title: 'Route Deviation Alert',
      description: 'Unexpected route detected',
      icon: '🗺️',
      color: '#f97316',
    },
    other: {
      title: 'Emergency Alert',
      description: 'Safety concern reported',
      icon: '🆘',
      color: '#ec4899',
    },
  };

  const emergency = emergencyTypes[emergencyType] || emergencyTypes.other;

  return (
    <div className="emergency-modal-overlay">
      <div className="emergency-modal" style={{ borderColor: emergency.color }}>
        <div className="modal-header" style={{ background: `${emergency.color}15` }}>
          <div className="emergency-icon-large pulsing" style={{ color: emergency.color }}>
            <span>{emergency.icon}</span>
          </div>
          <h2>{emergency.title}</h2>
          <p>{emergency.description}</p>
        </div>

        <div className="modal-body">
          <div className="countdown-circle">
            <svg className="countdown-svg" viewBox="0 0 100 100">
              <circle
                className="countdown-bg"
                cx="50"
                cy="50"
                r="45"
              />
              <circle
                className="countdown-progress"
                cx="50"
                cy="50"
                r="45"
                style={{
                  strokeDasharray: `${(timeLeft / countdown) * 283} 283`,
                  stroke: emergency.color,
                }}
              />
            </svg>
            <div className="countdown-number" style={{ color: emergency.color }}>
              {timeLeft}
            </div>
          </div>

          <div className="modal-message">
            <h3>Emergency Alert Will Be Sent In {timeLeft} Seconds</h3>
            <p>The following actions will be taken:</p>
            <ul>
              <li>📍 Your live location will be shared</li>
              <li>📞 Emergency contacts will be notified</li>
              <li>🚨 Support team will be alerted</li>
              <li>📱 Emergency services will be contacted if needed</li>
            </ul>
          </div>

          <div className="modal-warning">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <p>Only trigger emergency alerts for real emergencies. False alarms may affect response times.</p>
          </div>
        </div>

        <div className="modal-actions">
          <button
            className="btn-cancel-alert"
            onClick={handleCancel}
            disabled={timeLeft === 0}
          >
            Cancel Alert
          </button>
          <button
            className="btn-confirm-alert"
            onClick={handleConfirm}
            style={{ background: emergency.color }}
            disabled={timeLeft === 0}
          >
            Send Alert Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyAlertModal;
