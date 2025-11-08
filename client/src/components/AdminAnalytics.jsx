import React, { useState, useEffect } from 'react';
import './AdminAnalytics.css';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="admin-analytics">
      <div className="analytics-header">
        <h1>Analytics Dashboard</h1>
        <div className="time-range-selector">
          <button
            className={timeRange === 'day' ? 'active' : ''}
            onClick={() => setTimeRange('day')}
          >
            Today
          </button>
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

      <div className="metrics-grid">
        <div className="metric-card revenue">
          <div className="metric-icon">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="metric-content">
            <span className="metric-label">Total Revenue</span>
            <span className="metric-value">₹{analytics?.revenue?.total?.toLocaleString() || 0}</span>
            <span className="metric-change positive">
              +{analytics?.revenue?.growth || 0}% from last period
            </span>
          </div>
        </div>

        <div className="metric-card rides">
          <div className="metric-icon">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
            </svg>
          </div>
          <div className="metric-content">
            <span className="metric-label">Total Rides</span>
            <span className="metric-value">{analytics?.rides?.total?.toLocaleString() || 0}</span>
            <span className="metric-change positive">
              +{analytics?.rides?.growth || 0}% from last period
            </span>
          </div>
        </div>

        <div className="metric-card users">
          <div className="metric-icon">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
          </div>
          <div className="metric-content">
            <span className="metric-label">Active Users</span>
            <span className="metric-value">{analytics?.users?.active?.toLocaleString() || 0}</span>
            <span className="metric-change positive">
              +{analytics?.users?.growth || 0}% from last period
            </span>
          </div>
        </div>

        <div className="metric-card drivers">
          <div className="metric-icon">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="metric-content">
            <span className="metric-label">Active Drivers</span>
            <span className="metric-value">{analytics?.drivers?.active?.toLocaleString() || 0}</span>
            <span className="metric-change positive">
              +{analytics?.drivers?.growth || 0}% from last period
            </span>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <h3>Revenue Trend</h3>
          <div className="chart-placeholder">
            <svg viewBox="0 0 400 200" className="line-chart">
              <polyline
                points="0,180 50,120 100,140 150,80 200,100 250,60 300,90 350,40 400,70"
                stroke="#3b82f6"
                strokeWidth="3"
                fill="none"
              />
              <polyline
                points="0,200 0,180 50,120 100,140 150,80 200,100 250,60 300,90 350,40 400,70 400,200"
                fill="url(#gradient)"
                opacity="0.3"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <div className="chart-card">
          <h3>Ride Distribution</h3>
          <div className="distribution-chart">
            <div className="distribution-item">
              <span className="distribution-label">Completed</span>
              <div className="distribution-bar">
                <div 
                  className="distribution-fill completed"
                  style={{ width: `${analytics?.rides?.completed / analytics?.rides?.total * 100 || 0}%` }}
                ></div>
              </div>
              <span className="distribution-value">{analytics?.rides?.completed || 0}</span>
            </div>
            <div className="distribution-item">
              <span className="distribution-label">Ongoing</span>
              <div className="distribution-bar">
                <div 
                  className="distribution-fill ongoing"
                  style={{ width: `${analytics?.rides?.ongoing / analytics?.rides?.total * 100 || 0}%` }}
                ></div>
              </div>
              <span className="distribution-value">{analytics?.rides?.ongoing || 0}</span>
            </div>
            <div className="distribution-item">
              <span className="distribution-label">Cancelled</span>
              <div className="distribution-bar">
                <div 
                  className="distribution-fill cancelled"
                  style={{ width: `${analytics?.rides?.cancelled / analytics?.rides?.total * 100 || 0}%` }}
                ></div>
              </div>
              <span className="distribution-value">{analytics?.rides?.cancelled || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="insights-section">
        <h2>Key Insights</h2>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon">📈</div>
            <h4>Peak Hours</h4>
            <p>Most rides occur between 8-10 AM and 6-8 PM</p>
          </div>
          <div className="insight-card">
            <div className="insight-icon">⭐</div>
            <h4>Average Rating</h4>
            <p>Overall platform rating: {analytics?.ratings?.average || 4.5}/5.0</p>
          </div>
          <div className="insight-card">
            <div className="insight-icon">💰</div>
            <h4>Average Fare</h4>
            <p>₹{analytics?.revenue?.averageFare || 0} per ride</p>
          </div>
          <div className="insight-card">
            <div className="insight-icon">🚗</div>
            <h4>Driver Utilization</h4>
            <p>{analytics?.drivers?.utilization || 0}% of drivers active</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
