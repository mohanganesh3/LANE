/**
 * API Controller
 * Handles external API integrations: Nominatim (geocoding) and OSRM (routing)
 */

const axios = require('axios');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

const NOMINATIM_URL = process.env.NOMINATIM_API_URL || 'https://nominatim.openstreetmap.org';
const OSRM_URL = process.env.OSRM_API_URL || 'https://router.project-osrm.org';

/**
 * Geocode address to coordinates
 */
exports.geocodeAddress = asyncHandler(async (req, res) => {
    const { address } = req.query;

    if (!address) {
        throw new AppError('Address is required', 400);
    }

    try {
        const response = await axios.get(`${NOMINATIM_URL}/search`, {
            params: {
                q: address,
                format: 'json',
                limit: 5,
                countrycodes: 'in', // India only
                addressdetails: 1
            },
            headers: {
                'User-Agent': 'LANE-Carpool-App/1.0'
            }
        });

        const results = response.data.map(place => ({
            displayName: place.display_name,
            address: place.address,
            coordinates: [parseFloat(place.lon), parseFloat(place.lat)],
            city: place.address.city || place.address.town || place.address.village,
            state: place.address.state,
            country: place.address.country,
            placeId: place.place_id
        }));

        res.status(200).json({
            success: true,
            count: results.length,
            results
        });
    } catch (error) {
        console.error('Geocoding error:', error.message);
        throw new AppError('Geocoding failed', 500);
    }
});

/**
 * Reverse geocode coordinates to address
 */
exports.reverseGeocode = asyncHandler(async (req, res) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        throw new AppError('Latitude and longitude are required', 400);
    }

    try {
        const response = await axios.get(`${NOMINATIM_URL}/reverse`, {
            params: {
                lat: parseFloat(lat),
                lon: parseFloat(lon),
                format: 'json',
                addressdetails: 1
            },
            headers: {
                'User-Agent': 'LANE-Carpool-App/1.0'
            }
        });

        const place = response.data;

        res.status(200).json({
            success: true,
            result: {
                displayName: place.display_name,
                address: place.address,
                coordinates: [parseFloat(place.lon), parseFloat(place.lat)],
                city: place.address.city || place.address.town || place.address.village,
                state: place.address.state,
                country: place.address.country
            }
        });
    } catch (error) {
        console.error('Reverse geocoding error:', error.message);
        throw new AppError('Reverse geocoding failed', 500);
    }
});

/**
 * Get route between two points
 */
exports.getRoute = asyncHandler(async (req, res) => {
    const { origin, destination, waypoints } = req.body;

    if (!origin || !destination) {
        throw new AppError('Origin and destination are required', 400);
    }

    try {
        // Parse coordinates
        const originCoords = JSON.parse(origin);
        const destCoords = JSON.parse(destination);
        const waypointCoords = waypoints ? JSON.parse(waypoints) : [];

        // Build coordinate string
        const allCoords = [
            originCoords,
            ...waypointCoords,
            destCoords
        ];

        const coordString = allCoords
            .map(c => `${c.coordinates[0]},${c.coordinates[1]}`)
            .join(';');

        const response = await axios.get(`${OSRM_URL}/route/v1/driving/${coordString}`, {
            params: {
                overview: 'full',
                geometries: 'geojson',
                steps: true,
                alternatives: true
            }
        });

        if (response.data.code !== 'Ok') {
            throw new Error('OSRM routing failed');
        }

        const routes = response.data.routes.map(route => ({
            geometry: route.geometry,
            distance: route.distance / 1000, // Convert to km
            duration: route.duration / 60, // Convert to minutes
            legs: route.legs.map(leg => ({
                distance: leg.distance / 1000,
                duration: leg.duration / 60,
                steps: leg.steps ? leg.steps.map(step => ({
                    instruction: step.maneuver?.instruction || '',
                    distance: step.distance / 1000,
                    duration: step.duration / 60
                })) : []
            }))
        }));

        res.status(200).json({
            success: true,
            routes
        });
    } catch (error) {
        console.error('Routing error:', error.message);
        throw new AppError('Route calculation failed', 500);
    }
});

/**
 * Get distance matrix
 */
exports.getDistanceMatrix = asyncHandler(async (req, res) => {
    const { origins, destinations } = req.body;

    if (!origins || !destinations) {
        throw new AppError('Origins and destinations are required', 400);
    }

    try {
        const originCoords = JSON.parse(origins);
        const destCoords = JSON.parse(destinations);

        // OSRM table service
        const allCoords = [...originCoords, ...destCoords];
        const coordString = allCoords
            .map(c => `${c[0]},${c[1]}`)
            .join(';');

        const originIndices = originCoords.map((_, i) => i).join(';');
        const destIndices = destCoords.map((_, i) => i + originCoords.length).join(';');

        const response = await axios.get(`${OSRM_URL}/table/v1/driving/${coordString}`, {
            params: {
                sources: originIndices,
                destinations: destIndices
            }
        });

        if (response.data.code !== 'Ok') {
            throw new Error('Distance matrix calculation failed');
        }

        res.status(200).json({
            success: true,
            distances: response.data.distances, // 2D array in meters
            durations: response.data.durations // 2D array in seconds
        });
    } catch (error) {
        console.error('Distance matrix error:', error.message);
        throw new AppError('Distance matrix calculation failed', 500);
    }
});

