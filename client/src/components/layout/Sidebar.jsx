import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ userRole = 'passenger' }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const passengerMenuItems = [
    { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { path: '/search-rides', icon: '🔍', label: 'Search Rides' },
    { path: '/my-bookings', icon: '📋', label: 'My Bookings' },
    { path: '/trip-history', icon: '📊', label: 'Trip History' },
    { path: '/wallet', icon: '💰', label: 'Wallet' },
    { path: '/profile', icon: '👤', label: 'Profile' },
    { path: '/settings', icon: '⚙️', label: 'Settings' }
  ];

  const riderMenuItems = [
    { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { path: '/post-ride', icon: '➕', label: 'Post Ride' },
    { path: '/my-rides', icon: '🚗', label: 'My Rides' },
    { path: '/bookings', icon: '📋', label: 'Bookings' },
    { path: '/earnings', icon: '💵', label: 'Earnings' },
    { path: '/reviews', icon: '⭐', label: 'Reviews' },
    { path: '/vehicle', icon: '🚙', label: 'Vehicle Info' },
    { path: '/profile', icon: '👤', label: 'Profile' },
    { path: '/settings', icon: '⚙️', label: 'Settings' }
  ];

  const adminMenuItems = [
    { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/admin/users', icon: '👥', label: 'Users' },
    { path: '/admin/rides', icon: '🚗', label: 'Rides' },
    { path: '/admin/bookings', icon: '📋', label: 'Bookings' },
    { path: '/admin/verifications', icon: '✅', label: 'Verifications' },
    { path: '/admin/reports', icon: '📝', label: 'Reports' },
    { path: '/admin/sos', icon: '🚨', label: 'SOS Dashboard' },
    { path: '/admin/geo-fencing', icon: '🗺️', label: 'Geo-Fencing' },
    { path: '/admin/financial', icon: '💰', label: 'Financial' },
    { path: '/admin/settings', icon: '⚙️', label: 'Settings' }
  ];

  const menuItems = userRole === 'admin' 
    ? adminMenuItems 
    : userRole === 'rider' 
    ? riderMenuItems 
    : passengerMenuItems;

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && (
          <div className="sidebar-logo">
            <h2>🚗 LANE</h2>
            <span className="role-badge">{userRole}</span>
          </div>
        )}
        <button 
          className="sidebar-toggle" 
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : ''}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {!collapsed && <span className="sidebar-label">{item.label}</span>}
              {isActive && <span className="active-indicator"></span>}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <Link 
          to="/logout" 
          className="sidebar-item logout"
          title={collapsed ? 'Logout' : ''}
        >
          <span className="sidebar-icon">🚪</span>
          {!collapsed && <span className="sidebar-label">Logout</span>}
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
