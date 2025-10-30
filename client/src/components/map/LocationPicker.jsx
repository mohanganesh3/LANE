import React, { useState, useEffect, useRef } from 'react';
import MapContainer from '../../components/map/MapContainer';
import { getCurrentLocation, MAP_CONFIG } from '../../utils/mapUtils';
import { createLocationMarker } from '../../components/map/MapMarkers';
import './LocationPicker.css';

/**
 * LocationPicker Component
 * Interactive map for selecting pickup/dropoff locations
 */
const LocationPicker = ({ 
  initialLocation,
  onLocationSelect,
  placeholder = "Click on map to select location",
  type = 'pickup', // 'pickup' or 'dropoff'
  showSearchBar = true
}) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || null);
  const [mapCenter, setMapCenter] = useState(MAP_CONFIG.DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(12);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [address, setAddress] = useState('');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Initialize with current location
  useEffect(() => {
    if (!initialLocation) {
      getCurrentLocation()
        .then(location => {
          setMapCenter([location.lat, location.lng]);
          setMapZoom(15);
        })
        .catch(err => {
          console.error('Failed to get current location:', err);
        });
    } else {
      setSelectedLocation(initialLocation);
      setMapCenter([initialLocation.lat, initialLocation.lng]);
      setAddress(initialLocation.address || '');
    }
  }, [initialLocation]);

  // Handle map click to select location
  const handleMapClick = async (location) => {
    setSelectedLocation(location);
    
    // Reverse geocode to get address
    setIsLoadingAddress(true);
    try {
      const addressData = await reverseGeocode(location.lat, location.lng);
      setAddress(addressData);
      
      if (onLocationSelect) {
        onLocationSelect({
          ...location,
          address: addressData
        });
      }
    } catch (error) {
      console.error('Failed to get address:', error);
      setAddress(`${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  // Reverse geocoding using Nominatim (OpenStreetMap)
  const reverseGeocode = async (lat, lng) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
    );
    const data = await response.json();
    return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  // Forward geocoding (search)
  const searchLocation = async (query) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchLocation(query);
    }, 500);
  };

  // Handle search result selection
  const handleResultClick = (result) => {
    const location = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      address: result.display_name
    };

    setSelectedLocation(location);
    setMapCenter([location.lat, location.lng]);
    setMapZoom(15);
    setAddress(result.display_name);
    setSearchQuery('');
    setSearchResults([]);

    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };

  // Get current location button
  const handleGetCurrentLocation = () => {
    getCurrentLocation()
      .then(location => {
        const newLocation = { lat: location.lat, lng: location.lng };
        setSelectedLocation(newLocation);
        setMapCenter([location.lat, location.lng]);
        setMapZoom(16);
        
        // Get address for current location
        reverseGeocode(location.lat, location.lng)
          .then(addr => {
            setAddress(addr);
            if (onLocationSelect) {
              onLocationSelect({ ...newLocation, address: addr });
            }
          });
      })
      .catch(err => {
        alert('Failed to get your current location. Please enable location services.');
        console.error(err);
      });
  };

  // Prepare markers
  const markers = selectedLocation ? [{
    id: 'selected',
    position: selectedLocation,
    icon: type === 'pickup' 
      ? { iconUrl: '/icons/pickup-marker.png', iconSize: [32, 32], iconAnchor: [16, 32] }
      : { iconUrl: '/icons/dropoff-marker.png', iconSize: [32, 32], iconAnchor: [16, 32] },
    popup: address || 'Selected Location'
  }] : [];

  return (
    <div className="location-picker">
      {showSearchBar && (
        <div className="location-search-bar">
          <div className="search-input-wrapper">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder={placeholder}
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />
            {isSearching && <div className="search-spinner" />}
          </div>

          <button 
            onClick={handleGetCurrentLocation}
            className="current-location-btn"
            title="Use current location"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="3" fill="currentColor"/>
            </svg>
          </button>

          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="search-result-item"
                  onClick={() => handleResultClick(result)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>{result.display_name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="map-wrapper">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          markers={markers}
          onMapClick={handleMapClick}
          className="location-picker-map"
        />

        <div className="map-crosshair">
          <svg width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="2" fill="#3b82f6"/>
            <line x1="20" y1="0" x2="20" y2="15" stroke="#3b82f6" strokeWidth="2"/>
            <line x1="20" y1="25" x2="20" y2="40" stroke="#3b82f6" strokeWidth="2"/>
            <line x1="0" y1="20" x2="15" y2="20" stroke="#3b82f6" strokeWidth="2"/>
            <line x1="25" y1="20" x2="40" y2="20" stroke="#3b82f6" strokeWidth="2"/>
          </svg>
        </div>
      </div>

      {selectedLocation && (
        <div className="selected-location-info">
          <div className="location-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div className="location-details">
            <span className="location-type">{type === 'pickup' ? 'Pickup Location' : 'Drop-off Location'}</span>
            <p className="location-address">
              {isLoadingAddress ? (
                <span className="loading-text">Getting address...</span>
              ) : (
                address || `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
