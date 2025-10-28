/**
 * Analytics utility for tracking search and user behavior
 */

class SearchAnalytics {
  constructor() {
    this.events = [];
    this.sessionId = this.generateSessionId();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track search query event
   * @param {Object} data - Search data
   */
  trackSearch(data) {
    const event = {
      type: 'search',
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      data: {
        query: data.query || '',
        pickup: data.pickup,
        dropoff: data.dropoff,
        date: data.date,
        seats: data.seats,
        filters: data.filters,
        resultsCount: data.resultsCount
      }
    };

    this.events.push(event);
    this.sendToServer(event);
    this.saveToLocalStorage('search', event);
    
    return event;
  }

  /**
   * Track filter application
   * @param {Object} filterData - Applied filters
   */
  trackFilter(filterData) {
    const event = {
      type: 'filter',
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      data: filterData
    };

    this.events.push(event);
    this.sendToServer(event);
    
    return event;
  }

  /**
   * Track ride selection/click
   * @param {Object} rideData - Selected ride data
   */
  trackRideClick(rideData) {
    const event = {
      type: 'ride_click',
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      data: {
        rideId: rideData.id,
        driverName: rideData.driver?.name,
        price: rideData.pricing?.total,
        position: rideData.position // Position in search results
      }
    };

    this.events.push(event);
    this.sendToServer(event);
    
    return event;
  }

  /**
   * Track search performance metrics
   * @param {Object} performanceData - Performance metrics
   */
  trackPerformance(performanceData) {
    const event = {
      type: 'performance',
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      data: {
        loadTime: performanceData.loadTime,
        searchDuration: performanceData.searchDuration,
        resultsRendered: performanceData.resultsRendered,
        debounceDelay: performanceData.debounceDelay
      }
    };

    this.events.push(event);
    this.saveToLocalStorage('performance', event);
    
    return event;
  }

  /**
   * Track user engagement
   * @param {string} action - Action type
   * @param {Object} data - Action data
   */
  trackEngagement(action, data = {}) {
    const event = {
      type: 'engagement',
      action,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      data
    };

    this.events.push(event);
    this.sendToServer(event);
    
    return event;
  }

  /**
   * Track error events
   * @param {Object} errorData - Error information
   */
  trackError(errorData) {
    const event = {
      type: 'error',
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      data: {
        errorType: errorData.type,
        message: errorData.message,
        context: errorData.context,
        retryAttempt: errorData.retryAttempt
      }
    };

    this.events.push(event);
    this.sendToServer(event);
    
    return event;
  }

  /**
   * Send event to analytics server
   * @param {Object} event - Event data
   */
  async sendToServer(event) {
    try {
      // In production, send to actual analytics endpoint
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
      // Silent fail - don't disrupt user experience
    }
  }

  /**
   * Save event to localStorage for offline tracking
   * @param {string} category - Event category
   * @param {Object} event - Event data
   */
  saveToLocalStorage(category, event) {
    try {
      const key = `analytics_${category}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.push(event);
      
      // Keep only last 100 events per category
      if (existing.length > 100) {
        existing.shift();
      }
      
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (error) {
      console.warn('Failed to save analytics to localStorage:', error);
    }
  }

  /**
   * Get analytics summary
   * @returns {Object} Analytics summary
   */
  getSummary() {
    const summary = {
      totalEvents: this.events.length,
      searches: this.events.filter(e => e.type === 'search').length,
      filters: this.events.filter(e => e.type === 'filter').length,
      clicks: this.events.filter(e => e.type === 'ride_click').length,
      errors: this.events.filter(e => e.type === 'error').length,
      sessionDuration: this.calculateSessionDuration()
    };

    return summary;
  }

  /**
   * Calculate session duration
   * @returns {number} Duration in milliseconds
   */
  calculateSessionDuration() {
    if (this.events.length === 0) return 0;
    
    const first = new Date(this.events[0].timestamp);
    const last = new Date(this.events[this.events.length - 1].timestamp);
    
    return last - first;
  }

  /**
   * Clear analytics data
   */
  clear() {
    this.events = [];
    this.sessionId = this.generateSessionId();
  }
}

// Create singleton instance
const searchAnalytics = new SearchAnalytics();

export default searchAnalytics;
