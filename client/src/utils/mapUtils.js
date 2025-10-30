/**
 * Map Integration Utility Functions
 * Handles map initialization, markers, routes, and location services
 */

// Map configuration constants
export const MAP_CONFIG = {
  DEFAULT_CENTER: [20.5937, 78.9629], // India center
  DEFAULT_ZOOM: 5,
  TRACKING_ZOOM: 15,
  TILE_LAYER: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
};

// Marker icon configurations
export const MARKER_ICONS = {
  PASSENGER: {
    color: '#3b82f6',
    iconUrl: '/icons/passenger-marker.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  },
  DRIVER: {
    color: '#10b981',
    iconUrl: '/icons/driver-marker.png',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38]
  },
  PICKUP: {
    color: '#f59e0b',
    iconUrl: '/icons/pickup-marker.png',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  },
  DROPOFF: {
    color: '#ef4444',
    iconUrl: '/icons/dropoff-marker.png',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  }
};

// Route styling configurations
export const ROUTE_STYLES = {
  ACTIVE: {
    color: '#3b82f6',
    weight: 5,
    opacity: 0.7
  },
  PLANNED: {
    color: '#6b7280',
    weight: 4,
    opacity: 0.5,
    dashArray: '10, 10'
  },
  ALTERNATIVE: {
    color: '#9ca3af',
    weight: 3,
    opacity: 0.4,
    dashArray: '5, 5'
  }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {Object} point1 - {lat, lng}
 * @param {Object} point2 - {lat, lng}
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (point1, point2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(point2.lat - point1.lat);
  const dLon = toRad(point2.lng - point1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal
};

/**
 * Convert degrees to radians
 */
const toRad = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Calculate bearing between two points
 * @param {Object} point1 - {lat, lng}
 * @param {Object} point2 - {lat, lng}
 * @returns {number} Bearing in degrees (0-360)
 */
export const calculateBearing = (point1, point2) => {
  const lat1 = toRad(point1.lat);
  const lat2 = toRad(point2.lat);
  const dLon = toRad(point2.lng - point1.lng);
  
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  
  let bearing = Math.atan2(y, x);
  bearing = bearing * (180 / Math.PI);
  bearing = (bearing + 360) % 360;
  
  return Math.round(bearing);
};

/**
 * Get current user location using Geolocation API
 * @returns {Promise<Object>} {lat, lng}
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};

/**
 * Watch user location for real-time tracking
 * @param {Function} callback - Called with new position
 * @returns {number} Watch ID to clear later
 */
export const watchLocation = (callback) => {
  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported');
  }
  
  return navigator.geolocation.watchPosition(
    (position) => {
      callback({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        heading: position.coords.heading,
        speed: position.coords.speed
      });
    },
    (error) => {
      console.error('Location watch error:', error);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    }
  );
};

/**
 * Clear location watch
 */
export const clearLocationWatch = (watchId) => {
  if (navigator.geolocation && watchId) {
    navigator.geolocation.clearWatch(watchId);
  }
};

/**
 * Calculate bounds for multiple markers
 * @param {Array} points - Array of {lat, lng} objects
 * @returns {Array} [[minLat, minLng], [maxLat, maxLng]]
 */
export const calculateBounds = (points) => {
  if (!points || points.length === 0) {
    return null;
  }
  
  const lats = points.map(p => p.lat);
  const lngs = points.map(p => p.lng);
  
  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)]
  ];
};

/**
 * Decode polyline string to coordinates array
 * @param {string} encoded - Encoded polyline string
 * @returns {Array} Array of [lat, lng] coordinates
 */
export const decodePolyline = (encoded) => {
  if (!encoded) return [];
  
  const points = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;
  
  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;
    
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;
    
    points.push([lat / 1e5, lng / 1e5]);
  }
  
  return points;
};

/**
 * Format distance for display
 * @param {number} distanceKm - Distance in kilometers
 * @returns {string} Formatted distance string
 */
export const formatDistance = (distanceKm) => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
};

/**
 * Check if point is within radius of center
 * @param {Object} point - {lat, lng}
 * @param {Object} center - {lat, lng}
 * @param {number} radiusKm - Radius in kilometers
 * @returns {boolean}
 */
export const isWithinRadius = (point, center, radiusKm) => {
  const distance = calculateDistance(point, center);
  return distance <= radiusKm;
};

/**
 * Get map zoom level based on distance
 * @param {number} distanceKm - Distance in kilometers
 * @returns {number} Appropriate zoom level
 */
export const getZoomForDistance = (distanceKm) => {
  if (distanceKm < 1) return 15;
  if (distanceKm < 5) return 13;
  if (distanceKm < 10) return 12;
  if (distanceKm < 20) return 11;
  if (distanceKm < 50) return 10;
  if (distanceKm < 100) return 9;
  if (distanceKm < 200) return 8;
  return 7;
};

export default {
  MAP_CONFIG,
  MARKER_ICONS,
  ROUTE_STYLES,
  calculateDistance,
  calculateBearing,
  getCurrentLocation,
  watchLocation,
  clearLocationWatch,
  calculateBounds,
  decodePolyline,
  formatDistance,
  isWithinRadius,
  getZoomForDistance
};
