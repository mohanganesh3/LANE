import L from 'leaflet';
import { ROUTE_STYLES } from '../../utils/mapUtils';

/**
 * RoutePolyline Component
 * Handles route visualization and manipulation on the map
 */

/**
 * Create a route polyline on the map
 * @param {Array} coordinates - Array of {lat, lng} objects
 * @param {Object} options - Polyline styling options
 * @param {L.Map} map - Leaflet map instance
 * @returns {L.Polyline} Leaflet polyline instance
 */
export const createRoutePolyline = (coordinates, options = {}, map) => {
  const {
    color = ROUTE_STYLES.ACTIVE.color,
    weight = ROUTE_STYLES.ACTIVE.weight,
    opacity = ROUTE_STYLES.ACTIVE.opacity,
    dashArray = null,
    interactive = true
  } = options;

  // Convert coordinates to Leaflet LatLng format
  const latLngs = coordinates.map(coord => [coord.lat, coord.lng]);

  const polyline = L.polyline(latLngs, {
    color,
    weight,
    opacity,
    dashArray,
    interactive,
    smoothFactor: 1.0,
    lineCap: 'round',
    lineJoin: 'round'
  });

  if (map) {
    polyline.addTo(map);
  }

  return polyline;
};

/**
 * Create an animated route polyline (for active rides)
 * @param {Array} coordinates - Route coordinates
 * @param {L.Map} map - Map instance
 * @returns {Object} { polyline, decorator }
 */
export const createAnimatedRoute = (coordinates, map) => {
  const polyline = createRoutePolyline(
    coordinates,
    {
      color: '#3b82f6',
      weight: 6,
      opacity: 0.8
    },
    map
  );

  // Create animated arrows using CSS
  const decorator = L.polylineDecorator(polyline, {
    patterns: [
      {
        offset: 0,
        repeat: 100,
        symbol: L.Symbol.arrowHead({
          pixelSize: 12,
          pathOptions: {
            fillOpacity: 0.8,
            weight: 0,
            color: '#3b82f6'
          }
        })
      },
      {
        offset: 0,
        repeat: 50,
        symbol: L.Symbol.dash({
          pixelSize: 10,
          pathOptions: {
            color: 'white',
            weight: 3,
            opacity: 0.6
          }
        })
      }
    ]
  });

  if (map) {
    decorator.addTo(map);
  }

  return { polyline, decorator };
};

/**
 * Create multiple route alternatives
 * @param {Array} routes - Array of route objects with coordinates and metadata
 * @param {L.Map} map - Map instance
 * @returns {Array} Array of polyline instances
 */
export const createAlternativeRoutes = (routes, map) => {
  return routes.map((route, index) => {
    const isActive = index === 0;
    const style = isActive ? ROUTE_STYLES.ACTIVE : ROUTE_STYLES.ALTERNATIVE;

    const polyline = createRoutePolyline(
      route.coordinates,
      {
        ...style,
        interactive: true
      },
      map
    );

    // Add route metadata
    polyline.routeData = {
      distance: route.distance,
      duration: route.duration,
      name: route.name || `Route ${index + 1}`,
      index
    };

    // Add click handler to select route
    polyline.on('click', function () {
      if (route.onSelect) {
        route.onSelect(route, index);
      }
    });

    // Add tooltip with route info
    const tooltipContent = `
      <div style="text-align: center;">
        <strong>${polyline.routeData.name}</strong><br>
        ${route.distance} km • ${route.duration} min
      </div>
    `;
    polyline.bindTooltip(tooltipContent, {
      sticky: true,
      opacity: 0.9
    });

    return polyline;
  });
};

/**
 * Highlight a specific polyline (make it active)
 * @param {L.Polyline} polyline - Polyline to highlight
 * @param {Array} allPolylines - All route polylines
 */
export const highlightRoute = (polyline, allPolylines = []) => {
  // Reset all polylines to alternative style
  allPolylines.forEach(p => {
    if (p !== polyline) {
      p.setStyle(ROUTE_STYLES.ALTERNATIVE);
    }
  });

  // Highlight selected polyline
  polyline.setStyle(ROUTE_STYLES.ACTIVE);
  polyline.bringToFront();
};

