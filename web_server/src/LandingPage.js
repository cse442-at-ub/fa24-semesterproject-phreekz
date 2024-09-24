import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css'; // Your existing CSS file

const LandingPage = () => {
  return (
    <div className="landing-container">
      <div className="landing-header">
        <h1>PhreekyNoises</h1>
        <div className="buttons">
          <Link to="/login">
            <button className="login-btn">🎵 Log in</button>
          </Link>
          <button className="signup-btn">🎵 Sign up</button>
        </div>
      </div>

      <div className="landing-content">
        <h2>Connect with friends through shared music tastes</h2>
        <p>Track top listening habits and discover new favorites</p>
        <button className="get-started-btn">🎵 Get Started</button>
      </div>
    </div>
  );
};

export default LandingPage;
