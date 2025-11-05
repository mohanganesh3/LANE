import axios from 'axios';

class MapsAPIService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    this.baseURL = 'https://maps.googleapis.com/maps/api';
    this.retryAttempts = 3;
    this.retryDelay = 1000;
    this.cache = new Map();
    this.cacheExpiry = 300000; // 5 minutes
  }

  getCacheKey(endpoint, params) {
    return `${endpoint}_${JSON.stringify(params)}`;
  }

  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  async retryRequest(requestFn, attempt = 1) {
    try {
      return await requestFn();
    } catch (error) {
      if (attempt < this.retryAttempts) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
        return this.retryRequest(requestFn, attempt + 1);
      }
      throw error;
    }
  }

  async geocode(address) {
    const cacheKey = this.getCacheKey('geocode', { address });
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    return this.retryRequest(async () => {
      const response = await axios.get(`${this.baseURL}/geocode/json`, {
        params: {
          address,
          key: this.apiKey
        }
      });

      if (response.data.status === 'OK') {
        const result = response.data.results[0];
        const data = {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          formattedAddress: result.formatted_address,
          placeId: result.place_id
        };
        this.setCachedData(cacheKey, data);
        return data;
      } else {
        throw new Error(`Geocoding failed: ${response.data.status}`);
      }
    });
  }

  async reverseGeocode(lat, lng) {
    const cacheKey = this.getCacheKey('reverse_geocode', { lat, lng });
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    return this.retryRequest(async () => {
      const response = await axios.get(`${this.baseURL}/geocode/json`, {
        params: {
          latlng: `${lat},${lng}`,
          key: this.apiKey
        }
      });

      if (response.data.status === 'OK') {
        const data = {
          address: response.data.results[0].formatted_address,
          placeId: response.data.results[0].place_id,
          components: response.data.results[0].address_components
        };
        this.setCachedData(cacheKey, data);
        return data;
      } else {
        throw new Error(`Reverse geocoding failed: ${response.data.status}`);
      }
    });
  }

  async autocomplete(input, location = null, radius = 50000) {
    if (!input || input.length < 3) return [];

    const params = {
      input,
      key: this.apiKey,
      types: 'geocode'
    };

    if (location) {
      params.location = `${location.lat},${location.lng}`;
      params.radius = radius;
    }

    return this.retryRequest(async () => {
      const response = await axios.get(`${this.baseURL}/place/autocomplete/json`, {
        params
      });

      if (response.data.status === 'OK') {
        return response.data.predictions.map(prediction => ({
          placeId: prediction.place_id,
          description: prediction.description,
          mainText: prediction.structured_formatting.main_text,
          secondaryText: prediction.structured_formatting.secondary_text
        }));
      }
      return [];
    });
  }

  async getPlaceDetails(placeId) {
    const cacheKey = this.getCacheKey('place_details', { placeId });
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    return this.retryRequest(async () => {
      const response = await axios.get(`${this.baseURL}/place/details/json`, {
        params: {
          place_id: placeId,
          key: this.apiKey,
          fields: 'geometry,formatted_address,name,address_components'
        }
      });

      if (response.data.status === 'OK') {
        const result = response.data.result;
        const data = {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          address: result.formatted_address,
          name: result.name,
          components: result.address_components
        };
        this.setCachedData(cacheKey, data);
        return data;
      } else {
        throw new Error(`Place details failed: ${response.data.status}`);
      }
    });
  }

  async getDirections(origin, destination, waypoints = []) {
    const params = {
      origin: `${origin.lat},${origin.lng}`,
      destination: `${destination.lat},${destination.lng}`,
      key: this.apiKey,
      mode: 'driving',
      alternatives: true
    };

    if (waypoints.length > 0) {
      params.waypoints = waypoints.map(wp => `${wp.lat},${wp.lng}`).join('|');
    }

    return this.retryRequest(async () => {
      const response = await axios.get(`${this.baseURL}/directions/json`, {
        params
      });

      if (response.data.status === 'OK') {
        return response.data.routes.map(route => ({
          distance: route.legs.reduce((sum, leg) => sum + leg.distance.value, 0),
          duration: route.legs.reduce((sum, leg) => sum + leg.duration.value, 0),
          polyline: route.overview_polyline.points,
          bounds: route.bounds,
          legs: route.legs.map(leg => ({
            distance: leg.distance,
            duration: leg.duration,
            startAddress: leg.start_address,
            endAddress: leg.end_address,
            steps: leg.steps
          }))
        }));
      } else {
        throw new Error(`Directions failed: ${response.data.status}`);
      }
    });
  }

  async calculateDistance(origins, destinations) {
    return this.retryRequest(async () => {
      const response = await axios.get(`${this.baseURL}/distancematrix/json`, {
        params: {
          origins: origins.map(o => `${o.lat},${o.lng}`).join('|'),
          destinations: destinations.map(d => `${d.lat},${d.lng}`).join('|'),
          key: this.apiKey,
          mode: 'driving'
        }
      });

      if (response.data.status === 'OK') {
        return response.data.rows.map((row, i) => ({
          origin: origins[i],
          elements: row.elements.map((element, j) => ({
            destination: destinations[j],
            distance: element.distance,
            duration: element.duration,
            status: element.status
          }))
        }));
      } else {
        throw new Error(`Distance matrix failed: ${response.data.status}`);
      }
    });
  }

  async getNearbyPlaces(location, radius = 1000, type = 'gas_station') {
    return this.retryRequest(async () => {
      const response = await axios.get(`${this.baseURL}/place/nearbysearch/json`, {
        params: {
          location: `${location.lat},${location.lng}`,
          radius,
          type,
          key: this.apiKey
        }
      });

      if (response.data.status === 'OK') {
        return response.data.results.map(place => ({
          placeId: place.place_id,
          name: place.name,
          location: place.geometry.location,
          vicinity: place.vicinity,
          rating: place.rating,
          userRatingsTotal: place.user_ratings_total,
          types: place.types
        }));
      }
      return [];
    });
  }

  clearCache() {
    this.cache.clear();
  }

  logAnalytics(endpoint, success, duration) {
    const analytics = {
      endpoint,
      success,
      duration,
      timestamp: new Date().toISOString()
    };
    
    // Send to analytics service
    if (window.gtag) {
      window.gtag('event', 'api_call', analytics);
    }
  }
}

export default new MapsAPIService();
