import React, { useState, useEffect, useRef } from 'react';
import './Autocomplete.css';

/**
 * Autocomplete Component
 * Smart autocomplete with suggestions and fuzzy matching
 */
const Autocomplete = ({
  value,
  onChange,
  onSelect,
  suggestions = [],
  placeholder = 'Search...',
  minChars = 2,
  maxSuggestions = 10,
  debounceMs = 300,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [inputValue, setInputValue] = useState(value || '');
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Filter suggestions based on input
    if (inputValue.length >= minChars) {
      // Debounce filtering
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        const filtered = filterSuggestions(inputValue, suggestions);
        setFilteredSuggestions(filtered.slice(0, maxSuggestions));
        setIsOpen(filtered.length > 0);
      }, debounceMs);
    } else {
      setFilteredSuggestions([]);
      setIsOpen(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [inputValue, suggestions, minChars, maxSuggestions, debounceMs]);

  const filterSuggestions = (query, items) => {
    const normalizedQuery = query.toLowerCase().trim();
    
    return items
      .map((item) => {
        const text = typeof item === 'string' ? item : item.text || '';
        const normalizedText = text.toLowerCase();
        
        // Calculate score for ranking
        let score = 0;
        if (normalizedText === normalizedQuery) {
          score = 100;
        } else if (normalizedText.startsWith(normalizedQuery)) {
          score = 80;
        } else if (normalizedText.includes(normalizedQuery)) {
          score = 50;
        } else {
          // Fuzzy match
          const similarity = calculateSimilarity(normalizedText, normalizedQuery);
          if (similarity > 0.6) {
            score = similarity * 30;
          }
        }

        return { item, score, text };
      })
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((result) => result.item);
  };

  const calculateSimilarity = (str1, str2) => {
    const matrix = [];
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    const distance = matrix[str2.length][str1.length];
    const maxLength = Math.max(str1.length, str2.length);
    return 1 - distance / maxLength;
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setActiveSuggestionIndex(-1);
    
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const text = typeof suggestion === 'string' ? suggestion : suggestion.text || '';
    setInputValue(text);
    setIsOpen(false);
    setActiveSuggestionIndex(-1);
    
    if (onSelect) {
      onSelect(suggestion);
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestionIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeSuggestionIndex >= 0) {
          handleSuggestionClick(filteredSuggestions[activeSuggestionIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setActiveSuggestionIndex(-1);
        break;
      default:
        break;
    }
  };

  const highlightMatch = (text, query) => {
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;

    const before = text.substring(0, index);
    const match = text.substring(index, index + query.length);
    const after = text.substring(index + query.length);

    return (
      <>
        {before}
        <mark>{match}</mark>
        {after}
      </>
    );
  };

  return (
    <div className="autocomplete-container">
      <input
        ref={inputRef}
        type="text"
        className="autocomplete-input"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => inputValue.length >= minChars && setIsOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
      />
      
      {isOpen && filteredSuggestions.length > 0 && (
        <div ref={dropdownRef} className="autocomplete-dropdown">
          <ul className="suggestions-list">
            {filteredSuggestions.map((suggestion, index) => {
              const text = typeof suggestion === 'string' ? suggestion : suggestion.text || '';
              const isActive = index === activeSuggestionIndex;

              return (
                <li
                  key={index}
                  className={`suggestion-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseEnter={() => setActiveSuggestionIndex(index)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                  <span>{highlightMatch(text, inputValue)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Autocomplete;
