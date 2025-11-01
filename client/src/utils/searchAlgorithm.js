/**
 * Search Algorithm Optimization
 * Improved search with scoring, ranking, and relevance
 */

export class SearchAlgorithm {
  constructor(options = {}) {
    this.options = {
      caseSensitive: false,
      fuzzyThreshold: 0.6,
      maxResults: 50,
      enableHighlighting: true,
      searchFields: ['name', 'description', 'tags'],
      ...options,
    };
  }

  /**
   * Advanced search with scoring and ranking
   * @param {Array} items - Items to search
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Array} Ranked search results
   */
  search(items, query, options = {}) {
    if (!query || query.trim().length === 0) {
      return items;
    }

    const searchOptions = { ...this.options, ...options };
    const normalizedQuery = this.normalizeString(query, searchOptions.caseSensitive);
    const queryTokens = this.tokenize(normalizedQuery);

    // Score each item
    const scoredItems = items.map((item) => {
      const score = this.calculateScore(item, queryTokens, searchOptions);
      return {
        item,
        score,
        highlights: searchOptions.enableHighlighting
          ? this.generateHighlights(item, queryTokens, searchOptions)
          : null,
      };
    });

    // Filter out items with score 0
    const filteredItems = scoredItems.filter((result) => result.score > 0);

    // Sort by score (descending)
    const sortedResults = filteredItems.sort((a, b) => b.score - a.score);

    // Limit results
    const limitedResults = sortedResults.slice(0, searchOptions.maxResults);

    return limitedResults;
  }

  /**
   * Calculate relevance score for an item
   */
  calculateScore(item, queryTokens, options) {
    let totalScore = 0;

    options.searchFields.forEach((field) => {
      const fieldValue = this.getNestedValue(item, field);
      if (!fieldValue) return;

      const normalizedValue = this.normalizeString(
        String(fieldValue),
        options.caseSensitive
      );

      queryTokens.forEach((token, tokenIndex) => {
        // Exact match - highest score
        if (normalizedValue === token) {
          totalScore += 100;
        }
        // Starts with - high score
        else if (normalizedValue.startsWith(token)) {
          totalScore += 80;
        }
        // Contains - medium score
        else if (normalizedValue.includes(token)) {
          totalScore += 50;
        }
        // Fuzzy match - lower score
        else {
          const similarity = this.calculateSimilarity(normalizedValue, token);
          if (similarity >= options.fuzzyThreshold) {
            totalScore += similarity * 30;
          }
        }

        // Boost score for earlier tokens
        const positionBoost = 1 + (queryTokens.length - tokenIndex) * 0.1;
        totalScore *= positionBoost;
      });
    });

    return totalScore;
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  calculateSimilarity(str1, str2) {
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
  }

  /**
   * Generate highlights for matched text
   */
  generateHighlights(item, queryTokens, options) {
    const highlights = {};

    options.searchFields.forEach((field) => {
      const fieldValue = this.getNestedValue(item, field);
      if (!fieldValue) return;

      const normalizedValue = this.normalizeString(
        String(fieldValue),
        options.caseSensitive
      );
      let highlightedText = String(fieldValue);

      queryTokens.forEach((token) => {
        const index = normalizedValue.indexOf(token);
        if (index !== -1) {
          const originalSubstring = highlightedText.substring(
            index,
            index + token.length
          );
          highlightedText = highlightedText.replace(
            originalSubstring,
            `<mark>${originalSubstring}</mark>`
          );
        }
      });

      highlights[field] = highlightedText;
    });

    return highlights;
  }

  /**
   * Normalize string for comparison
   */
  normalizeString(str, caseSensitive) {
    let normalized = str.trim();
    if (!caseSensitive) {
      normalized = normalized.toLowerCase();
    }
    // Remove diacritics
    normalized = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return normalized;
  }

  /**
   * Tokenize search query
   */
  tokenize(query) {
    return query
      .split(/\s+/)
      .filter((token) => token.length > 0)
      .map((token) => token.trim());
  }

  /**
   * Get nested object value by path
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

/**
 * Search Index for fast lookups
 */
export class SearchIndex {
  constructor() {
    this.index = new Map();
    this.reverseIndex = new Map();
  }

  /**
   * Build search index from items
   */
  build(items, fields) {
    this.index.clear();
    this.reverseIndex.clear();

    items.forEach((item, itemIndex) => {
      fields.forEach((field) => {
        const value = this.getNestedValue(item, field);
        if (!value) return;

        const tokens = String(value)
          .toLowerCase()
          .split(/\s+/);

        tokens.forEach((token) => {
          if (!this.index.has(token)) {
            this.index.set(token, new Set());
          }
          this.index.get(token).add(itemIndex);

          if (!this.reverseIndex.has(itemIndex)) {
            this.reverseIndex.set(itemIndex, new Set());
          }
          this.reverseIndex.get(itemIndex).add(token);
        });
      });
    });

    return this;
  }

  /**
   * Quick lookup using index
   */
  lookup(query) {
    const tokens = query.toLowerCase().split(/\s+/);
    let matchingIndices = null;

    tokens.forEach((token) => {
      const indices = this.index.get(token);
      if (!indices) {
        matchingIndices = new Set();
        return;
      }

      if (matchingIndices === null) {
        matchingIndices = new Set(indices);
      } else {
        matchingIndices = new Set(
          [...matchingIndices].filter((idx) => indices.has(idx))
        );
      }
    });

    return matchingIndices ? Array.from(matchingIndices) : [];
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

export default SearchAlgorithm;
