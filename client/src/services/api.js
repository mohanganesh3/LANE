import axios from 'axios';
import { getToken, removeToken } from '../utils/helpers';
import { API_ENDPOINTS } from '../utils/constants';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 seconds
});

// Request interceptor - add token to requests
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API methods
export const authAPI = {
  login: (credentials) => api.post(API_ENDPOINTS.AUTH.LOGIN, credentials),
  register: (userData) => api.post(API_ENDPOINTS.AUTH.REGISTER, userData),
  logout: () => api.post(API_ENDPOINTS.AUTH.LOGOUT),
  forgotPassword: (email) => api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }),
  resetPassword: (token, password) => api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, password }),
  verifyOTP: (otp) => api.post(API_ENDPOINTS.AUTH.VERIFY_OTP, { otp }),
  resendOTP: () => api.post(API_ENDPOINTS.AUTH.RESEND_OTP)
};

// User API methods
export const userAPI = {
  getProfile: () => api.get(API_ENDPOINTS.USER.PROFILE),
  updateProfile: (data) => api.put(API_ENDPOINTS.USER.UPDATE_PROFILE, data),
  getDashboard: () => api.get(API_ENDPOINTS.USER.DASHBOARD),
  getNotifications: () => api.get(API_ENDPOINTS.USER.NOTIFICATIONS),
  getSettings: () => api.get(API_ENDPOINTS.USER.SETTINGS),
  updateSettings: (settings) => api.put(API_ENDPOINTS.USER.SETTINGS, settings)
};

// Ride API methods
export const rideAPI = {
  searchRides: (params) => api.get(API_ENDPOINTS.RIDES.SEARCH, { params }),
  postRide: (rideData) => api.post(API_ENDPOINTS.RIDES.POST, rideData),
  getMyRides: () => api.get(API_ENDPOINTS.RIDES.MY_RIDES),
  getRideDetails: (id) => api.get(API_ENDPOINTS.RIDES.DETAILS.replace(':id', id)),
  cancelRide: (id) => api.post(API_ENDPOINTS.RIDES.CANCEL.replace(':id', id))
};

// Booking API methods
export const bookingAPI = {
  createBooking: (bookingData) => api.post(API_ENDPOINTS.BOOKINGS.CREATE, bookingData),
  getMyBookings: () => api.get(API_ENDPOINTS.BOOKINGS.MY_BOOKINGS),
  getBookingDetails: (id) => api.get(API_ENDPOINTS.BOOKINGS.DETAILS.replace(':id', id)),
  cancelBooking: (id) => api.post(API_ENDPOINTS.BOOKINGS.CANCEL.replace(':id', id))
};

// Chat API methods
export const chatAPI = {
  getConversations: () => api.get(API_ENDPOINTS.CHAT.CONVERSATIONS),
  getMessages: (conversationId) => api.get(API_ENDPOINTS.CHAT.MESSAGES.replace(':conversationId', conversationId)),
  sendMessage: (conversationId, message) => api.post(API_ENDPOINTS.CHAT.SEND.replace(':conversationId', conversationId), { message })
};

// SOS API methods
export const sosAPI = {
  triggerEmergency: (data) => api.post(API_ENDPOINTS.SOS.EMERGENCY, data),
  cancelEmergency: () => api.post(API_ENDPOINTS.SOS.CANCEL),
  getHistory: () => api.get(API_ENDPOINTS.SOS.HISTORY)
};

// Admin API methods
export const adminAPI = {
  getDashboard: () => api.get(API_ENDPOINTS.ADMIN.DASHBOARD),
  getUsers: (params) => api.get(API_ENDPOINTS.ADMIN.USERS, { params }),
  getRides: (params) => api.get(API_ENDPOINTS.ADMIN.RIDES, { params }),
  getBookings: (params) => api.get(API_ENDPOINTS.ADMIN.BOOKINGS, { params }),
  getReports: () => api.get(API_ENDPOINTS.ADMIN.REPORTS),
  getSettings: () => api.get(API_ENDPOINTS.ADMIN.SETTINGS),
  updateSettings: (settings) => api.put(API_ENDPOINTS.ADMIN.SETTINGS, settings)
};

export default api;
