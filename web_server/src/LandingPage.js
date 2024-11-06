import React, { useEffect} from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie'; // Import Cookies library
import './LandingPage.css'; // Your existing CSS file

const LandingPage = () => {
  const navigate = useNavigate();

  // Function to handle "Log In" button click
  const handleLoginClick = () => {
    // Check for the "remember me" cookie
    const rememberMeCookie = Cookies.get("remember_me");

    // If the "remember me" cookie is set to "true", navigate to the dashboard
    if (rememberMeCookie === "true") {
      navigate("/dashboard");
    } else {
      // Otherwise, navigate to the login page
      navigate("/login");
    }
  };

  // Handle auth code if it's present in the URL
  useEffect(() => {
    var auth_code = new URLSearchParams(window.location.search).get('code');
    if (auth_code) {
      navigate('/dashboard', { state: { code: auth_code } });
    }
  }, [navigate]);

  return (
    <div className="landing-container">
      <div className="landing-header">
        <h1>PhreekyNoises</h1>
        <div className="buttons">
          {/* Use the handleLoginClick function for the "Log In" button */}
          <button className="login-btn" onClick={handleLoginClick}>
            🎵 Log in
          </button>
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
