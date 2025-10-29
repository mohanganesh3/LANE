import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StarRating from '../../components/StarRating';
import './ReviewRating.css';

const ReviewRating = () => {
  const { rideId } = useParams();
  const navigate = useNavigate();
  
  const [rideDetails, setRideDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [ratings, setRatings] = useState({
    overall: 0,
    cleanliness: 0,
    punctuality: 0,
    driving: 0,
    behavior: 0
  });
  
  const [review, setReview] = useState({
    comment: '',
    wouldRecommend: null
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchRideDetails();
  }, [rideId]);

  const fetchRideDetails = async () => {
    try {
      const response = await fetch(`/api/rides/${rideId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch ride details');
      
      const data = await response.json();
      setRideDetails(data);
    } catch (error) {
      console.error('Error fetching ride details:', error);
      setErrors({ fetch: 'Unable to load ride details. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (category, value) => {
    setRatings(prev => ({
      ...prev,
      [category]: value
    }));
    
    if (errors[category]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[category];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (ratings.overall === 0) {
      newErrors.overall = 'Please provide an overall rating';
    }
    
    if (!review.comment.trim()) {
      newErrors.comment = 'Please share your experience';
    } else if (review.comment.trim().length < 10) {
      newErrors.comment = 'Review must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rideId,
          ratings,
          comment: review.comment,
          wouldRecommend: review.wouldRecommend
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit review');
      }
      
      setShowSuccess(true);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting review:', error);
      setErrors({ submit: error.message || 'Failed to submit review. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="review-loading">
        <div className="spinner"></div>
        <p>Loading ride details...</p>
      </div>
    );
  }

  if (errors.fetch) {
    return (
      <div className="review-error">
        <div className="error-icon">⚠️</div>
        <h3>Unable to Load Ride</h3>
        <p>{errors.fetch}</p>
        <button onClick={() => navigate('/dashboard')} className="btn-back">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="review-rating-page">
      <div className="review-container">
        <div className="review-header">
          <h1>Rate Your Ride</h1>
          <p>Help us improve by sharing your experience</p>
        </div>

        {rideDetails && (
          <div className="ride-summary-card">
            <div className="ride-summary-header">
              <h3>Ride Summary</h3>
              <span className="ride-status">{rideDetails.status}</span>
            </div>
            
            <div className="ride-summary-content">
              <div className="driver-info">
                <img 
                  src={rideDetails.driver?.profilePhoto || '/images/default-avatar.png'} 
                  alt={rideDetails.driver?.name}
                  className="driver-avatar"
                />
                <div>
                  <h4>{rideDetails.driver?.name}</h4>
                  <p className="vehicle-info">
                    {rideDetails.vehicle?.make} {rideDetails.vehicle?.model} • {rideDetails.vehicle?.number}
                  </p>
                </div>
              </div>
              
              <div className="route-info">
                <div className="location">
                  <span className="icon pickup">📍</span>
                  <div>
                    <p className="label">Pickup</p>
                    <p className="address">{rideDetails.pickup?.address}</p>
                  </div>
                </div>
                
                <div className="location">
                  <span className="icon dropoff">🏁</span>
                  <div>
                    <p className="label">Drop-off</p>
                    <p className="address">{rideDetails.dropoff?.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="review-form">
          <div className="rating-section overall-rating">
            <h3>Overall Rating</h3>
            <div className="rating-input">
              <StarRating
                rating={ratings.overall}
                onRatingChange={(value) => handleRatingChange('overall', value)}
                size="large"
              />
            </div>
            {errors.overall && <span className="error-message">{errors.overall}</span>}
          </div>

          <div className="category-ratings">
            <h3>Rate Different Aspects</h3>
            
            <div className="rating-item">
              <div className="rating-label">
                <span className="icon">✨</span>
                <div>
                  <h4>Cleanliness</h4>
                </div>
              </div>
              <StarRating
                rating={ratings.cleanliness}
                onRatingChange={(value) => handleRatingChange('cleanliness', value)}
                size="medium"
              />
            </div>

            <div className="rating-item">
              <div className="rating-label">
                <span className="icon">⏰</span>
                <div>
                  <h4>Punctuality</h4>
                </div>
              </div>
              <StarRating
                rating={ratings.punctuality}
                onRatingChange={(value) => handleRatingChange('punctuality', value)}
                size="medium"
              />
            </div>

            <div className="rating-item">
              <div className="rating-label">
                <span className="icon">🚗</span>
                <div>
                  <h4>Driving Skills</h4>
                </div>
              </div>
              <StarRating
                rating={ratings.driving}
                onRatingChange={(value) => handleRatingChange('driving', value)}
                size="medium"
              />
            </div>

            <div className="rating-item">
              <div className="rating-label">
                <span className="icon">😊</span>
                <div>
                  <h4>Behavior</h4>
                </div>
              </div>
              <StarRating
                rating={ratings.behavior}
                onRatingChange={(value) => handleRatingChange('behavior', value)}
                size="medium"
              />
            </div>
          </div>

          <div className="review-text-section">
            <h3>Share Your Experience</h3>
            <textarea
              className={`review-textarea ${errors.comment ? 'error' : ''}`}
              placeholder="Tell us about your ride experience... (minimum 10 characters)"
              value={review.comment}
              onChange={(e) => {
                setReview(prev => ({ ...prev, comment: e.target.value }));
                if (errors.comment) {
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.comment;
                    return newErrors;
                  });
                }
              }}
              rows="5"
              maxLength="500"
            />
            <div className="character-count">
              {review.comment.length}/500 characters
            </div>
            {errors.comment && <span className="error-message">{errors.comment}</span>}
          </div>

          <div className="form-actions">
            {errors.submit && (
              <div className="submit-error">
                <span className="error-icon">⚠️</span>
                {errors.submit}
              </div>
            )}
            
            <button
              type="submit"
              className="submit-review-btn"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>

      {showSuccess && (
        <div className="success-modal">
          <div className="success-content">
            <div className="success-icon">✓</div>
            <h2>Thank You!</h2>
            <p>Your review has been submitted successfully</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewRating;
