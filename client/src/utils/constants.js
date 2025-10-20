/**
 * Application-wide constants for LANE Rideshare Platform
 */

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    VERIFY_OTP: '/api/auth/verify-otp',
    RESEND_OTP: '/api/auth/resend-otp'
  },
  
  // User endpoints
  USER: {
    PROFILE: '/api/user/profile',
    UPDATE_PROFILE: '/api/user/update',
    DASHBOARD: '/api/user/dashboard',
    NOTIFICATIONS: '/api/user/notifications',
    SETTINGS: '/api/user/settings'
  },
  
  // Ride endpoints
  RIDES: {
    SEARCH: '/api/rides/search',
    POST: '/api/rides/post',
    MY_RIDES: '/api/rides/my-rides',
    DETAILS: '/api/rides/:id',
    CANCEL: '/api/rides/:id/cancel'
  },
  
  // Booking endpoints
  BOOKINGS: {
    CREATE: '/api/bookings/create',
    MY_BOOKINGS: '/api/bookings/my-bookings',
    DETAILS: '/api/bookings/:id',
    CANCEL: '/api/bookings/:id/cancel'
  },
  
  // Chat endpoints
  CHAT: {
    CONVERSATIONS: '/api/chat/conversations',
    MESSAGES: '/api/chat/:conversationId/messages',
    SEND: '/api/chat/:conversationId/send'
  },
  
  // SOS endpoints
  SOS: {
    EMERGENCY: '/api/sos/emergency',
    CANCEL: '/api/sos/cancel',
    HISTORY: '/api/sos/history'
  },
  
  // Admin endpoints
  ADMIN: {
    DASHBOARD: '/api/admin/dashboard',
    USERS: '/api/admin/users',
    RIDES: '/api/admin/rides',
    BOOKINGS: '/api/admin/bookings',
    REPORTS: '/api/admin/reports',
    SETTINGS: '/api/admin/settings'
  }
};

// User roles
export const USER_ROLES = {
  USER: 'user',
  DRIVER: 'driver',
  ADMIN: 'admin'
};

// Verification status
export const VERIFICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

// Ride status
export const RIDE_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Booking status
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
};

// Emergency types
export const EMERGENCY_TYPES = {
  ACCIDENT: 'accident',
  HARASSMENT: 'harassment',
  VEHICLE_BREAKDOWN: 'vehicle-breakdown',
  OTHER: 'other'
};

// Date/Time formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_WITH_TIME: 'MMM DD, YYYY hh:mm A',
  API: 'YYYY-MM-DD',
  TIME: 'hh:mm A'
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'lane_token',
  USER: 'lane_user',
  THEME: 'lane_theme',
  LANGUAGE: 'lane_language'
};

// Socket events
export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  MESSAGE: 'message',
  LOCATION_UPDATE: 'location-update',
  RIDE_UPDATE: 'ride-update',
  EMERGENCY: 'emergency'
};

export default {
  API_ENDPOINTS,
  USER_ROLES,
  VERIFICATION_STATUS,
  RIDE_STATUS,
  BOOKING_STATUS,
  EMERGENCY_TYPES,
  DATE_FORMATS,
  PAGINATION,
  STORAGE_KEYS,
  SOCKET_EVENTS
};
