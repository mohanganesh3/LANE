import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyOTP from './pages/auth/VerifyOTP';
import ResetPassword from './pages/auth/ResetPassword';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <h1>LANE - Rideshare Platform</h1>
              <p>Welcome to LANE! React migration in progress...</p>
              <div style={{ marginTop: '20px' }}>
                <a href="/login" style={{ marginRight: '15px', color: '#667eea' }}>Login</a>
                <a href="/register" style={{ color: '#667eea' }}>Register</a>
              </div>
            </div>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
