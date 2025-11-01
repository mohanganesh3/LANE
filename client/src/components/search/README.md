# Search Optimization Features - Documentation

This directory contains all search optimization components and utilities for enhanced search functionality.

## Overview

The search optimization system provides advanced search capabilities including:
- **Intelligent Algorithms**: Scoring, ranking, and relevance calculation
- **Fuzzy Matching**: Multiple algorithms (Levenshtein, Jaro-Winkler, Cosine similarity)
- **Performance Optimization**: Caching, debouncing, throttling, memoization
- **User Experience**: Autocomplete, search history, keyboard navigation
- **Real-time Features**: Live suggestions, instant results

## Components

### Search Algorithm (`utils/searchAlgorithm.js`)
Advanced search with intelligent scoring and ranking.

**Features**:
- Multi-field search
- Exact, prefix, substring, and fuzzy matching
- Configurable relevance scoring
- Search result highlighting
- Fast indexed lookups

**Usage**:
```javascript
import { SearchAlgorithm } from './utils/searchAlgorithm';

const search = new SearchAlgorithm({
  caseSensitive: false,
  fuzzyThreshold: 0.6,
  maxResults: 50,
  searchFields: ['name', 'description', 'tags'],
});

const results = search.search(items, 'query');
```

### Search Cache (`utils/searchCache.js`)
LRU cache for search results with TTL expiration.

**Features**:
- Least Recently Used (LRU) eviction
- Time-to-live (TTL) expiration
- Automatic cache invalidation
- Query and filter-based keys
- Cache statistics

**Usage**:
```javascript
import { SearchCache } from './utils/searchCache';

const cache = new SearchCache({ maxSize: 100, ttl: 5 * 60 * 1000 });

// Get cached results
const cached = cache.get(query, filters);

// Set results in cache
cache.set(query, filters, results);
```

### Search History (`components/search/SearchHistory.jsx`)
Recent search queries with localStorage persistence.

**Features**:
- LocalStorage persistence
- Recent queries display
- Query selection
- History management (add/remove/clear)
- Maximum items limit

**Usage**:
```jsx
import SearchHistory from './components/search/SearchHistory';

<SearchHistory
  onSelectQuery={(query) => handleSearch(query)}
  maxItems={10}
/>
```

### Autocomplete (`components/search/Autocomplete.jsx`)
Smart autocomplete with fuzzy matching and keyboard navigation.

**Features**:
- Real-time suggestions
- Fuzzy matching
- Keyboard navigation (↑↓ Enter Esc)
- Result highlighting
- Debounced filtering
- Click-outside handling

**Usage**:
```jsx
import Autocomplete from './components/search/Autocomplete';

<Autocomplete
  value={searchQuery}
  onChange={setSearchQuery}
  onSelect={handleSelect}
  suggestions={suggestions}
  minChars={2}
  maxSuggestions={10}
/>
```

### Fuzzy Matching (`utils/fuzzyMatch.js`)
Advanced fuzzy matching algorithms.

**Algorithms**:
- **Levenshtein Distance**: Edit distance calculation
- **Damerau-Levenshtein**: Includes transpositions
- **Jaro Similarity**: Character match-based
- **Jaro-Winkler**: Prefix-boosted Jaro
- **Cosine Similarity**: N-gram vector-based

**Usage**:
```javascript
import { fuzzyMatch, fuzzySearch } from './utils/fuzzyMatch';

// Single match
const match = fuzzyMatch('seach', 'search', 0.6);
// { score: 0.83, matched: true, algorithm: 'jaro-winkler' }

// Search array
const results = fuzzySearch('seach', items, {
  threshold: 0.6,
  limit: 10,
  key: 'name',
});
```

### Performance Utilities (`utils/performanceUtils.js`)
Performance optimization tools.

**Features**:
- **Debounce**: Delay function execution
- **Throttle**: Limit function calls
- **Memoize**: Cache function results
- **Performance Monitor**: Track execution time
- **Chunk Processing**: Handle large datasets
- **Web Workers**: Offload heavy computations

**Usage**:
```javascript
import { debounce, throttle, memoize, PerformanceMonitor } from './utils/performanceUtils';

// Debounce search input
const debouncedSearch = debounce(handleSearch, 300);

// Throttle scroll handler
const throttledScroll = throttle(handleScroll, 100);

// Memoize expensive calculation
const memoizedCalc = memoize(expensiveFunction);

// Monitor performance
const monitor = new PerformanceMonitor();
monitor.start('search');
// ... perform search ...
const duration = monitor.end('search');
```

## Performance Metrics

### Search Speed
- **Cached Results**: <10ms
- **Indexed Lookup**: 10-50ms
- **Full Search**: 50-200ms (depending on dataset size)
- **Fuzzy Matching**: 100-500ms (with optimizations)

### Optimization Strategies
1. **Caching**: LRU cache with 5-minute TTL
2. **Indexing**: Pre-built search indices for fast lookups
3. **Debouncing**: 300ms delay for input events
4. **Throttling**: 100ms for scroll/resize events
5. **Memoization**: Cache expensive calculations
6. **Chunking**: Process large datasets in 100-item chunks

## Search Scoring Algorithm

### Score Calculation
```
Total Score = Σ (Field Scores × Position Boost)

Field Score:
- Exact Match: 100 points
- Starts With: 80 points
- Contains: 50 points
- Fuzzy Match: similarity × 30 points

Position Boost:
- First Token: 1.0x
- Second Token: 0.9x
- Third Token: 0.8x
- etc.
```

### Result Ranking
Results are ranked by total score (descending):
1. Exact matches
2. Prefix matches
3. Substring matches
4. Fuzzy matches (above threshold)

## API Integration

### Backend Endpoints
- `GET /search?q={query}&filters={json}` - Search items
- `GET /search/suggestions?q={query}` - Get autocomplete suggestions
- `GET /search/history` - Get user search history
- `POST /search/history` - Add to search history
- `DELETE /search/history/{id}` - Remove from history

### Response Format
```json
{
  "results": [
    {
      "item": { ... },
      "score": 95.5,
      "highlights": {
        "name": "Matching <mark>text</mark>",
        "description": "..."
      }
    }
  ],
  "total": 150,
  "page": 1,
  "pageSize": 20,
  "cached": false,
  "duration": 45
}
```

## Browser Support

- **Modern Browsers**: Full support (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **localStorage**: Required for search history
- **Performance API**: Optional (for monitoring)
- **Web Workers**: Optional (for heavy computations)

## Accessibility

- **Keyboard Navigation**: Full support for autocomplete
- **Screen Readers**: ARIA labels and announcements
- **Focus Management**: Proper focus handling
- **High Contrast**: Compatible color schemes

## Future Enhancements

1. **Voice Search**: Speech-to-text integration
2. **Search Analytics**: Track popular queries
3. **Machine Learning**: Personalized rankings
4. **Spell Correction**: Auto-correct typos
5. **Synonyms**: Expand query with synonyms
6. **Filters**: Advanced filtering options

---

**Created**: November 1, 2025  
**Author**: Sujal (sujalpcmb123@gmail.com)  
**Day**: 15 of 22 - React Migration  
**Commits**: 7 total (Search Optimization)  

**Performance**: ⚡ Optimized for speed and accuracy  
**Accuracy**: 🎯 Advanced fuzzy matching algorithms  
**UX**: 🎨 Smooth, responsive, intuitive interface
