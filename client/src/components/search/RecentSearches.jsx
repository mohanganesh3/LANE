import { useState, useEffect } from 'react';
import './RecentSearches.css';

const RecentSearches = ({ onSearchSelect }) => {
  const [recentSearches, setRecentSearches] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);

  // Load searches from localStorage on mount
  useEffect(() => {
    loadSearches();
  }, []);

  const loadSearches = () => {
    try {
      const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      const saved = JSON.parse(localStorage.getItem('savedSearches') || '[]');
      setRecentSearches(recent.slice(0, 5)); // Keep only last 5
      setSavedSearches(saved);
    } catch (error) {
      console.error('Error loading searches:', error);
      setRecentSearches([]);
      setSavedSearches([]);
    }
  };

  const saveRecentSearch = (searchData) => {
    try {
      const existing = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      
      // Remove duplicate if exists
      const filtered = existing.filter(s => 
        s.from !== searchData.from || s.to !== searchData.to
      );
      
      // Add new search to beginning
      const updated = [searchData, ...filtered].slice(0, 5);
      
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      setRecentSearches(updated);
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  const saveSearch = (search) => {
    try {
      const existing = JSON.parse(localStorage.getItem('savedSearches') || '[]');
      
      // Check if already saved
      const alreadySaved = existing.some(s => 
        s.from === search.from && s.to === search.to
      );
      
      if (alreadySaved) {
        alert('This search is already saved!');
        return;
      }
      
      const savedSearch = {
        ...search,
        id: Date.now(),
        savedAt: new Date().toISOString()
      };
      
      const updated = [...existing, savedSearch];
      localStorage.setItem('savedSearches', JSON.stringify(updated));
      setSavedSearches(updated);
    } catch (error) {
      console.error('Error saving search:', error);
    }
  };

  const removeSavedSearch = (id) => {
    try {
      const updated = savedSearches.filter(s => s.id !== id);
      localStorage.setItem('savedSearches', JSON.stringify(updated));
      setSavedSearches(updated);
    } catch (error) {
      console.error('Error removing saved search:', error);
    }
  };

  const clearRecentSearches = () => {
    if (window.confirm('Clear all recent searches?')) {
      localStorage.setItem('recentSearches', JSON.stringify([]));
      setRecentSearches([]);
    }
  };

  const handleSearchClick = (search) => {
    if (onSearchSelect) {
      onSearchSelect(search);
    }
    // Also save to recent if not already there
    saveRecentSearch(search);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="recent-searches">
      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <div className="searches-section">
          <div className="section-header">
            <h3>
              <span className="section-icon">⭐</span>
              Saved Searches
            </h3>
          </div>
          <div className="searches-list">
            {savedSearches.map((search) => (
              <div 
                key={search.id} 
                className="search-item saved"
                onClick={() => handleSearchClick(search)}
              >
                <div className="search-route">
                  <div className="route-from">
                    <span className="route-dot from"></span>
                    <span className="route-text">{search.from || 'Unknown'}</span>
                  </div>
                  <div className="route-arrow">→</div>
                  <div className="route-to">
                    <span className="route-dot to"></span>
                    <span className="route-text">{search.to || 'Unknown'}</span>
                  </div>
                </div>
                
                {search.date && (
                  <div className="search-meta">
                    <span className="meta-item">📅 {formatDate(search.date)}</span>
                  </div>
                )}
                
                <button 
                  className="remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSavedSearch(search.id);
                  }}
                  title="Remove saved search"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div className="searches-section">
          <div className="section-header">
            <h3>
              <span className="section-icon">🕐</span>
              Recent Searches
            </h3>
            <button className="clear-btn" onClick={clearRecentSearches}>
              Clear All
            </button>
          </div>
          <div className="searches-list">
            {recentSearches.map((search, index) => (
              <div 
                key={index} 
                className="search-item"
                onClick={() => handleSearchClick(search)}
              >
                <div className="search-route">
                  <div className="route-from">
                    <span className="route-dot from"></span>
                    <span className="route-text">{search.from || 'Unknown'}</span>
                  </div>
                  <div className="route-arrow">→</div>
                  <div className="route-to">
                    <span className="route-dot to"></span>
                    <span className="route-text">{search.to || 'Unknown'}</span>
                  </div>
                </div>
                
                {search.date && (
                  <div className="search-meta">
                    <span className="meta-item">📅 {formatDate(search.date)}</span>
                  </div>
                )}
                
                <button 
                  className="save-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    saveSearch(search);
                  }}
                  title="Save this search"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {recentSearches.length === 0 && savedSearches.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No Recent Searches</h3>
          <p>Your recent and saved searches will appear here</p>
        </div>
      )}
    </div>
  );
};

// Export helper function to save searches from outside
export const addRecentSearch = (searchData) => {
  try {
    const existing = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const filtered = existing.filter(s => 
      s.from !== searchData.from || s.to !== searchData.to
    );
    const updated = [searchData, ...filtered].slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving recent search:', error);
  }
};

export default RecentSearches;
