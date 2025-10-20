/**
 * Validation utility functions for LANE Rideshare Platform
 */

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  return { isValid: true, error: '' };
};

// Password validation
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters' };
  }
  if (password.length > 50) {
    return { isValid: false, error: 'Password must not exceed 50 characters' };
  }
  return { isValid: true, error: '' };
};

// Phone number validation
export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  const cleanPhone = phone.replace(/[-\s()]/g, '');
  
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' };
  }
  if (!phoneRegex.test(cleanPhone)) {
    return { isValid: false, error: 'Phone number must be 10 digits' };
  }
  return { isValid: true, error: '' };
};

// Name validation
export const validateName = (name) => {
  if (!name || !name.trim()) {
    return { isValid: false, error: 'Name is required' };
  }
  if (name.trim().length < 3) {
    return { isValid: false, error: 'Name must be at least 3 characters' };
  }
  if (name.trim().length > 50) {
    return { isValid: false, error: 'Name must not exceed 50 characters' };
  }
  return { isValid: true, error: '' };
};

// Confirm password validation
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password' };
  }
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }
  return { isValid: true, error: '' };
};

// Generic required field validation
export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true, error: '' };
};

export default {
  validateEmail,
  validatePassword,
  validatePhone,
  validateName,
  validateConfirmPassword,
  validateRequired
};
