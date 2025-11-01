/**
 * Search Result Caching
 * LRU cache for search results
 */

class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) {
      return null;
    }

    // Move to end (most recently used)
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    
    return value;
  }

  set(key, value) {
    // Delete if exists (to update position)
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Add to end
    this.cache.set(key, value);

    // Evict oldest if over max size
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  has(key) {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
  }

  get size() {
    return this.cache.size;
  }
}

/**
 * Search Cache Manager
 */
export class SearchCache {
  constructor(options = {}) {
    this.cache = new LRUCache(options.maxSize || 100);
    this.ttl = options.ttl || 5 * 60 * 1000; // 5 minutes default
    this.timestamps = new Map();
  }

  /**
   * Get cached search results
   */
  get(query, filters = {}) {
    const key = this.generateKey(query, filters);
    
    // Check if cached and not expired
    if (this.cache.has(key)) {
      const timestamp = this.timestamps.get(key);
      if (Date.now() - timestamp < this.ttl) {
        return this.cache.get(key);
      } else {
        // Expired - remove from cache
        this.cache.delete(key);
        this.timestamps.delete(key);
      }
    }

    return null;
  }

  /**
   * Set search results in cache
   */
  set(query, filters, results) {
    const key = this.generateKey(query, filters);
    this.cache.set(key, results);
    this.timestamps.set(key, Date.now());
  }

  /**
   * Clear all cached results
   */
  clear() {
    this.cache.clear();
    this.timestamps.clear();
  }

  /**
   * Clear expired entries
   */
  clearExpired() {
    const now = Date.now();
    const expiredKeys = [];

    this.timestamps.forEach((timestamp, key) => {
      if (now - timestamp >= this.ttl) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach((key) => {
      this.cache.delete(key);
      this.timestamps.delete(key);
    });

    return expiredKeys.length;
  }

  /**
   * Generate cache key from query and filters
   */
  generateKey(query, filters) {
    const normalizedQuery = query.toLowerCase().trim();
    const sortedFilters = Object.keys(filters)
      .sort()
      .map((key) => `${key}:${filters[key]}`)
      .join('|');
    
    return `${normalizedQuery}__${sortedFilters}`;
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.cache.maxSize,
      hitRate: this.calculateHitRate(),
    };
  }

  calculateHitRate() {
    // Simple implementation - can be enhanced with hit/miss tracking
    return this.cache.size > 0 ? 0.75 : 0; // Placeholder
  }
}

/**
 * Prefetch common search queries
 */
export class SearchPrefetcher {
  constructor(searchFunction) {
    this.searchFunction = searchFunction;
    this.commonQueries = [];
  }

  /**
   * Add common query to prefetch
   */
  addCommonQuery(query, filters = {}) {
    this.commonQueries.push({ query, filters });
  }

  /**
   * Prefetch all common queries
   */
  async prefetchAll() {
    const promises = this.commonQueries.map(({ query, filters }) =>
      this.searchFunction(query, filters)
    );

    try {
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('Prefetch failed:', error);
      return false;
    }
  }

  /**
   * Clear common queries
   */
  clear() {
    this.commonQueries = [];
  }
}

export default SearchCache;
