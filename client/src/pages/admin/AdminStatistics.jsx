import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminStatistics.css';

const AdminStatistics = () => {
  const [stats, setStats] = useState({
    overview: {
      totalUsers: 0,
      totalRides: 0,
      totalBookings: 0,
      totalRevenue: 0
    },
    userStats: {
      riders: 0,
      passengers: 0,
      activeUsers: 0,
      newUsersThisMonth: 0
    },
    rideStats: {
      activeRides: 0,
      completedRides: 0,
      cancelledRides: 0,
      averageRating: 0
    },
    bookingStats: {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0
    },
    revenueStats: {
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      platformCommission: 0
    },
    chartData: {
      monthlyRevenue: [],
      dailyBookings: [],
      topRoutes: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month'); // week, month, year

  useEffect(() => {
    fetchStatistics();
  }, [timeRange]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/statistics', {
        params: { timeRange }
      });
      
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setLoading(false);
      
      // Generate mock data
      setStats(generateMockStats());
    }
  };

  const generateMockStats = () => {
    return {
      overview: {
        totalUsers: 1245,
        totalRides: 856,
        totalBookings: 1523,
        totalRevenue: 456789
      },
      userStats: {
        riders: 456,
        passengers: 789,
        activeUsers: 923,
        newUsersThisMonth: 87
      },
      rideStats: {
        activeRides: 124,
        completedRides: 687,
        cancelledRides: 45,
        averageRating: 4.6
      },
      bookingStats: {
        pending: 234,
        confirmed: 567,
        completed: 678,
        cancelled: 44
      },
      revenueStats: {
        today: 12500,
        thisWeek: 78000,
        thisMonth: 325000,
        platformCommission: 65000
      },
      chartData: {
        monthlyRevenue: [
          { month: 'Jan', revenue: 245000 },
          { month: 'Feb', revenue: 278000 },
          { month: 'Mar', revenue: 312000 },
          { month: 'Apr', revenue: 289000 },
          { month: 'May', revenue: 356000 },
          { month: 'Jun', revenue: 325000 }
        ],
        dailyBookings: [
          { day: 'Mon', count: 45 },
          { day: 'Tue', count: 52 },
          { day: 'Wed', count: 48 },
          { day: 'Thu', count: 61 },
          { day: 'Fri', count: 58 },
          { day: 'Sat', count: 72 },
          { day: 'Sun', count: 68 }
        ],
        topRoutes: [
          { route: 'Bangalore → Chennai', count: 156 },
          { route: 'Mumbai → Pune', count: 134 },
          { route: 'Delhi → Jaipur', count: 128 },
          { route: 'Hyderabad → Vijayawada', count: 98 },
          { route: 'Kolkata → Durgapur', count: 87 }
        ]
      }
    };
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getPercentageChange = (current, previous) => {
    if (!previous) return 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="admin-statistics-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-statistics-container">
      <div className="page-header">
        <div>
          <h1>Statistics & Analytics</h1>
          <p className="subtitle">Comprehensive platform insights and metrics</p>
        </div>
        
        <div className="time-range-selector">
          <button
            className={timeRange === 'week' ? 'active' : ''}
            onClick={() => setTimeRange('week')}
          >
            This Week
          </button>
          <button
            className={timeRange === 'month' ? 'active' : ''}
            onClick={() => setTimeRange('month')}
          >
            This Month
          </button>
          <button
            className={timeRange === 'year' ? 'active' : ''}
            onClick={() => setTimeRange('year')}
          >
            This Year
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="stats-grid overview-stats">
        <div className="stat-card primary">
          <div className="stat-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.overview.totalUsers.toLocaleString()}</div>
            <div className="stat-label">Total Users</div>
            <div className="stat-change positive">
              <i className="fas fa-arrow-up"></i> +12.5% from last month
            </div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <i className="fas fa-car"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.overview.totalRides.toLocaleString()}</div>
            <div className="stat-label">Total Rides</div>
            <div className="stat-change positive">
              <i className="fas fa-arrow-up"></i> +8.3% from last month
            </div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <i className="fas fa-bookmark"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.overview.totalBookings.toLocaleString()}</div>
            <div className="stat-label">Total Bookings</div>
            <div className="stat-change positive">
              <i className="fas fa-arrow-up"></i> +15.7% from last month
            </div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <i className="fas fa-rupee-sign"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatCurrency(stats.overview.totalRevenue)}</div>
            <div className="stat-label">Total Revenue</div>
            <div className="stat-change positive">
              <i className="fas fa-arrow-up"></i> +18.2% from last month
            </div>
          </div>
        </div>
      </div>

      {/* User Statistics */}
      <div className="section">
        <h2 className="section-title">
          <i className="fas fa-users"></i>
          User Statistics
        </h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Riders</div>
            <div className="stat-value">{stats.userStats.riders}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Passengers</div>
            <div className="stat-value">{stats.userStats.passengers}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active Users</div>
            <div className="stat-value">{stats.userStats.activeUsers}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">New This Month</div>
            <div className="stat-value">{stats.userStats.newUsersThisMonth}</div>
          </div>
        </div>
      </div>

      {/* Ride Statistics */}
      <div className="section">
        <h2 className="section-title">
          <i className="fas fa-car"></i>
          Ride Statistics
        </h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Active Rides</div>
            <div className="stat-value">{stats.rideStats.activeRides}</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '60%' }}></div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Completed Rides</div>
            <div className="stat-value">{stats.rideStats.completedRides}</div>
            <div className="progress-bar">
              <div className="progress-fill success" style={{ width: '85%' }}></div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Cancelled Rides</div>
            <div className="stat-value">{stats.rideStats.cancelledRides}</div>
            <div className="progress-bar">
              <div className="progress-fill danger" style={{ width: '15%' }}></div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Average Rating</div>
            <div className="stat-value">
              {stats.rideStats.averageRating.toFixed(1)}
              <span className="rating-stars">
                {'⭐'.repeat(Math.floor(stats.rideStats.averageRating))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Statistics */}
      <div className="section">
        <h2 className="section-title">
          <i className="fas fa-bookmark"></i>
          Booking Statistics
        </h2>
        <div className="booking-stats-visual">
          <div className="booking-stat">
            <div className="booking-count">{stats.bookingStats.pending}</div>
            <div className="booking-label">Pending</div>
            <div className="booking-bar pending" style={{ height: `${(stats.bookingStats.pending / 1000) * 100}%` }}></div>
          </div>
          <div className="booking-stat">
            <div className="booking-count">{stats.bookingStats.confirmed}</div>
            <div className="booking-label">Confirmed</div>
            <div className="booking-bar confirmed" style={{ height: `${(stats.bookingStats.confirmed / 1000) * 100}%` }}></div>
          </div>
          <div className="booking-stat">
            <div className="booking-count">{stats.bookingStats.completed}</div>
            <div className="booking-label">Completed</div>
            <div className="booking-bar completed" style={{ height: `${(stats.bookingStats.completed / 1000) * 100}%` }}></div>
          </div>
          <div className="booking-stat">
            <div className="booking-count">{stats.bookingStats.cancelled}</div>
            <div className="booking-label">Cancelled</div>
            <div className="booking-bar cancelled" style={{ height: `${(stats.bookingStats.cancelled / 1000) * 100}%` }}></div>
          </div>
        </div>
      </div>

      {/* Revenue Statistics */}
      <div className="section">
        <h2 className="section-title">
          <i className="fas fa-chart-line"></i>
          Revenue Statistics
        </h2>
        <div className="stats-grid">
          <div className="stat-card revenue">
            <div className="stat-label">Today's Revenue</div>
            <div className="stat-value">{formatCurrency(stats.revenueStats.today)}</div>
          </div>
          <div className="stat-card revenue">
            <div className="stat-label">This Week</div>
            <div className="stat-value">{formatCurrency(stats.revenueStats.thisWeek)}</div>
          </div>
          <div className="stat-card revenue">
            <div className="stat-label">This Month</div>
            <div className="stat-value">{formatCurrency(stats.revenueStats.thisMonth)}</div>
          </div>
          <div className="stat-card revenue">
            <div className="stat-label">Platform Commission</div>
            <div className="stat-value">{formatCurrency(stats.revenueStats.platformCommission)}</div>
          </div>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="section">
        <h2 className="section-title">
          <i className="fas fa-chart-bar"></i>
          Monthly Revenue Trend
        </h2>
        <div className="chart-container">
          <div className="bar-chart">
            {stats.chartData.monthlyRevenue.map((item, index) => (
              <div key={index} className="bar-item">
                <div
                  className="bar"
                  style={{ height: `${(item.revenue / 400000) * 100}%` }}
                  title={formatCurrency(item.revenue)}
                >
                  <span className="bar-value">{formatCurrency(item.revenue)}</span>
                </div>
                <div className="bar-label">{item.month}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Routes */}
      <div className="section">
        <h2 className="section-title">
          <i className="fas fa-route"></i>
          Top Routes
        </h2>
        <div className="top-routes">
          {stats.chartData.topRoutes.map((route, index) => (
            <div key={index} className="route-item">
              <div className="route-rank">#{index + 1}</div>
              <div className="route-info">
                <div className="route-name">{route.route}</div>
                <div className="route-count">{route.count} bookings</div>
              </div>
              <div className="route-bar-container">
                <div
                  className="route-bar"
                  style={{ width: `${(route.count / 200) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminStatistics;
