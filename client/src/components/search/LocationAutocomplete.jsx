import { useState, useEffect, useRef } from 'react';
import './LocationAutocomplete.css';

const BANGALORE_LOCATIONS = [
  { id: 1, name: 'MG Road', area: 'Central Bangalore', lat: 12.9716, lng: 77.5946 },
  { id: 2, name: 'Koramangala', area: 'South Bangalore', lat: 12.9352, lng: 77.6245 },
  { id: 3, name: 'Indiranagar', area: 'East Bangalore', lat: 12.9719, lng: 77.6412 },
  { id: 4, name: 'Whitefield', area: 'East Bangalore', lat: 12.9698, lng: 77.7500 },
  { id: 5, name: 'Electronic City', area: 'South Bangalore', lat: 12.8456, lng: 77.6603 },
  { id: 6, name: 'Marathahalli', area: 'East Bangalore', lat: 12.9591, lng: 77.6974 },
  { id: 7, name: 'HSR Layout', area: 'South Bangalore', lat: 12.9121, lng: 77.6446 },
  { id: 8, name: 'BTM Layout', area: 'South Bangalore', lat: 12.9165, lng: 77.6101 },
  { id: 9, name: 'Jayanagar', area: 'South Bangalore', lat: 12.9250, lng: 77.5838 },
  { id: 10, name: 'Malleshwaram', area: 'North Bangalore', lat: 13.0037, lng: 77.5711 },
  { id: 11, name: 'Yelahanka', area: 'North Bangalore', lat: 13.1007, lng: 77.5963 },
  { id: 12, name: 'Hebbal', area: 'North Bangalore', lat: 13.0358, lng: 77.5970 },
  { id: 13, name: 'Banashankari', area: 'South Bangalore', lat: 12.9250, lng: 77.5487 },
  { id: 14, name: 'Rajajinagar', area: 'West Bangalore', lat: 12.9916, lng: 77.5547 },
  { id: 15, name: 'JP Nagar', area: 'South Bangalore', lat: 12.9081, lng: 77.5858 },
  { id: 16, name: 'Bellandur', area: 'South East Bangalore', lat: 12.9256, lng: 77.6737 },
  { id: 17, name: 'Sarjapur Road', area: 'South East Bangalore', lat: 12.9010, lng: 77.6870 },
  { id: 18, name: 'KR Puram', area: 'East Bangalore', lat: 13.0092, lng: 77.6954 }
];

const LocationAutocomplete = ({ 
  value, 
  onChange, 
  placeholder = 'Enter location',
  type = 'pickup' 
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update input when value prop changes
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value || '');
    }
  }, [value]);

  // Filter locations based on input
  const filterLocations = (query) => {
    if (!query.trim()) {
      return BANGALORE_LOCATIONS.slice(0, 8);
    }
    
    const lowerQuery = query.toLowerCase();
    return BANGALORE_LOCATIONS.filter(location => 
      location.name.toLowerCase().includes(lowerQuery) ||
      location.area.toLowerCase().includes(lowerQuery)
    ).slice(0, 8);
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsLoading(true);
    
    // Simulate API delay for realistic UX
    setTimeout(() => {
      const filtered = filterLocations(newValue);
      setSuggestions(filtered);
      setShowSuggestions(true);
      setSelectedIndex(-1);
      setIsLoading(false);
    }, 100);
  };

  const handleSelectLocation = (location) => {
    const locationString = `${location.name}, ${location.area}`;
    setInputValue(locationString);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    
    if (onChange) {
      onChange({
        name: locationString,
        coordinates: { lat: location.lat, lng: location.lng },
        ...location
      });
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'ArrowDown') {
        const filtered = filterLocations(inputValue);
        setSuggestions(filtered);
        setShowSuggestions(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelectLocation(suggestions[selectedIndex]);
        }
        break;
      
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      
      default:
        break;
    }
  };

  const handleFocus = () => {
    const filtered = filterLocations(inputValue);
    setSuggestions(filtered);
    setShowSuggestions(true);
  };

  return (
    <div className="location-autocomplete" ref={wrapperRef}>
      <div className={`autocomplete-input-wrapper ${type}`}>
        <input
          ref={inputRef}
          type="text"
          className="autocomplete-input"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          autoComplete="off"
        />
        {isLoading && <div className="autocomplete-loader"></div>}
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="autocomplete-suggestions">
          {suggestions.map((location, index) => (
            <div
              key={location.id}
              className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSelectLocation(location)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="suggestion-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" 
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div className="suggestion-content">
                <div className="suggestion-name">{location.name}</div>
                <div className="suggestion-area">{location.area}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {showSuggestions && inputValue && suggestions.length === 0 && !isLoading && (
        <div className="autocomplete-suggestions">
          <div className="suggestion-item no-results">
            <div className="suggestion-content">
              <div className="suggestion-name">No locations found</div>
              <div className="suggestion-area">Try searching for a different area</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;
