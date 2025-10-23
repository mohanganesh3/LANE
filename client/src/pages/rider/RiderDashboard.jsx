import { useState, useEffect } from 'react';
import { rideAPI } from '../../services/api';
import Sidebar from '../../components/layout/Sidebar';
import Breadcrumb from '../../components/layout/Breadcrumb';
import './RiderDashboard.css';

const RiderDashboard = () => {
  const [stats, setStats] = useState({
    totalRides: 0,
    totalEarnings: 0,
    averageRating: 0,
    activeRides: 0
  });
  const [recentRides, setRecentRides] = useState([]);
  const [upcomingRides, setUpcomingRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data for now
      setStats({
        totalRides: 127,
        totalEarnings: 45680,
        averageRating: 4.8,
        activeRides: 3
      });
      setRecentRides([
        { id: 1, from: 'Bangalore', to: 'Mysore', date: '2025-10-20', earnings: 450, passengers: 3 },
        { id: 2, from: 'Bangalore', to: 'Coorg', date: '2025-10-19', earnings: 890, passengers: 4 },
        { id: 3, from: 'Bangalore', to: 'Chennai', date: '2025-10-18', earnings: 1200, passengers: 2 }
      ]);
      setUpcomingRides([
        { id: 4, from: 'Bangalore', to: 'Hyderabad', date: '2025-10-25', time: '06:00 AM', seats: 4 },
        { id: 5, from: 'Bangalore', to: 'Goa', date: '2025-10-27', time: '05:00 AM', seats: 3 }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar userRole="rider" />
        <main className="dashboard-content">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar userRole="rider" />
      <main className="dashboard-content">
        <div className="dashboard-header">
          <Breadcrumb />
          <h1>Rider Dashboard</h1>
          <p className="welcome-text">Welcome back! Here's your ride summary</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card earnings">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>Total Earnings</h3>
              <p className="stat-value">₹{stats.totalEarnings.toLocaleString()}</p>
              <span className="stat-change positive">+12% this month</span>
            </div>
          </div>

          <div className="stat-card rides">
            <div className="stat-icon">🚗</div>
            <div className="stat-info">
              <h3>Total Rides</h3>
              <p className="stat-value">{stats.totalRides}</p>
              <span className="stat-change positive">+8 this week</span>
            </div>
          </div>

          <div className="stat-card rating">
            <div className="stat-icon">⭐</div>
            <div className="stat-info">
              <h3>Average Rating</h3>
              <p className="stat-value">{stats.averageRating}</p>
              <span className="stat-change">Based on 89 reviews</span>
            </div>
          </div>

          <div className="stat-card active">
            <div className="stat-icon">🔥</div>
            <div className="stat-info">
              <h3>Active Rides</h3>
              <p className="stat-value">{stats.activeRides}</p>
              <span className="stat-change">Currently ongoing</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button className="action-btn primary">
            <span className="btn-icon">➕</span>
            Post New Ride
          </button>
          <button className="action-btn secondary">
            <span className="btn-icon">📋</span>
            View Bookings
          </button>
          <button className="action-btn secondary">
            <span className="btn-icon">📊</span>
            Earnings Report
          </button>
          <button className="action-btn secondary">
            <span className="btn-icon">🚙</span>
            Vehicle Info
          </button>
        </div>

        {/* Recent Rides */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Rides</h2>
            <a href="/my-rides" className="view-all">View All →</a>
          </div>
          <div className="rides-table">
            <table>
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Date</th>
                  <th>Passengers</th>
                  <th>Earnings</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRides.map(ride => (
                  <tr key={ride.id}>
                    <td>
                      <div className="route-cell">
                        <span className="from">{ride.from}</span>
                        <span className="arrow">→</span>
                        <span className="to">{ride.to}</span>
                      </div>
                    </td>
                    <td>{new Date(ride.date).toLocaleDateString()}</td>
                    <td>{ride.passengers} passengers</td>
                    <td className="earnings-cell">₹{ride.earnings}</td>
                    <td><span className="status-badge completed">Completed</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Rides */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Upcoming Rides</h2>
            <a href="/my-rides?filter=upcoming" className="view-all">View All →</a>
          </div>
          <div className="upcoming-rides-grid">
            {upcomingRides.map(ride => (
              <div key={ride.id} className="upcoming-ride-card">
                <div className="ride-date-badge">
                  {new Date(ride.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="ride-details">
                  <div className="route">
                    <strong>{ride.from}</strong>
                    <span className="arrow-icon">→</span>
                    <strong>{ride.to}</strong>
                  </div>
                  <div className="ride-meta">
                    <span>🕒 {ride.time}</span>
                    <span>💺 {ride.seats} seats available</span>
                  </div>
                </div>
                <button className="manage-btn">Manage</button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RiderDashboard;
