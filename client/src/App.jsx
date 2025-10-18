import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={
            <div>
              <h1>LANE - Rideshare Platform</h1>
              <p>Welcome to LANE! React migration in progress...</p>
            </div>
          } />
          <Route path="/login" element={<div><h2>Login Page</h2></div>} />
          <Route path="/register" element={<div><h2>Register Page</h2></div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
