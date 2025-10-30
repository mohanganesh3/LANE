import L from 'leaflet';

/**
 * Create a custom rotating driver marker icon
 * @param {number} heading - Direction in degrees (0-360)
 * @param {string} color - Marker color
 * @returns {L.DivIcon} Leaflet divIcon with rotation
 */
export const createDriverMarker = (heading = 0, color = '#10b981') => {
  const svgIcon = `
    <svg width="38" height="38" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
        </filter>
      </defs>
      <!-- Outer circle -->
      <circle cx="19" cy="19" r="18" fill="white" filter="url(#shadow)"/>
      <!-- Inner colored circle -->
      <circle cx="19" cy="19" r="15" fill="${color}"/>
      <!-- Direction arrow -->
      <path 
        d="M 19 8 L 24 19 L 19 16 L 14 19 Z" 
        fill="white"
        stroke="white"
        stroke-width="1"
        transform="rotate(${heading} 19 19)"
      />
      <!-- Center dot -->
      <circle cx="19" cy="19" r="3" fill="white" opacity="0.9"/>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'driver-marker-icon',
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -19]
  });
};

/**
 * Create a pulsing passenger marker
 * @param {string} color - Marker color
 * @returns {L.DivIcon}
 */
export const createPassengerMarker = (color = '#3b82f6') => {
  const svgIcon = `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow-passenger" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
        </filter>
      </defs>
      <!-- Pulse ring -->
      <circle cx="16" cy="16" r="14" fill="${color}" opacity="0.2">
        <animate attributeName="r" from="12" to="16" dur="1.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" repeatCount="indefinite"/>
      </circle>
      <!-- Outer circle -->
      <circle cx="16" cy="16" r="14" fill="white" filter="url(#shadow-passenger)"/>
      <!-- Inner circle -->
      <circle cx="16" cy="16" r="11" fill="${color}"/>
      <!-- Person icon -->
      <circle cx="16" cy="13" r="3" fill="white"/>
      <path d="M 11 22 Q 11 18 16 18 Q 21 18 21 22" fill="white"/>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'passenger-marker-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

/**
 * Create pickup location marker
 * @param {string} label - Optional label text
 * @returns {L.DivIcon}
 */
export const createPickupMarker = (label = 'A') => {
  const svgIcon = `
    <svg width="28" height="38" viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow-pickup" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.4"/>
        </filter>
      </defs>
      <!-- Pin shape -->
      <path 
        d="M 14 0 C 6.268 0 0 6.268 0 14 C 0 24.5 14 38 14 38 C 14 38 28 24.5 28 14 C 28 6.268 21.732 0 14 0 Z"
        fill="#f59e0b"
        filter="url(#shadow-pickup)"
      />
      <!-- Inner circle -->
      <circle cx="14" cy="14" r="9" fill="white"/>
      <!-- Label -->
      <text 
        x="14" 
        y="19" 
        text-anchor="middle" 
        font-family="Arial, sans-serif" 
        font-size="12" 
        font-weight="bold" 
        fill="#f59e0b"
      >${label}</text>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'pickup-marker-icon',
    iconSize: [28, 38],
    iconAnchor: [14, 38],
    popupAnchor: [0, -38]
  });
};

/**
 * Create dropoff location marker
 * @param {string} label - Optional label text
 * @returns {L.DivIcon}
 */
export const createDropoffMarker = (label = 'B') => {
  const svgIcon = `
    <svg width="28" height="38" viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow-dropoff" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.4"/>
        </filter>
      </defs>
      <!-- Pin shape -->
      <path 
        d="M 14 0 C 6.268 0 0 6.268 0 14 C 0 24.5 14 38 14 38 C 14 38 28 24.5 28 14 C 28 6.268 21.732 0 14 0 Z"
        fill="#ef4444"
        filter="url(#shadow-dropoff)"
      />
      <!-- Inner circle -->
      <circle cx="14" cy="14" r="9" fill="white"/>
      <!-- Label -->
      <text 
        x="14" 
        y="19" 
        text-anchor="middle" 
        font-family="Arial, sans-serif" 
        font-size="12" 
        font-weight="bold" 
        fill="#ef4444"
      >${label}</text>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'dropoff-marker-icon',
    iconSize: [28, 38],
    iconAnchor: [14, 38],
    popupAnchor: [0, -38]
  });
};

/**
 * Create a generic location marker
 * @param {string} color - Marker color
 * @param {string} icon - Icon character or emoji
 * @returns {L.DivIcon}
 */
export const createLocationMarker = (color = '#6b7280', icon = '📍') => {
  const svgIcon = `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow-location" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
        </filter>
      </defs>
      <circle cx="16" cy="16" r="14" fill="white" filter="url(#shadow-location)"/>
      <circle cx="16" cy="16" r="11" fill="${color}"/>
      <text 
        x="16" 
        y="20" 
        text-anchor="middle" 
        font-size="14"
      >${icon}</text>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'location-marker-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

/**
 * Update driver marker rotation smoothly
 * @param {L.Marker} marker - Leaflet marker instance
 * @param {number} newHeading - New heading in degrees
 */
export const updateDriverMarkerRotation = (marker, newHeading) => {
  if (!marker) return;

  const icon = createDriverMarker(newHeading);
  marker.setIcon(icon);
};

/**
 * Animate marker movement
 * @param {L.Marker} marker - Leaflet marker
 * @param {Object} newPosition - {lat, lng}
 * @param {number} duration - Animation duration in ms
 */
export const animateMarkerTo = (marker, newPosition, duration = 1000) => {
  if (!marker) return;

  const start = marker.getLatLng();
  const end = L.latLng(newPosition.lat, newPosition.lng);
  const startTime = Date.now();

  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease-in-out function
    const eased = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    const lat = start.lat + (end.lat - start.lat) * eased;
    const lng = start.lng + (end.lng - start.lng) * eased;

    marker.setLatLng([lat, lng]);

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
};

export default {
  createDriverMarker,
  createPassengerMarker,
  createPickupMarker,
  createDropoffMarker,
  createLocationMarker,
  updateDriverMarkerRotation,
  animateMarkerTo
};
