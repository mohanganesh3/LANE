// Form validation utilities with comprehensive error handling

export const validators = {
  required: (value, fieldName = 'This field') => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName} is required`;
    }
    return null;
  },

  email: (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  phone: (value) => {
    if (!value) return null;
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(value.replace(/\s|-/g, ''))) {
      return 'Please enter a valid 10-digit phone number';
    }
    return null;
  },

  password: (value) => {
    if (!value) return null;
    const errors = [];
    
    if (value.length < 8) {
      errors.push('at least 8 characters');
    }
    if (!/[A-Z]/.test(value)) {
      errors.push('one uppercase letter');
    }
    if (!/[a-z]/.test(value)) {
      errors.push('one lowercase letter');
    }
    if (!/[0-9]/.test(value)) {
      errors.push('one number');
    }
    if (!/[!@#$%^&*]/.test(value)) {
      errors.push('one special character (!@#$%^&*)');
    }

    if (errors.length > 0) {
      return `Password must contain ${errors.join(', ')}`;
    }
    return null;
  },

  confirmPassword: (value, password) => {
    if (!value) return null;
    if (value !== password) {
      return 'Passwords do not match';
    }
    return null;
  },

  minLength: (min) => (value, fieldName = 'This field') => {
    if (!value) return null;
    if (value.length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    return null;
  },

  maxLength: (max) => (value, fieldName = 'This field') => {
    if (!value) return null;
    if (value.length > max) {
      return `${fieldName} must not exceed ${max} characters`;
    }
    return null;
  },

  pattern: (regex, message) => (value) => {
    if (!value) return null;
    if (!regex.test(value)) {
      return message;
    }
    return null;
  },

  numeric: (value, fieldName = 'This field') => {
    if (!value) return null;
    if (isNaN(value)) {
      return `${fieldName} must be a number`;
    }
    return null;
  },

  min: (min) => (value, fieldName = 'This field') => {
    if (!value) return null;
    if (parseFloat(value) < min) {
      return `${fieldName} must be at least ${min}`;
    }
    return null;
  },

  max: (max) => (value, fieldName = 'This field') => {
    if (!value) return null;
    if (parseFloat(value) > max) {
      return `${fieldName} must not exceed ${max}`;
    }
    return null;
  },

  url: (value) => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  },

  date: (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return 'Please enter a valid date';
    }
    return null;
  },

  futureDate: (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (date <= new Date()) {
      return 'Date must be in the future';
    }
    return null;
  },

  pastDate: (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (date >= new Date()) {
      return 'Date must be in the past';
    }
    return null;
  }
};

export const validateField = (value, validationRules, fieldName) => {
  for (const rule of validationRules) {
    const error = rule(value, fieldName);
    if (error) {
      return error;
    }
  }
  return null;
};

export const validateForm = (formData, validationSchema) => {
  const errors = {};
  let isValid = true;

  Object.keys(validationSchema).forEach((fieldName) => {
    const value = formData[fieldName];
    const rules = validationSchema[fieldName];
    const error = validateField(value, rules, fieldName);
    
    if (error) {
      errors[fieldName] = error;
      isValid = false;
    }
  });

  return { isValid, errors };
};

export const getPasswordStrength = (password) => {
  if (!password) return { strength: 0, label: 'No password', color: '#d1d5db' };

  let strength = 0;
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /[0-9]/.test(password),
    special: /[!@#$%^&*]/.test(password)
  };

  strength = Object.values(checks).filter(Boolean).length;

  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['#ef4444', '#f59e0b', '#eab308', '#10b981', '#059669'];

  return {
    strength,
    label: labels[strength - 1] || labels[0],
    color: colors[strength - 1] || colors[0],
    checks
  };
};

export default validators;
