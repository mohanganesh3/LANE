import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

function Header() {
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <Link to="/">
            <h1>LANE</h1>
            <span className="logo-tagline">Rideshare Platform</span>
          </Link>
        </div>

        <nav className="header-nav">
          <Link to="/search" className="nav-link">Find Rides</Link>
          <Link to="/post-ride" className="nav-link">Post Ride</Link>
          <Link to="/my-bookings" className="nav-link">My Bookings</Link>
          <Link to="/my-rides" className="nav-link">My Rides</Link>
        </nav>

        <div className="header-actions">
          <button className="btn-notifications">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeWidth="2"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeWidth="2"/>
            </svg>
          </button>
          
          <button className="btn-profile" onClick={() => navigate('/profile')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2"/>
              <circle cx="12" cy="7" r="4" strokeWidth="2"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
