/**
 * Fuzzy Search Matching Utilities
 * Advanced fuzzy matching algorithms for search
 */

/**
 * Calculate Levenshtein distance between two strings
 */
export function levenshteinDistance(str1, str2) {
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
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Calculate Damerau-Levenshtein distance (includes transpositions)
 */
export function damerauLevenshteinDistance(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;

      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,     // deletion
        matrix[i][j - 1] + 1,     // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );

      // Transposition
      if (
        i > 1 &&
        j > 1 &&
        str1[i - 1] === str2[j - 2] &&
        str1[i - 2] === str2[j - 1]
      ) {
        matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + cost);
      }
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate Jaro similarity
 */
export function jaroSimilarity(str1, str2) {
  if (str1 === str2) return 1.0;

  const len1 = str1.length;
  const len2 = str2.length;

  if (len1 === 0 || len2 === 0) return 0.0;

  const matchDistance = Math.floor(Math.max(len1, len2) / 2) - 1;
  const str1Matches = new Array(len1).fill(false);
  const str2Matches = new Array(len2).fill(false);

  let matches = 0;
  let transpositions = 0;

  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, len2);

    for (let j = start; j < end; j++) {
      if (str2Matches[j] || str1[i] !== str2[j]) continue;
      str1Matches[i] = true;
      str2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0.0;

  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!str1Matches[i]) continue;
    while (!str2Matches[k]) k++;
    if (str1[i] !== str2[k]) transpositions++;
    k++;
  }

  return (
    (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3.0
  );
}

/**
 * Calculate Jaro-Winkler similarity
 */
export function jaroWinklerSimilarity(str1, str2, prefixScale = 0.1) {
  const jaroSim = jaroSimilarity(str1, str2);

  if (jaroSim < 0.7) return jaroSim;

  // Calculate common prefix up to 4 characters
  let prefix = 0;
  for (let i = 0; i < Math.min(str1.length, str2.length, 4); i++) {
    if (str1[i] === str2[i]) {
      prefix++;
    } else {
      break;
    }
  }

  return jaroSim + prefix * prefixScale * (1 - jaroSim);
}

/**
 * Calculate cosine similarity
 */
export function cosineSimilarity(str1, str2) {
  const vec1 = createNgramVector(str1, 2);
  const vec2 = createNgramVector(str2, 2);

  const allNgrams = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);
  
  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;

  allNgrams.forEach((ngram) => {
    const v1 = vec1[ngram] || 0;
    const v2 = vec2[ngram] || 0;
    dotProduct += v1 * v2;
    mag1 += v1 * v1;
    mag2 += v2 * v2;
  });

  if (mag1 === 0 || mag2 === 0) return 0;

  return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2));
}

/**
 * Create n-gram vector from string
 */
function createNgramVector(str, n) {
  const ngrams = {};
  const normalized = str.toLowerCase();

  for (let i = 0; i <= normalized.length - n; i++) {
    const ngram = normalized.substring(i, i + n);
    ngrams[ngram] = (ngrams[ngram] || 0) + 1;
  }

  return ngrams;
}

/**
 * Fuzzy match with multiple algorithms
 */
export function fuzzyMatch(query, target, threshold = 0.6) {
  const normalizedQuery = query.toLowerCase().trim();
  const normalizedTarget = target.toLowerCase().trim();

  // Exact match
  if (normalizedQuery === normalizedTarget) {
    return { score: 1.0, matched: true, algorithm: 'exact' };
  }

  // Starts with
  if (normalizedTarget.startsWith(normalizedQuery)) {
    return { score: 0.9, matched: true, algorithm: 'prefix' };
  }

  // Contains
  if (normalizedTarget.includes(normalizedQuery)) {
    return { score: 0.7, matched: true, algorithm: 'substring' };
  }

  // Use multiple fuzzy algorithms and take best match
  const jaroWinkler = jaroWinklerSimilarity(normalizedQuery, normalizedTarget);
  const cosine = cosineSimilarity(normalizedQuery, normalizedTarget);
  
  const maxSimilarity = Math.max(jaroWinkler, cosine);

  return {
    score: maxSimilarity,
    matched: maxSimilarity >= threshold,
    algorithm: jaroWinkler > cosine ? 'jaro-winkler' : 'cosine',
  };
}

/**
 * Find best fuzzy matches in array
 */
export function fuzzySearch(query, items, options = {}) {
  const {
    threshold = 0.6,
    limit = 10,
    key = null,
  } = options;

  const results = items
    .map((item) => {
      const target = key ? item[key] : item;
      const match = fuzzyMatch(query, target, threshold);
      return { item, ...match };
    })
    .filter((result) => result.matched)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return results;
}

export default {
  levenshteinDistance,
  damerauLevenshteinDistance,
  jaroSimilarity,
  jaroWinklerSimilarity,
  cosineSimilarity,
  fuzzyMatch,
  fuzzySearch,
};
