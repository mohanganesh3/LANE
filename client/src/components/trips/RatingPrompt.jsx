import React, { useState } from 'react';
import { apiService } from '../../services/apiService';
import './RatingPrompt.css';

/**
 * RatingPrompt Component
 * Allows users to rate driver and provide feedback after trip
 */
const RatingPrompt = ({ trip, onRatingSubmit, onSkip }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Predefined feedback tags
  const feedbackTags = {
    5: ['Excellent Service', 'Professional', 'Clean Vehicle', 'Safe Driving', 'On Time'],
    4: ['Good Service', 'Polite', 'Smooth Ride', 'Helpful'],
    3: ['Average', 'Could be better', 'Okay'],
    2: ['Late Arrival', 'Poor Navigation', 'Uncomfortable', 'Unprofessional'],
    1: ['Very Poor', 'Rude Behavior', 'Unsafe Driving', 'Dirty Vehicle', 'Wrong Route'],
  };

  // Get available tags based on rating
  const availableTags = feedbackTags[rating] || [];

  // Handle rating click
  const handleRatingClick = (value) => {
    setRating(value);
    setSelectedTags([]); // Reset tags when rating changes
  };

  // Handle tag selection
  const handleTagClick = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const ratingData = {
        tripId: trip._id,
        driverId: trip.driver._id,
        rating,
        feedback,
        tags: selectedTags,
      };

      await apiService.post('/reviews', ratingData);

      // Call success callback
      if (onRatingSubmit) {
        onRatingSubmit(ratingData);
      }
    } catch (err) {
      console.error('Failed to submit rating:', err);
      setError('Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get rating text
  const getRatingText = (value) => {
    const texts = {
      1: 'Poor',
      2: 'Below Average',
      3: 'Average',
      4: 'Good',
      5: 'Excellent',
    };
    return texts[value] || 'Rate your experience';
  };

  return (
    <div className="rating-prompt-container">
      <div className="rating-card">
        {/* Header */}
        <div className="rating-header">
          <h2>Rate Your Trip</h2>
          <p>How was your experience with {trip.driver?.name || 'your driver'}?</p>
        </div>

        {/* Driver Info */}
        {trip.driver && (
          <div className="driver-info-compact">
            <div className="driver-avatar-small">
              {trip.driver.profilePhoto ? (
                <img src={trip.driver.profilePhoto} alt={trip.driver.name} />
              ) : (
                <div className="avatar-placeholder-small">
                  {trip.driver.name?.charAt(0) || 'D'}
                </div>
              )}
            </div>
            <div className="driver-details-small">
              <span className="driver-name-small">{trip.driver.name}</span>
              <span className="vehicle-info-small">
                {trip.vehicle?.make} {trip.vehicle?.model}
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="rating-form">
          {/* Star Rating */}
          <div className="star-rating-section">
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star ${star <= (hoverRating || rating) ? 'active' : ''}`}
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`${star} star${star !== 1 ? 's' : ''}`}
                >
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </button>
              ))}
            </div>
            <p className="rating-text">{getRatingText(hoverRating || rating)}</p>
          </div>

          {/* Feedback Tags */}
          {rating > 0 && availableTags.length > 0 && (
            <div className="feedback-tags-section">
              <label>What went well? (Optional)</label>
              <div className="feedback-tags">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`feedback-tag ${selectedTags.includes(tag) ? 'selected' : ''}`}
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Written Feedback */}
          <div className="feedback-section">
            <label htmlFor="feedback">Additional Feedback (Optional)</label>
            <textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your experience..."
              rows="4"
              maxLength="500"
            />
            <span className="char-count">{feedback.length}/500</span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="rating-actions">
            {onSkip && (
              <button
                type="button"
                className="btn-skip"
                onClick={onSkip}
                disabled={isSubmitting}
              >
                Skip for Now
              </button>
            )}
            <button
              type="submit"
              className="btn-submit-rating"
              disabled={rating === 0 || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-small" />
                  Submitting...
                </>
              ) : (
                'Submit Rating'
              )}
            </button>
          </div>
        </form>

        {/* Rating Info */}
        <div className="rating-info">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4"/>
            <path d="M12 8h.01"/>
          </svg>
          <p>Your feedback helps us improve our service and helps other riders</p>
        </div>
      </div>
    </div>
  );
};

export default RatingPrompt;