/**
 * Add distance markers along the route
 * @param {L.Polyline} polyline - Route polyline
 * @param {L.Map} map - Map instance
 * @param {number} intervalKm - Interval in kilometers
 * @returns {Array} Array of marker instances
 */
export const addDistanceMarkers = (polyline, map, intervalKm = 5) => {
  const markers = [];
  const latlngs = polyline.getLatLngs();
  let accumulatedDistance = 0;
  let nextMarkerDistance = intervalKm;

  for (let i = 1; i < latlngs.length; i++) {
    const segmentDistance = latlngs[i - 1].distanceTo(latlngs[i]) / 1000; // km
    accumulatedDistance += segmentDistance;

    if (accumulatedDistance >= nextMarkerDistance) {
      const marker = L.circleMarker(latlngs[i], {
        radius: 6,
        fillColor: '#fff',
        color: '#3b82f6',
        weight: 2,
        opacity: 1,
        fillOpacity: 1
      }).addTo(map);

      marker.bindTooltip(`${Math.round(nextMarkerDistance)} km`, {
        permanent: true,
        direction: 'center',
        className: 'distance-marker-label'
      });

      markers.push(marker);
      nextMarkerDistance += intervalKm;
    }
  }

  return markers;
};

/**
 * Calculate route bounds
 * @param {Array} coordinates - Route coordinates
 * @returns {L.LatLngBounds} Bounds object
 */
export const getRouteBounds = (coordinates) => {
  const latLngs = coordinates.map(coord => [coord.lat, coord.lng]);
  return L.latLngBounds(latLngs);
};

/**
 * Fit map to route with padding
 * @param {L.Polyline} polyline - Route polyline
 * @param {L.Map} map - Map instance
 * @param {Object} options - Fit options
 */
export const fitRouteInView = (polyline, map, options = {}) => {
  const {
    padding = [50, 50],
    maxZoom = 15,
    animate = true
  } = options;

  const bounds = polyline.getBounds();
  map.fitBounds(bounds, {
    padding,
    maxZoom,
    animate
  });
};

/**
 * Create a dashed planned route (for future rides)
 * @param {Array} coordinates - Route coordinates
 * @param {L.Map} map - Map instance
 * @returns {L.Polyline}
 */
export const createPlannedRoute = (coordinates, map) => {
  return createRoutePolyline(
    coordinates,
    ROUTE_STYLES.PLANNED,
    map
  );
};

/**
 * Animate drawing of route polyline
 * @param {Array} coordinates - Route coordinates
 * @param {L.Map} map - Map instance
 * @param {number} duration - Animation duration in ms
 * @returns {Promise<L.Polyline>}
 */
export const animateRouteDraw = (coordinates, map, duration = 2000) => {
  return new Promise((resolve) => {
    const steps = 50;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const polyline = L.polyline([], {
      color: '#3b82f6',
      weight: 5,
      opacity: 0.7
    }).addTo(map);

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const pointsToShow = Math.floor(coordinates.length * progress);
      const latLngs = coordinates.slice(0, pointsToShow).map(c => [c.lat, c.lng]);
      
      polyline.setLatLngs(latLngs);

      if (currentStep >= steps) {
        clearInterval(interval);
        resolve(polyline);
      }
    }, stepDuration);
  });
};

/**
 * Add waypoint markers along the route
 * @param {Array} waypoints - Array of waypoint objects {lat, lng, name}
 * @param {L.Map} map - Map instance
 * @returns {Array} Array of markers
 */
export const addWaypointMarkers = (waypoints, map) => {
  return waypoints.map((waypoint, index) => {
    const marker = L.marker([waypoint.lat, waypoint.lng], {
      icon: L.divIcon({
        html: `
          <div class="waypoint-marker">
            <span>${index + 1}</span>
          </div>
        `,
        className: 'waypoint-marker-container',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      })
    }).addTo(map);

    if (waypoint.name) {
      marker.bindTooltip(waypoint.name, {
        permanent: false,
        direction: 'top'
      });
    }

    return marker;
  });
};

export default {
  createRoutePolyline,
  createAnimatedRoute,
  createAlternativeRoutes,
  highlightRoute,
  addDistanceMarkers,
  getRouteBounds,
  fitRouteInView,
  createPlannedRoute,
  animateRouteDraw,
  addWaypointMarkers
};
