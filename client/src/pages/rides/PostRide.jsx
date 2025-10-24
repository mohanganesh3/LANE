import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PostRide.css';

const PostRide = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    from: '',
    to: '',
    date: '',
    time: '',
    vehicleType: '',
    availableSeats: 1,
    pricePerSeat: '',
    allowSmoking: false,
    allowPets: false,
    musicPreference: 'no-preference',
    notes: ''
  });

  // Set minimum date to today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, date: today }));
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.from.trim()) newErrors.from = 'Pickup location is required';
    if (!formData.to.trim()) newErrors.to = 'Drop-off location is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';
    if (!formData.vehicleType) newErrors.vehicleType = 'Vehicle type is required';
    if (!formData.pricePerSeat || formData.pricePerSeat <= 0) {
      newErrors.pricePerSeat = 'Please enter a valid price';
    }

    // Check if date/time is in the future
    const rideDateTime = new Date(`${formData.date}T${formData.time}`);
    if (rideDateTime <= new Date()) {
      newErrors.date = 'Ride date/time must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/rides/post', {
        ...formData,
        departureTime: `${formData.date}T${formData.time}`
      });

      if (response.data.success) {
        alert('Ride posted successfully!');
        navigate('/rides/my-rides');
      }
    } catch (error) {
      console.error('Error posting ride:', error);
      alert(error.response?.data?.message || 'Failed to post ride. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const suggestedPrices = {
    short: { label: 'Short (< 10 km)', price: 50 },
    medium: { label: 'Medium (10-25 km)', price: 100 },
    long: { label: 'Long (25-50 km)', price: 200 },
    veryLong: { label: 'Very Long (> 50 km)', price: 350 }
  };

  return (
    <div className="post-ride-page">
      <div className="post-ride-container">
        <div className="post-ride-header">
          <h1>Post a Ride</h1>
          <p>Share your journey and split the cost</p>
        </div>

        <form className="post-ride-form" onSubmit={handleSubmit}>
          {/* Route Details */}
          <div className="form-section">
            <h2>
              <span className="section-icon">📍</span>
              Route Details
            </h2>
            
            <div className="route-inputs">
              <div className="form-group">
                <label htmlFor="from">
                  <span className="pickup-dot"></span>
                  Pickup Location
                </label>
                <input
                  type="text"
                  id="from"
                  name="from"
                  value={formData.from}
                  onChange={handleChange}
                  placeholder="e.g., Koramangala, Bangalore"
                  className={errors.from ? 'error' : ''}
                />
                {errors.from && <span className="error-message">{errors.from}</span>}
              </div>

              <div className="route-arrow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 4v16m0 0l-6-6m6 6l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <div className="form-group">
                <label htmlFor="to">
                  <span className="dropoff-dot"></span>
                  Drop-off Location
                </label>
                <input
                  type="text"
                  id="to"
                  name="to"
                  value={formData.to}
                  onChange={handleChange}
                  placeholder="e.g., Whitefield, Bangalore"
                  className={errors.to ? 'error' : ''}
                />
                {errors.to && <span className="error-message">{errors.to}</span>}
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="form-section">
            <h2>
              <span className="section-icon">📅</span>
              When are you traveling?
            </h2>
            
            <div className="datetime-inputs">
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={errors.date ? 'error' : ''}
                />
                {errors.date && <span className="error-message">{errors.date}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="time">Time</label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className={errors.time ? 'error' : ''}
                />
                {errors.time && <span className="error-message">{errors.time}</span>}
              </div>
            </div>
          </div>

          {/* Vehicle Selection */}
          <div className="form-section">
            <h2>
              <span className="section-icon">🚗</span>
              Vehicle Type
            </h2>
            
            <div className="vehicle-grid">
              {['sedan', 'suv', 'hatchback'].map((type) => (
                <label key={type} className={`vehicle-option ${formData.vehicleType === type ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="vehicleType"
                    value={type}
                    checked={formData.vehicleType === type}
                    onChange={handleChange}
                  />
                  <div className="vehicle-card">
                    <div className="vehicle-icon">
                      {type === 'sedan' && '🚙'}
                      {type === 'suv' && '🚐'}
                      {type === 'hatchback' && '🚗'}
                    </div>
                    <div className="vehicle-name">{type.charAt(0).toUpperCase() + type.slice(1)}</div>
                  </div>
                </label>
              ))}
            </div>
            {errors.vehicleType && <span className="error-message">{errors.vehicleType}</span>}
          </div>

          {/* Seats & Pricing */}
          <div className="form-section">
            <h2>
              <span className="section-icon">💺</span>
              Seats & Pricing
            </h2>
            
            <div className="seats-pricing-grid">
              <div className="form-group">
                <label htmlFor="availableSeats">Available Seats</label>
                <select
                  id="availableSeats"
                  name="availableSeats"
                  value={formData.availableSeats}
                  onChange={handleChange}
                >
                  <option value={1}>1 Seat</option>
                  <option value={2}>2 Seats</option>
                  <option value={3}>3 Seats</option>
                  <option value={4}>4 Seats</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="pricePerSeat">Price per Seat (₹)</label>
                <input
                  type="number"
                  id="pricePerSeat"
                  name="pricePerSeat"
                  value={formData.pricePerSeat}
                  onChange={handleChange}
                  placeholder="Enter price"
                  min="0"
                  step="10"
                  className={errors.pricePerSeat ? 'error' : ''}
                />
                {errors.pricePerSeat && <span className="error-message">{errors.pricePerSeat}</span>}
              </div>
            </div>

            {/* Price Suggestions */}
            <div className="price-suggestions">
              <p className="suggestions-label">Suggested prices:</p>
              <div className="suggestion-chips">
                {Object.entries(suggestedPrices).map(([key, { label, price }]) => (
                  <button
                    key={key}
                    type="button"
                    className="suggestion-chip"
                    onClick={() => setFormData(prev => ({ ...prev, pricePerSeat: price }))}
                  >
                    {label}: ₹{price}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="form-section">
            <h2>
              <span className="section-icon">⚙️</span>
              Ride Preferences
            </h2>
            
            <div className="preferences-grid">
              <label className="checkbox-preference">
                <input
                  type="checkbox"
                  name="allowSmoking"
                  checked={formData.allowSmoking}
                  onChange={handleChange}
                />
                <span className="checkbox-custom"></span>
                <div className="preference-content">
                  <span className="preference-icon">🚭</span>
                  <span className="preference-text">Allow Smoking</span>
                </div>
              </label>

              <label className="checkbox-preference">
                <input
                  type="checkbox"
                  name="allowPets"
                  checked={formData.allowPets}
                  onChange={handleChange}
                />
                <span className="checkbox-custom"></span>
                <div className="preference-content">
                  <span className="preference-icon">🐕</span>
                  <span className="preference-text">Pet Friendly</span>
                </div>
              </label>

              <div className="form-group music-preference">
                <label htmlFor="musicPreference">
                  <span className="preference-icon">🎵</span>
                  Music Preference
                </label>
                <select
                  id="musicPreference"
                  name="musicPreference"
                  value={formData.musicPreference}
                  onChange={handleChange}
                >
                  <option value="no-preference">No Preference</option>
                  <option value="bollywood">Bollywood</option>
                  <option value="english">English</option>
                  <option value="regional">Regional</option>
                  <option value="no-music">No Music</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="form-section">
            <h2>
              <span className="section-icon">📝</span>
              Additional Notes
            </h2>
            
            <div className="form-group">
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add any additional information for passengers (optional)"
                rows="4"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Posting...
                </>
              ) : (
                <>
                  <span>🚀</span>
                  Post Ride
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostRide;
