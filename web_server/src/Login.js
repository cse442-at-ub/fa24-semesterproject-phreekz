import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css'; // Import the CSS for this component

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // State to hold error messages
  const navigate = useNavigate(); // Use React Router's useNavigate for navigation

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Patterns to detect malicious input
    const htmlPattern = /<script>/i;
    const sqlInjectionPattern = /(\bDROP\b|\bSELECT\b|\bDELETE\b|\bINSERT\b)/i;

    // Check for HTML and SQL injection attempts
    if (htmlPattern.test(email) || htmlPattern.test(password)) {
      setErrorMessage("Malicious input detected. Please enter valid information.");
      return;
    }
    if (sqlInjectionPattern.test(email) || sqlInjectionPattern.test(password)) {
      setErrorMessage("Malicious input detected. Please enter valid information.");
      return;
    }

    // Data to be sent to the backend
    const loginData = {
      email: email,
      password: password,
    };

    try {
      const response = await fetch("/CSE442/2024-Fall/sadeedra/api/login.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const parsedResponse = await response.json();

      if (!response.ok) {
        // If login failed (e.g., incorrect credentials)
        setErrorMessage("Login failed. Please check your credentials.");
      } else {
        // If login is successful
        alert("Login successful!");
        navigate("/dashboard"); // Navigate to the dashboard
      }
    } catch (error) {
      // Catch any other errors (e.g., network issues, fetch failures)
      console.error("Error during login:", error);
      setErrorMessage("An error occurred during login. Please try again.");
    }
  };

  return (
    <div className="login-container">
      {/* Logo section with clickable link */}
      <div className="login-header">
        <Link to="/">
          <h1>PhreekyNoises</h1>
        </Link>
      </div>

      {/* Login form section */}
      <div className="login-card">
        <h2 className="login-title">Log in</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Display error message if any */}
          {errorMessage && <p className="error-message">{errorMessage}</p>}

          {/* Form options (Remember me and Sign-up link) */}
          <div className="login-options">
            <label className="remember-me">
              <input type="checkbox" />
              Remember me
            </label>
            <Link to="/signup" className="signup-link">
              Don't have an account?
            </Link>
          </div>

          {/* Button section */}
          <div className="login-buttons">
            <button type="submit" className="login-btn get-phreeky-btn">
              🎵 Get Phreeky
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
