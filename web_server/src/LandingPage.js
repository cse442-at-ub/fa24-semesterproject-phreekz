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
          <Link to="/signup">
          <button className="signup-btn">🎵 Sign up</button>
          </Link>
        </div>
      </div>

      <div className="landing-content">
        <h2>Connect with friends through shared music tastes</h2>
        <p>Track top listening habits and discover new favorites</p>
        <Link to="signup">
        <button className="get-started-btn">🎵 Get Started</button>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