/**
 * Autocomplete location search
 */
exports.autocomplete = asyncHandler(async (req, res) => {
    const { query } = req.query;

    if (!query || query.length < 3) {
        throw new AppError('Query must be at least 3 characters', 400);
    }

    try {
        const response = await axios.get(`${NOMINATIM_URL}/search`, {
            params: {
                q: query,
                format: 'json',
                limit: 10,
                countrycodes: 'in',
                addressdetails: 1
            },
            headers: {
                'User-Agent': 'LANE-Carpool-App/1.0'
            }
        });

        const suggestions = response.data.map(place => ({
            label: place.display_name,
            value: {
                address: place.display_name,
                coordinates: [parseFloat(place.lon), parseFloat(place.lat)],
                city: place.address.city || place.address.town || place.address.village,
                state: place.address.state
            }
        }));

        res.status(200).json({
            success: true,
            suggestions
        });
    } catch (error) {
        console.error('Autocomplete error:', error.message);
        throw new AppError('Autocomplete failed', 500);
    }
});

/**
 * Get nearest roads (snap to road)
 */
exports.snapToRoad = asyncHandler(async (req, res) => {
    const { coordinates } = req.body;

    if (!coordinates) {
        throw new AppError('Coordinates are required', 400);
    }

    try {
        const coords = JSON.parse(coordinates);
        const coordString = coords
            .map(c => `${c[0]},${c[1]}`)
            .join(';');

        const response = await axios.get(`${OSRM_URL}/nearest/v1/driving/${coordString}`, {
            params: {
                number: 1
            }
        });

        if (response.data.code !== 'Ok') {
            throw new Error('Snap to road failed');
        }

        const snapped = response.data.waypoints.map(wp => ({
            coordinates: [wp.location[0], wp.location[1]],
            distance: wp.distance,
            name: wp.name
        }));

        res.status(200).json({
            success: true,
            snapped
        });
    } catch (error) {
        console.error('Snap to road error:', error.message);
        throw new AppError('Snap to road failed', 500);
    }
});

/**
 * Calculate ETA
 */
exports.calculateETA = asyncHandler(async (req, res) => {
    const { origin, destination } = req.query;

    if (!origin || !destination) {
        throw new AppError('Origin and destination are required', 400);
    }

    try {
        const originCoords = JSON.parse(origin);
        const destCoords = JSON.parse(destination);

        const coordString = `${originCoords[0]},${originCoords[1]};${destCoords[0]},${destCoords[1]}`;

        const response = await axios.get(`${OSRM_URL}/route/v1/driving/${coordString}`, {
            params: {
                overview: 'false',
                geometries: 'geojson'
            }
        });

        if (response.data.code !== 'Ok') {
            throw new Error('ETA calculation failed');
        }

        const route = response.data.routes[0];
        const eta = new Date(Date.now() + route.duration * 1000);

        res.status(200).json({
            success: true,
            distance: route.distance / 1000, // km
            duration: route.duration / 60, // minutes
            eta: eta.toISOString()
        });
    } catch (error) {
        console.error('ETA calculation error:', error.message);
        throw new AppError('ETA calculation failed', 500);
    }
});

/**
 * Get user notifications
 */
exports.getNotifications = asyncHandler(async (req, res) => {
    const Notification = require('../models/Notification');
    
    const notifications = await Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();
    
    res.status(200).json({
        success: true,
        notifications
    });
});

/**
 * Get all user notifications (for notifications page)
 */
exports.getAllNotifications = asyncHandler(async (req, res) => {
    const Notification = require('../models/Notification');
    
    const notifications = await Notification.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .lean();
    
    res.status(200).json({
        success: true,
        notifications
    });
});

/**
 * Get unread notification count
 */
exports.getNotificationCount = asyncHandler(async (req, res) => {
    const Notification = require('../models/Notification');
    
    const unreadCount = await Notification.countDocuments({
        user: req.user._id,
        isRead: false
    });
    
    res.status(200).json({
        success: true,
        unreadCount
    });
});

/**
 * Mark notification as read
 */
exports.markNotificationAsRead = asyncHandler(async (req, res) => {
    const Notification = require('../models/Notification');
    const { notificationId } = req.params;
    
    const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, user: req.user._id },
        { isRead: true, readAt: new Date() },
        { new: true }
    );
    
    if (!notification) {
        throw new AppError('Notification not found', 404);
    }
    
    res.status(200).json({
        success: true,
        notification
    });
});

/**
 * Mark all notifications as read
 */
exports.markAllNotificationsAsRead = asyncHandler(async (req, res) => {
    const Notification = require('../models/Notification');
    
    const result = await Notification.updateMany(
        { user: req.user._id, isRead: false },
        { isRead: true, readAt: new Date() }
    );
    
    res.status(200).json({
        success: true,
        modifiedCount: result.modifiedCount
    });
});
