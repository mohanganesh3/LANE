import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MAP_CONFIG } from '../../utils/mapUtils';
import './MapContainer.css';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/**
 * MapContainer Component
 * Wrapper component for Leaflet map integration
 */
const MapContainer = ({ 
  center = MAP_CONFIG.DEFAULT_CENTER,
  zoom = MAP_CONFIG.DEFAULT_ZOOM,
  markers = [],
  polylines = [],
  onMapClick,
  onMarkerClick,
  className = '',
  style = {},
  children
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const polylinesLayerRef = useRef(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Create map instance
    const map = L.map(mapRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: true,
      scrollWheelZoom: true,
      dragging: true,
      touchZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
      attributionControl: true
    });

    // Add tile layer
    L.tileLayer(MAP_CONFIG.TILE_LAYER, {
      attribution: MAP_CONFIG.ATTRIBUTION,
      maxZoom: 19,
      minZoom: 3
    }).addTo(map);

    // Create layer groups for markers and polylines
    markersLayerRef.current = L.layerGroup().addTo(map);
    polylinesLayerRef.current = L.layerGroup().addTo(map);

    // Add map click handler
    if (onMapClick) {
      map.on('click', (e) => {
        onMapClick({
          lat: e.latlng.lat,
          lng: e.latlng.lng
        });
      });
    }

    mapInstanceRef.current = map;
    setIsMapReady(true);

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map center and zoom
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady) return;

    mapInstanceRef.current.setView(center, zoom, {
      animate: true,
      duration: 0.5
    });
  }, [center, zoom, isMapReady]);

  // Update markers
  useEffect(() => {
    if (!markersLayerRef.current || !isMapReady) return;

    // Clear existing markers
    markersLayerRef.current.clearLayers();

    // Add new markers
    markers.forEach((marker) => {
      const { position, icon, popup, tooltip, onClick } = marker;

      // Create custom icon if provided
      let markerIcon = undefined;
      if (icon) {
        markerIcon = L.icon({
          iconUrl: icon.iconUrl || icon.url,
          iconSize: icon.iconSize || [25, 41],
          iconAnchor: icon.iconAnchor || [12, 41],
          popupAnchor: icon.popupAnchor || [1, -34],
          shadowUrl: icon.shadowUrl,
          shadowSize: icon.shadowSize || [41, 41]
        });
      }

      // Create marker
      const leafletMarker = L.marker(
        [position.lat, position.lng],
        markerIcon ? { icon: markerIcon } : {}
      );

      // Add popup if provided
      if (popup) {
        leafletMarker.bindPopup(popup);
      }

      // Add tooltip if provided
      if (tooltip) {
        leafletMarker.bindTooltip(tooltip, {
          permanent: false,
          direction: 'top'
        });
      }

      // Add click handler
      if (onClick || onMarkerClick) {
        leafletMarker.on('click', () => {
          if (onClick) onClick(marker);
          if (onMarkerClick) onMarkerClick(marker);
        });
      }

      // Add to layer group
      leafletMarker.addTo(markersLayerRef.current);
    });
  }, [markers, isMapReady, onMarkerClick]);

  // Update polylines
  useEffect(() => {
    if (!polylinesLayerRef.current || !isMapReady) return;

    // Clear existing polylines
    polylinesLayerRef.current.clearLayers();

    // Add new polylines
    polylines.forEach((polyline) => {
      const { positions, color, weight, opacity, dashArray } = polyline;

      const leafletPolyline = L.polyline(
        positions.map(pos => [pos.lat, pos.lng]),
        {
          color: color || '#3b82f6',
          weight: weight || 5,
          opacity: opacity || 0.7,
          dashArray: dashArray || null
        }
      );

      leafletPolyline.addTo(polylinesLayerRef.current);
    });
  }, [polylines, isMapReady]);

  // Expose map methods
  useEffect(() => {
    if (mapInstanceRef.current && isMapReady) {
      // Make map instance available to parent
      window.mapInstance = mapInstanceRef.current;
    }
  }, [isMapReady]);

  return (
    <div 
      ref={mapRef} 
      className={`map-container ${className}`}
      style={{ 
        width: '100%', 
        height: '100%',
        minHeight: '400px',
        ...style 
      }}
    >
      {children}
    </div>
  );
};

export default MapContainer;

// Export map utilities for external use
export const getMapInstance = () => window.mapInstance;

export const fitBounds = (bounds) => {
  const map = getMapInstance();
  if (map && bounds) {
    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 15
    });
  }
};

export const setMapCenter = (lat, lng, zoom = 13) => {
  const map = getMapInstance();
  if (map) {
    map.setView([lat, lng], zoom, {
      animate: true
    });
  }
};

export const invalidateMapSize = () => {
  const map = getMapInstance();
  if (map) {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }
};
