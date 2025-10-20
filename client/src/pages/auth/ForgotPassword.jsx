import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPassword.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email format');
      return;
    }

    setLoading(true);
    // API call will be implemented later
    setTimeout(() => {
      setLoading(false);
      setMessage('Password reset link has been sent to your email');
      setEmail('');
    }, 1500);
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-box">
        <div className="icon-wrapper">
          <svg className="lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="5" y="11" width="14" height="10" rx="2" ry="2" strokeWidth="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2"></path>
          </svg>
        </div>
        
        <h2>Forgot Password?</h2>
        <p className="forgot-password-subtitle">
          No worries! Enter your email address and we'll send you a link to reset your password
        </p>

        {message && <div className="success-message">
          <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M20 6L9 17l-5-5" strokeWidth="2" strokeLinecap="round"></path>
          </svg>
          {message}
        </div>}
        
        {error && <div className="error-message">
          <svg className="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="2"></circle>
            <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round"></line>
            <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round"></line>
          </svg>
          {error}
        </div>}

        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              className={error ? 'error' : ''}
            />
            <small className="help-text">We'll send a password reset link to this email</small>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span> Sending...
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <div className="forgot-password-footer">
          <Link to="/login">
            <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round"></path>
            </svg>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
