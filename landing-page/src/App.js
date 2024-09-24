import React from 'react';
import './App.css'; // Include this for any global styles
import './LandingPage.css'; // Add your CSS for the landing page styling

function App() {
  return (
    <div className="landing-container">
      <div className="landing-header">
        <h1>PhreekyNoises</h1>
        <div className="buttons">
          <button className="login-btn">🎵 Log in</button>
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
}

export default App;
