import React from 'react';
import './MapControls.css';

/**
 * MapControls Component
 * Provides control buttons for map interactions
 */
const MapControls = ({
  onZoomIn,
  onZoomOut,
  onCenterLocation,
  onFitBounds,
  onToggleMapType,
  onToggleTraffic,
  showTraffic = false,
  mapType = 'standard', // 'standard', 'satellite', 'terrain'
  isTracking = false,
  className = ''
}) => {
  return (
    <div className={`map-controls-container ${className}`}>
      {/* Zoom Controls */}
      <div className="control-group">
        <button 
          onClick={onZoomIn}
          className="control-btn"
          title="Zoom in"
          aria-label="Zoom in"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
            <line x1="11" y1="8" x2="11" y2="14"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </button>

        <button 
          onClick={onZoomOut}
          className="control-btn"
          title="Zoom out"
          aria-label="Zoom out"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </button>
      </div>

      {/* Location Controls */}
      <div className="control-group">
        {onCenterLocation && (
          <button 
            onClick={onCenterLocation}
            className={`control-btn ${isTracking ? 'active' : ''}`}
            title="Center on location"
            aria-label="Center on location"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="3" fill={isTracking ? "currentColor" : "none"}/>
              <line x1="12" y1="2" x2="12" y2="5"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
              <line x1="2" y1="12" x2="5" y2="12"/>
              <line x1="19" y1="12" x2="22" y2="12"/>
            </svg>
          </button>
        )}

        {onFitBounds && (
          <button 
            onClick={onFitBounds}
            className="control-btn"
            title="Fit all markers"
            aria-label="Fit all markers in view"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M9 9L3 3M9 3L3 9"/>
              <path d="M15 15l6 6M15 21l6-6"/>
            </svg>
          </button>
        )}
      </div>

      {/* Map Type Controls */}
      {onToggleMapType && (
        <div className="control-group">
          <button 
            onClick={onToggleMapType}
            className="control-btn map-type-btn"
            title={`Switch to ${mapType === 'standard' ? 'satellite' : 'standard'} view`}
            aria-label="Toggle map type"
          >
            {mapType === 'standard' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M3 9h18"/>
                <path d="M9 21V9"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Traffic Layer Control */}
      {onToggleTraffic && (
        <div className="control-group">
          <button 
            onClick={onToggleTraffic}
            className={`control-btn ${showTraffic ? 'active' : ''}`}
            title={showTraffic ? 'Hide traffic' : 'Show traffic'}
            aria-label="Toggle traffic layer"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="8" r="2" fill={showTraffic ? "#ef4444" : "none"}/>
              <circle cx="12" cy="12" r="2" fill={showTraffic ? "#f59e0b" : "none"}/>
              <circle cx="12" cy="16" r="2" fill={showTraffic ? "#10b981" : "none"}/>
            </svg>
          </button>
        </div>
      )}

      {/* Compass Control */}
      <div className="control-group">
        <button 
          className="control-btn compass-btn"
          title="North"
          aria-label="Reset compass to north"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <polygon points="12 2 15 12 12 10 9 12" fill="currentColor"/>
          </svg>
        </button>
      </div>

      {/* Fullscreen Control */}
      <div className="control-group">
        <button 
          className="control-btn"
          title="Toggle fullscreen"
          aria-label="Toggle fullscreen mode"
          onClick={() => {
            const mapElement = document.querySelector('.map-container');
            if (mapElement) {
              if (!document.fullscreenElement) {
                mapElement.requestFullscreen();
              } else {
                document.exitFullscreen();
              }
            }
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MapControls;

/**
 * MapLegend Component
 * Displays legend for map markers and routes
 */
export const MapLegend = ({ items = [], className = '' }) => {
  return (
    <div className={`map-legend ${className}`}>
      <h4 className="legend-title">Legend</h4>
      <div className="legend-items">
        {items.map((item, index) => (
          <div key={index} className="legend-item">
            <span 
              className="legend-icon" 
              style={{ backgroundColor: item.color }}
            >
              {item.icon}
            </span>
            <span className="legend-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * MapScale Component
 * Shows distance scale on the map
 */
export const MapScale = ({ distance = '1 km', className = '' }) => {
  return (
    <div className={`map-scale ${className}`}>
      <div className="scale-bar" />
      <span className="scale-label">{distance}</span>
    </div>
  );
};
