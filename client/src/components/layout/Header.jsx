import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">LANE</Link>
        <nav className="nav">
          <Link to="/search">Search Rides</Link>
          <Link to="/post-ride">Post Ride</Link>
          <Link to="/dashboard">Dashboard</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
