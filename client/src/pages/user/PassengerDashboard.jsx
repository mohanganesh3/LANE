import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PassengerDashboard.css';

const PassengerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedBookings: 0,
    totalSpent: 0,
    rating: 0
  });
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, bookingsRes, walletRes, userRes] = await Promise.all([
        axios.get('/api/user/stats'),
        axios.get('/api/bookings/my-bookings'),
        axios.get('/api/user/wallet'),
        axios.get('/api/auth/me')
      ]);

      setStats(statsRes.data);
      setUser(userRes.data.user);
      
      const bookings = bookingsRes.data.bookings || [];
      setUpcomingBookings(bookings.filter(b => 
        ['CONFIRMED', 'PICKUP_PENDING', 'PICKED_UP'].includes(b.status)
      ).slice(0, 3));
      
      setRecentBookings(bookings.filter(b => 
        ['COMPLETED', 'DROPPED_OFF'].includes(b.status)
      ).slice(0, 5));
      
      setWalletBalance(walletRes.data.balance || 0);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Mock data for development
      setUser({ profile: { firstName: 'Passenger', lastName: 'User' } });
      setStats({
        totalBookings: 24,
        completedBookings: 18,
        totalSpent: 12500,
        rating: 4.7
      });
      setUpcomingBookings(generateMockBookings(3, ['CONFIRMED', 'PICKUP_PENDING']));
      setRecentBookings(generateMockBookings(5, ['COMPLETED']));
      setWalletBalance(850);
      setLoading(false);
    }
  };

  const generateMockBookings = (count, statuses) => {
    const routes = [
      { from: 'Koramangala', to: 'Whitefield' },
      { from: 'Indiranagar', to: 'Electronic City' },
      { from: 'HSR Layout', to: 'Manyata Tech Park' },
      { from: 'BTM Layout', to: 'Hebbal' },
      { from: 'Jayanagar', to: 'Yelahanka' }
    ];

    return Array.from({ length: count }, (_, i) => {
      const route = routes[i % routes.length];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      return {
        _id: `booking-${i + 1}`,
        ride: {
          _id: `ride-${i + 1}`,
          route: {
            from: { address: route.from, coordinates: [12.9716, 77.5946] },
            to: { address: route.to, coordinates: [12.9716, 77.5946] }
          },
          departureTime: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
          rider: {
            _id: `rider-${i + 1}`,
            profile: {
              firstName: ['Rajesh', 'Priya', 'Amit', 'Sneha', 'Karthik'][i % 5],
              lastName: ['Kumar', 'Sharma', 'Patel', 'Reddy', 'Rajan'][i % 5]
            },
            ratingAsRider: 4.5 + Math.random() * 0.5
          },
          vehicle: {
            type: ['Sedan', 'SUV', 'Hatchback'][i % 3],
            model: ['Honda City', 'Toyota Innova', 'Maruti Swift'][i % 3],
            number: `KA-${Math.floor(10 + Math.random() * 90)}-AB-${1000 + i}`
          }
        },
        pickupPoint: { address: route.from },
        dropoffPoint: { address: route.to },
        seatsBooked: Math.floor(1 + Math.random() * 3),
        totalPrice: Math.floor(200 + Math.random() * 500),
        status,
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
      };
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'CONFIRMED': { class: 'success', text: 'Confirmed', icon: 'fa-check-circle' },
      'PICKUP_PENDING': { class: 'warning', text: 'Pickup Pending', icon: 'fa-clock' },
      'PICKED_UP': { class: 'primary', text: 'On Board', icon: 'fa-car' },
      'COMPLETED': { class: 'success', text: 'Completed', icon: 'fa-check-circle' },
      'DROPPED_OFF': { class: 'success', text: 'Completed', icon: 'fa-check-circle' },
      'CANCELLED': { class: 'danger', text: 'Cancelled', icon: 'fa-times-circle' }
    };
    return statusMap[status] || { class: 'primary', text: status, icon: 'fa-info-circle' };
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString()}`;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<i key={i} className="fas fa-star"></i>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<i key={i} className="fas fa-star-half-alt"></i>);
      } else {
        stars.push(<i key={i} className="far fa-star"></i>);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="passenger-dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="passenger-dashboard">
      {/* Welcome Header */}
      <div className="welcome-header">
        <div className="welcome-content">
          <h1>Welcome back, {user?.profile.firstName}! 👋</h1>
          <p>Ready to find your next ride?</p>
        </div>
        <Link to="/rides/search" className="find-rides-btn">
          <i className="fas fa-search"></i> Find Rides
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-content">
            <p className="stat-label">Total Bookings</p>
            <p className="stat-value">{stats.totalBookings}</p>
          </div>
          <div className="stat-icon blue">
            <i className="fas fa-ticket-alt"></i>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <p className="stat-label">Completed</p>
            <p className="stat-value">{stats.completedBookings}</p>
          </div>
          <div className="stat-icon green">
            <i className="fas fa-check-circle"></i>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <p className="stat-label">Total Spent</p>
            <p className="stat-value">{formatCurrency(stats.totalSpent)}</p>
          </div>
          <div className="stat-icon yellow">
            <i className="fas fa-wallet"></i>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <p className="stat-label">Your Rating</p>
            <div className="stat-rating">
              <p className="stat-value">{stats.rating.toFixed(1)}</p>
              <div className="stars-small">
                {renderStars(stats.rating)}
              </div>
            </div>
          </div>
          <div className="stat-icon purple">
            <i className="fas fa-star"></i>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Upcoming Bookings */}
        <div className="bookings-section main-section">
          <div className="section-header">
            <h2>Upcoming Bookings</h2>
            <Link to="/bookings/my-bookings" className="view-all-link">
              View All <i className="fas fa-arrow-right"></i>
            </Link>
          </div>

          {upcomingBookings.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-calendar-times"></i>
              <p>No upcoming bookings</p>
              <Link to="/rides/search" className="action-btn">
                Find Rides
              </Link>
            </div>
          ) : (
            <div className="bookings-list">
              {upcomingBookings.map(booking => {
                const badge = getStatusBadge(booking.status);
                return (
                  <div key={booking._id} className="booking-card">
                    <div className="booking-header">
                      <div className="status-date">
                        <span className={`status-badge ${badge.class}`}>
                          <i className={`fas ${badge.icon}`}></i> {badge.text}
                        </span>
                        <span className="booking-date">{formatDate(booking.ride.departureTime)}</span>
                      </div>
                      <span className="booking-time">{formatTime(booking.ride.departureTime)}</span>
                    </div>

                    <div className="route-display">
                      <div className="route-point from">
                        <i className="fas fa-circle"></i>
                        <span>{booking.pickupPoint.address}</span>
                      </div>
                      <div className="route-line-container">
                        <div className="route-line"></div>
                      </div>
                      <div className="route-point to">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{booking.dropoffPoint.address}</span>
                      </div>
                    </div>

                    <div className="booking-details">
                      <div className="driver-info">
                        <div className="driver-avatar">
                          {booking.ride.rider.profile.firstName[0]}{booking.ride.rider.profile.lastName[0]}
                        </div>
                        <div className="driver-meta">
                          <span className="driver-name">
                            {booking.ride.rider.profile.firstName} {booking.ride.rider.profile.lastName}
                          </span>
                          <div className="driver-rating">
                            <i className="fas fa-star"></i> {booking.ride.rider.ratingAsRider?.toFixed(1) || 'N/A'}
                          </div>
                        </div>
                      </div>

                      <div className="booking-meta">
                        <div className="meta-item">
                          <i className="fas fa-users"></i> {booking.seatsBooked} seat{booking.seatsBooked > 1 ? 's' : ''}
                        </div>
                        <div className="meta-item price">
                          {formatCurrency(booking.totalPrice)}
                        </div>
                      </div>
                    </div>

                    <div className="booking-actions">
                      <Link to={`/bookings/${booking._id}`} className="btn-view">
                        View Details
                      </Link>
                      {booking.status === 'CONFIRMED' && (
                        <Link to={`/tracking/${booking._id}`} className="btn-track">
                          <i className="fas fa-map-marked-alt"></i> Track
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="sidebar-section">
          {/* Wallet Card */}
          <div className="wallet-card">
            <div className="wallet-header">
              <h3>LANE Wallet</h3>
              <i className="fas fa-wallet"></i>
            </div>
            <div className="wallet-balance">
              <p className="balance-label">Available Balance</p>
              <p className="balance-amount">{formatCurrency(walletBalance)}</p>
            </div>
            <button className="add-money-btn">
              <i className="fas fa-plus"></i> Add Money
            </button>
          </div>

          {/* Recent Bookings */}
          <div className="recent-bookings">
            <h3>Recent Trips</h3>
            {recentBookings.length === 0 ? (
              <p className="no-data">No recent trips</p>
            ) : (
              <div className="recent-list">
                {recentBookings.map(booking => (
                  <Link 
                    key={booking._id} 
                    to={`/bookings/${booking._id}`} 
                    className="recent-item"
                  >
                    <div className="recent-route">
                      <span className="from">{booking.pickupPoint.address.split(',')[0]}</span>
                      <i className="fas fa-arrow-right"></i>
                      <span className="to">{booking.dropoffPoint.address.split(',')[0]}</span>
                    </div>
                    <div className="recent-meta">
                      <span className="recent-date">{formatDate(booking.createdAt)}</span>
                      <span className="recent-price">{formatCurrency(booking.totalPrice)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="actions-grid">
              <Link to="/rides/search" className="action-card">
                <i className="fas fa-search"></i>
                <span>Find Rides</span>
              </Link>
              <Link to="/bookings/my-bookings" className="action-card">
                <i className="fas fa-list"></i>
                <span>My Bookings</span>
              </Link>
              <Link to="/user/profile" className="action-card">
                <i className="fas fa-user"></i>
                <span>Profile</span>
              </Link>
              <Link to="/help" className="action-card">
                <i className="fas fa-question-circle"></i>
                <span>Help</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassengerDashboard;
