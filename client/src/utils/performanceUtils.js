/**
 * Search Performance Optimization Utilities
 * Debouncing, throttling, and performance monitoring
 */

/**
 * Debounce function calls
 */
export function debounce(func, wait, options = {}) {
  let timeout;
  let lastArgs;
  let lastThis;
  let result;
  let lastCallTime;
  let lastInvokeTime = 0;
  
  const { leading = false, trailing = true, maxWait } = options;

  function invokeFunc(time) {
    const args = lastArgs;
    const thisArg = lastThis;

    lastArgs = lastThis = undefined;
    lastInvokeTime = time;
    result = func.apply(thisArg, args);
    return result;
  }

  function leadingEdge(time) {
    lastInvokeTime = time;
    timeout = setTimeout(timerExpired, wait);
    return leading ? invokeFunc(time) : result;
  }

  function remainingWait(time) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - timeSinceLastCall;

    return maxWait !== undefined
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  }

  function shouldInvoke(time) {
    const timeSinceLastCall = time - lastCallTime;
    const timeSinceLastInvoke = time - lastInvokeTime;

    return (
      lastCallTime === undefined ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  }

  function timerExpired() {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timeout = setTimeout(timerExpired, remainingWait(time));
  }

  function trailingEdge(time) {
    timeout = undefined;

    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = lastThis = undefined;
    return result;
  }

  function cancel() {
    if (timeout !== undefined) {
      clearTimeout(timeout);
    }
    lastInvokeTime = 0;
    lastArgs = lastCallTime = lastThis = timeout = undefined;
  }

  function flush() {
    return timeout === undefined ? result : trailingEdge(Date.now());
  }

  function debounced(...args) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timeout === undefined) {
        return leadingEdge(lastCallTime);
      }
      if (maxWait) {
        timeout = setTimeout(timerExpired, wait);
        return invokeFunc(lastCallTime);
      }
    }
    if (timeout === undefined) {
      timeout = setTimeout(timerExpired, wait);
    }
    return result;
  }

  debounced.cancel = cancel;
  debounced.flush = flush;
  return debounced;
}

/**
 * Throttle function calls
 */
export function throttle(func, wait, options = {}) {
  let timeout, context, args, result;
  let previous = 0;
  const { leading = true, trailing = true } = options;

  const later = function () {
    previous = leading === false ? 0 : Date.now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };

  const throttled = function (...params) {
    const now = Date.now();
    if (!previous && leading === false) previous = now;
    const remaining = wait - (now - previous);
    context = this;
    args = params;

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };

  throttled.cancel = function () {
    clearTimeout(timeout);
    previous = 0;
    timeout = context = args = null;
  };

  return throttled;
}

/**
 * Memoize function results
 */
export function memoize(func, resolver) {
  const cache = new Map();

  function memoized(...args) {
    const key = resolver ? resolver(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = func.apply(this, args);
    cache.set(key, result);
    return result;
  }

  memoized.cache = cache;
  memoized.clear = () => cache.clear();
  
  return memoized;
}

/**
 * Performance monitoring
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
  }

  start(label) {
    this.metrics.set(label, {
      startTime: performance.now(),
      endTime: null,
      duration: null,
    });
  }

  end(label) {
    const metric = this.metrics.get(label);
    if (!metric) {
      console.warn(`No metric found for label: ${label}`);
      return null;
    }

    metric.endTime = performance.now();
    metric.duration = metric.endTime - metric.startTime;
    return metric.duration;
  }

  getMetric(label) {
    return this.metrics.get(label);
  }

  getAllMetrics() {
    return Array.from(this.metrics.entries()).map(([label, metric]) => ({
      label,
      ...metric,
    }));
  }

  clear() {
    this.metrics.clear();
  }

  report() {
    const metrics = this.getAllMetrics();
    console.table(
      metrics.map((m) => ({
        Label: m.label,
        'Duration (ms)': m.duration?.toFixed(2) || 'N/A',
      }))
    );
  }
}

/**
 * Chunk array processing for performance
 */
export async function processInChunks(items, processor, chunkSize = 100) {
  const results = [];
  
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = await processor(chunk);
    results.push(...chunkResults);
    
    // Allow UI to update
    await new Promise((resolve) => setTimeout(resolve, 0));
  }

  return results;
}

/**
 * Web Worker utility for heavy computations
 */
export function createWorker(workerFunction) {
  const code = workerFunction.toString();
  const blob = new Blob(['(' + code + ')()']);
  const workerUrl = URL.createObjectURL(blob);
  return new Worker(workerUrl);
}

export default {
  debounce,
  throttle,
  memoize,
  PerformanceMonitor,
  processInChunks,
  createWorker,
};
