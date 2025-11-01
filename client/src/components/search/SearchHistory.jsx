import React, { useState, useEffect } from 'react';
import './SearchHistory.css';

/**
 * SearchHistory Component
 * Display and manage recent search queries
 */
const SearchHistory = ({ onSelectQuery, maxItems = 10 }) => {
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      const stored = localStorage.getItem('searchHistory');
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(parsed.slice(0, maxItems));
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  };

  const addToHistory = (query) => {
    if (!query || query.trim().length === 0) return;

    const trimmedQuery = query.trim();
    
    // Remove duplicates and add to beginning
    const updated = [
      trimmedQuery,
      ...history.filter((q) => q !== trimmedQuery),
    ].slice(0, maxItems);

    setHistory(updated);
    
    try {
      localStorage.setItem('searchHistory', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  };

  const removeFromHistory = (query) => {
    const updated = history.filter((q) => q !== query);
    setHistory(updated);
    
    try {
      localStorage.setItem('searchHistory', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to update search history:', error);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('searchHistory');
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  };

  const handleSelectQuery = (query) => {
    if (onSelectQuery) {
      onSelectQuery(query);
    }
    setShowHistory(false);
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="search-history-container">
      <button
        className="history-toggle"
        onClick={() => setShowHistory(!showHistory)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        Recent Searches
      </button>

      {showHistory && (
        <div className="history-dropdown">
          <div className="history-header">
            <h4>Recent Searches</h4>
            <button className="btn-clear-history" onClick={clearHistory}>
              Clear All
            </button>
          </div>

          <ul className="history-list">
            {history.map((query, index) => (
              <li key={index} className="history-item">
                <button
                  className="history-query"
                  onClick={() => handleSelectQuery(query)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                  <span>{query}</span>
                </button>
                <button
                  className="btn-remove"
                  onClick={() => removeFromHistory(query)}
                  title="Remove from history"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

/**
 * useSearchHistory Hook
 * Hook for managing search history
 */
export const useSearchHistory = (maxItems = 10) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      const stored = localStorage.getItem('searchHistory');
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(parsed.slice(0, maxItems));
      }
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  };

  const addToHistory = (query) => {
    if (!query || query.trim().length === 0) return;

    const trimmedQuery = query.trim();
    const updated = [
      trimmedQuery,
      ...history.filter((q) => q !== trimmedQuery),
    ].slice(0, maxItems);

    setHistory(updated);
    
    try {
      localStorage.setItem('searchHistory', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save search history:', error);
    }
  };

  const removeFromHistory = (query) => {
    const updated = history.filter((q) => q !== query);
    setHistory(updated);
    
    try {
      localStorage.setItem('searchHistory', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to update search history:', error);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('searchHistory');
    } catch (error) {
      console.error('Failed to clear search history:', error);
    }
  };

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
};

export default SearchHistory;
