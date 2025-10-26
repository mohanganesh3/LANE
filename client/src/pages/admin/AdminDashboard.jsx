import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: { total: 0, riders: 0, passengers: 0, pendingVerifications: 0 },
    rides: { total: 0, active: 0, completed: 0 },
    bookings: { total: 0, pending: 0, confirmed: 0 },
    revenue: 0,
    platformRevenue: 0,
    revenueBookings: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentRides, setRecentRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unresolvedDeviations, setUnresolvedDeviations] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/dashboard');
      
      setStats(response.data.stats);
      setRecentUsers(response.data.recentUsers);
      setRecentRides(response.data.recentRides);
      setUnresolvedDeviations(response.data.unresolvedDeviations || 0);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use mock data for development
      setStats({
        users: { total: 1250, riders: 485, passengers: 765, pendingVerifications: 23 },
        rides: { total: 3420, active: 142, completed: 2890 },
        bookings: { total: 5670, pending: 89, confirmed: 234 },
        revenue: 284500,
        platformRevenue: 28350,
        revenueBookings: 567
      });
      setRecentUsers(generateMockUsers());
      setRecentRides(generateMockRides());
      setUnresolvedDeviations(12);
      setLoading(false);
    }
  };

  const generateMockUsers = () => {
    const roles = ['RIDER', 'PASSENGER'];
    const statuses = ['ACTIVE', 'PENDING', 'SUSPENDED'];
    return Array.from({ length: 10 }, (_, i) => ({
      _id: `user-${i + 1}`,
      profile: {
        firstName: ['Rajesh', 'Priya', 'Amit', 'Sneha', 'Vikram'][Math.floor(Math.random() * 5)],
        lastName: ['Kumar', 'Sharma', 'Patel', 'Reddy', 'Singh'][Math.floor(Math.random() * 5)]
      },
      email: `user${i + 1}@example.com`,
      role: roles[Math.floor(Math.random() * roles.length)],
      accountStatus: statuses[Math.floor(Math.random() * statuses.length)],
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    }));
  };

  const generateMockRides = () => {
    const statuses = ['ACTIVE', 'PENDING', 'COMPLETED', 'CANCELLED'];
    const routes = [
      { from: 'Koramangala', to: 'Whitefield' },
      { from: 'Indiranagar', to: 'Electronic City' },
      { from: 'HSR Layout', to: 'Manyata Tech Park' },
      { from: 'BTM Layout', to: 'Hebbal' }
    ];
    
    return Array.from({ length: 10 }, (_, i) => {
      const route = routes[Math.floor(Math.random() * routes.length)];
      return {
        _id: `ride-${i + 1}`,
        rider: {
          _id: `rider-${i + 1}`,
          profile: {
            firstName: ['Karthik', 'Dinesh', 'Sujal', 'Akshaya', 'Mohan'][Math.floor(Math.random() * 5)],
            lastName: ['Kumar', 'Naik', 'Bandi', 'Aienavolu', 'Ganesh'][Math.floor(Math.random() * 5)]
          },
          email: `rider${i + 1}@example.com`
        },
        route: {
          from: {
            address: route.from,
            coordinates: [12.9716 + Math.random() * 0.1, 77.5946 + Math.random() * 0.1]
          },
          to: {
            address: route.to,
            coordinates: [12.9716 + Math.random() * 0.1, 77.5946 + Math.random() * 0.1]
          }
        },
        price: Math.floor(200 + Math.random() * 600),
        availableSeats: Math.floor(1 + Math.random() * 4),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        departureTime: new Date(Date.now() + Math.random() * 48 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      };
    });
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'ACTIVE': 'success',
      'COMPLETED': 'primary',
      'PENDING': 'warning',
      'SUSPENDED': 'danger',
      'CANCELLED': 'danger',
      'CONFIRMED': 'success'
    };
    return `badge badge-${statusMap[status] || 'primary'}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Dashboard Overview</h1>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={fetchDashboardData}>
            <i className="fas fa-sync-alt"></i> Refresh
          </button>
        </div>
      </div>

      <div className="admin-content">
        {/* Stats Grid */}
        <div className="stats-grid">
          {/* Total Users */}
          <div className="stat-card">
            <div className="stat-header">
              <div>
                <div className="stat-value">{stats.users.total.toLocaleString()}</div>
                <div className="stat-label">Total Users</div>
              </div>
              <div className="stat-icon primary">
                <i className="fas fa-users"></i>
              </div>
            </div>
            <div className="stat-breakdown">
              <span>{stats.users.riders} Riders</span>
              <span>{stats.users.passengers} Passengers</span>
            </div>
          </div>

          {/* Pending Verifications */}
          <div className="stat-card warning">
            <div className="stat-header">
              <div>
                <div className="stat-value">{stats.users.pendingVerifications}</div>
                <div className="stat-label">Pending Verifications</div>
              </div>
              <div className="stat-icon warning">
                <i className="fas fa-clock"></i>
              </div>
            </div>
            <Link to="/admin/verifications" className="stat-link">
              View Details →
            </Link>
          </div>

          {/* Total Rides */}
          <div className="stat-card success">
            <div className="stat-header">
              <div>
                <div className="stat-value">{stats.rides.total.toLocaleString()}</div>
                <div className="stat-label">Total Rides</div>
              </div>
              <div className="stat-icon success">
                <i className="fas fa-car"></i>
              </div>
            </div>
            <div className="stat-breakdown">
              <span>{stats.rides.active} Active</span>
              <span>{stats.rides.completed} Completed</span>
            </div>
          </div>

          {/* Total Bookings */}
          <div className="stat-card">
            <div className="stat-header">
              <div>
                <div className="stat-value">{stats.bookings.total.toLocaleString()}</div>
                <div className="stat-label">Total Bookings</div>
              </div>
              <div className="stat-icon primary">
                <i className="fas fa-ticket-alt"></i>
              </div>
            </div>
            <div className="stat-breakdown">
              <span>{stats.bookings.pending} Pending</span>
              <span>{stats.bookings.confirmed} Confirmed</span>
            </div>
          </div>

          {/* Revenue */}
          <div className="stat-card success">
            <div className="stat-header">
              <div>
                <div className="stat-value">{formatCurrency(stats.revenue)}</div>
                <div className="stat-label">Total Revenue</div>
              </div>
              <div className="stat-icon success">
                <i className="fas fa-rupee-sign"></i>
              </div>
            </div>
            <div className="stat-breakdown">
              <span>{stats.revenueBookings} Completed Bookings</span>
            </div>
          </div>

          {/* Platform Revenue */}
          <div className="stat-card success">
            <div className="stat-header">
              <div>
                <div className="stat-value">{formatCurrency(stats.platformRevenue)}</div>
                <div className="stat-label">Platform Commission</div>
              </div>
              <div className="stat-icon success">
                <i className="fas fa-chart-line"></i>
              </div>
            </div>
            <div className="stat-breakdown">
              <span>₹50 per booking</span>
            </div>
          </div>

          {/* Route Deviations */}
          {unresolvedDeviations > 0 && (
            <div className="stat-card danger">
              <div className="stat-header">
                <div>
                  <div className="stat-value">{unresolvedDeviations}</div>
                  <div className="stat-label">Geo-Fence Violations</div>
                </div>
                <div className="stat-icon danger">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
              </div>
              <Link to="/admin/geo-fencing" className="stat-link">
                View Violations →
              </Link>
            </div>
          )}

          {/* SOS Alerts */}
          <div className="stat-card danger">
            <div className="stat-header">
              <div>
                <div className="stat-value">0</div>
                <div className="stat-label">Active SOS</div>
              </div>
              <div className="stat-icon danger">
                <i className="fas fa-bell"></i>
              </div>
            </div>
            <Link to="/admin/sos" className="stat-link">
              SOS Dashboard →
            </Link>
          </div>
        </div>

        {/* Recent Users */}
        <div className="recent-section">
          <div className="section-header">
            <h3>Recent Users</h3>
            <Link to="/admin/users" className="view-all-link">
              View All →
            </Link>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {user.profile.firstName[0]}{user.profile.lastName[0]}
                        </div>
                        <span>{user.profile.firstName} {user.profile.lastName}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td><span className={`badge badge-${user.role === 'RIDER' ? 'primary' : 'success'}`}>
                      {user.role}
                    </span></td>
                    <td><span className={getStatusBadgeClass(user.accountStatus)}>
                      {user.accountStatus}
                    </span></td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <Link to={`/admin/users/${user._id}`} className="btn-icon" title="View Details">
                        <i className="fas fa-eye"></i>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Rides */}
        <div className="recent-section">
          <div className="section-header">
            <h3>Recent Rides</h3>
            <Link to="/admin/rides" className="view-all-link">
              View All →
            </Link>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Rider</th>
                  <th>Route</th>
                  <th>Price</th>
                  <th>Seats</th>
                  <th>Status</th>
                  <th>Departure</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentRides.map(ride => (
                  <tr key={ride._id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {ride.rider.profile.firstName[0]}{ride.rider.profile.lastName[0]}
                        </div>
                        <span>{ride.rider.profile.firstName} {ride.rider.profile.lastName}</span>
                      </div>
                    </td>
                    <td>
                      <div className="route-cell">
                        <span className="from">{ride.route.from.address}</span>
                        <i className="fas fa-arrow-right"></i>
                        <span className="to">{ride.route.to.address}</span>
                      </div>
                    </td>
                    <td><strong>{formatCurrency(ride.price)}</strong></td>
                    <td>{ride.availableSeats}</td>
                    <td><span className={getStatusBadgeClass(ride.status)}>
                      {ride.status}
                    </span></td>
                    <td>{formatDate(ride.departureTime)}</td>
                    <td>
                      <Link to={`/admin/rides/${ride._id}`} className="btn-icon" title="View Details">
                        <i className="fas fa-eye"></i>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
