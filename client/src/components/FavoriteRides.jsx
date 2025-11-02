import React, { useState, useEffect } from 'react';
import './FavoriteRides.css';

const FavoriteRides = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/rides/favorites', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setFavorites(data.favorites);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setLoading(false);
    }
  };

  const toggleFavorite = async (rideId) => {
    try {
      const isFavorite = favorites.some(f => f.ride._id === rideId);
      const method = isFavorite ? 'DELETE' : 'POST';
      
      await fetch(`/api/rides/${rideId}/favorite`, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (isFavorite) {
        setFavorites(prev => prev.filter(f => f.ride._id !== rideId));
      } else {
        fetchFavorites();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const removeFavorite = async (favoriteId) => {
    try {
      await fetch(`/api/favorites/${favoriteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setFavorites(prev => prev.filter(f => f._id !== favoriteId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="favorites-loading">
        <div className="spinner"></div>
        <p>Loading your favorites...</p>
      </div>
    );
  }

  return (
    <div className="favorites-container">
      <div className="favorites-header">
        <h2>
          <i className="fas fa-heart"></i>
          Favorite Rides
        </h2>
        <p>Quick access to your preferred rides and drivers</p>
      </div>

      {favorites.length === 0 ? (
        <div className="favorites-empty">
          <i className="fas fa-heart-broken"></i>
          <h3>No favorites yet</h3>
          <p>Start adding rides to your favorites for quick booking</p>
        </div>
      ) : (
        <div className="favorites-grid">
          {favorites.map((favorite) => (
            <div key={favorite._id} className="favorite-card">
              <button
                className="remove-favorite"
                onClick={() => removeFavorite(favorite._id)}
                title="Remove from favorites"
              >
                <i className="fas fa-times"></i>
              </button>

              <div className="favorite-header">
                <img
                  src={favorite.ride.rider?.profilePhoto || '/images/default-avatar.png'}
                  alt={favorite.ride.rider?.name}
                />
                <div className="rider-info">
                  <h3>{favorite.ride.rider?.name}</h3>
                  <div className="rating">
                    <i className="fas fa-star"></i>
                    <span>{favorite.ride.rider?.rating?.toFixed(1) || '5.0'}</span>
                  </div>
                </div>
              </div>

              <div className="favorite-route">
                <div className="route-point">
                  <i className="fas fa-map-marker-alt start"></i>
                  <span>{favorite.ride.from?.address}</span>
                </div>
                <div className="route-line"></div>
                <div className="route-point">
                  <i className="fas fa-map-marker-alt end"></i>
                  <span>{favorite.ride.to?.address}</span>
                </div>
              </div>

              <div className="favorite-details">
                <div className="detail-item">
                  <i className="fas fa-car"></i>
                  <span>{favorite.ride.vehicle?.model || 'Vehicle'}</span>
                </div>
                <div className="detail-item">
                  <i className="fas fa-users"></i>
                  <span>{favorite.ride.seatsAvailable} seats</span>
                </div>
                <div className="detail-item">
                  <i className="fas fa-rupee-sign"></i>
                  <span>{favorite.ride.pricePerSeat}/seat</span>
                </div>
              </div>

              <div className="favorite-stats">
                <span className="stat">
                  <i className="fas fa-clock"></i>
                  Added {new Date(favorite.createdAt).toLocaleDateString()}
                </span>
                {favorite.timesBooked > 0 && (
                  <span className="stat">
                    <i className="fas fa-check-circle"></i>
                    Booked {favorite.timesBooked} times
                  </span>
                )}
              </div>

              <button className="btn-book">
                <i className="fas fa-calendar-check"></i>
                Quick Book
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoriteRides;
